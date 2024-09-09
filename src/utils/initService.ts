import mqttService from "../core/mqtt.core";
import { AppLogger } from "../logs/error.logs";

export async function initializeServices() {
    try {
      await mqttService.init();
      AppLogger.info('MQTT Service initialized successfully');
      console.log('[broker]: Connected to MQTT Broker')
    } catch (error) {
      AppLogger.error('Failed to initialize MQTT Service:', error);
    }
  }