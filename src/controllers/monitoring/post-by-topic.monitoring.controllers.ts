import { Pools, Monitor, Users } from '../../models';
import { validatePostRecord } from '../../validators';
import { AppLogger } from '../../logs/error.logs';

async function postMonitorByTopic(apiKey: string, deviceName: string, data: any) {
  try {
    const user = await Users.findOne({ apiKey: apiKey });
    if (!user) {
      AppLogger.warn(`User not found for API Key: ${apiKey}`);
      return;
    }

    const pool = await Pools.findOne({ deviceName: deviceName, userId: user._id });
    if (!pool) {
      AppLogger.warn(`Pool not found for device: ${deviceName}`);
      return;
    }

    const { error } = validatePostRecord(data);
    if (error) {
      AppLogger.error(`Invalid monitor data: ${error.message}`);
      return;
    }

    const record = new Monitor({
      ...data,
      userId: user._id,
      poolsId: pool._id
    });
    
    const savedMonitor = await record.save();
    AppLogger.info(`Monitor data saved for pool: ${pool.poolsName}`);

    return savedMonitor;
  } catch (error) {
    AppLogger.error('Error saving monitor data:', error);
  }
}

export { postMonitorByTopic } ;
