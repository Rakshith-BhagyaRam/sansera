import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  SectionList,
} from 'react-native';
import {ApiService} from '../../httpservice';
import {useIsFocused} from '@react-navigation/native';
import ErrorModal from '../../components/ErrorModal';
import AppStyles from '../../styles/AppStyles';
import CustomModal from '../../components/CustomModal';
import {RackDetails} from './RackDetails';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {appTheme} from '../../lib/Themes';
import {BinIndicator} from '../../svgs/BinIcon';
import {SvgCss} from 'react-native-svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import UserContext from '../UserContext';
export const RackData = React.memo(props => {
  const isFocused = useIsFocused();
  const [racks, setRacks] = useState([]);
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [rackNo, setRackNo] = useState('');
  const [batch, setBatch] = useState({});
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const userState = React.useContext(UserContext);

  useEffect(() => {
    if (isFocused) {
      setApiStatus(true);
      loadBatches();
    }
    return () => {};
  }, [isFocused]);

  const loadBatches = () => {
    let apiData = {
      op: 'get_compartments',
      unit_num: userState.user.unit_number,
    };
    console.log('get_compartments' + JSON.stringify(apiData));
    setRefreshing(false);
    ApiService.getAPIRes(apiData, 'POST', 'compartment').then(async apiRes => { 
      setApiStatus(false);

      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message) {
          setColumns(apiRes.response.message.matrix.column);
          //setColumns(4)
          setRows(apiRes.response.message.matrix.row);
          setRacks(apiRes.response.message.compartments);
        } else {
        }
      } else if (apiRes && apiRes.response.message)
        setApiError(apiRes.response.message);
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadBatches();
  });

  const errOKAction = () => {
    setApiError('');
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setRackNo('');
    setBatch({});
  };
  const openDialog = async (e, batch, rackNo) => {
    showDialog(true);
    let dialogTitle = '';
    let dialogMessage = '';
    dialogTitle = 'Rack Number ' + rackNo;
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    await getBatch(batch.batch_num);
  };

  const getBatch = async batch_num => {
    let apiData = {
      op: 'get_batch_details',
      batch_num: batch_num,
      unit_num: userState.user.unit_number,
    };

    console.log('rack data ' + JSON.stringify(apiData));
    let apiRes = await ApiService.getAPIRes(apiData, 'POST', 'batch');
    if (apiRes.status && apiRes.response.message) {
      setBatch(apiRes.response.message);
    }
  };
  const renderItem = ({item, index}) => {
    if (item.batch_num.length)
      return (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            margin: 5,
            padding: 5,
            flex: 1,
          }}
          onPress={e => openDialog(e, item, item.element_name)}
          key={index}>
          <Text
            style={[
              AppStyles.titleWithBold,
              {backgroundColor: 'white', flex: 1, padding: 2},
            ]}>
            {item.element_name}
          </Text>
          <Text style={[AppStyles.subtitle, {flex: 3, padding: 0}]}>
            {'Batch : ' + item.batch_num}
          </Text>
          <View
            style={{
              height: 25,
              width: 25,
              borderRadius: 11,
              borderWidth: 1,
              borderColor: 'grey',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <FontAwesome
              name="circle"
              size={23}
              style={{color: item.color}}></FontAwesome>
          </View>
        </TouchableOpacity>
      );
    else {
      return (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            margin: 5,
            padding: 5,
            flex: 1,
          }}
          key={index}>
          <Text
            style={[
              AppStyles.titleWithBold,
              {backgroundColor: 'white', flex: 1, padding: 2},
            ]}>
            {item.element_name}
          </Text>
          <View
            style={[
              AppStyles.subtitle,
              {flex: 3, alignItems: 'center', padding: 2},
            ]}></View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, {flexDirection: 'column', flex: 1}]}>
      {racks.length ? (
        <FlatList
          data={racks}
          horizontal={false}
          renderItem={renderItem}
          keyExtractor={item => item.element_name}
          onRefresh={() => onRefresh()}
          refreshing={refreshing}
          numColumns={columns}
        />
      ) : (
        false
      )}
      {dialog ? (
        <CustomModal
          modalVisible={dialog}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          closeDialog={closeDialog}
          height={'70%'}
          container={<RackDetails content={batch} />}
        />
      ) : (
        false
      )}

      {apiError && apiError.length ? (
        <ErrorModal msg={apiError} okAction={errOKAction} />
      ) : (
        false
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
});