import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import {default as AppStyles} from '../../styles/AppStyles';
import {TextInput} from 'react-native-gesture-handler';
import {ApiService} from '../../httpservice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PubBatterySleep from '../mqtt/PubBatterySleep';

export default function ShowRack(props) {
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const appState = React.useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [bundleWeight, setBundleWeight] = useState(0);
  const [bundleWeigtErr, setBundleWeightErr] = useState('');
  const userState = React.useContext(UserContext);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);

  const closeDialog = () => {
    props.closeDialog();
  };

  const handleSubmit = () => {
    console.log('handle');
    if (bundleWeight && bundleWeight > 0) {
      let apiData1 = {
        op: 'get_batch_details',
        batch_num: props.processEntity.batch_num,
        unit_num: userState.user.unit_number,
      };

      ApiService.getAPIRes(apiData1, 'POST', 'batch').then(apiRes => {
        console.log('apiRes ++++++++++++++++++++++++++++++++++++++++++++++++');
        console.log(JSON.stringify(apiRes));
        console.log('++++++++++++++++++++++++++++++++++++++++++++++++');
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          let renderedBatch = apiRes.response.message;
          console.log('renderedBatch ++++++++++++++++++++++++++++++++++');
          console.log(renderedBatch);
          console.log('++++++++++++++++++++++++++++++++++++++++++++++++');
          if (renderedBatch.total_weight >= bundleWeight) {
            console.log('1st if');
            setApiStatus(true);
            let apiData = {};
            apiData.batch_num = props.processEntity.batch_num;
            apiData.bundle_weight = bundleWeight;
            apiData.op = 'pop_material';

            ApiService.getAPIRes(apiData, 'POST', 'batch').then(apiRes => {
              console.log('api Data');
              setApiStatus(false);
              console.log(apiRes);
              if (apiRes && apiRes.status) {
                console.log('2nd if');
                props.closeDialog();
                props.reloadPage();
                AsyncStorage.getItem('deviceDet').then(async devices => {
                  console.log('async loop');
                  console.log('devices here 123 ' + JSON.parse(devices));
                  let devicesDet = JSON.parse(devices);
                  let device = devicesDet.find(
                    device => device.element_num === props.rackData.element_num,
                  );
                  console.log('device rack ' + JSON.stringify(device));
                  if (device) {
                    console.log(device.device_id);
                    PubBatterySleep({topic: device.device_id});
                  }
                });
                //here do goto_sleep
              } else {
                setBundleWeightErr(apiRes.response.message);
              }
            });
          } else {
            setBundleWeightErr(
              'bundle weight should be less than total weight',
            );
          } //
        } //
      }); //
    } else {
      setBundleWeightErr('Please enter valid bundle weight');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View
        style={[
          styles.container,
          {alignItems: 'center', flexDirection: 'column'},
        ]}>
        <View style={{flexDirection: 'row', width: '60%', flex: 2}}>
          <Text style={[AppStyles.filterLabel, {flex: 1}]}>
            Bundle Weight (Kg)
          </Text>
          <TextInput
            keyboardType="numeric"
            style={[AppStyles.filterText, {flex: 2}]}
            onChangeText={value => setBundleWeight(value)}>
            {bundleWeight}
          </TextInput>
        </View>
        {bundleWeigtErr && bundleWeigtErr.length ? (
          <Text
            style={{
              color: 'red',
              fontSize: 12,
              padding: 2,
              margin: 10,
              textAlign: 'center',
            }}>
            {bundleWeigtErr}
          </Text>
        ) : (
          false
        )}
        <View
          style={{flexDirection: 'row', width: '60%', flex: 1, marginTop: 100}}>
          <TouchableOpacity
            style={[AppStyles.successBtn, {flex: 1}]}
            onPress={e => handleSubmit(e)}
            disabled={apiStatus}>
            <Text style={AppStyles.successText}>SAVE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[AppStyles.canButtonContainer, {flex: 1, marginLeft: 10}]}
            onPress={e => closeDialog(e)}>
            <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1,
  },
});
