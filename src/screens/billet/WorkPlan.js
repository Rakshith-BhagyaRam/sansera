import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import ProcessDetails from "../process/ProcessDetails";
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestBin from "../generic/RequestBin";
import ProcessInfo from "../process/ProcessInfo";
import { EmptyBinContext } from "../../context/EmptyBinContext";

let stageSchema = [
  {
    "key": "one punch billet", displayName: "One Punch Billet (Count)", placeholder: "", value: 0,
    error: "", required: true, label: "One Punch Billet", type: "number", defaultValue: 0
  },
  {
    "key": "two punch billet", displayName: "Two Punch Billet (Count)", placeholder: "", value: 0,
    error: "", required: true, label: "Two Punch Billet", type: "number", defaultValue: 0
  },
  // {
  //   "key": "three punch billet", displayName: "Three Punch Billet (Count)", placeholder: "", value: 0,
  //   error: "", required: true, label: "Three Punch Billet", type: "number", defaultValue: 0
  // },
]



export default function WorkPlan(props) {
  const [formData, setFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [count, setCount] = useState(0);
  const [rackData,setRackData] = useState({})
  const { appProcess } = React.useContext(EmptyBinContext)


  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused])

 

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadForm = () => {
    let schemaData = [...stageSchema];
    setFormData(schemaData);
    setCount(previousCount => previousCount + 1);
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
    setBatchDet({})
    setRackData({})
  }

  const openDialog = (batchDetails) => {
    showDialog(true);
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.process_name + " is the new process generated. Please click ok to confirm";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

 
  const handleSubmit = async () => {
    let loginFormData = [...formData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });


    let apiData = {} ;
    apiData.op = "update_process",
    apiData.process_name = appProcess.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")
    apiData.properties = await util.filterFormData([...formData])
    setFormData(validFormData);
    if (!isError) {
      setApiStatus(true);
      ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message) {
            Alert.alert("Process updated");
           // props.setProcessEntity(apiRes.response.message)
            props.updateProcess()
            util.resetForm(formData);
          }
        }
      });

    }
  
  }

  const reloadPage = (response) => {
    props.updateProcess()
  }

  const showReqBin = (e) => {
    setDialogTitle("REQUEST TO")
    setDialogMessage("")
    showDialog(true);
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }>
      <View style={styles.mainContainer}>
        <View style={{flexDirection:'row'}}>
          <View style={{flex:2,backgroundColor:'white',margin:5,padding:5}}>

            <TouchableOpacity
              style={[AppStyles.warnButtonContainer, { width:'50%',marginBottom:20 }]} 
              onPress={(e) => showReqBin(e)} 
              >
              <Text style={AppStyles.warnButtonTxt}>REQUEST FILLED BIN</Text>
            </TouchableOpacity>
            {/* <View style={{flexDirection:'row',margin:10}}>
              <Text style={AppStyles.filterLabel}>Empty Bin </Text>
              <CustomHeader  title=""></CustomHeader>
            </View> */}
            <View style={{ flexDirection: 'column', margin: 10 }}>

            <FormGen
              handleChange={handleChange}
              formData={formData} labelDataInRow={false}
            />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center',
            margin:5,marginTop:20 }}>
              <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row', }]} 
                onPress={(e) => handleSubmit(e)} disabled={apiStatus} >
                <Text style={AppStyles.successText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex:3,flexDirection:'row',}}>
            <View style={{ flex: 1, backgroundColor: 'white',margin:5,padding:5}}>
              <ProcessInfo 
                title="PROCESS DETAILS"
                processEntity={appProcess}
                fields={["total_rejections"]}

                />
             
            </View>
           
          </View>
        </View>
       {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          container={<RequestBin  processEntity={appProcess}
            //reloadPage={reloadPage}
            closeDialog={closeDialog}
          />} 
       
       /> : false}
      
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  mainContainer:{
    justifyContent: "center",
    margin: 10,
  },
  container: {
    //flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 10,
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt
  },


  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold"
  },

});