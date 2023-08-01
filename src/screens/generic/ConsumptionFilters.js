import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, RefreshControl, ActivityIndicator, Touchable } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import ErrorModal from "../../components/ErrorModal";
import { ConsumptionData } from "../generic/ConsumptionData";
import AppStyles from "../../styles/AppStyles";
import { Picker } from '@react-native-picker/picker';
import UserContext from "../UserContext";


export default function ConsumptionFilters() {
  const isFocused = useIsFocused();
  const [apiStatus,setApiStatus] = useState(false)
  const [apiError, setApiError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [process, setProcess] = useState([])
  const [processName, setProcessName] = useState('')
  const [stageName, setStageName] = useState('')
  const [stages, setStages] = useState([])
  const userState = React.useContext(UserContext);


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

  const errOKAction = () => {
    setApiError('')
  }
  const handleChange = (name) => (value, index) => {
    if (name === "processName") {
      let pIndex = process.findIndex(item => item.process_name === value);
      if (pIndex > -1) {
        setStages(process[pIndex].process);
        setProcessName(value)
        setStageName(process[pIndex].process[0].stage_name)
      }
    }
    else if (name === "stageName") setStageName(value)

  }

  return (
    
    <View style={styles.container}>
      <View style={{flexDirection:'row'}}>
      <View style={{ flexDirection: 'row', alignItems: 'center',flex:1 }}>
        <Text style={AppStyles.filterLabel}>Select Process</Text>
        <Picker
          selectedValue={processName}
          onValueChange={handleChange("processName")}
          mode="dialog"
          style={{ backgroundColor: "#ECF0FA", flex: 1 }}
          itemStyle={{}}
          dropdownIconColor={appTheme.colors.cardTitle}
        >
          {process.map((pickerItem, pickerIndex) => {
            return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem.process_name} value={pickerItem.process_name} key={pickerIndex} />)
          })}
        </Picker>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center',flex:1 }}>
        <Text style={AppStyles.filterLabel}>Select Stage</Text>
        <Picker
          selectedValue={stageName}
          onValueChange={handleChange("stageName")}
          mode="dialog"
          style={{ backgroundColor: "#ECF0FA", flex: 1 }}
          itemStyle={{}}
          dropdownIconColor={appTheme.colors.cardTitle}>
          {stages.map((pickerItem, pickerIndex) => {
            return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={pickerItem.stage_name} value={pickerItem.stage_name} key={pickerIndex} />)
          })}
        </Picker>
      </View>
      </View>
      {console.log(processName+" .... "+stageName)}
      {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}
        <ConsumptionData 
        processEntity={{ "process_name": processName, stage_name: stageName }} 
        processName={processName}
        stageName={stageName}
        />
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  }
});