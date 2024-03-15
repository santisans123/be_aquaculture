/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Ponds, Users } from '../../models';
import { extractToken } from '../../utils';
import message from '../../views/message';

async function getAllNoQueryPonds(req: Request, res: Response) {
  const userId = extractToken(req.headers.authorization, false).result;
  if (userId) {
    const isUserExist = await Users.find();
    if (!isUserExist) {
      return res.status(404).send(
        message({
          statusCode: 404,
          message: 'User is not found',
          data: req.body
        })
      );
    }

    const getAllPonds = await Ponds.find()
      .populate('userId')
      .populate({ path: 'cityId', populate: { path: 'provinceId' } });
    if (!getAllPonds) {
      return res.status(404).send(
        message({
          statusCode: 404,
          message: 'Tambak tidak ditemukan',
          data: req.body
        })
      );
    }
    res.send(
      message({
        statusCode: 200,
        message: 'Tambak berhasil ditemukan!',
        data: getAllPonds
      })
    );
  } else {
    return res.status(404).send(
      message({
        statusCode: 404,
        message: 'User is not found',
        data: req.body
      })
    );
  }
}

export { getAllNoQueryPonds };
