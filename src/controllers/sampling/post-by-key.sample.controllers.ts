import { Request, Response } from 'express';
import { Pools, Sample, Users } from '../../models/index';
import { validatePostRecord } from '../../validators';
import message from '../../views/message';

async function postSampleByKey(req: Request, res: Response) {
  const isId = req.headers['accept-language'] == 'id-ID' ? true : false;
  const apiKey = req.params.apiKey;
  const isUserExist = await Users.findOne({apiKey: apiKey});
  if (!isUserExist) {
    return res.status(404).send(
      message({
        statusCode: 404,
        data: req.body,
        message: 'User by given API Key is not found!'
      })
    );
  }

  const isPoolsExist = await Pools.findOne({_id: req.params.poolsId, userId: isUserExist._id});
  if (!isPoolsExist) {
    return res.status(404).send(
      message({
        statusCode: 404,
        data: req.body,
        message: 'Pools by given ID is not found!'
      })
    );
  }

  const { error } = validatePostRecord(req.body);
  if (error) {
    return res.status(400).send(
      message({
        statusCode: 400,
        data: req.body,
        message: error.message
      })
    );
  }
  const record = new Sample({
    ...req.body,
    userId: isUserExist._id,
    poolsId: req.params.poolsId
  });
  
  const savedSample = await record.save();

  const ioEmitter = req.app.get('socketIo');
  ioEmitter.emit(isUserExist._id, savedSample);

  return res.send(
    message({
      statusCode: 201,
      message: isId ? 'Sample berhasil dibuat' : 'Sample is successfully created',
      data: savedSample
    })
  );
}

export { postSampleByKey };
