import { Pools, Monitor, Users } from '../models/index';
import MQTTHandler from '../core/mqtt.core';

export async function saveMonitorData(apiKey: string, deviceName: string, data: any) {
// export async function saveMonitorData(apiKey: string, data: any) {
  const isUserExist = await Users.findOne({ apiKey });
  if (!isUserExist) {
    throw new Error('User with the given API Key not found!');
  }

  const isPoolsExist = await Pools.findOne({ deviceName, userId: isUserExist._id });
  // const isPoolsExist = await Pools.findOne({ userId: isUserExist._id });
  if (!isPoolsExist) {
    throw new Error('Pool with the given Device Name not found!');
  }

  const record = new Monitor({
    ...data,
    userId: isUserExist._id,
    poolsId: isPoolsExist._id
  });

  await record.save();
  return record;
}

export async function subscribeToDynamicTopic(topic: string): Promise<void> {
  const mqttHandler = MQTTHandler.getInstance();

  const brokerConfig = {
    brokerUrl: process.env.MQTT_BROKER_URL,
    username: process.env.MQTT_USERNAME_SERVER,
    password: process.env.MQTT_PASSWORD_SERVER,
  };

  mqttHandler.connectToBroker(brokerConfig);
  mqttHandler.subscribeToTopic(topic);
}
