import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl, ActivityIndicator, Touchable } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import CustomModal from "../../components/CustomModal";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import FontAwesome from "react-native-vector-icons/FontAwesome"
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import RejectionData from "./RejectionData";
import ErrorModal from "../../components/ErrorModal";
import { ProcessFifo } from "./ProcessFifo";
import PublishMqtt from "../mqtt/PublishMqtt";



export default function ProcessList() {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [batchDet, setBatchDet] = useState({})
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [process, setProcess] = useState([])
  const [processDet, setProcessDet] = useState({})

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadProcess();
    }
    return () => { }
  }, [isFocused])

  const loadProcess = () => {
    let apiData = {
      "op": "get_process",
      "unit_num": userState.user.unit_number

    }
    apiData.sort_by = 'updated_on'
    apiData.sort_order = 'DSC'
    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          setProcess(apiRes.response.message)
        }
      }
      else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message)
        setProcess([])
      }
    });

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const publishBin = (data) => {
    console.log("publish bin data "+JSON.stringify(data))
    if (data.status === "HOLD"){
      console.log(JSON.stringify(processDet))
      processDet.process.map(stageItem => {
        console.log("stageItem . "+stageItem);
        if(stageItem.fifo && stageItem.fifo.length){
          stageItem.fifo.map(fifoItem => {
            console.log("fifoItem . " + fifoItem.element_id);
            PublishMqtt({ "topic": fifoItem.element_id })
          })
        }
      })
    }
  }

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
  }
  const openDialog = (type, item) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    let dialogType = ""
    dialogType = type;
    if (type === "rejection") {
      dialogTitle = "Rejection Data"
    }
    else if (type === "consumption") {
      dialogTitle = "Consumption Data"
    }
    else if (type === "processFifo") {
      dialogTitle = "Update Process " + item.process_name
    }
    else if (type === "startProcess") {
      dialogTitle = "Start Process " + item.process_name
    }
    else if (type === "stopProcess") {
      dialogTitle = "Stop Process " + item.process_name
    }
    else if (type === "finishProcess")
      dialogTitle = "Finish Process " + item.process_name


    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setDialogType(dialogType)
    setProcessDet(item)
  }

  const updateProcess = () => {
    let apiData = { op: "update_process" }
    apiData.process_name = processDet.process_name

    apiData.status = (dialogType === "startProcess" ? "RUNNING" : (dialogType === "stopProcess") ? "HOLD" : (dialogType === "finishProcess" ? "FINISHED" : ""))

    if (apiData.status === "FINISHED") {
      apiData.component_count = processDet.component_count
      apiData.finished_component = processDet.component_count
    }

    setApiStatus(true)
    ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
      if (apiRes) {
        if (apiRes.status) {
          publishBin(apiData)
          closeDialog()
          loadProcess();
        }
        else if (apiRes.response.message)
          setApiError(apiRes.response.message)
      }
    })


  }

  const updateFifo = () => {
    closeDialog()
    loadProcess();
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


        <ActivityIndicator size="large" animating={apiStatus} />
        {process.map((item, index) => {
          return (
            <View style={styles.processContainer} key={index}>
              <View style={{ flexDirection: 'row' }} key={index}>
                <Text style={[styles.title, { textAlign: 'left' }]}>{item.process_name}</Text>
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>

                  {(item.status.toLowerCase() === "created" || item.status.toLowerCase() === "hold") ?
                    <TouchableOpacity style={[{ alignSelf: 'center' }]}
                      onPress={(e) => openDialog('startProcess', item)}>
                      <Text style={{
                        textAlign: 'right', fontSize: 20, color: 'green',
                        fontFamily: appTheme.fonts.bold
                      }}>START</Text></TouchableOpacity> : false}

                  {item.status.toLowerCase() === "running" ?
                    <><TouchableOpacity style={[{ alignSelf: 'center' }]}
                      onPress={(e) => openDialog('stopProcess', item)}>
                      <Text style={{
                        textAlign: 'right', fontSize: 20, color: 'red',
                        fontFamily: appTheme.fonts.bold
                      }}>STOP</Text></TouchableOpacity>
                      <TouchableOpacity style={[{ alignSelf: 'center', paddingLeft: 20 }]}
                        onPress={(e) => openDialog('finishProcess', item)}>
                        <Text style={{
                          textAlign: 'right', fontSize: 20, color: 'green',
                          fontFamily: appTheme.fonts.bold
                        }}>FINISH</Text></TouchableOpacity>

                    </> : false}
                </View>


              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Batch</Text>
                <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Heat Number</Text>
                <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Supplier</Text>
                {/* <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Total Components</Text> */}
                {/* <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Total Quantity (kg)</Text> */}
                 <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Total Count</Text> 

                <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Status</Text>
                <Text style={[styles.subtitle, { textAlign: 'center', flex: 1 }]}>Rejection Data</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.batch_num}
                  <TouchableOpacity style={[{ alignSelf: 'center' }]}
                    onPress={(e) => openDialog('processFifo', item)} >
                    <MaterialIcons name="edit" size={22} style={{ marginLeft: 10 }} color="green" ></MaterialIcons>
                  </TouchableOpacity>

                </Text>
                <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.heat_num}</Text>
                <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.supplier}</Text>

                {/* <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.component_count}</Text> */}
                
                
                <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.component_weight}</Text> 

                <Text style={[styles.tableContent, { textAlign: 'center', flex: 1 }]}>{item.status}</Text>
                
                <TouchableOpacity style={[{ flex: 1, alignItems: 'center' }]}
                  onPress={(e) => openDialog('rejection', item)} >
                  <FontAwesome name="eye" size={20} style={{ flex: 1, justifyContent: 'center' }}  ></FontAwesome>
                </TouchableOpacity>
              </View>
            </View>)

        })}


      </View>

      {dialog && dialogType === "rejection" ? <CustomModal
        modalVisible={dialog}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        closeDialog={closeDialog}

        container={<RejectionData processEntity={processDet} />}
      /> : false}

     
      {dialog && dialogType === "processFifo" ? <CustomModal
        modalVisible={dialog}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        height={'80%'}
        // closeDialog={closeDialog}
        container={<ProcessFifo processDet={processDet} closeDialog={closeDialog} okDialog={updateFifo} />}
      /> : false}

      {dialog && (dialogType === "startProcess" || dialogType === "stopProcess" || dialogType === "finishProcess") ? <CustomModal
        modalVisible={dialog}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        closeDialog={closeDialog}
        okDialog={updateProcess}
      /> : false}
      {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    //backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  },
  processContainer: {
    flexDirection: 'column', margin: 8, backgroundColor: 'white', padding: 10
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    //marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: appTheme.fonts.regular
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold


  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    //fontWeight: "bold",
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle
  },
  tableContent: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: appTheme.fonts.regular,
  },
  tableHeader:{
    flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1
  }

});