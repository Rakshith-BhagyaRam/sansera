import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { dateUtil } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormGrid from "../../lib/FormGrid";


let created_process_schema = [
  {
    "key": "hold_materials_weight", displayName: "Hold Weight", placeholder: "", value: "", error: "",
     "label": "Hold Weight", type: "string"
  },
  {
    "key": "reject_weight", displayName: "Rejected Weight", placeholder: "", value: "", error: "",
    required: true, "label": "batch created on", type: "string"
  },
  {
    "key": "ok_end_billets_weight", displayName: "OK Billets Weight (kg)", placeholder: "", value: "", error: "",
    required: true, type: "string"
  },
 
  {
    "key": "ok_component", displayName: "OK Billets (count)", placeholder: "", value: "", error: "",
    required: true, type: "string"
  },
  {
    "key": "ok_bits_count", displayName: "OK Bits (count)", placeholder: "", value: 0, error: "",
    required: false, "label": "Count of OK Bits", type: "number", defaultValue: 0,
  },
  {
    "key": "ok_bits_weight", displayName: "OK Bits Weight (kg)", placeholder: "", value: 0, error: "",
    required: false, "label": "OK Bits Weight", type: "number", defaultValue: 0,
  },
  {
    "key": "updated_on", displayName: "Last Updated", placeholder: "", value: "",
    error: "", required: true, label: "components", type: "string"
  }
]


export default function WeightDetails(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const appState = React.useContext(UserContext);
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();


  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused])

  


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadForm = async() => {
    let value = await AsyncStorage.getItem("stage");

    if (props && props.processEntity && props.processEntity.process) {
      let stage_ok_comp_index = props.processEntity.process.findIndex(item => item.stage_name === value)

      created_process_schema.map(item => {
        item["value"] = props.processEntity[item.key] ? props.processEntity[item.key] + "" : "";
        if (item.type === "date") {
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
        if (item.key === "hold_materials_weight" && props.processEntity.process[stage_ok_comp_index]){
          item.value = props.processEntity.process[stage_ok_comp_index][item.key]+ ""
        }
        if (value.toLowerCase() === "shearing" && item.key === "ok_end_billets_weight" && props.processEntity.process[stage_ok_comp_index]) {
          item.value = props.processEntity.process[stage_ok_comp_index][item.key] + ""
        }
        if (value.toLowerCase() === "shearing" && item.key === "ok_bits_count" && props.processEntity.process[stage_ok_comp_index]) {
          item.value = props.processEntity.process[stage_ok_comp_index][item.key] + ""
        }
        if (value.toLowerCase() === "shearing" && item.key === "ok_bits_weight" && props.processEntity.process[stage_ok_comp_index]) {
          item.value = props.processEntity.process[stage_ok_comp_index][item.key] + ""
        }
        if (value.toLowerCase() === "shearing" && item.key === "ok_component" && props.processEntity.process[stage_ok_comp_index]) {
          item.value = props.processEntity.process[stage_ok_comp_index][item.key] + ""
        }
      });
    }
    setBatchFormData(created_process_schema); 
  }
  
  

  return (
    <ScrollView contentContainerStyle={styles.scrollView} 
    refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> } >
      <View style={styles.container}>
        {props.noTitle ? false : <CustomHeader title={props.title ? props.title : ""} align={"center"} />}
         <FormGrid
          formData={batchFormData} 
          labelDataInRow={true}
          labelFlex={1}
          dataFlex={1}
        /> 
        {/* <ActivityIndicator size="large" animating={apiStatus} /> */}
        {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}
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
  }
});