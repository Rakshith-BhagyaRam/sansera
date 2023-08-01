import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import CustomModal from "../../components/CustomModal";
import { EmptyBinContext } from "../../context/EmptyBinContext";


  export const Rejection = React.memo((props) => {

  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [rejections,setRejections] = useState([])
  const [curRejection,setCurRejection] = useState({});
  const [curRejMenu,setCurRejMenu] = useState('')
  const [level1,setLevel1] = useState([])
  const [level2,setLevel2] = useState(false)
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType,setDialogType] = useState('')
  const [rejCount,setRejCount] = useState(0);
  const [rejReason,setRejReason] = useState('');
  const [rejSubType,setRejSubType] = useState('')
  const [subTypeReasons,setSubTypeReasons] = useState([])
  const [curRejCount,setCurRejCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [rejError,setRejError] = useState('')
  const isFocused = useIsFocused();
  const { appProcess } = React.useContext(EmptyBinContext)

  let rejectionMenu = [];
 

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => { }
  }, [isFocused])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const loadData = async () => {
    let apiData = {
      "op": "get_rejections",
      "unit_num":userState.user.unit_number
    }
    apiData.process_name = appProcess.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")
    setRefreshing(false);
    setRejCount(0);
    setCurRejection({})

    ApiService.getAPIRes(apiData, "POST", "rejection").then(async apiRes => {
      setApiStatus(false);
      if (apiRes ) {
        if (apiRes.status && apiRes.response.message && apiRes.response.message.rejections) {
          let rejections = apiRes.response.message.rejections
          setRejections(rejections)
          
            let menuKeys = await rejections.reduce((keys, obj) => (
              keys.concat(Object.keys(obj).filter(key => (
                keys.indexOf(key) === -1))
              )
            ), [])
            if(Object.keys(curRejection).length){
              let index = menuKeys.indexOf(curRejMenu)
              if(index > -1) {
                handleRejection(rejections[index])
              }
            }
            else{
              handleRejection(rejections[0])
            }
        }
      }
      else if (apiRes && apiRes.response.message) {
        setApiError(apiRes.response.message)
        setRejections([])
      }
    });
  }
 
  const handleChange = (name) => async(value, index) => {
    if (name === "reason") {
      setRejReason(value)
      let curKey = Object.keys(curRejection)[0]
      if(level2){
        let level2Obj = curRejection[curKey].find(item =>  
          {return (Object.keys(item).length && Object.keys(item)[0] === rejSubType) })
        let nestedObj = level2Obj[rejSubType].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === value) })
        if (nestedObj) {
          setCurRejCount(nestedObj[value])
        }
      }
      else{
        let nestedObj = curRejection[curKey].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === value) })
        if (nestedObj) {
          setCurRejCount(nestedObj[value])
        }
      }
     
    }
    if(name === "subType"){
      setRejSubType(value)
      let curKey = Object.keys(curRejection)[0];
      let curObj = curRejection[curKey];
      let nestedObj = curObj.find(item => 
        (Object.keys(item).length && Object.keys(item)[0] === value))

      let subTypeReasonList = await nestedObj[value].reduce((keys, obj) => (
        keys.concat(Object.keys(obj).filter(key => (
          keys.indexOf(key) === -1))
        )
      ), [])

    
      setSubTypeReasons(subTypeReasonList)
      setRejReason(subTypeReasonList[0])
      let curReason = nestedObj[value].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === subTypeReasonList[0]) })
 
      if(curReason)
        setCurRejCount(curReason[subTypeReasonList[0]])

    }
  };
  const handleRejection = async (item) => {
    setRejError('')
    setCurRejection(item);
    let key = Object.keys(item)[0]
    setCurRejMenu(key)
    let level1Keys = await item[key].reduce((keys, obj) => (
      keys.concat(Object.keys(obj).filter(key => (
        keys.indexOf(key) === -1))
      )
    ), [])
    setLevel1(level1Keys)
 
    if (Array.isArray(item[key][0][level1Keys[0]]))
    {
      //set level 2 here
      let presetSubType = level1Keys[0]
      setRejSubType(presetSubType)
      //setLevel2(item[key])
      setLevel2(true)

      let nestedObj = item[key].find(item =>{ 
        return  (Object.keys(item).length && Object.keys(item)[0] === presetSubType) })
      if(nestedObj){
        let subTypeReasonList = await nestedObj[presetSubType].reduce((keys, obj) => (
          keys.concat(Object.keys(obj).filter(key => (
            keys.indexOf(key) === -1))
          )
        ), [])    
        setSubTypeReasons(subTypeReasonList)
        setRejReason(subTypeReasonList[0])

        let curReason = nestedObj[presetSubType].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === subTypeReasonList[0]) })
 
        if (curReason)
         setCurRejCount(curReason[subTypeReasonList[0]])
      }
    }  
    else {
      setLevel2(false) 
      let nestedObj = item[key].find(item => { return (Object.keys(item).length && Object.keys(item)[0] === level1Keys[0]) })
      if(nestedObj){
        setRejReason(level1Keys[0])
        setCurRejCount(nestedObj[level1Keys[0]])
      }
    }
  } 

  const validateRejection = () => {
    setRejError('')
    let valid = true;
    if(!level2){
      if (rejReason.length === 0 || rejCount == 0){
        setRejError('Please enter mandatory fields')
        valid = false;
      }
    }
    else{
      if (rejReason.length === 0 || rejCount == 0 || rejSubType.length === 0){
        setRejError('Please enter mandatory fields')
        valid = false;
      }
    }
    if(valid){
      showDialog(true);
      setDialogTitle("Save Rejections")
    }

  }
  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setDialogType('')

  }
  const openDialog = (type) => {
    showDialog(true);
    let dialogTitle = "";
    let dialogMessage = "";
    setDialogType(type)
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }
  
  const updateRejections = async() => {
    let apiData = { op: "update_rejection"}
    apiData.process_name = appProcess.process_name
    apiData.stage_name = await AsyncStorage.getItem("stage")
    let rejReasonObj = {};
    rejReasonObj[rejReason] =  parseInt(rejCount)
    if(level2){
      let rejSubTypeObj = {} 
      rejSubTypeObj[rejSubType] = rejReasonObj
      let rejObj = {}
      rejObj[Object.keys(curRejection)[0]] = rejSubTypeObj;
      apiData.rejections = rejObj;
    }
    else{
      let rejObj = {}
      rejObj[Object.keys(curRejection)[0]] = rejReasonObj;
      apiData.rejections = rejObj;
    }



    setRefreshing(false);
    ApiService.getAPIRes(apiData, "POST", "rejection").then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
         setRejCount(0)
         closeDialog();
         props.updateProcess();
         loadData()
      }
      else if(apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    });
  }
   
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }>
      
      <View style={styles.mainContainer}>
        <View style={{flexDirection:'row'}}>
        <View style={{flex:2}}>
          {rejections.map((item, index) => {
            let rejectionMenu = Object.keys(item);
            return (<TouchableOpacity
              style={{
              }}
              onPress={(e) => handleRejection(item)}
            >
              <Text key={index} 
                style={[AppStyles.sideMenu, {
                  borderRadius:5,
                  margin: 5, padding: 10, backgroundColor: rejectionMenu[0] == Object.keys(curRejection)[0] ? appTheme.colors.cardTitle : 'white',
                  color: rejectionMenu[0] == Object.keys(curRejection)[0] ? 'white' : appTheme.colors.cardTitle}]}
              
            >{rejectionMenu[0]}</Text></TouchableOpacity>)
          })}
        </View>
        <View style={{ flex: 6,margin:5,padding:5,backgroundColor:'white' }}>
           
            {curRejection && level1.length && !level2 ? 
              <View style={{flexDirection:'column'}}>
               
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, padding: 5 }}>
                  <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Reason <Text style={{ color: 'red' }}>* </Text></Text>
                  <Picker
                    selectedValue={rejReason}
                    onValueChange={handleChange("reason")}
                    mode="dialog"
                    style={{ backgroundColor: "#ECF0FA", flex: 2 }}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}
                  >
                    {level1.map((pickerItem, pickerIndex) => {
                      return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem} value={pickerItem} key={pickerIndex} />)
                    })}
                  </Picker>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, padding: 5 }}>
                  <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Rejection Count <Text style={{ color: 'red' }}>* </Text> ({curRejCount})</Text>
                  <TextInput keyboardType="numeric" style={[AppStyles.filterText, { flex: 2  }]} onChangeText={value => setRejCount(value)} value={rejCount}></TextInput>
                </View>
              </View>
              
             : false}

            {curRejection && level1.length && level2 ?
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, padding: 5 }}>
                  <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Reason <Text style={{ color: 'red' }}>* </Text></Text>
                  <Picker
                    selectedValue={rejSubType}
                    onValueChange={handleChange("subType")}
                    mode="dialog"
                    style={{ backgroundColor: "#ECF0FA", flex: 2 }}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}
                  >
                    {level1.map((pickerItem, pickerIndex) => {
                      return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem} value={pickerItem} key={pickerIndex} />)
                    })}
                  </Picker>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, padding: 5 }}>
                  <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Reason <Text style={{ color: 'red' }}>* </Text></Text>
                  <Picker
                    selectedValue={rejReason}
                    onValueChange={handleChange("reason")}
                    mode="dialog"
                    style={{ backgroundColor: "#ECF0FA", flex: 2 }}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}
                  >
                    {subTypeReasons.map((pickerItem, pickerIndex) => {
                      return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem} value={pickerItem} key={pickerIndex} />)
                    })}
                  </Picker>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5, padding: 5 }}>
                  <Text style={[AppStyles.filterLabel, { flex: 1 }]}>Rejection Count <Text style={{ color: 'red' }}>* </Text> ({curRejCount})</Text>
                  <TextInput keyboardType="numeric" style={[AppStyles.filterText, { flex: 2 }]} onChangeText={value => setRejCount(value)} value={rejCount}></TextInput>
                </View>
              </View>

              : false}

            {rejError.length ? <Text style={AppStyles.error}>{rejError}</Text> : false}
            <View style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'center',
              margin: 5, marginTop: 20
            }}>
              <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row', }]}
                onPress={(e) => validateRejection(e)} disabled={apiStatus} 
                >
                <Text style={AppStyles.successText}>SAVE</Text>
              </TouchableOpacity>
            </View>
        </View>
        </View>
       

        {dialog ? <CustomModal modalVisible={dialog} dialogTitle={dialogTitle}
         dialogMessage={dialogMessage}
          closeDialog={closeDialog} okDialog={updateRejections} /> : false}
        
     

      
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