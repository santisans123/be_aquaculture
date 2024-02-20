/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from 'express';
import { Users } from '../../models';
import { extractToken } from '../../utils';
import message from '../../views/message';

async function getAllUserProfiles(req: Request, res: Response) {
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
    res.send(
      message({
        statusCode: 200,
        message: 'You have successfully updated!',
        data: isUserExist
      })
    );
  }
  res.status(404).send(
    message({
      statusCode: 404,
      message: 'User is not found',
      data: req.body
    })
  );
}

export { getAllUserProfiles };
