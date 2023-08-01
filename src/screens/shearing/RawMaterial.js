import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { util } from "../../commons";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import ProcessDetails from "../process/ProcessDetails";
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import WeightDetails from "../process/WeightDetails";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import { mqttOptions } from "../../constants";
import MQTT from 'sp-react-native-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from "../../components/ErrorModal";
import { EmptyBinContext } from "../../context/EmptyBinContext";


let rejection_schema = [
  {
    "key": "reject_weight", displayName: "Rejection Weight (kg)", placeholder: "", value: "",
    error: "", required: true, label: "reject_weight", type: "number", nonZero: true
  },
  // {
  //   "key": "material_reject_reason", displayName: "Reason", placeholder: "", value: "", error: "",
  //   required: false, "label": "reason", select: true,
  //   options: [],
  //   keyName: "_id", valueName: "value", lowerCase: false
  // },

]

export default function RawMaterial(props) {
  const [formData, setFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('rejection')
  const [partialWeight, setPartialWeight] = useState(0);
  const [partialErr, setPartialErr] = useState('')
  const [rackErr, setRackErr] = useState('')
  const [listeningEvent, setListeningEvent] = useState(false);
  const [batchDet, setBatchDet] = useState({})
  const [addRacks, setAddRacks] = useState('')
  const [curFifo, setCurFifo] = useState({})
  const [client, setClient] = useState(undefined);
  const { appProcess } = React.useContext(EmptyBinContext)

  useEffect(() => {
    if (isFocused) {
      stopListening()
      loadForm();
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadForm = () => {
    setFormData(rejection_schema);
  }
  const tabChange = (value) => {
    setTab(value)
    if (value === "rejection") setFormData(rejection_schema)
  }

  const handleChange = (name) => value => {
    let formDataInput = [...formData]
    let index = formDataInput.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formDataInput[index]
      updatedItem["value"] = value;
      let updatedBatchData = [...formDataInput.slice(0, index), updatedItem, ...formDataInput.slice(index + 1)];
      setFormData([...updatedBatchData]);
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
    setPartialWeight('')
    setCurFifo({})
    setAddRacks('')
    if (client) client.disconnect()
  }
  const openDialog = (type) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    if (type === "rejection") {
      let formDataInput = [...formData]
      let bundleInput = formDataInput.find(item => item.key === "reject_weight");
      dialogTitle = "Reject Weight";
      dialogMessage = "Are you sure you wish to Reject Weight " + bundleInput.value + " (kg) of " + appProcess.process_name
    }
    if (type === "partial") {
      dialogTitle = "Partial Return"
      dialogMessage = "Are you sure you wish to partial return weight " + partialWeight + " kg of " + appProcess.process_name
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const validatePartialReturn = (e, type) => {
    let rackErr = (!addRacks.length ? 'Rack is empty' : '')
    setRackErr(rackErr)
    let partialWeightErr = (!partialWeight.length || partialWeight === 0) ? 'Please enter valid partial weight return' : ''
    setPartialErr(partialWeightErr)

    if (!rackErr.length && !partialWeightErr.length) {
      openDialog(type)
    }
  }
  const validateForm = async (e, type) => {
    let formDataInput = [...formData]

    let validFormData = await util.validateFormData(formDataInput);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    if (!isError) {
      //setFormData(validFormData)
      openDialog(type)
    }
    else {

    }

  }

  const setBatchPartialWeight = () => {
    let batchDetails = { ...batchDet }
    let apiData = {}
    apiData.op = "update_material_fifo"
    apiData.partial_return_weight = partialWeight
    apiData.batch_num = appProcess.batch_num
    let curFifoArr = [curFifo]
    apiData.fifo = [...curFifoArr, ...batchDetails.fifo]
    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      console.log("partial return apiRes here "+JSON.stringify(apiRes))
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        closeDialog();

        if (apiRes.response.message) {
          //check here
          //props.setProcessEntity(apiRes.response.message)
        }
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });
  }

  const setRejectWeight = async () => {
    let apiData = await util.filterFormData([...formData]);
    apiData.op = "update_raw_material"
    apiData.batch_num = appProcess.batch_num
    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          Alert.alert("Reject Weight updated");
          //check here
          //props.setProcessEntity(apiRes.response.message)
          setBatchDet(apiRes.response.message);
          //openDialog(apiRes.response.message);
          util.resetForm(formData);
          closeDialog();
        }
      }

      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }
  const handleSubmit = async () => {
    let apiData = await util.filterFormData([...formData]);
    apiData.op = "add_process"
  }
  const stopListening = () => {
    if (client && client.disconnect) client.disconnect();
    setListeningEvent(false);
    setClient(undefined)
    setRackErr('')
    setPartialErr('')
    setAddRacks('')
    setCurFifo({})

  }
  const startListening = () => {
    console.log(123)
    console.log(batchDet._id)
    if (!batchDet._id) {
      let apiData = {
        "op": "get_batch_details",
        "batch_num": appProcess.batch_num,
        "unit_num": userState.user.unit_number
      }
      ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
        if (apiRes.status && apiRes.response.message) {
          let batch = apiRes.response.message
          if (batch) {
            setBatchDet(batch)
            AsyncStorage.getItem("racks").then(topics => {
              connectMQTT(JSON.parse(topics), batch)
            })
          }
        }
      })
    }
    else {

      AsyncStorage.getItem("racks").then(topics => {
        connectMQTT(JSON.parse(topics), batchDet)
      })
    }

  }

  const connectMQTT = (topics, batchDetails) => {
    console.log(123)
    let options = { ...mqttOptions }
    console.log("connect to mqtt options " + JSON.stringify(options))
    MQTT.createClient(options).then((client) => {
      setClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setListeningEvent(false);

      });

      client.on('error', (msg) => {
        console.log('mqtt.event.error', msg);
        setListeningEvent(false);
      });

      client.on('message', (msg) => {
        
        console.log('partial return mqtt.event.message', msg);
        let dataJson = JSON.parse(msg.data)
        //this.setState({ message: JSON.stringify(msg) });
        //let deviceId = msg.topic.split("/")[1];
        let deviceId = dataJson.devID;
        let apiData = { op: "get_device", device_id: deviceId, unit_num: userState.user.unit_number };
        ApiService.getAPIRes(apiData, "POST", "mqtt").then(apiRes => {
          console.log("apiRes here raw material mqtt " + JSON.stringify(apiRes))
          if (apiRes && apiRes.status) {
            let deviceList = apiRes.response.message;
            if (deviceList[0].type === "bin") return;
            let rackDevices = Object.keys(batchDetails.device_map);
            let deviceExists = rackDevices.indexOf(deviceId);
            console.log(deviceExists)
            console.log(batchDetails.fifo)
            let fifoExists = batchDetails.fifo.findIndex(item => item.element_id === deviceId);
            console.log("fifoExists : "+fifoExists)
            if (deviceExists > -1 && fifoExists === -1 && addRacks.length === 0) {
              setAddRacks(batchDetails.device_map[deviceId]);
              setCurFifo({ "element_num": batchDetails.device_map[deviceId], "element_id": deviceId })
              setRackErr('')
            }

          }
        });

       

      });

      client.on('connect', () => {
        console.log('connected');
        setListeningEvent(true);
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
      console.log("raw naterial " + err);
      setListeningEvent(false);
    });
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 10 }}>
        <TouchableOpacity style={{
          flexDirection: 'row', padding: 8,
          borderRadius: tab === "rejection" ? 15 : 0,
          backgroundColor: tab === "rejection" ? appTheme.colors.cardTitle : 'white'
        }}
          onPress={(e) => tabChange("rejection")} >
          <Text style={[styles.filterText, {
            fontFamily: tab === "rejection" ? appTheme.fonts.bold : appTheme.fonts.regular,
            color: tab === "rejection" ? 'white' : appTheme.colors.cardTitle,
          }]}>Rejection</Text>
        </TouchableOpacity>
        <Text style={{ padding: 5 }}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', padding: 8,
            borderRadius: tab === "partial" ? 15 : 0,
            backgroundColor: tab === "partial" ? appTheme.colors.cardTitle : 'white'
          }}
          onPress={(e) => tabChange("partial")} >
          <Text style={[styles.filterText, {
            fontFamily: tab === "partial" ? appTheme.fonts.bold : appTheme.fonts.regular,
            color: tab === "partial" ? 'white' : appTheme.colors.cardTitle,
          }]}>Partial Return</Text>
        </TouchableOpacity>

      </View>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: 'row' }}>
          {tab === "rejection" ? <View style={{ flex: 2, backgroundColor: 'white', margin: 5, padding: 5 }}>
            <FormGen handleChange={handleChange} formData={formData} labelDataInRow={true} />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]} onPress={(e) => validateForm(e, tab)} >
                <Text style={AppStyles.successText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
            : <View style={{ flex: 2, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                {!listeningEvent ? <TouchableOpacity style={[AppStyles.warnButtonContainer, { flexDirection: 'row' }]}
                  onPress={(e) => startListening(e)}
                >
                  <Text style={AppStyles.warnButtonTxt}>ADD TO RACKS</Text>
                </TouchableOpacity> :

                  <TouchableOpacity style={{ flexDirection: 'row', padding: 10 }}
                  >
                    <Text style={{ color: appTheme.colors.warnAction, marginRight: 10, fontFamily: appTheme.fonts.bold }}>
                      Listening to Rack Switch
                    </Text>
                    <MaterialCommunityIcons name="cast-connected" size={20} color={appTheme.colors.warnAction} style={{}} />

                  </TouchableOpacity>
                }

              </View>
              <View style={{ display: 'flex', flexDirection: 'row', padding: 5, margin: 5 }}>
                <CustomHeader title="Rack" />
                {curFifo && curFifo.element_num ? <Text style={{
                  fontSize: 20,
                  color: 'green',
                  paddingLeft: 10,
                  fontFamily: appTheme.fonts.bold

                }}  >{curFifo.element_num}</Text> : false}
              </View>
              {rackErr && rackErr.length ? (<Text style={AppStyles.error}> {rackErr} </Text>) : false}

              <View style={{ display: 'flex', flexDirection: 'row', padding: 10 }}>
                <Text style={[AppStyles.filterLabel, { flex: 1, padding: 10 }]}>Enter Weight</Text>
                <TextInput style={[AppStyles.filterText, { flex: 2, padding: 10, }]}
                  keyboardType="numeric"
                  onChangeText={(text) => setPartialWeight(text)}


                >{partialWeight}</TextInput>
              </View>
              <View style={{ display: 'flex', flexDirection: 'column', padding: 10 }}>

                {partialErr && partialErr.length ? (<Text style={AppStyles.error}> {partialErr} </Text>) : false}
              </View>
              <View style={{ display: 'flex', flexDirection: 'row', padding: 10, justifyContent: 'center', marginTop: 10 }}>
                <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row', marginRight: 10 }]}
                  onPress={(e) => validatePartialReturn(e, tab)}
                >
                  <Text style={AppStyles.successText}>CONFIRM</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[AppStyles.canButtonContainer, { flexDirection: 'row' }]}
                  onPress={(e) => stopListening(e)}
                >
                  <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          <View style={{ flex: 3, flexDirection: 'row', }}>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <ProcessDetails
                title="Process Details"
                processEntity={appProcess} />
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <WeightDetails title="Weight Details"
                processEntity={appProcess} />
            </View>

          </View>
        </View>




        {dialog && dialogType === "rejection" ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={setRejectWeight}
          closeDialog={closeDialog}
        /> : false}

        {dialog && dialogType === "partial" ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={setBatchPartialWeight}
          closeDialog={closeDialog}
        /> : false}

      </View>

      {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});