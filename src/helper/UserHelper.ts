import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { userAccountTypes } from 'src/constants/types';
import { db } from 'src/model/entities/firebase';
import { IAccount, IUserAccount } from 'src/model/interfaces/db/IAccount';
import { IUser, IVaccinationHistory } from 'src/model/interfaces/db/IUser';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';
import { IUserLoginData } from 'src/model/interfaces/requests/IUserLoginData';

@Injectable()
export class UserHelper {
  async register(dto: IUserLoginData): Promise<any> {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('email', '==', dto.hashedUsername),
          // where('secretKey', '==', dto.hashedPassword),
        ),
      );

      if (dbData.size > 0) {
        throw new UnauthorizedException('User Account Already Exists');
      } else {
        var crypto = require('crypto');
        const newId = crypto.randomUUID();
        const newUser: IUserAccount = {
          id: newId,
          email: dto.hashedUsername,
          secretKey: dto.hashedPassword,
          type: userAccountTypes.user,
          userList: [],
        };
        await addDoc(collection(db, 'MsAccount'), newUser);

        const returnObj = {
          ...newUser,
          secretKey: '',
        };

        userRes = returnObj;
      }

      return userRes;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async login(dto: IUserLoginData): Promise<any> {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('email', '==', dto.hashedUsername),
          where('secretKey', '==', dto.hashedPassword),
        ),
      );

      if (dbData.size == 0) {
        throw new UnauthorizedException(
          'Email or Password Incorrect, please try again.',
        );
      }
      // console.log(dbData)
      dbData.forEach((x) => {
        // const user = x.data();
        userRes = x.data();
        userRes.secretKey = '';
        // return user;
      });
      // console.log(userRes)
      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async addUser(accountId: string, dto: IUser) {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);

      var crypto = require('crypto');
      const newId = crypto.randomUUID();
      await updateDoc(docRef, {
        userList: arrayUnion({
          ...dto,
          id: newId,
        }),
      });

      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async editUser(accountId: string, dto: IUser) {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: any = docSnap.data();
      const mapUser = data.userList.map((user, idx) => {
        if (user.id == dto.id) {
          user.fullName = dto.fullName;
          user.dateOfBirth = dto.dateOfBirth;
          user.gender = dto.gender;
        }
        return user;
      });

      await updateDoc(docRef, {
        userList: mapUser,
      });

      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async deleteUser(accountId: string, userId: string) {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: any = docSnap.data();

      const searchUser = data.userList.find((user) => user.id == userId);

      if (searchUser != undefined || searchUser != null) {
        await updateDoc(docRef, {
          userList: arrayRemove(searchUser),
        });
      } else {
        throw new UnauthorizedException('Invalid User');
      }

      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async getUpcomingVaccineSchedule(accountId: string) {
    try {
      // console.log("babi", accountId)
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: any = docSnap.data();

      const mapUser: any[] = data.userList.map((user: IUser, idx) => {
        const vaccineMap = new Map<string, IVaccinationHistory[]>();

        for (const record of user.vaccinationHistory) {
          const id = record.vaccine.id;
          if (!vaccineMap.has(id)) {
            vaccineMap.set(id, []);
          }
          vaccineMap.get(id)!.push(record);
        }

        let nextVaccine: {
          vaccine: IVaccine;
          nextDoseNumber: number;
          daysTillEligible: number;
          eligibleDate: Date;
        } | null = null;

        for (const records of vaccineMap.values()) {
          const vaccine = records[0].vaccine;
          const dosesTaken = records.length;

          if (dosesTaken < vaccine.doses) {
            const lastDoseDate = new Date(
              Math.max(
                ...records.map((r) => new Date(r.vaccinationDate).getTime()),
              ),
            );

            const eligibleDate = new Date(lastDoseDate);
            eligibleDate.setDate(eligibleDate.getDate() + vaccine.doseInterval);
            const daysTillEligible = Math.floor(
              (eligibleDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            );

            if (new Date() >= eligibleDate) {
              if (!nextVaccine || eligibleDate < nextVaccine.eligibleDate) {
                nextVaccine = {
                  vaccine,
                  nextDoseNumber: dosesTaken + 1,
                  eligibleDate,
                  daysTillEligible,
                };
              }
            }
          }
        }

        if (nextVaccine != null) {
          console.log('test');
          return nextVaccine;
        }

        // return;
      });

      if (mapUser.length > 0) {
        console.log('babi', mapUser);
        return mapUser;
      }

      return [];
    } catch (ex) {
      throw ex;
    }
  }

  async getAppointmentDetails(appointmentId: string) {}

  async getUserById(accountId: string) {
    try {
      const res = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.user),
          where('id', '==', accountId),
        ),
      );
      const resSnap = res.docs[0];
      const resRef = doc(db, 'MsAccount', resSnap.id);
      const resData: IUserAccount = resSnap.data() as IUserAccount;

      const returnObj: IUserAccount = {
        ...resData,
        secretKey: '',
      };
      return returnObj;
    } catch (ex) {
      throw ex;
    }
  }
}
