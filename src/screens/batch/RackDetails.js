import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View,  ScrollView, RefreshControl } from "react-native";
import { dateUtil } from "../../commons";
import CustomHeader from "../../components/CustomHeader";
import { useIsFocused } from '@react-navigation/native';
import FormGrid from "../../lib/FormGrid";


let createdBatch = [
  {"key": "supplier", displayName: "Supplier",value:""},
  { "key": "diameter", displayName: "Diameter", value: ""},
  { "key": "material_code", displayName: "Material", value: ""},
  { "key": "heat_num", displayName: "Heat Number", value: ""},
  { "key": "batch_num", displayName: "Batch", value: ""},
  { "key": "created_on", displayName: "Created Date", value: ""},
  { "key": "total_weight", displayName: "Total Quantity (in Kg)", value: ""},
  { "key": "current_weight", displayName: "Current Quantity (in Kg)", value: ""},
  { "key": "reject_weight", displayName: "Reject Quantity (in Kg)", value: ""},
  { "key": "status", displayName: "Status", value: ""}
]

export const RackDetails = React.memo ((props) => {
  const [batchFormData, setBatchFormData] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused, (props.content && props.content._id)])

 


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
   
  }, []);


  const loadForm = () => {
    let batchSchemaData = [];
    if (props.content._id) {
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item["value"] = props.content[item.key] ? props.content[item.key] + "" : "";
        if (item.type === "date") {
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
        if (item.key === "status" && props.content[item.key].toLowerCase() === "new")
          item.value = "HOLD"
      });
      setBatchFormData(batchSchemaData);

    }
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
    >
      <View style={styles.container}>
        <FormGrid labelDataInRow={true} formData={batchFormData} /> 
      </View>
    </ScrollView>
  )
})
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    margin: 1
  }
});