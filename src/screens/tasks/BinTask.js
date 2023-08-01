import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from "../../components/ErrorModal";
import { roles, taskState, stageType } from "../../constants/appConstants";
import PublishMqtt from "../mqtt/PublishMqtt";
import AppContext from "../../context/AppContext";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import PubBatterySleep from "../mqtt/PubBatterySleep";



export const BinTask = React.memo((props) => {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [binTask, setBinTask] = useState([])
  const [stage, setStage] = useState('')
  const [task, setTask] = useState({})
  const [binNo, setBinNo] = useState('')
  const [prevSubStage, setPrevSubStage] = useState('')
  let { processStage } = React.useContext(AppContext);
  const { setUnReadFilledBinData } = React.useContext(EmptyBinContext)
  const { appProcess } = React.useContext(EmptyBinContext)

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused, appProcess.process_name])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
  }, []);

  const loadData = async () => {
    setApiStatus(true);
    let stage = await AsyncStorage.getItem("stage")
    setStage(stage);
    // let currentStage = appProcess.process.find(item => item.stage_name === stage)
    // setCurrentStage(currentStage)
    setTimeout(() => {
      setUnReadFilledBinData("0");
    }, 3000)
    let apiData = {};
    apiData.op = "get_request"
    apiData.unit_num = userState.user.unit_number
    // if (currentStage.stage_name.toLowerCase() === stageType.shotblasting) {
    //   currentStage.sub_stage = stageType.underheat
    // }

    // if(props.processEntity)
    //  apiData.process_name =  props.processEntity.process_name 
    apiData.process_name = appProcess.process_name
    if (stage && stage.toLowerCase() === stageType.shotblasting) {
      let inputStageList = await appProcess.process.reduce(async function (accumulator, item) {
        const accum = await accumulator;
        if (item.output_stage === stage && item.order === null)
          await (accum.push(item.stage_name));
        return accum;
      }, []);

      inputStageList.push(stage)
      apiData.stage = inputStageList;
    }
    else apiData.stage = stage
    if (userState.user.role === roles.MO)
      apiData.task_state = ["REQUESTED", "DELIVERED"]
    else if (userState.user.role === roles.FO)
      apiData.task_state = ["REQUESTED"]
    if (userState.user.role === roles.FO)
      apiData.resolver_id = userState.user.id
    apiData.sort_by = 'updated_on'
    apiData.sort_order = 'DSC'


    setBinTask([])
    console.log("hit reload " + JSON.stringify(apiData))
    ApiService.getAPIRes(apiData, "POST", "task").then(apiRes => {
      console.log("apiRes here " + JSON.stringify(apiRes))
      setApiStatus(false)
      setRefreshing(false);

      AsyncStorage.setItem(appProcess + "_" + processStage, "0");

      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length)
          setBinTask(apiRes.response.message);
      }
      else if (apiRes.response.message) {
        setBinTask([])
        setApiError(apiRes.response.message)
      }
    })


  }

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')
    setTask({})
    setBinNo('')
  }

  const showBin = async (e, type, item) => {
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    let apiData = {}
    apiData.op = "get_next_element"
    apiData.process_name = item.process_name
    apiData.stage_name = item.stage;

    setApiStatus(true);
    let apiRes = await ApiService.getAPIRes(apiData, "POST", "process");
    setApiStatus(false)
    if (apiRes && apiRes.status && apiRes.response.message) {
      PublishMqtt({ topic: apiRes.response.message.element_id });
      setBinNo(apiRes.response.message.element_num)
      if (type === "fulfilled") {
        showDialog(true);
        dialogTitle = "Confirm Filled Bin Request";
        dialogMessage = "Are you sure you wish to confirm filled bin request "
        setDialogTitle(dialogTitle);
        setDialogMessage(dialogMessage);
        setTask(item)
      }
      else if (type === "delivered") {
        showDialog(true);
        dialogTitle = "Deliver Filled Bin Request";
        dialogMessage = "Are you sure you wish to confirm filled bin request "
        setDialogTitle(dialogTitle);
        setDialogMessage(dialogMessage);
        setTask(item)
      }
    }
    else {
      Alert.alert("Bin not found")
    }
  }

  const openDialog = (e, type, item) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    if (type === "cancel") {
      dialogTitle = "Cancel Filled Bin Request";
      dialogMessage = "Are you sure you wish to cancel filled bin request "
    }

    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setTask(item)
  }

  const updateRequest = () => {
    let invokeApi = false;
    let apiData = {}
    apiData.op = "update"
    apiData._id = task._id
    if (dialogType === "fulfilled") {
      apiData.task_state = taskState.FULFILL
      invokeApi = true;
    }
    else if (dialogType === "cancel")
      apiData.task_state = taskState.CANCEL

    else if (dialogType === "delivered")
      apiData.task_state = taskState.DELIVER

    ApiService.getAPIRes(apiData, "POST", "task").then(apiRes => {
      if (apiRes && apiRes.status) {
        let msg = "";
        if (dialogType === "fulfilled") {
          msg = "Task fulfilled"
          console.log("binNo .. " + binNo)
          AsyncStorage.getItem("deviceDet").then(async devices => {
            console.log("devices here 123 " + JSON.parse(devices))
            let devicesDet = JSON.parse(devices);
            let device = devicesDet.find(device => device.element_num === binNo);
            console.log("device " + JSON.stringify(device))
            if (device) {
              console.log(device.device_id)
              PubBatterySleep({ topic: device.device_id })
            }
          })

        }
        if (dialogType === "cancel") msg = "Task Cancelled";
        if (dialogType === "delivered") msg = "Task Delivered";

        loadData();
        Alert.alert(msg);
        closeDialog();
      }
      else if (apiRes.response.message)
        setApiError(apiRes.response.message)
    })
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        {binTask && binTask.length ? binTask.map((item, index) => {
          return (<View style={{ flexDirection: 'row', padding: 5, backgroundColor: 'white', margin: 5 }} key={index}>
            <View style={{ flexDirection: 'column', flex: 3, padding: 5 }}>
              {item.task_state.toLowerCase() === "requested" ? (userState.user.role === roles.MO ? <Text
                style={[AppStyles.subtitle, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                {item.requester_id === item.resolver_id ? item.stage + " - Requested Filled Bin" : "Requested forklift " + item.resolver_emp_name + " to pick Filled Bin"}</Text> :
                <Text
                  style={[AppStyles.subtitle, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                  {"Supply to " + item.stage + " " + (item.stage.toLowerCase() === stageType.forging ? " ( " + item.forge_machine_id + " ) " : '')}</Text>) :
                <Text
                  style={[AppStyles.subtitle, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                  {"Forklift " + item.resolver_emp_name + " delivered filled bin"}</Text>
              }

              {userState.user.role === roles.MO ?
                <Text
                  style={[AppStyles.info, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                  {item.updated_on}</Text> :
                <Text
                  style={[AppStyles.info, { justifyContent: 'flex-start', color: 'black', padding: 1 }]}>
                  {"Requested By " + item.requester_emp_name + " " + item.updated_on}</Text>
              }
            </View>
            {item.task_state.toLowerCase() === "requested" && item.requester_id === item.resolver_id && userState.user.role === roles.MO ?
              <TouchableOpacity style={[AppStyles.warnButtonContainer, { flex: 1, margin: 10 }]}
                onPress={(e) => showBin(e, "fulfilled", item)}
              >
                <Text style={AppStyles.warnButtonTxt}>SHOW BIN</Text>
              </TouchableOpacity>

              : false}
            {item.task_state.toLowerCase() === "delivered" && userState.user.role === roles.MO ?
              <TouchableOpacity style={[AppStyles.warnButtonContainer, { flex: 1, margin: 10 }]}
                onPress={(e) => showBin(e, "fulfilled", item)}
              >
                <Text style={AppStyles.warnButtonTxt}>SHOW BIN</Text>
              </TouchableOpacity>

              : false}

            {item.task_state.toLowerCase() === "requested" && item.requester_id != item.resolver_id && userState.user.role === roles.FO ?
              <TouchableOpacity style={[AppStyles.warnButtonContainer, { flex: 1, margin: 10 }]}
                onPress={(e) => showBin(e, "delivered", item)}
              >
                <Text style={AppStyles.warnButtonTxt}>SHOW BIN</Text>
              </TouchableOpacity>

              : false}

            {(item.task_state.toLowerCase() === "requested" || item.task_state.toLowerCase() === "delivered") && item.requester_id != item.resolver_id ?
              <TouchableOpacity style={[{ flex: 1, margin: 10 }]}
              >
              </TouchableOpacity>

              : false}
            {item.task_state.toLowerCase() === "requested" && userState.user.role === roles.MO ?

              <TouchableOpacity style={[AppStyles.canButtonContainer, { flex: 1, margin: 10 }]}
                onPress={(e) => openDialog(e, "cancel", item)}
              >
                <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
              </TouchableOpacity> : false}
          </View>)
        }) : false}
        {dialog && (dialogType === "fulfilled" || dialogType === "delivered") ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={updateRequest} closeDialog={closeDialog}
          okTitle={dialogType === "fulfilled" ? "PICK UP" : "DELIVERED"}
          container={
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '70%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>BIN No : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{binNo} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Stage : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.stage} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Process : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.process_name} </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Requested On : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.created_on} </Text>
              </View>
            </View>
          }
        /> : false}


        {dialog && dialogType === "cancel" ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          okDialog={updateRequest} closeDialog={closeDialog}
          container={
            <View style={{ flexDirection: 'column', alignItems: 'center', width: '70%' }}>

              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Stage : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{stage} </Text>

              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Process : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.process_name} </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Requested On : </Text>
                <Text style={[AppStyles.title, { flex: 2, textAlign: 'left', color: appTheme.colors.cardTitle, fontFamily: appTheme.fonts.bold }]}>{task.created_on} </Text>
              </View>
            </View>
          }
        /> : false}

        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}



      </View>


    </ScrollView>
  )
})

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});