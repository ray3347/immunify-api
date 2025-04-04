import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { userAccountTypes } from 'src/constants/types';
import { db } from 'src/model/entities/firebase';
import { IAccount, IUserAccount } from 'src/model/interfaces/db/IAccount';
import { IUser } from 'src/model/interfaces/db/IUser';
import { IUserLoginData } from 'src/model/interfaces/requests/IUserLoginData';

@Injectable()
export class UserHelper {
    async register(dto: IUserLoginData): Promise<any> {
        try{
            const dbData = await getDocs(
                query(
                  collection(db, 'MsAccount'),
                  where('email', '==', dto.hashedUsername),
                  // where('secretKey', '==', dto.hashedPassword),
                ),
              );

              if(dbData.size > 0){
                throw new UnauthorizedException("User Account Already Exists");
              }
              else{
                var crypto = require('crypto');
                const newId = crypto.randomUUID();
                const newUser:IUserAccount={
                    id: newId,
                    email: dto.hashedUsername,
                    secretKey: dto.hashedPassword,
                    type: userAccountTypes.user,
                    userList: []
                }
                await addDoc(collection(db, 'MsAccount'), newUser);
              }
        }
        catch(ex){
            throw new UnauthorizedException(ex);
        }
    }
  async login(dto: IUserLoginData): Promise<any> {
    try {
        var userRes:any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('email', '==', dto.hashedUsername),
          where('secretKey', '==', dto.hashedPassword),
        ),
      );
      // console.log(dbData)
      dbData.forEach((x) => {
        // const user = x.data();
        userRes = x.data();
        userRes.secretKey = "";
        // return user;
      });
      // console.log(userRes)
      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

//   async getUserData(email: string): Promise<any> {}

//   async addUserData(accountId: string, user: IUser): Promise<any> {

//   }
}
