import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert, SegmentedControlIOSComponent } from "react-native";
import { dateUtil, util } from "../../commons";
import FormGen from "../../lib/FormGen"
import CustomHeader from "../../components/CustomHeader";
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import FormGrid from "../../lib/FormGrid";
import AppStyles from "../../styles/AppStyles";
import ErrorModal from "../../components/ErrorModal";

let batchSchema = [
  {
    "key": "supplier_id", displayName: "Supplier", placeholder: "", value: "", error: "",
    required: true, "label": "supplier", select: true,
    options: [],
    keyName: "_id", valueName: "supplier_name", titleCase: true
  },
  {
    "key": "material_code", displayName: "Material Code", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "Material Code", select: true,
    options: [],
    keyName: "material_code", valueName: "material_code", lowerCase: false
  },
  {
    "key": "material_grade", displayName: "Material Grade", placeholder: "", value: "", error: "",
    required: true, lowerCase: true, "label": "Material Grade", select: true,
    options: [],
    //keyName: "material_grade", valueName: "material_grade",
     lowerCase: false
  },
  // {
  //   "key": "type", displayName: "Type", placeholder: "", value: "steel", error: "",
  //   required: true, lowerCase: true, "label": "type", select: true, options: [
  //     { "_id": "steel", "value": "Steel" },
  //     { "_id": "aluminium", "value": "Aluminium" }
  //   ],
  //   keyName: "_id", valueName: "value"
  // },
  {
    "key": "heat_num", displayName: "Heat Number", placeholder: "", value: "",
    error: "", required: true, label: "heat number", type: "string"
  },
  {
    "key": "total_weight", displayName: "Total Quantity (in Kg)", placeholder: "", value: "",
    error: "", required: true, label: "quantity", type: "number", nonZero: true
  },
]

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

