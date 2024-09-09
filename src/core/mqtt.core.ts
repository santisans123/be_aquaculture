import mqtt, { MqttClient } from 'mqtt';
import { Monitor, Pools, Users } from '../models/index';
import { AppLogger } from '../logs/error.logs';
import { postMonitorByTopic } from '../controllers/monitoring';
import { postSamplebyTopic } from '../controllers/sampling';

class MQTTService{
  private static instance: MQTTService;
  private mqttClient: MqttClient | null = null;

  private constructor(){

  }

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance =new MQTTService();
    }
    return MQTTService.instance;
  }

  public async init() {
    const mqttOptions = {
      host: process.env.MQTT_BROKER_URL,
      port: 8883,
      username: process.env.MQTT_USERNAME_SERVER,
      password: process.env.MQTT_PASSWORD_SERVER,
    };

    this.mqttClient = mqtt.connect(mqttOptions);

    this.mqttClient.on('connect', () => {
      this.mqtt_handler(this.mqttClient!);
    });

    this.mqttClient.on('error', (error) => this.onError(error));
    this.mqttClient.on('reconnect', () => this.onReconnect());
    this.mqttClient.on('close', () => this.onClose());
  }

  private onError(error: Error): void {
    AppLogger.error('MQTT Client Error:', error.message);
  }

  private onReconnect(): void {
    AppLogger.info('Attempting to reconnect to MQTT broker...');
  }

  private onClose(): void {
    AppLogger.warn('Disconnected from MQTT broker.');
  }

  public async mqtt_handler(client: MqttClient) {
    try {
      const users = await Users.find({ isArchived: false });

      for (const user of users) {
        const pools = await Pools.find({ userId: user._id, isArchived: false });

        for (const pool of pools) {
          if (pool.deviceName && pool.isActived) {
            const monitoringTopic = `${pool.deviceName}/${user.apiKey}/monitoring`;
            const samplingTopic = `${pool.deviceName}/${user.apiKey}/sampling`;

            client.subscribe(monitoringTopic, (err) => {
              if (err) {
                AppLogger.error(`Error subscribing to ${monitoringTopic}:`, err);
              } else {
                console.log(`Subscribed to ${monitoringTopic}`)
                AppLogger.info(`Subscribed to ${monitoringTopic}`);
              }
            });

            client.subscribe(samplingTopic, (err) => {
              if (err) {
                AppLogger.error(`Error subscribing to ${samplingTopic}:`, err);
              } else {
                console.log(`Subscribed to ${samplingTopic}`)
                AppLogger.info(`Subscribed to ${samplingTopic}`);
              }
            });

            client.on('message', async (topic, message) => {
              try {
                const data = JSON.parse(message.toString());
                if (topic === monitoringTopic) {
                  await postMonitorByTopic(user.apiKey, pool.deviceName, data);
                } else if (topic === samplingTopic) {
                  await postSamplebyTopic(user.apiKey, pool.deviceName, data);
                }
              } catch (error) {
                AppLogger.error(`Error processing message from ${topic}:`, error);
              }
            });
          }
        }
      }
    } catch (error) {
      AppLogger.error('Error in mqtt_handler:', error);
    }
  }

}

const mqttService = MQTTService.getInstance();
mqttService.init();

export default mqttService;