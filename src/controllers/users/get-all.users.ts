/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from 'express';
import { Users } from '../../models';
import { extractToken } from '../../utils';
import message from '../../views/message';

async function getAllUserProfiles(req: Request, res: Response) {
  const userId = extractToken(req.headers.authorization, false).result;
  if (userId) {
    try {
      const users = await Users.find().sort({ createdAt: -1 });

      if (!users.length) {
        return res.status(404).send(
          message({
            statusCode: 404,
            message: 'User is not found',
            data: req.body
          })
        );
      }

      return res.send(
        message({
          statusCode: 200,
          message: 'Users retrieved successfully!',
          data: users
        })
      );
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send(
        message({
          statusCode: 500,
          message: 'Internal Server Error',
          data: error
        })
      );
    }
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

export { getAllUserProfiles };