export default function BatchDetails(props) {
  const [batchFormData, setBatchFormData] = useState([])
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [supplier, setSupplier] = useState([])
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('')
  const [dialogMessage, setDialogMessage] = useState('');
  const [batchDet, setBatchDet] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [materials, setMaterials] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused, (props.content && props.content._id)])

  useEffect(() => {
    if (!props._id) {
      getSuppliers();
    }
    return () => { }
  }, [count])


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (!props._id)
      getSuppliers();
  }, []);


  const loadForm = () => {
    let batchSchemaData = [];
    if (props._id) {
      batchSchemaData = [...createdBatch];
      batchSchemaData.map(item => {
        item["value"] = props._id ? props.content[item.key] + "" : "";
        if (item.type === "date") {
          //convert date here
          console.log("before "+item.value)
          item.value = dateUtil.fromToDateFormat(item.value,"DD/MM/YYYY, hh:mm:ss A", "DD MMM YYYY hh:mm A");
          console.log("after " + item.value)

        }
        if (item.key === "status" && props.content[item.key].toLowerCase() === "new")
          item.value = "HOLD"
        if(item.key === "created_by"){
          item.value = props.content["created_by_emp_name"] + " (" + props.content[item.key]+")"
        }
      });
      setBatchFormData(batchSchemaData);

    }
    else {
      batchSchemaData = [...batchSchema];
      //let formData = await util.formatForm(batchSchemaData);
      setBatchFormData(batchSchemaData);
    }
    setCount(previousCount => previousCount + 1);

  }

  const getSuppliers = async () => {
    setApiStatus(true);

    let apiData = {
      "op": "get_suppliers"
    }
    setRefreshing(false);

    let apiRes = await ApiService.getAPIRes(apiData, "POST", "get_supplier");
    setApiStatus(false);
    if (apiRes && apiRes.status) {
      if (apiRes.response.message && apiRes.response.message.length) {
        setSupplier(apiRes.response.message)
        let formData = [...batchFormData];
        let index = formData.findIndex(item => item.key === "supplier_id");
        if (index != -1) {
          let updatedItem = formData[index];
          const options = apiRes.response.message;
          updatedItem["options"] = options;
          if (apiRes.response.message[0]) updatedItem.value = apiRes.response.message[0]._id;
          let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
          setBatchFormData([...updatedBatchData]);
          loadSupplierMaterials()
        }

      }
    }
  }

  const loadSupplierMaterials = () => {
    let formData = [...batchFormData];
    let sIndex = formData.findIndex(item => item.key === "supplier_id");
    let sItem = formData[sIndex]
    let mIndex = formData.findIndex(materialItem => materialItem.key === "material_code");
    let mgIndex = formData.findIndex(materialItem => materialItem.key === "material_grade");

    if (mIndex != -1 && sIndex != -1) {
      let selectedSupplierIndex = sItem.options.findIndex(item => item._id === sItem.value);
      let updatedItem = formData[mIndex];
      let updatedMaterialGrade = formData[mgIndex]
      if (selectedSupplierIndex != -1) {
        let material_details = sItem.options[selectedSupplierIndex].material_details
        if (material_details) {
          setMaterials(material_details)
          if (material_details.length && material_details[0]) updatedItem.value = material_details[0].material_code
          updatedItem.options = material_details;
          updatedMaterialGrade.options = material_details[0].material_grade
          console.log(material_details[0].material_code[0])
          updatedMaterialGrade.value = material_details[0].material_grade[0];
          updatedMaterialGrade.options = material_details[0].material_grade;
          //console.log("updatedMaterialGrade" + JSON.stringify(updatedMaterialGrade))
          let updatedBatchData = [...formData.slice(0, mIndex), updatedItem, ...formData.slice(mIndex + 1)];
          updatedBatchData[mgIndex] = updatedMaterialGrade;
          //console.log(JSON.stringify(updatedBatchData))
          setBatchFormData([...updatedBatchData]);
        }
      }
    }
  }

  const handleChange = (name) => value => {
    let formData = [...batchFormData]
    let index = formData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = formData[index]
      updatedItem["value"] = value;
      let updatedBatchData = [...formData.slice(0, index), updatedItem, ...formData.slice(index + 1)];
      setBatchFormData([...updatedBatchData]);
      if (name === "supplier_id") {
        loadSupplierMaterials();
      }
    }
  };

  const closeDialog = () => {
    showDialog(false)
    setDialogTitle('')
    setDialogMessage('')
    setBatchDet({})
    if (!props._id) {
      let newForm = util.resetForm(batchSchema)
      setBatchFormData(newForm);
      getSuppliers();

    }
  }
  const openDialog = (batchDetails) => {
    showDialog(true);
    let dialogTitle = "Confirm Batch Creation";
    let dialogMessage = batchDetails.batch_num + " is the new batch number generated.";
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
  }

  const handleSubmit = async () => {
    let loginFormData = [...batchFormData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    setBatchFormData(validFormData);
    if (!isError) {
      let apiData = await util.filterFormData([...batchFormData]);
      apiData.total_weight = parseFloat(apiData.total_weight)
      //apiData.created_by = userState.user.id;
      apiData.op = "add_raw_material";
      apiData.type = "Steel";
      console.log("apiData "+JSON.stringify(apiData))
      setApiStatus(true);
      console.log("apiData here "+JSON.stringify(apiData))
      
      let apiRes = await ApiService.getAPIRes(apiData, "POST", "batch");
      console.log("ApiRes here "+JSON.stringify(apiRes));
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message) {
          setBatchDet(apiRes.response.message);
          openDialog(apiRes.response.message);
        }
      }
      else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message)
    }
  }

  const errOKAction = () => {
    setApiError('')
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        {props.noTitle ? false : <CustomHeader title={props.title ? props.title : ""} align="center" />}

        {props._id ? <FormGrid labelDataInRow={true} formData={batchFormData} /> :
          <View style={{ width: '70%', margin: 10, padding: 5 }}>
            <FormGen handleChange={handleChange}
              editMode={true} formData={batchFormData} labelDataInRow={true} />
          </View>}
        {dialog ?
          <CustomModal modalVisible={dialog} dialogTitle={dialogTitle} dialogMessage={dialogMessage}
            okDialog={closeDialog} />
          : false}

        {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}

        {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

        {props._id ? <></> : <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={[AppStyles.successBtn, { flexDirection: 'row' }]} onPress={(e) => handleSubmit(e)} >
            <Text style={AppStyles.successText}>SAVE</Text>
          </TouchableOpacity>
        </View>}

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