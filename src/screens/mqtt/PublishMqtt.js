
import MQTT from 'sp-react-native-mqtt';
import { binMqttOptions } from "../../constants/urlConstants";

const pub_topic_format = (topic) => {
  return "MWPI2/" + topic + "/set/led1";
}


const PublishMqtt = (props) => {
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
      // let topic = pub_topic_format(props.topic)
      //console.log("publish topic here "+topic);
      let publishParams = {
        devID: props.topic,
        data: "LG 1, 3"
      }
      console.log("publishParams here "+JSON.stringify(publishParams))
      client.publish("LED_GLOW", JSON.stringify(publishParams), 2, false)
      //client.publish(topic, "3,5", 2, false);
      client.disconnect()
    });

  }).catch((err) => {
    console.log("pub err : " + err);
  });

}

export default PublishMqtt;
