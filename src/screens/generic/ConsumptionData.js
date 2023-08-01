import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import ErrorModal from "../../components/ErrorModal";
import { dateUtil } from "../../commons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stageType } from "../../constants/appConstants";
import DateTimePicker from "@react-native-community/datetimepicker"
import AppStyles from "../../styles/AppStyles";
import { TouchableOpacity } from "react-native-gesture-handler";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import UserContext from "../UserContext";


const shearing_consumption_schema = [
  { key: "slNo", displayName: "Sl No"},
  { key: "created_on", displayName: "Date",type:"date" },
  { key: "created_on", displayName: "Time",type:"time" },
  { key:"component_id",displayName:"Component"},
  { key: "ok_end_billets", displayName: "OK End Billets" },
  { key: "ok_end_billets_in_kg", displayName: "OK End Billets (kg)" },
  { key: "ok_bits_count", displayName: "OK Bits" },
  { key: "ok_bits_weight", displayName: "OK Bits (kg)" },
  { key: "total_quantity", displayName: "Total Quanity (kg)" },
  { key: "balance_quantity", displayName: "Balance Quanity (kg)" },

]

export const ConsumptionData = React.memo((props) => {
  const isFocused = useIsFocused();
  const [apiMsg,setApiMsg] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [conData, setConData] = useState([])
  const [tableSchema,setTableSchema] = useState([])
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const { appProcess } = React.useContext(EmptyBinContext)
  const userState = React.useContext(UserContext);


  useEffect(() => {
    if (isFocused) {

      loadProcess();
    }
    return () => { }
  }, [isFocused,date,props.stageName,props.processName])

 
  const loadProcess = async () => {
    console.log("props : "+props.stageName+" .. "+props.processName)
    let curStage = props.stageName ? props.stageName : await AsyncStorage.getItem("stage");
    let curProcess = appProcess.process_name ? appProcess.process_name : props.processName;
    setTableSchema([])
    setConData([])
    setApiMsg('')
    if(curStage.toLowerCase() === stageType.shearing) 
    {
      setTableSchema(shearing_consumption_schema)
      console.log(curProcess+" .. "+curStage)
      let apiData = {
        "op": "get_process_consumption",
        process_name: curProcess,
        stage_name: curStage,
        "unit_num": userState.user.unit_number

      }
      apiData.date = await dateUtil.formatDate(date, "YYYY-MM-DD")
      console.log("get_process_consumption apiData "+JSON.stringify(apiData))
      if(!curProcess)
        return;
      setRefreshing(false);
      setApiStatus(true);
      
      ApiService.getAPIRes(apiData, "POST", "process_consumption").then(apiRes => {
        console.log("apiRes here "+JSON.stringify(apiRes))
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          if (apiRes.response.message && apiRes.response.message.length) {
            setConData(apiRes.response.message)
          }
          else {
            setApiMsg("No data")
          }
        }
        else if (apiRes && apiRes.response.message) {
          setApiError(apiRes.response.message)
          setConData([])
        }
      });
    }
    
    

  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const errOKAction = () => {
    setApiError('')
  }
  const msgOKAction = () => {
    setApiMsg('')
  }
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShow(false)
  };
  const renderItem = ({ item, index }) => {
    let customTabStyle =  { "borderLeftWidth": 0.5, textAlign: 'center' } ;
    return(
      <View style={[styles.tableData, { flexDirection: 'row' }]} key={index}>
        <Text style={[styles.tableDataCell, customTabStyle]}>{index+1}</Text>
        {tableSchema.map((tabItem,tabIndex) => {
          let value = item[tabItem.key];
          if(tabItem.type === "date") {
            value = dateUtil.fromToDateFormat(value, "DD/MM/YYYY, hh:mm:ss A", "DD MMM YYYY");
            //value = dateUtil.toDateFormat(value, "DD/MM/yyyy")
            //hh:mm A

          }
          if (tabItem.type === "time") {
            //value = dateUtil.toTimeFormat(value,"h:mm:ss a")
            value = dateUtil.fromToDateFormat(value, "DD/MM/YYYY, hh:mm:ss A", "hh:mm A");

          }

          return (tabItem.key != "slNo" ? <Text style={[styles.tableDataCell, {}]} key={tabIndex}>{value}</Text> : false);
        })}
    </View>
  )};

  return (
    <View style={[styles.container,{}]}>
      {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
       <View style = {{flexDirection:'row',margin:5,padding:5,backgroundColor:'white'}}>
        <TouchableOpacity onPress={(e) => setShow(!show)} style={{flexDirection:'row'}}>
          <FontAwesome name="calendar" size={25} color={appTheme.colors.cardTitle} ></FontAwesome>
          <Text style={[AppStyles.subtitleWithBold,{marginLeft:10}]}>{dateUtil.toDateFormat(date,"DD MMM yyyy")}</Text>
        </TouchableOpacity>
      </View>
      {show ? <DateTimePicker
        testID="dateTimePicker"
        value={date}
        mode={'date'}
        is24Hour={true}
        display="default"
        onChange={onDateChange}
      /> : false} 
      {conData.length ? <View style={{ backgroundColor: 'white', margin: 2, padding: 5 }}>
        <FlatList
          data={conData}
          horizontal={false}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          ListHeaderComponent={() => {
            return (<View style={styles.tableHeader}>
            {tableSchema.map((item,index) => {
              let customStyle = index === 0 ? { borderLeftWidth:0.5} : {};
              return (
                <Text style={[styles.tableHeaderCell,customStyle]} key={index}>{item.displayName}</Text>
              )
            })}
            </View>)
          }}
        >
        </FlatList>
      </View> : false} 
   
      {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}
      {apiMsg && apiMsg.length ? <Text style={[AppStyles.subtitle,{textAlign:'center'}]} type="info" >{apiMsg}</Text>  : false}

    </View>
  )
})
const styles = StyleSheet.create({

  container: {
    flex: 1,
    margin: 5,
  },
 
  tableContent: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: appTheme.fonts.regular,
  },

  tableHeader: {
    flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: 'grey'
  },
  tableHeaderCell: {
    textAlign: 'center', flex: 1, borderRightWidth: 0.5, padding: 5,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle,
    borderColor: 'grey'
  },
  tableData: {
    flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: 'grey'

  },
  tableDataCell: {
    textAlign: 'center', flex: 1, borderRightWidth: 0.5, padding: 5,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.filterText,
    borderColor: 'grey',
    color: 'black'
  }

});