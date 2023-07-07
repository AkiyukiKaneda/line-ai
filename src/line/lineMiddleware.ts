import {
  middleware as createLineMiddleware,
  SignatureValidationFailed,
} from '@line/bot-sdk';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export async function lineMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await createLineMiddleware(config)(req, res, () => {
      next();
    });
  } catch (err) {
    if (err instanceof SignatureValidationFailed) {
      console.error('Error in lineMiddleware: Signature validation failed');
      res.status(401).end();
    } else {
      console.error('Error in lineMiddleware:', err);
      res.status(500).end();
    }
  }
}
