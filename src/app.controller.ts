import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { handleLineEvent } from './line/lineHandler';

@Controller('webhook')
export class AppController {
  constructor() {
    //
  }

  @Post()
  async webhook(
    @Req() req: Request<any, any, any, any, Record<string, any>>,
    @Res() res: Response<any>,
  ) {
    try {
      const events = req.body.events;

      for (const event of events) {
        await handleLineEvent(event);
      }

      res.status(200).end();
    } catch (err) {
      console.error('Error in /webhook:', err);
      res.status(500).end();
    }
  }
}
