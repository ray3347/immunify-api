import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthHelper {
  async getToken(token: string): Promise<string> {
    try {
      const decodedToken = atob(token);
      if (
        decodedToken != undefined &&
        decodedToken === process.env.TOKEN_AUTH &&
        process.env.ROUTE_AUTH != null
      ) {
        const encodedToken = btoa(process.env.ROUTE_AUTH);
        return encodedToken;
      } else {
        return '';
      }
    } catch (ex) {
      return '';
    }
  }
}
