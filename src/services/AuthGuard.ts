import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthHelper } from "../helper/AuthHelper";

export class AuthGuard implements CanActivate {
    constructor(private readonly helper: AuthHelper) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request = context.switchToHttp().getRequest();
        const { authorization }: any = request.headers;
        if (!authorization || authorization.trim() === '') {
          throw new UnauthorizedException('Please provide token');
        }
        const authToken = authorization.replace(/bearer/gim, '').trim();
        const decodedToken = await atob(authToken);
        if (decodedToken == process.env.ROUTE_AUTH) {
          return true;
        } else {
          throw new UnauthorizedException('Wrong Token');
        }
      } catch (error) {
        console.log('auth error - ', error.message);
        return false;
      }
    }
  }