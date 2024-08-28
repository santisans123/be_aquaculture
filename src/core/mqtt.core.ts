import mqtt from 'mqtt';
import { caCert, clientCert, clientKey } from '../utils/credentials';
import { AppLogger } from '../logs/error.logs';
import { saveMonitorData } from '../services/monitor.services';

const MQTT_Broker_url = process.env.MQTT_BROKER_URL;
const MQTT_Username = process.env.MQTT_USERNAME_SERVER;
const MQTT_Password = process.env.MQTT_PASSWORD_SERVER;

interface BrokerConfig {
  brokerUrl: string;
  username: string;
  password: string;
}

class MQTTHandler {
  private static instance: MQTTHandler;
  private mqttClient: mqtt.MqttClient | null = null;

  // private static readonly CertificateOptions = {
  //   ca: caCert,
  //   cert: clientCert,
  //   key: clientKey,
  //   rejectUnauthorized: true,
  // };

  public static getInstance(): MQTTHandler {
    if (!MQTTHandler.instance) {
      MQTTHandler.instance = new MQTTHandler();
    }
    return MQTTHandler.instance;
  }

  public connectToBroker(broker: BrokerConfig): void {
    if (this.mqttClient && this.mqttClient.connected) {
      AppLogger.info('MQTT Client already connected.');
      return;
    }

    this.mqttClient = mqtt.connect(MQTT_Broker_url, {
      username: MQTT_Username,
      password: MQTT_Password
      // ca: MQTTHandler.CertificateOptions.ca,
      // cert: MQTTHandler.CertificateOptions.cert,
      // key: MQTTHandler.CertificateOptions.key,
      // rejectUnauthorized: MQTTHandler.CertificateOptions.rejectUnauthorized,
    });

    this.mqttClient.on('connect', () => {
      AppLogger.info('Connected to MQTT broker.');
    });

    this.mqttClient.on('error', this.onError.bind(this));
    this.mqttClient.on('reconnect', this.onReconnect.bind(this));
    this.mqttClient.on('close', this.onClose.bind(this));
  }

  public subscribeToTopic(topic: string): void {
    if (!this.mqttClient) {
      AppLogger.error('MQTT Client is not connected.');
      return;
    }

    this.mqttClient.subscribe(topic, (err) => {
      if (err) {
        AppLogger.error(`Failed to subscribe to topic ${topic}:`, err.message);
      } else {
        AppLogger.info(`Subscribed to topic ${topic}`);
      }
    });

    this.mqttClient.on('message', async (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        await saveMonitorData(data.apiKey, data.deviceName, data);
        AppLogger.info(`Data from topic ${topic} saved to database.`);
      } catch (error) {
        AppLogger.error('Failed to save data from MQTT message:', error);
      }
    });
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
}

export default MQTTHandler;
