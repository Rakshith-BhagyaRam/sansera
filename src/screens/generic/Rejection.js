import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import ProcessInfo from "../process/ProcessInfo";
import { EmptyBinContext } from "../../context/EmptyBinContext";



export const  Rejection = React.memo((props) => {
  const [formData, setFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false)
  const [rejCount,setRejCount] = useState(0)
  const [curRejCount,setCurRejCount] = useState(0)
  const [rejReason,setRejReason] = useState('')
  const [rejReasons,setRejReasons] = useState('')
  const [rejections,setRejections] = useState([])
  const [rejError,setRejError] = useState('')
  const isFocused = useIsFocused();
  const [rackData, setRackData] = useState({})
  const { appProcess } = React.useContext(EmptyBinContext)

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused,appProcess])


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadData = async () => {
    let apiData = {
      "op": "get_rejections",
      "unit_num": userState.user.unit_number

    }
    apiData.process_name =appProcess.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")
    setRefreshing(false);
    setRejCount(0);


    ApiService.getAPIRes(apiData, "POST", "rejection").then(async apiRes => {
      setApiStatus(false);
      if (apiRes) {
        if (apiRes.status && apiRes.response.message && apiRes.response.message.rejections) {
          let rejections = apiRes.response.message.rejections
          setRejections( )
         // setRejections(rejections)
          let stage_name = await AsyncStorage.getItem("stage");
          let curKey = Object.keys(rejections[0])[0]
          let menuKeys = await rejections[0][curKey].reduce((keys, obj) => (
            keys.concat(Object.keys(obj).filter(key => (
              keys.indexOf(key) === -1))
            )
          ), [])

          
              
          if(rejReason === ''){
            let initalReason = menuKeys[0];
          
            setRejReasons(menuKeys)
            setRejReason(initalReason)
            let curKey = Object.keys(rejections[0])[0]

            let nestedObj = rejections[0][curKey].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === initalReason) })
            if (nestedObj) {
              setCurRejCount(nestedObj[initalReason])
            }
          }
          else{
            let initalReason =rejReason;
            setRejReasons(menuKeys)
            setRejReason(initalReason)
            let curKey = Object.keys(rejections[0])[0]

            let nestedObj = rejections[0][curKey].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === initalReason) })
            if (nestedObj) {
              setCurRejCount(nestedObj[initalReason])
            }
          }
        }
      }
      else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message)
        setRejections([])
      }
    });
  }

  const handleChange = (name) =>  (value, index) => {
    if (name === "reason") {
      setRejReason(value)
      let curKey = Object.keys(rejections[0])[0]

      let nestedObj = rejections[0][curKey].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === value) })
      if (nestedObj)
        setCurRejCount(nestedObj[value])
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setRejError('')
  }


  const validateRejection = () => {
    setRejError('')
    let valid = true;
    if (rejReason.length === 0 || rejCount < 1) {
      setRejError('Please enter mandatory fields')
      valid = false;
    }
    
    if (valid) {
      showDialog(true);
      setDialogTitle("Save Rejections")
    }

  }

  const updateRejections = async () => {
    let apiData = { op: "update_rejection" }
    apiData.process_name = appProcess.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")

    let rejReasonObj = {};
    rejReasonObj[rejReason] = parseInt(rejCount)
    let rejObj = {}
    let curKey = Object.keys(rejections[0])[0]
    rejObj[curKey] = rejReasonObj;
    apiData.rejections = rejObj;

    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "rejection").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        Alert.alert("Rejections updated");
        setRejCount(0)
        closeDialog();
        loadData()
        //props.setProcessEntity(apiRes.response.message)
        props.updateProcess()
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });

  }

  const reloadPage = (response) => {
    props.updateProcess()
  }

 
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 2, backgroundColor: 'white', margin: 5, padding: 5 }}>

            <View style={{ flexDirection: 'column'}}>
              <View style={{flexDirection:'row',margin:5}}>
                <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Rejection Reason <Text style={{ color: 'red' }}>* </Text></Text>
                <Picker
                  selectedValue={rejReason}
                  onValueChange={handleChange("reason")}
                  mode="dialog"
                  style={[AppStyles.pickerStyle,{  flex: 2 }]}
                  itemStyle={{}}
                  dropdownIconColor={appTheme.colors.cardTitle}
                >
                  {rejReasons ? rejReasons.map((pickerItem, pickerIndex) => {
                    return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem} value={pickerItem} key={pickerIndex} />)
                  }) : false}
                </Picker>
              </View>
              <View style={{flexDirection:'row',margin:5}}>
                <Text style={[AppStyles.filterLabel, { flex: 1, }]}>Rejection Count <Text style={{ color: 'red' }}>* </Text> ({curRejCount})</Text>
                <TextInput style={[AppStyles.filterText,{flex:2,padding:5}]} keyboardType="numeric" 
                  onChangeText={value => setRejCount(value)}
                value={rejCount}></TextInput>
              </View>
              {rejError.length ? <Text style={AppStyles.error}>{rejError}</Text> : false}

              <View style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'center',
                margin: 5, marginTop: 20
              }}>
                <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row', }]}
                  onPress={(e) => validateRejection(e)} disabled={apiStatus} >
                  <Text style={AppStyles.successText}>SAVE</Text>
                </TouchableOpacity>
              </View>
             

            </View>
            
          </View>
          <View style={{ flex: 3, flexDirection: 'row', }}>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <ProcessInfo
                title="PROCESS DETAILS"
                processEntity={appProcess}
                fields={["total_rejections"]}                
                />
                
            </View>
           
          </View>
        </View>
        {dialog ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          closeDialog={closeDialog} okDialog={updateRejections}
          
          /> : false}
        

      </View>
    </ScrollView>
  )
})
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },
  container: {
    //flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 10,
  }
});