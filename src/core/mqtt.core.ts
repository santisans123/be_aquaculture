import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { Monitor, Pools, Users } from '../models/index';
import { AppLogger } from '../logs/error.logs';
import { postMonitorByTopic } from '../controllers/monitoring';
import { postSamplebyTopic } from '../controllers/sampling';
import { Private_Key_Cert_Server, clientCert, clientKey } from '../utils/credentials';

class MQTTService {
  private static instance: MQTTService;
  private mqttClient: MqttClient | null = null;
  private mqttOptions: IClientOptions | null = null;

  private constructor() {}

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService();
    }
    return MQTTService.instance;
  }

  public async init() {
    const mqttOptions: IClientOptions = {
      host: process.env.MQTT_BROKER_URL,
      port: parseInt(process.env.MQTT_PORT || '8883', 10),
      protocol: 'mqtts',
      username: process.env.MQTT_USERNAME_SERVER,
      password: process.env.MQTT_PASSWORD_SERVER,
      connectTimeout: 5000,
      reconnectPeriod: 1000,

      ca: Private_Key_Cert_Server,
      cert: clientCert,
      key: clientKey,
      rejectUnauthorized: true,
    };

    this.mqttClient = mqtt.connect(mqttOptions);

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.mqttClient.on('message', this.handleMessage);

    this.mqttClient.on('error', (error) => {
      console.error('MQTT Client Error:', error);
      AppLogger.error('MQTT Client Error:', error);
    });
  }

  private async subscribeToTopics() {
    try {
      // console.log('Starting to subscribe to topics');
      const users = await Users.find({ isArchived: false });
      // console.log(`Found ${users.length} active users`);

      for (const user of users) {
        const pools = await Pools.find({ userId: user._id, isArchived: false });
        // console.log(`Found ${pools.length} active pools for user ${user._id}`);

        for (const pool of pools) {
          if (pool.deviceName) {
            const monitoringTopic = `${pool.deviceName}/${user.apiKey}/monitoring`;
            const samplingTopic = `${pool.deviceName}/${user.apiKey}/sampling`;

            // console.log(`Attempting to subscribe to: ${monitoringTopic}`);
            this.mqttClient?.subscribe(monitoringTopic, (err) => {
              if (err) {
                AppLogger.error(`Error subscribing to ${monitoringTopic}:`, err);
              } else {
                // console.log(`Successfully subscribed to ${monitoringTopic}`);
              }
            });

            // console.log(`Attempting to subscribe to: ${samplingTopic}`);
            this.mqttClient?.subscribe(samplingTopic, (err) => {
              if (err) {
                AppLogger.error(`Error subscribing to ${samplingTopic}:`, err);
              } else {
                // console.log(`Successfully subscribed to ${samplingTopic}`);
              }
            });
          } else {
            // console.log(`Skipping pool ${pool._id} because deviceName is empty`);
          }
        }
      }
    } catch (error) {
      AppLogger.error('Error in subscribing to topics:', error);
    }
  }

  private handleMessage = (topic: string, message: Buffer) => {
    const [deviceName, apiKey, messageType] = topic.split('/');
    const data = JSON.parse(message.toString());

    // console.log(`Received message on topic ${topic}:`, data);

    if (messageType === 'monitoring') {
      postMonitorByTopic(deviceName, apiKey, data);
    } else if (messageType === 'sampling') {
      postSamplebyTopic(deviceName, apiKey, data);
    }
  }
}

const mqttService = MQTTService.getInstance();

export default mqttService;
