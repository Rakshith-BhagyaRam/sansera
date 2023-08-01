import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { dateUtil, util } from "../../commons";
import { appTheme } from "../../lib/Themes";
import FormGen from "../../lib/FormGen"
import { ApiService } from "../../httpservice";
import UserContext from "../UserContext";
import CustomModal from "../../components/CustomModal";
import { useIsFocused } from '@react-navigation/native';
import { default as AppStyles } from "../../styles/AppStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestBin from "../generic/RequestBin";
import ProcessInfo from "../process/ProcessInfo";
import { EmptyBinContext } from "../../context/EmptyBinContext";


let stageSchema = [
  {
    "key": "ok_component", displayName: "OK Component (Count)", placeholder: "", value: 0,
    error: "", required: true, label: "components", type: "number", defaultValue: 0, nonZero: true
  },
  
]



export const  WorkPlan = React.memo((props) => {
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
  const [rackData, setRackData] = useState({})
  const { appProcess } = React.useContext(EmptyBinContext)


  useEffect(() => {
    if (isFocused) {
      loadForm();
    }
    return () => { }
  }, [isFocused,appProcess.process_name])



  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const loadForm = () => {
    let schemaData = [...stageSchema];
    setFormData(schemaData);
    setCount(previousCount => previousCount + 1);
  }





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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.mainContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 2, backgroundColor: 'white', margin: 5, padding: 5 }}>

            <TouchableOpacity
              style={[AppStyles.warnButtonContainer, { width: '50%', marginBottom: 20 }]}
              onPress={(e) => showReqBin(e)}
            >
              <Text style={AppStyles.warnButtonTxt}>REQUEST FILLED BIN</Text>
            </TouchableOpacity>
           
            
            
          </View>
          <View style={{ flex: 3, flexDirection: 'row', }}>
            <View style={{ flex: 1, backgroundColor: 'white', margin: 5, padding: 5 }}>
              <ProcessInfo
                title="PROCESS DETAILS"
                fields={["ok_component", "total_rejections"]}
                processEntity={appProcess.process_name ? appProcess : {}}

                />
            </View>
           
          </View>
        </View>
        {dialog ? <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          container={<RequestBin processEntity={appProcess}
            //reloadPage={reloadPage}
            closeDialog={closeDialog}
          />}

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