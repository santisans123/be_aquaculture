import { Sample, Pools, Users } from '../../models/index';
import { validatePostRecord } from '../../validators';
import { AppLogger } from '../../logs/error.logs';

async function postSamplebyTopic(deviceName: string, apiKey: string, data: any) {
  try {
    console.log(`Processing monitoring data for device ${deviceName} with apiKey ${apiKey}`);
    console.log('Received data:', data);

    const user = await Users.findOne({ apiKey });
    if (!user) {
      console.log(`No user found with apiKey ${apiKey}`);
      return;
    }

    const pool = await Pools.findOne({ deviceName, userId: user._id });
    if (!pool) {
      console.log(`No pool found for device ${deviceName} and user ${user._id}`);
      return;
    }

    const samplingData = new Sample({
      poolsId: pool._id,
      salinity: data.salinity,
      acidity: data.acidity,
      oxygen: data.oxygen,
      temperature: data.temperature
    });

    await samplingData.save();
    console.log(`Sampling data saved for pool ${pool._id}`);
  } catch (error) {
    AppLogger.error('Error handling sampling message:', error);
  }
}

export { postSamplebyTopic };