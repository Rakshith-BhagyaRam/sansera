import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import CustomHeader from "../../components/CustomHeader";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import FormGrid from "../../lib/FormGrid";



let createdBatch = [
  {
    "key": "batch_num", displayName: "Batch", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "batch num", type: "string"
  },
  {
    "key": "created_on", displayName: "Created Date", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "created date", type: "date"
  },
  {
    "key": "supplier", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "supplier", type: "string"
  },
  // {
  //   "key": "type", displayName: "Type", placeholder: "", value: "", error: "",
  //   required: true, lowerCase: true, "label": "type", type: "string"
  // },
  {
    "key": "heat_num", displayName: "Heat Number", placeholder: "", value: "",
    error: "", required: true, label: "heat number", type: "string"
  },
  {
    "key": "total_weight", displayName: "Total Quantity (in Kg)", placeholder: "", value: "",
    error: "", required: true, label: "quantity", type: "number"
  },
  {
    "key": "created_by", displayName: "Created By", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "created by", type: "string"
  },
  {
    "key": "status", displayName: "Status", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "status", type: "string"
  }
]

export default function Batch(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused,props.content._id])


  const loadForm = () => {
    let batchSchemaData = [];
    if (props._id) {
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item["value"] = props._id ? props.content[item.key] + "" : "";
        if (item.type === "date") {
          item.value = dateUtil.toDateFormat(item.value, "DD MMM YYYY hh:mm");
        }
      });
      setBatchFormData(batchSchemaData);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollView} >
      <View style={styles.container}>
        {props.noTitle ? false
          : <CustomHeader title={props.title ? props.title : ""} align="center" />}
        {props._id ? <FormGrid labelDataInRow={true} formData={batchFormData} /> :false}
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