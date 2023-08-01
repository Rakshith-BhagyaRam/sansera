var liveAddress = 'http://203.129.243.94:8086/'
var mqttAddress = 'mqtt://203.129.243.94:1883'

let oldmqttOptions = {
    uri: "mqtt" + "://mqtt.meti.in:1884",
    clientId: "clientId",
    user: "quickiot_wd",
    pass: "whiz1234!",
    auth: true,
    keepalive: 32000
    // keepalive: 60
}

let mqttOptions = {
    uri: mqttAddress,
    clientId: "clientId",
    user: "mqtt",
    pass: "mqtt2022",
    auth: true,
    keepalive: 32000
    // keepalive: 60
}

let binMqttOptions = {
    uri: mqttAddress,
    clientId: "clientId",
    user: "mqtt",
    pass: "mqtt2022",
    auth: true,
    keepalive: 32000
    // keepalive: 60
}

let oldbinMqttOptions = {
    uri: "mqtt" + "://mqtt.meti.in:1884",
    clientId: "clientId",
    user: "quickiot_wd",
    pass: "whiz1234!",
    auth: true,
    keepalive: 32000
    // keepalive: 60
}

const SERVER_URL = liveAddress;
const urls = {
    login: SERVER_URL + "api/auth",
    getProcess: SERVER_URL + "api/process-line",
    get_next_element: SERVER_URL + "api/process-line",
    pop_element: SERVER_URL + "api/fifo",
    create_request: SERVER_URL + "api/operator-task",
    update_request: SERVER_URL + "api/operator-task",
    get_supplier: SERVER_URL + "api/supplier",
    create_batch: SERVER_URL + "api/raw-materials",
    list_raw_material_by_status: SERVER_URL + "api/raw-materials",
    update_batch: SERVER_URL + "api/raw-materials",
    batch: SERVER_URL + "api/raw-materials",
    get_batch_reason: SERVER_URL + "api/batch-rejection",
    process: SERVER_URL + "api/process-line",
    forgeMachine: SERVER_URL + "api/forge-machine",
    customer: SERVER_URL + "api/customer",
    fifo: SERVER_URL + "api/fifo",
    "process-master": SERVER_URL + "api/process-master",
    mqtt: SERVER_URL + "api/mqtt-service",
    rejection: SERVER_URL + "api/rejection",
    org: SERVER_URL + "api/org-service",
    task: SERVER_URL + "api/operator-task",
    process_consumption: SERVER_URL + "api/process-consumption",
    compartment: SERVER_URL + "api/compartment"
};


export { urls, SERVER_URL, mqttOptions, binMqttOptions };