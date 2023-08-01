import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Alert } from "react-native";
import { appTheme } from "../../lib/Themes";
import CustomHeader from "../../components/CustomHeader";
import { Picker } from '@react-native-picker/picker';
import { ApiService } from "../../httpservice";
import BatchDetails from "./BatchDetails";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AppStyles from "../../styles/AppStyles";
import ErrorModal from "../../components/ErrorModal";
import UserContext from "../UserContext";


export default function ClearInventory() {
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [batchNum, setBatchNum] = useState('')
  const [batchDet, setBatchDet] = useState({})
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [editRack, setEditRack] = useState(false);
  const [delRacks, setDelRacks] = useState([]);
  const userState = React.useContext(UserContext);


  const [batchOptions, setBatchOptions] = useState({
    keyName: "_id", valueName: "batch_num",
    options: [],
  })

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadBatches();
    }
    return () => { }
  }, [isFocused])

  const loadBatches = () => {
    let apiData = {
      "op": "list_raw_material_by_status",
      "status": ["APPROVED", "REJECTED"],
      "unit_num": userState.user.unit_number

    }
    apiData.sort_by = 'updated_on'
    apiData.sort_order = 'DSC'
    setRefreshing(false);
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
        else {
          let bOptions = { ...batchOptions }
          bOptions.options = []
          setBatchOptions(bOptions)
          setBatchNum('')
          setBatchDet({})
        }
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  });
  const handleChange = (name) => (value, index) => {
    if (name === "batchNum") {
      let bOptions = [...batchOptions.options]
      let bDet = bOptions[index];
      setBatchDet(bDet);
      setBatchNum(value)
      setDelRacks([])
      setEditRack(false)
    }

  };

  const handleEditRack = () => {
    setEditRack(prevState => !prevState)
    setDelRacks([]);
  }

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
  }
  const openDialog = (e, type) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    let batchDetails = { ...batchDet };
    setDialogType(type)

    if (type === "inventory") {
      dialogTitle = "Confirm Clear Inventory"
      dialogMessage = "The racks associated with batch number " + batchDetails.batch_num + " will be deleted"
    }
    if (type === "racks") {
      dialogTitle = "Delete Racks"
      dialogMessage = "Please confirm to delete the selected racks"
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);

  }

  const removeBatch = async () => {
    let apiData = {}
    let batchDetails = { ...batchDet };
    apiData.batch_num = batchDetails.batch_num;
    apiData.status = "REMOVED"
    apiData.op = "update_material_fifo";
    apiData.fifo = [];
    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          closeDialog();
          loadBatches();
          setBatchDet({})
          setBatchNum('')
        }
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }

  const addToDelRacks = (e, fifoItem) => {
    let racks_to_del = [...delRacks]
    let element_num = fifoItem.element_num;
    const selectedIndex = racks_to_del.indexOf(element_num);
    if (selectedIndex === -1) {
      racks_to_del.push(element_num);
    } else if (selectedIndex !== -1) {
      racks_to_del.splice(selectedIndex, 1);
    }
    setDelRacks(racks_to_del);
  }

  const saveRacks = () => {
    let racks_to_del = [...delRacks];
    let apiData = {
      "op": "update_material_fifo",
      "batch_num": batchDet.batch_num,
    }
    let updatedFifo = batchDet.fifo.filter(ar => !racks_to_del.find(rm => (rm === ar.element_num)))
    apiData.fifo = updatedFifo

    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        Alert.alert("Racks updated !")
        setDelRacks([]);
        showDialog(false)
        setDialogMessage("");
        setDialogTitle("");


        let bOptions = { ...batchOptions }
        let batchIndex = bOptions.options.findIndex(batchItem => batchItem.batch_num === batchDet.batch_num)
        bOptions.options[batchIndex].fifo = apiRes.response.message.fifo;
        setBatchOptions(bOptions)
        setBatchDet(apiRes.response.message)
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    })

  }
  const errOKAction = () => {
    setApiError('')
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 5 }}>
          <View style={{ flex: 2, margin: 2, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ padding: 5, fontSize: 14 }}>Select Batch</Text>
            <Picker
              selectedValue={batchNum}
              onValueChange={handleChange("batchNum")}
              mode="dialog"
              style={{ backgroundColor: "#ECF0FA", flex: 1 }}
              itemStyle={{}}
              dropdownIconColor={appTheme.colors.cardTitle}
            >
              {batchOptions.options.map((pickerItem, pickerIndex) => {
                let labelV = (batchOptions.keyName && pickerItem[batchOptions.keyName]) ? pickerItem[batchOptions.keyName] : (pickerItem.key ? pickerItem.key : "");
                let label = (batchOptions.valueName && pickerItem[batchOptions.valueName]) ? pickerItem[batchOptions.valueName] : (pickerItem.value ? pickerItem.value : "");
                return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV}
                  key={pickerIndex} />)
              })}
            </Picker>
          </View>
          <View style={{ flex: 3, margin: 2 }}>

          </View>


        </View>
        {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}

        {batchDet && batchDet._id ?
          <View style={{ flexDirection: 'row' }}>

            <View style={[styles.sectionContainer, { flex: 2, flexDirection: 'column' }]}>
              <View style={{ flexDirection: 'column', border: 'grey', borderWidth: 0.5, borderRadius: 10, padding: 10, margin: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
                  <CustomHeader title={"Rack Numbers"} size={18} style={{}} />
                  {batchDet.status.toLowerCase() != "rejected" ? <TouchableOpacity style={{}}
                    onPress={(e) => handleEditRack(e)} >
                    <MaterialIcons name="edit" size={25} style={{ marginLeft: 10 }}
                      color={editRack ? 'red' : 'green'}

                    ></MaterialIcons>
                  </TouchableOpacity> : false}
                </View>


                <View style={{ flexDirection: 'row', flex: 1, padding: 10, margin: 10 }}>
                  <View style={{ flexDirection: 'column', flex: 2 }}>
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
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                      {delRacks.length ? <Text style={{ color: 'red', fontSize: 14, paddingTop: 10 }}>Racks to be deleted are red in color</Text>
                        : false}
                    </View>
                    
                    {delRacks.length ?
                      <TouchableOpacity style={[{ flexDirection: 'row', marginRight: 50, marginTop: 10, justifyContent: 'flex-end' }]} onPress={(e) => openDialog(e, "racks")} >
                        <Text style={[AppStyles.successText, { color: 'red', fontFamily: appTheme.fonts.bold }]}>REMOVE</Text>
                      </TouchableOpacity>
                      : false}
                  </View>
                </View>
              </View>

              <View style={{ flex: 1, marginTop: 50 }}>
                {batchNum && batchNum.length && batchDet.status.toLowerCase() === "rejected" ? <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]} onPress={(e) => openDialog(e, "inventory")} >
                    <Text style={AppStyles.successText}>CLEAR INVENTORY</Text>
                  </TouchableOpacity>
                </View> : false}
              </View>
            </View>
            <View style={[styles.sectionContainer, { flex: 2 }]}>
              <BatchDetails content={batchDet} editMode={false} _id={batchDet._id} title="BATCH DETAILS" />
            </View>
            {dialog && dialogType === "inventory" ? 
              <CustomModal modalVisible={dialog} dialogTitle={dialogTitle} dialogMessage={dialogMessage} 
              closeDialog={closeDialog} okDialog={removeBatch} /> : false}

            {dialog && dialogType === "racks" ?
              <CustomModal modalVisible={dialog} dialogTitle={dialogTitle} dialogMessage={dialogMessage}
                closeDialog={closeDialog} okDialog={saveRacks} /> : false}

          </View>: false}
        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 5,
    padding: 5
  }

});