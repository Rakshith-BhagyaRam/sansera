import React, { useState, useEffect, useDebugValue } from "react";
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView,
  RefreshControl,
  Alert
} from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import CustomHeader from "../../components/CustomHeader";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ErrorModal from "../../components/ErrorModal";
import UserContext from "../UserContext";
import { roles } from "../../constants/appConstants";
import AppStyles from "../../styles/AppStyles";
import PubBatterySleep from "../mqtt/PubBatterySleep";




export const ProcessFifo = React.memo((props) => {
  const isFocused = useIsFocused();
  const userState = React.useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false)
  const [proStageData, setProStageData] = useState([])
  const [stage, setStage] = useState({})
  const [nextStage, setNextStage] = useState({})
  const [subStage, setSubStage] = useState({})
  const [binStage, setBinStage] = useState({})
  const [editBin, setEditBin] = useState(false);
  const [delBin, setDelBin] = useState([]);
  const [delSubBin, setDelSubBin] = useState([])
  const [isConfirm, setConfirm] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (isFocused) {
      loadRejectionData();
    }
    return () => { }
  }, [isFocused])

  const loadRejectionData = () => {
    setProStageData(props.processDet.process)
    setStage(props.processDet.process[0])
    setNextStage(props.processDet.process[1])
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRejectionData();
  }, []);

  const switchStage = (e, stage) => {
    setStage(stage);
    let index = proStageData.findIndex(item => item.order === stage.order + 1)
    setNextStage(proStageData[index]);
    if (stage.sub_stage && stage.sub_stage.length) {
      let subIndex = proStageData.findIndex(item => item.stage_name === stage.sub_stage)
      if (subIndex > -1) setSubStage(proStageData[subIndex]);
    } else {
      setSubStage({})
    }
    setEditBin(false)
    setDelBin([])
  }

  const closeDialog = () => {
    setEditBin(false)
    setDelBin([])
    props.closeDialog();
  }

  const handleEditBin = () => {
    setEditBin(prevState => !prevState)
    setDelBin([]);
  }

  const addToDelBin = (e, fifoItem, type) => {
    if (type === "stage") {
      let bin_to_del = [...delBin]
      let element_num = fifoItem.element_num;
      const selectedIndex = bin_to_del.indexOf(element_num);
      if (selectedIndex === -1 && bin_to_del.length === 0) {
        bin_to_del.push(element_num);
      } else if (selectedIndex !== -1) {
        bin_to_del.splice(selectedIndex, 1);
      }
      setDelBin(bin_to_del);
    }
    else if (type === "substage") {
      let bin_to_del = [...delSubBin]
      let element_num = fifoItem.element_num;
      const selectedIndex = bin_to_del.indexOf(element_num);
      if (selectedIndex === -1 && bin_to_del.length === 0) {
        bin_to_del.push(element_num);
      } else if (selectedIndex !== -1) {
        bin_to_del.splice(selectedIndex, 1);
      }
      setDelSubBin(bin_to_del);
    }

  }

  const computeBin = () => {
    setConfirm(false);
    if (delBin.length && delSubBin.length) {

    }
    else if (delBin.length === 1) {
      setConfirm(true);
    }
    else if (delSubBin.length === 1) {
      setConfirm(true);
    }
  }
  const updateBin = () => {
    let apiData = {};
    let invokeApi = false;
    if (delSubBin.length) {
      let elementIndex = subStage.fifo.findIndex(item => item.element_num === delSubBin[0]);
      apiData.op = "remove_element"
      apiData.process_name = props.processDet.process_name
      apiData.stage_name = subStage.stage_name
      apiData.element_id = subStage.fifo[elementIndex].element_id
      invokeApi = true;
    }
    if (delBin.length) {
      let elementIndex = stage.fifo.findIndex(item => item.element_num === delBin[0]);
      apiData.op = "remove_element"
      apiData.process_name = props.processDet.process_name
      apiData.stage_name = stage.stage_name
      apiData.element_id = stage.fifo[elementIndex].element_id
      invokeApi = true;
    }

    if (invokeApi) {
      ApiService.getAPIRes(apiData, "POST", "fifo").then(apiRes => {
        if (apiRes && apiRes.status) {
          Alert.alert("Bin removed");
          //goto sleep publish
          props.okDialog();
          //PubBatterySleep({ topic: apiData.element_id })
        }
        else
          setApiError("Could not update. try again!")
      })
    }
  }

  const errOKAction = () => {
    setApiError('')
  }
  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={[styles.container]}>

        {/* <ActivityIndicator size="large" animating={apiStatus} /> */}
        <View style={[styles.dataContainer, {}]}>
          <CustomHeader title="BIN FIFO" align={"center"} />

          <View style={{ flexDirection: 'column', margin: 5, padding: 10, borderRadius: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              {proStageData.map((item, index) => {
                return (
                  <TouchableOpacity style={{}} key={index}
                    onPress={(e) => switchStage(e, item)} >
                    <Text key={index} style={[styles.tableHeader, {
                      marginBottom: 1, padding: 10, width: '100%', borderColor: 'grey', borderWidth: 0.5,
                      color: stage.stage_name === item.stage_name ? appTheme.colors.cardTitle : 'grey'
                    }]}>
                      {item.stage_name}
                    </Text></TouchableOpacity>)
              })}
            </View>
            {stage && stage.fifo && stage.fifo.length ?
              false :
              <View style={{ flexDirection: 'row', margin: 1, alignSelf: 'center', borderWidth: 0.5, margin: 10, padding: 10, width: '30%' }}>
                <Text align="left" style={[AppStyles.warnButtonTxt, { color: appTheme.colors.warnAction }]}>No Bins</Text></View>
            }
            {stage && stage.fifo && stage.fifo.length ?
              <View style={{ flexDirection: 'row', margin: 1, alignSelf: 'center', borderWidth: 0.5, margin: 10, padding: 10, width: '30%' }}>
                {stage && stage.fifo && stage.fifo.map((fifoItem, fifoIndex) => {
                  return (
                    <TouchableOpacity style={{}} key={fifoIndex}
                      disabled={userState.user && userState.user.role === roles.PL ? false : true}
                      onPress={(e) => addToDelBin(e, fifoItem, "stage")} >
                      <Text style={[{
                        padding: 5, fontSize: 18,
                        color: delBin.indexOf(fifoItem.element_num) > -1 ? 'red' : 'black'
                      }]}>
                        {fifoItem.element_num}
                      </Text></TouchableOpacity>)
                })}</View> : false}

            {delBin.length ? <Text style={{ color: 'red', fontSize: 14, padding: 10 }}>Only one bin can be removed at a time</Text> : false}
            {(delBin.length || delSubBin.length) ?
              <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', width: "50%" }}>
                <TouchableOpacity style={[styles.sucButtonContainer, {
                  flex: 1, padding: 5, paddingLeft: 10, paddingRight: 10
                }]}
                  onPress={(e) => isConfirm ? updateBin(e) : computeBin(e)}
                >
                  <Text style={styles.sucButtonText}>{isConfirm ? 'CONFIRM' : 'REMOVE'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.canButtonContainer, {
                  flex: 1, padding: 5, paddingLeft: 10, paddingRight: 10
                }]}
                  onPress={(e) => closeDialog(e)}
                >
                  <Text style={styles.canButtonTxt}>CANCEL</Text>
                </TouchableOpacity>
              </View>
              : false}
            {/* {!delBin.length ? 
            <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', width: "20%" }}>
                <TouchableOpacity style={[styles.canButtonContainer, {
                  flex: 1, padding: 5, paddingLeft: 10, paddingRight: 10
                }]}
                  onPress={(e) => closeDialog(e)}
                >
                  <Text style={styles.canButtonTxt}>CLOSE</Text>
                </TouchableOpacity>
            </View>: false} */}
            {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

          </View>
          <CustomHeader title="BINS IN USE" align={"center"} />
          <View style={{
            flexDirection: 'column', margin: 5,
            padding: 10, borderRadius: 10
          }}>
            <View style={{ flexDirection: 'row' }}>
              {proStageData.map((item, index) => {
                return (
                  <View style={{ flexDirection: 'column' }} key={index}>
                    <Text key={index} style={[styles.tableHeader, {
                      padding: 5, width: '100%', borderColor: 'grey', borderWidth: 0.5,
                    }]}>{item.stage_name}</Text>
                    <Text key={index} style={[styles.tableHeader, {
                      padding: 5, width: '100%', borderColor: 'grey', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5,
                    }]}>{item.last_popped_element && item.last_popped_element.length ? item.last_popped_element : ' '}</Text>

                  </View>)
              })}
            </View>
          </View>

          <TouchableOpacity style={[styles.canButtonContainer, {
            width: '20%', alignSelf: 'center'
          }]}
            onPress={(e) => closeDialog(e)}
          >
            <Text style={styles.canButtonTxt}>CLOSE</Text>
          </TouchableOpacity>

        </View>









      </View>


    </ScrollView>
  )
});
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 10
  },
  tableHeader: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: appTheme.fonts.bold,
    color: 'grey'
  },
  tableCell: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
  },
  canButtonContainer: {
    //flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: appTheme.colors.cancelAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  canButtonTxt: {
    color: appTheme.colors.cancelActionTxt,
    fontSize: 16,
    margin: 5,
    fontFamily: appTheme.fonts.bold
  },
  sucButtonContainer: {
    margin: 5,
    borderRadius: 15,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: appTheme.colors.successAction,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
  sucButtonText: {
    color: appTheme.colors.successActionTxt,
    fontSize: 14,
    margin: 5,
    fontFamily: appTheme.fonts.bold
  },

});