import { Request, Response } from 'express';
import { Pools, Monitor, Users } from '../../models/index';
import { subscribeToDynamicTopic } from '../../services/monitor.services';
import { validatePostRecord } from '../../validators';
import message from '../../views/message';

async function configureMQTTSubscription(req: Request, res: Response) {
  const apiKey = req.params.apiKey;
  const isUserExist = await Users.findOne({apiKey: apiKey});
  if (!isUserExist) {
    return res.status(404).send(
      message({
        statusCode: 404,
        data: req.body,
        message: 'Pengguna dengan API Key yang diberikan tidak ditemukan!'
      })
    );
  }

  try {
    await subscribeToDynamicTopic(apiKey);
    return res.status(200).send(
      message({
        statusCode: 200,
        message: 'Server berhasil berlangganan ke topik.',
        data: { apiKey }
      })
    );
  } catch (error) {
    return res.status(500).send(
      message({
        statusCode: 500,
        message: 'Gagal berlangganan ke topik.',
        data: req.body
      })
    );
  }
}

export { configureMQTTSubscription };
