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
import { WikiHelper } from './WikiHelper';
import { IVaccineRecommendation } from '../model/interfaces/requests/IVaccineRecommendation';
import { appointmentStatusTypes, userAccountTypes } from '../constants/types';
import { db } from '../model/entities/firebase';
import { IUserAccount } from '../model/interfaces/db/IAccount';
import { IUser, IVaccinationHistory } from '../model/interfaces/db/IUser';
import { IVaccine } from '../model/interfaces/db/IVaccine';
import { IUserLoginData } from '../model/interfaces/requests/IUserLoginData';
import { differenceInDays } from 'date-fns';
import { pushNotification } from '../utilities/fcm-publisher';

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
          notificationToken: [dto.notificationToken],
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

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      // console.log(dbData)
      dbData.forEach(async (x) => {
        // const user = x.data();
        const user = x.data() as IUserAccount;
        const token = dto.notificationToken;
        userRes = user;
        userRes.secretKey = '';
        if (!user.notificationToken.includes(dto.notificationToken)) {
          await updateDoc(docRef, {
            notificationToken: arrayUnion(token),
          });
        }
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

      const returnObj = await this.getUserById(accountId);

      return returnObj;

      // return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async editUser(accountId: string, dto: IUser) {
    console.log('babi', dto);
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

      const returnObj = await this.getUserById(accountId);

      return returnObj;

      // return userRes;
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

      const returnObj = await this.getUserById(accountId);

      return returnObj;
    } catch (ex) {
      throw ex;
    }
  }

  async getNextVaccineDoseAppointment(accountId: string) {
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

  async addVaccinationHistory(
    accountId: string,
    userId: string,
    dto: IVaccinationHistory,
  ) {
    try {
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: IUserAccount = docSnap.data() as IUserAccount;

      const user = data.userList.map((u) => {
        if (u.id == userId) {
          var crypto = require('crypto');
          const newId = crypto.randomUUID();
          const newRecord: IVaccinationHistory = {
            ...dto,
            id: newId,
            vaccine: {
              ...dto.vaccine,
              availableAt: [],
            },
          };
          u.vaccinationHistory.push(newRecord);
        }

        return u;
      });

      await updateDoc(docRef, {
        userList: user,
      });

      const returnObj = await this.getUserById(accountId);

      return returnObj;
    } catch (ex) {
      throw ex;
    }
  }

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

  async getRecommendedVaccines(accountId: string, userId: string) {
    const vaccineHelper = new WikiHelper();
    const allVaccines: IVaccine[] = await vaccineHelper.getVaccineList();
    const userAccount = await this.getUserById(accountId);
    const user = userAccount.userList.filter((u) => u.id == userId)[0];
    const currentDate = new Date();
    const ageInYears =
      (currentDate.getTime() - new Date(user.dateOfBirth).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);

    const recommendations: IVaccineRecommendation[] = [];

    for (const vaccine of allVaccines) {
      // Check age eligibility
      if (ageInYears < vaccine.minimumAge) continue;

      // Check vaccination history
      const history = user.vaccinationHistory
        .filter((vh) => vh.vaccine.id === vaccine.id)
        .sort((a, b) => b.doseNumber - a.doseNumber);

      const lastDose = history[0]?.doseNumber ?? 0;

      if (lastDose >= vaccine.doses) continue; // All doses complete

      const nextDose = lastDose + 1;
      const trimVax: IVaccine = {
        ...vaccine,
        availableAt: [],
      };

      recommendations.push({
        vaccine: trimVax,
        nextDose,
        message:
          lastDose === 0
            ? `Start ${trimVax.vaccineName} (Dose 1 of ${trimVax.doses})`
            : `Continue ${trimVax.vaccineName} (Next: Dose ${nextDose} of ${trimVax.doses})`,
      });
    }

    // Sort by nextDose (lower dose number = higher priority), then by total required doses
    const sorted = recommendations.sort((a, b) => {
      if (a.nextDose !== b.nextDose) return b.nextDose - a.nextDose;
      return b.vaccine.doses - a.vaccine.doses;
    });

    return sorted.slice(0, 3); // Return only top 3
  }

  async sendDailyNotificationReminder() {
    try {
      const today = new Date();
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.user),
        ),
      );

      dbData.forEach((entry) => {
        const dataValues = entry.data() as IUserAccount;
        dataValues.userList.map(async (u) => {
          u.scheduledAppointments
            .filter((a) => a.status == appointmentStatusTypes.scheduled)
            .map(async (app) => {
              const appDate = new Date(app.scheduledDate);
              const dayDiff = differenceInDays(appDate, today);
              console.log('diff', dayDiff);
              if (
                today < appDate &&
                (dayDiff == 7 || dayDiff == 3 || dayDiff == 1)
              ) {
                dataValues.notificationToken.forEach(async (token) => {
                  console.log('send notif', `${u.fullName} - ${token}`)
                  await pushNotification(
                    'Appointment Reminder',
                    `${u.fullName}'s ${app.vaccine.vaccineName} Vaccine Appointment is in ${dayDiff} days`,
                    token,
                  );
                });
              }
            });
        });
      });
    } catch (ex) {
      throw ex;
    }
  }
}
