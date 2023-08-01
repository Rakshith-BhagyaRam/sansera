import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { appTheme } from "../../lib/Themes";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ErrorModal from "../../components/ErrorModal";
import { FlatList } from "react-native-gesture-handler";
import AppStyles from "../../styles/AppStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dateUtil } from "../../commons";

export default function LowBattery(props) {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [battery, setBattery] = useState([])

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadProcess();
    }
    return () => { }
  }, [isFocused, props.batteryData])

  const loadProcess = () => {
    // AsyncStorage.getItem("lowBattery").then(data => {
    //   if (data != null)
    //     data = JSON.parse(data);
    //   setBattery(data)
    // })
    console.log("load props batteryData " + JSON.stringify(props.batteryData))
    setBattery(props.batteryData)

    setApiStatus(false)
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const errOKAction = () => {
    setApiError('')
  }

  const renderItem = ({ item, index }) => {
    console.log(index);
    console.log(dateUtil.formatDate(item.createdOn, "DD MMM YYYY"))
    return (

      <View style={{
        flexDirection: 'row', backgroundColor: 'white', margin: 5, padding: 5,
        flex: 1
      }} key={item.createdOn}>
        <Text style={[AppStyles.titleWithBold, { backgroundColor: 'white', flex: 1, padding: 5, textAlign: 'left' }]}>{item.devID}</Text>
        <Text style={[AppStyles.titleWithBold, { backgroundColor: 'white', flex: 1, padding: 5, textAlign: 'left' }]}>{item.data}</Text>
        <Text style={[AppStyles.titleWithBold, { backgroundColor: 'white', flex: 1, padding: 5, textAlign: 'left' }]}>{dateUtil.formatDate(item.createdOn, "DD MMM YYYY HH:MM:SS")}</Text>
      </View>
    )

  };
  return (

    // <ScrollView
    //   contentContainerStyle={styles.scrollView}

    // >
    <View style={styles.container}>
      {battery.length ? <FlatList
        data={battery}
        horizontal={false}
        renderItem={renderItem}
        keyExtractor={item => item.createdOn}
        onRefresh={() => onRefresh()}
        refreshing={refreshing}
        numColumns={1}
      />: false}

      </View> 
  )
}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    //backgroundColor: "#fff",
    //justifyContent: "center",
    margin: 5
  },
  processContainer: {
    flexDirection: 'column', margin: 8, backgroundColor: 'white', padding: 10
  },
  successBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    //marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,
  },
  successText: {
    color: appTheme.colors.warnActionTxt
  },
  radioText: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: appTheme.fonts.regular
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold


  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    //fontWeight: "bold",
    fontFamily: appTheme.fonts.regular,
    color: appTheme.colors.cardTitle
  },
  tableContent: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: appTheme.fonts.regular,
  },
  tableHeader: {
    flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1
  }

});