import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { appTheme } from "../../lib/Themes";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { default as AppStyles } from "../../styles/AppStyles";
import { TextInput } from "react-native-gesture-handler";
import { ApiService } from "../../httpservice";
import { RadioButton } from "react-native-paper";
import { roles } from "../../constants/appConstants";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function RequestBin(props) {
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const appState = React.useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [binErr, setBinErr] = useState('')
  const [requestType,setRequestType] = useState('self')
  const userState = React.useContext(UserContext);
  const [forkUsers,setForkUsers] = useState([])
  const [forkOp,setForkOp] = useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);


  const closeDialog = () => {
    props.closeDialog();
  }

  const handleSubmit = async() => {
    if(requestType.length == 0)
      setBinErr("Please select SELF/FORKLIFT")
    else if(requestType === "forklift" && !forkOp.length)
      setBinErr("Please select fork operator")
    else {
      setApiStatus(true);
      let apiData = {};
      apiData.process_name = props.processEntity.process_name
      apiData.op = "create"
      apiData.resolver_id = requestType === "self" ? userState.user.id : forkOp
      apiData.stage = await AsyncStorage.getItem("stage");
      console.log("request bin apiData "+JSON.stringify(apiData))

      ApiService.getAPIRes(apiData, "POST", "task").then(apiRes => {
        console.log("request bin res "+JSON.stringify(apiRes))
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          Alert.alert("Filled Bin Requested")
          props.closeDialog()
        }
      });
    }
   
  }

  const handleChange = (name) => async (value, index) => {
    if (name === "forkOp") {
      setForkOp(value)
    }
  };
  const handleRequestType = (name) => (value) => {
    setRequestType(value)
    if(value === "forklift"){
      let apiData = { op : "fetch_member_by_role",role:roles.FO}
      apiData.parent_suborg_id = userState.user.parent_suborg_id
      ApiService.getAPIRes(apiData,"POST","org").then(apiRes => {
        if(apiRes && apiRes.status){
          if(apiRes.response.message && apiRes.response.message.length){
            setForkUsers(apiRes.response.message)
            setForkOp(apiRes.response.message[0])
          }
        }
        else if(apiRes.response.message)
          setApiError(apiRes.response.message)
      })
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={[styles.container, { alignItems: 'center', flexDirection: 'column' }]}>
        <View style={{flexDirection:'row',margin:5,padding:5}}>
          <RadioButton.Group
            onValueChange={handleRequestType("requestType")}
            value={requestType}
            style={{ flexDirection: 'row', color: "blue", }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }} >
              <RadioButton value={"self"} />
              <Text style={[AppStyles.radioText, { color: appTheme.colors.warnAction,marginRight:15  }]}>SELF</Text>
              <RadioButton value={"forklift"} />
              <Text style={[AppStyles.radioText, { color: appTheme.colors.warnAction, }]}>FORKLIFT</Text>
            </View>
          </RadioButton.Group>
        </View>
        {requestType === "forklift" ? <View style={{flexDirection:'row',width:'50%'}}>
          <Picker
            selectedValue={forkOp}
            onValueChange={handleChange("forkOp")}
            mode="dialog"
            style={{ backgroundColor: "#ECF0FA", flex: 2 }}
            itemStyle={{}}
            dropdownIconColor={appTheme.colors.cardTitle}
          >
            {forkUsers && forkUsers.length ? forkUsers.map((pickerItem, pickerIndex) => {
              return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem.emp_id} value={pickerItem.user_id} key={pickerIndex} />)
            }) : false}
          </Picker>


        </View>: false}
        
       
        <View style={{ flexDirection: 'row', width: '60%', flex: 1,margin:10,marginTop:60}}>
         
          <TouchableOpacity style={[AppStyles.canButtonContainer, { flex: 1, marginRight: 10 }]}
            onPress={(e) => closeDialog(e)}
          >
            <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[AppStyles.successBtn, { flex: 1 }]}
            onPress={(e) => handleSubmit(e)}
            disabled={apiStatus}
          >
            <Text style={AppStyles.successText}>SAVE</Text>
          </TouchableOpacity>
        </View>
        {binErr && binErr.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {binErr} </Text>) : (false)}
      </View>


    </ScrollView>
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 1
  },
});