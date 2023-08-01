
import MQTT from 'sp-react-native-mqtt';
import { binMqttOptions } from "../../constants/urlConstants";

const PubBatterySleep = (props) => {
  let options = { ...binMqttOptions }
  options.clientId = "pubclientId" + Date.now()
  console.log(options)
  MQTT.createClient(options).then((client) => {
    client.connect();

    client.on('closed', () => {
      console.log('mqtt.event.closed');
    });

    client.on('error', (msg) => {
      console.log('bin mqtt.event.error', msg);
    });

    client.on('message', (msg) => {
      console.log('mqtt.event.message', msg);
    });

    client.on('connect', () => {
      console.log('pub connected' + props.topic);
      let publishParams = {
        devID: props.topic,
        data: "SL"
      }
      console.log("publishParams here " + JSON.stringify(publishParams))
      client.publish("GOTO_SLEEP", JSON.stringify(publishParams), 2, false)
      client.disconnect()
    });

  }).catch((err) => {
    console.log("pub err : " + err);
  });

}

export default PubBatterySleep;
