import { Pools, Monitor, Users } from '../../models';
import { validatePostRecord } from '../../validators';
import { AppLogger } from '../../logs/error.logs';

async function postMonitorByTopic(deviceName: string, apiKey: string, data: any) {
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

    const newMonitor = new Monitor({
      poolsId: pool._id,
      temperature: data.temperature,
      salinity: data.salinity,
      oxygen: data.oxygen,
      acidity: data.acidity,
    });

    await newMonitor.save();
    console.log(`Monitoring data saved successfully for pool ${pool._id}`);

  } catch (error) {
    console.error('Error in postMonitorByTopic:', error);
    AppLogger.error('Error in postMonitorByTopic:', error);
  }
};

export { postMonitorByTopic } ;
