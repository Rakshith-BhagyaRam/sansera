import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { useIsFocused } from '@react-navigation/native';
import ErrorModal from "../../components/ErrorModal";
import { dateUtil } from "../../commons";
import UserContext from "../UserContext";


export const BatchBoard = React.memo((props) => {
  
  const isFocused = useIsFocused();
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false)
  const [process, setProcess] = useState([])
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
      "op": "list_raw_material_by_status",
      status: ["NEW", "APPROVED", "REJECTED"],
      "unit_num": userState.user.unit_number

    }
    // apiData.sort_by = 'updated_on'
    //apiData.sort_order = 'DSC'
    setRefreshing(false);
    setProcess([])
    ApiService.getAPIRes(apiData, "POST", "batch").then(apiRes => {
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

  const renderItem = ({ item, index }) => (
    <View style={[styles.tableData, { flexDirection: 'row' }]} key={index}>
      <Text style={[styles.tableDataCell, { borderLeftWidth: 0.5}]}>{item.batch_num}</Text>
      <Text style={[styles.tableDataCell, {}]}>{item.heat_num}</Text>
      <Text style={[styles.tableDataCell, {}]}>{item.supplier}</Text>
      <Text style={[styles.tableDataCell, {}]}>{item.total_weight}</Text>
      <Text style={[styles.tableDataCell, {}]}>{dateUtil.toFormat(item.created_on, "DD MMM YYYY")}</Text>
      <Text style={[styles.tableDataCell, {}]}>{item.status}</Text>
    </View>
  );

  return (
    // <ScrollView
    //   contentContainerStyle={styles.scrollView}
    //   refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }
    // >
    <View style={styles.container}>
      {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
      {process.length ? <View style={{ backgroundColor: 'white', margin: 2, padding: 5 }}>
        <FlatList
          data={process}
          horizontal={false}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          ListHeaderComponent={(index) => {
            return (
              <View style={styles.tableHeader} key={index}>
                <Text style={[styles.tableHeaderCell, { borderLeftWidth: 0.5 }]}>Batch</Text>
                <Text style={[styles.tableHeaderCell, {}]}>Heat Number</Text>
                <Text style={[styles.tableHeaderCell, {}]}>Supplier</Text>
                <Text style={[styles.tableHeaderCell, {}]}>Total Weight</Text>
                <Text style={[styles.tableHeaderCell, {}]}>Received Date</Text>
                <Text style={[styles.tableHeaderCell, {}]}>Status</Text>
              </View>)
          }}
        >
        </FlatList>
      </View> : false}
      
      {apiError && apiError.length ? (<ErrorModal msg={apiError} okAction={errOKAction} />) : false}

    </View>
  )
})
const styles = StyleSheet.create({

  container: {
    flex: 1,
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