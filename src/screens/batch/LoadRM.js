import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import CustomHeader from "../../components/CustomHeader";
import { Picker } from '@react-native-picker/picker';
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import CustomModal from "../../components/CustomModal";
import { mqttOptions } from "../../constants";
import MQTT from 'sp-react-native-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import AppStyles from "../../styles/AppStyles";
import ErrorModal from "../../components/ErrorModal";
import UserContext from "../UserContext";



export default function LoadRM() {
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [batchNum, setBatchNum] = useState('')
  const [batchDet, setBatchDet] = useState({})
  const [editRack, setEditRack] = useState(false);
  const [delRacks, setDelRacks] = useState([]);
  const [addRacks, setAddRacks] = useState([]);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [listeningEvent, setListeningEvent] = useState(false);
  const [client, setClient] = useState(undefined);
  const [newFifo, setNewFifo] = useState([])
  const userState = React.useContext(UserContext);




  const [batchOptions, setBatchOptions] = useState({ keyName: "_id", valueName: "batch_num", options: [], })
  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      setDelRacks([]);
      //setAddRacks([]);
      showDialog(false)
      setDialogMessage("");
      setDialogType("")
      setDialogTitle("");
      setListeningEvent(false)
      loadBatches();
      setEditRack(false)
      stopLoading();

    }
    return () => { }
  }, [isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": ["NEW"],
      "unit_num": userState.user.unit_number

    }
    apiData.sort_by = 'updated_on'
    apiData.sort_order = 'DSC'
    console.log(apiData)
    setRefreshing(false)
    ApiService.getAPIRes(apiData, "POST", "list_raw_material_by_status").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let bOptions = { ...batchOptions }
          bOptions.options = apiRes.response.message;
          setBatchOptions(bOptions)

          if (bOptions.options[0] && batchNum === '') {
            setBatchNum(bOptions.options[0]._id)
            setBatchDet(bOptions.options[0])
          }

        }
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  });

  const handleEditRack = () => {
    setEditRack(prevState => !prevState)
    setDelRacks([]);
    setAddRacks([]);
    setNewFifo([])
  }

  const handleChange = (name) => (value, index) => {
    if (name === "batchNum") {
      if (addRacks.length) {
        showDialog(true);
        setDialogTitle("Confirm new racks")
        setDialogMessage("Data unsaved, please confirm");
        setDialogType("newRacks")

      }
      else {
        setBatchNum(value)
        let bOptions = [...batchOptions.options]
        let bDet = bOptions[index];
        setBatchDet(bDet);

      }

    }
  };
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
  }

  const clearNewRacks = () => {
    setAddRacks([])
    setNewFifo([]);
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
  }

  const removeRacks = () => {

  }
  const addToDelRacks = (e, fifoItem) => {
    let racks_to_del = [...delRacks]
    let racks_to_add = [...addRacks]
    let element_num = fifoItem.element_num;
    const selectedIndex = racks_to_del.indexOf(element_num);
    if (selectedIndex === -1) {
      racks_to_del.push(element_num);
    } else if (selectedIndex !== -1) {
      racks_to_del.splice(selectedIndex, 1);
    }

    const selectedIndex1 = racks_to_add.indexOf(element_num);
    // if (selectedIndex1 === -1) {
    //   racks_to_add.push(element_num);
    // } else 
    if (selectedIndex1 !== -1) {
      racks_to_add.splice(selectedIndex1, 1);
    }
    let mergeArr = [...racks_to_del, ...racks_to_add]
    setDelRacks(racks_to_del);

    setAddRacks(racks_to_add)

  }

  const startListening = () => {

    AsyncStorage.getItem("racks").then(topics => {
      if (topics)
        connectMQTT(JSON.parse(topics))
    })
  }

  const connectMQTT = (topics) => {
    if (client) {
      client.disconnect()
      setClient(null)
    }
    let options = { ...mqttOptions }
    options.clientId = "clientId" + Date.now();
    console.log("otpions 123 " + JSON.stringify(options))
    MQTT.createClient(options).then((client) => {
      setClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setListeningEvent(false)
        if (client) client.disconnect()

      });

      client.on('error', (msg) => {
        console.log('mqtt.event.error', msg);
        setListeningEvent(false)
      });

      client.on('message', (msg) => {
        let dataJson = JSON.parse(msg.data)
        console.log('mqtt.event.message', msg);
        //this.setState({ message: JSON.stringify(msg) });

        let batchDetails = { ...batchDet };
        let rackDevices = Object.keys(batchDetails.device_map);
        console.log(JSON.stringify(batchDetails))
        //let deviceId = msg.topic.split("/")[1];
        let deviceId = dataJson.devID;
        let apiData = { op: "get_device", device_id: deviceId, unit_num: userState.user.unit_number };
        ApiService.getAPIRes(apiData, "POST", "mqtt").then(apiRes => {
          console.log("apiRes here load raw mqtt " + JSON.stringify(apiRes))
          if (apiRes && apiRes.status) {
            let deviceList = apiRes.response.message;
            console.log(deviceList[0].type)
            if (deviceList[0].type === "bin") return;
            let deviceExists = rackDevices.indexOf(deviceId);
            console.log(deviceExists)
            let fifoExists = batchDetails.fifo.findIndex(item => item.element_id === deviceId);
            if (deviceExists > -1 && fifoExists === -1) {
              const selectedIndex = addRacks.indexOf(batchDetails.device_map[deviceId]);
              if (selectedIndex === -1) {
                addRacks.push(batchDetails.device_map[deviceId]);
                let newRacks = []
                addRacks.map(itemV => {
                  let key = Object.keys(batchDetails.device_map).find(k => batchDetails.device_map[k] === itemV);
                  let obj = { element_num: itemV, element_id: key }
                  newRacks.push({ element_num: itemV, element_id: key })
                })


                // let newRack = { "element_num": batchDetails.device_map[deviceId],"element_id":deviceId}
                //newRacks.push(newRack)
                setNewFifo(newRacks)
              }
            }

          }
        })
        

      });

      client.on('connect', () => {
        console.log('connected');
        setListeningEvent(true);
        console.log(topics)
        // topics.map(item => {
        //   client.subscribe(item.topic_name, 2)
        // })
        let mqttTopics = ['SWITCH_PRESS']
        mqttTopics.map(item => {
          client.subscribe(item, 2)
        })

      });
      setClient(client)

    }).catch((err) => {
      console.log("load raw naterial " + err);
    });
  }
  const stopLoading = () => {

    if (client) client.disconnect();
    setClient(undefined)

  }

  const saveRacks = () => {
    let racks_to_del = [...delRacks];
    let racks_to_add = [...addRacks];
    let apiData = {
      "op": "update_material_fifo",
      "batch_num": batchDet.batch_num,
    }
    let invokeApi = false;
    if (racks_to_add.length && racks_to_del.length) {
      stopLoading();
      let updatedFifo = batchDet.fifo.filter(ar => !racks_to_del.find(rm => (rm === ar.element_num)))
      mergeFifo = [...batchDet.fifo, ...updatedFifo]
      apiData.fifo = mergeFifo;
    }
    else if (racks_to_add.length) {
      stopLoading();
      if (batchDet.fifo && batchDet.fifo.length) {
        let mergeFifo = [...batchDet.fifo, ...newFifo]
        apiData.fifo = mergeFifo
      }
      else apiData.fifo = newFifo
      invokeApi = true;

    }
    else if (racks_to_del.length) {

      let updatedFifo = batchDet.fifo.filter(ar => !racks_to_del.find(rm => (rm === ar.element_num)))
      apiData.fifo = updatedFifo
      invokeApi = true;
    }
    if (invokeApi) {
      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
        setApiStatus(false);
        if (apiRes && !apiRes.status) {
          Alert.alert(apiRes.response.message)
          setApiError(apiRes.response.message)
          setDelRacks([]);
          setAddRacks([]);
          showDialog(false)
          setDialogMessage("");
          setDialogType("")
          setDialogTitle("");
          setEditRack(false)
          setNewFifo([])

        }
        if (apiRes && apiRes.status) {
          Alert.alert("Racks updated !")
          setListeningEvent(false)
          if (client) client.disconnect()
          setDelRacks([]);
          setAddRacks([]);
          setNewFifo([])
          showDialog(false)
          setDialogMessage("");
          setDialogType("")
          setDialogTitle("");
          let bOptions = { ...batchOptions }
          let batchIndex = bOptions.options.findIndex(batchItem => batchItem.batch_num === batchDet.batch_num)
          bOptions.options[batchIndex].fifo = apiRes.response.message.fifo;
          setBatchOptions(bOptions)
        }
      })
    }
  }

  const computeRacks = () => {
    let racks_to_del = [...delRacks];
    if (racks_to_del.length && addRacks.length) {
      showDialog(true);
      setDialogTitle('Save Racks');
      let message = "Please confirm to delete the selected racks and add new racks"
      setDialogMessage(message);
      setDialogType('saveRacks')
    }
    else if (racks_to_del.length) {
      showDialog(true);
      setDialogTitle('Delete Racks');
      let message = "Please confirm to delete the selected racks"
      setDialogMessage(message);
      setDialogType('saveRacks')

    }
    else if (addRacks.length) {
      showDialog(true);
      setDialogTitle('Save Racks');
      let message = "Please confirm newly added racks"
      setDialogMessage(message);
      setDialogType('saveRacks')

    }
    else {
      setListeningEvent(false);
    }
  }
  const errOKAction = () => {
    setApiError('')
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.container}>
        <View style={[styles.sectionContainer, { flexDirection: 'row' }]}>
          <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', margin: 1 }}>
            <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA", flex: 2, padding: 0 }}
              itemStyle={{ padding: 0 }}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
              })}
            </Picker>
          </View>
          <View style={{ flex: 3 }}></View>

        </View>
        {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row', padding: 5 }}>

            <View style={[styles.sectionContainer, { flex: 2 }]}>
              <View style={{
                flexDirection: 'column', margin: 10, marginTop: 20,
                borderColor: 'grey', borderWidth: 0.5, padding: 10, borderRadius: 10
              }}>
                {listeningEvent ?
                  <View style={{ flexDirection: 'row' }}>

                    <Text style={{ color: appTheme.colors.warnAction, marginRight: 10, fontFamily: appTheme.fonts.bold }}>Listening to Rack Switch
                    </Text>
                    <MaterialCommunityIcons name="cast-connected" size={20} color={appTheme.colors.warnAction} style={{}} />
                  </View> : false}

                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <CustomHeader title={"Rack Numbers"} size={18} style={{}} />
                  <TouchableOpacity style={{}}
                    onPress={(e) => handleEditRack(e)}
                  >
                    <MaterialIcons name="edit" size={25} style={{ marginLeft: 10 }} color={editRack ? 'red' : 'green'}
                    ></MaterialIcons>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', }}>
                  {batchDet.fifo.map((fifoItem, fifoIndex) => {

                    let fifoRack = (fifoIndex === 0) ? fifoItem.element_num : "  |   " + fifoItem.element_num
                    return (
                      <TouchableOpacity style={{}} key={fifoIndex}
                        onPress={(e) => addToDelRacks(e, fifoItem)}
                        disabled={!editRack}

                      >
                        <Text style={{
                          fontSize: 14,
                          color: delRacks.indexOf(fifoItem.element_num) > -1 ? 'red' : 'black'

                        }} key={fifoIndex} >{fifoRack}</Text>
                      </TouchableOpacity>
                    )
                  })}
                  {newFifo.map((fifoItem, fifoIndex) => {

                    let fifoRack = (fifoIndex === 0 && batchDet.fifo.length ? " | " + fifoItem.element_num : (fifoIndex === 0 ? fifoItem.element_num : "  |   " + fifoItem.element_num))
                    return (
                      <TouchableOpacity style={{}} key={fifoIndex}
                        onPress={(e) => addToDelRacks(e, fifoItem)}
                        disabled={!editRack}
                      >
                        <Text style={{
                          fontSize: 14,
                          color: delRacks.indexOf(fifoItem.element_num) > -1 ? 'red' : 'green'

                        }} key={fifoIndex} >{fifoRack}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
                <View style={{ flexDirection: 'row', }}>
                  {delRacks.length ? <Text style={{ color: 'red', fontSize: 14, paddingTop: 10 }}>Racks to be deleted are red in color</Text>
                    : false}
                </View>
                <View style={{ flexDirection: 'row', }}>
                  {addRacks.length ? <Text style={{ color: 'green', fontSize: 14, paddingTop: 10 }}>Switched racks to be saved are green in color</Text>
                    : false}
                </View>
              </View>

              {batchNum && batchNum.length &&
                delRacks.length && listeningEvent ?
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                    <Text style={AppStyles.successText}>SAVE</Text>
                  </TouchableOpacity>
                </View> : false}

              {batchNum && batchNum.length && delRacks.length === 0 && listeningEvent ?
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                    <Text style={AppStyles.successText}>SAVE</Text>
                  </TouchableOpacity>
                </View> : false}

              {batchNum && batchNum.length && delRacks.length === 0 && listeningEvent === false ?
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => startListening(e)} >
                    <Text style={AppStyles.successText}>ADD TO RACK</Text>
                  </TouchableOpacity>

                </View> : false}

              {batchNum && batchNum.length && delRacks.length && listeningEvent === false ?
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => startListening(e)} >
                    <Text>ADD TO RACK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]}
                    onPress={(e) => computeRacks(e)} >
                    <Text>SAVE</Text></TouchableOpacity>
                </View> : false}

            </View>
            <View style={[styles.sectionContainer, { flex: 2 }]}>
              <BatchDetails
                content={batchDet}
                editMode={false}
                _id={batchDet._id}
                title="BATCH DETAILS"
              />
            </View>
          </View>
          : false}


        {dialog && dialogType === "saveRacks" ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          closeDialog={closeDialog}
          okDialog={saveRacks}
        /> : false}

        {dialog && dialogType === "newRacks" ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          closeDialog={closeDialog}
          okDialog={clearNewRacks}
        /> : false}


        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    //  backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5
  }
});