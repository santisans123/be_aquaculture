import { Sample, Pools, Users } from '../../models/index';
import { validatePostRecord } from '../../validators';
import { AppLogger } from '../../logs/error.logs';

async function postSamplebyTopic(apiKey: string, deviceName: string, data: any) {
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
      AppLogger.error(`Invalid sample data: ${error.message}`);
      return;
    }

    const record = new Sample({
      ...data,
      userId: user._id,
      poolsId: pool._id,
    });
    
    const savedSample = await record.save();
    AppLogger.info(`Sample data saved for pool: ${pool.poolsName}`);

    return savedSample;
  } catch (error) {
    AppLogger.error('Error saving sample data:', error);
  }
}

export { postSamplebyTopic };