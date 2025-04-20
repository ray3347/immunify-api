import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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

  async addUser(accountId: string, dto: IUser): Promise<any>{
    try{
      var userRes: any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('id', "==", accountId)
        ),
      );

      if(dbData == null){
        throw new UnauthorizedException("Invalid Account");
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);

      // dbData.forEach((x) => {
      //   // const user = x.data();
      //   userRes = x.data();
      //   userRes.secretKey = "";
      //   userRes.userList.push(dto);
      //   // return user;
      // });

      var crypto = require('crypto');
      const newId = crypto.randomUUID();
      await updateDoc(docRef,  {
        userList: arrayUnion({
          ...dto,
          id: newId
        })
      })

      return userRes;
    }catch (ex) {
      throw ex;
    }
  }
}
