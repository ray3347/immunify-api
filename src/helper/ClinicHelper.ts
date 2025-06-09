import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from 'src/model/entities/firebase';
import { IClinic, IVaccineStock } from 'src/model/interfaces/db/IClinic';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';
import { IClinicFilterRequestDTO } from 'src/model/interfaces/requests/IClinicFilterRequestDTO';
import { ILocationData } from 'src/model/interfaces/requests/ILocationData';
import { distanceCalculator } from 'src/utilities/distanceCalculator';
import { userAccountTypes } from '../constants/types';
import { IUserLoginData } from '../model/interfaces/requests/IUserLoginData';
import { IClinicAccount } from '../model/interfaces/db/IAccount';
import { ICreateClinic } from '../model/interfaces/requests/ICreateClinic';

@Injectable()
export class ClinicHelper {
  async getClinicWithLocation(request: IClinicFilterRequestDTO) {
    try {
      const clinicList: IClinic[] = [];
      var userLocationData: ILocationData | null = null;
      if (request.userLangtitude != null && request.userLongtitude != null) {
        userLocationData = {
          latitude: parseInt(request.userLangtitude),
          longtitude: parseInt(request.userLongtitude),
        };
      }
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('clinic.id', '==', request.clinicId),
          // collection(db, 'MsClinic'),
          // where('name', '==', request.filterName ?? ''),
          // where(
          //   'availableVaccines',
          //   'array-contains',
          //   request.filterVaccineId ?? '',
          // ),
        ),
      );

      dbData.forEach((x) => {
        const clinicData: IClinic = {
          ...(x.data() as IClinic),
          distanceFromUser: `${distanceCalculator(
            userLocationData as ILocationData,
            {
              latitude: parseInt(x.data().geoLatitude as string),
              longtitude: parseInt(x.data().geoLongtitude as string),
            },
          )} km`,
        };

        clinicList.push(clinicData);
      });

      // if (userLocationData != null) {
      //   return clinicList
      //     .sort(
      //       (a, b) =>
      //         distanceCalculator(userLocationData as ILocationData, {
      //           latitude: parseInt(a.geoLatitude),
      //           longtitude: parseInt(a.geoLongtitude),
      //         }) -
      //         distanceCalculator(userLocationData as ILocationData, {
      //           latitude: parseInt(b.geoLatitude),
      //           longtitude: parseInt(b.geoLongtitude),
      //         }),
      //     )
      //     .slice(0, 5);
      // }
      return clinicList[0];
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async modifyClinicVaccineAvailability(accountId: string, dto: IVaccineStock) {
    try {
      var clinicRes: IClinicAccount[] = [];
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('id', '==', accountId),
        ),
      );
      var count = 0;
      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: IClinicAccount = docSnap.data() as IClinicAccount;
      const update = data.clinic.availableVaccines.map(async (vax, idx) => {
        // if (user.id == dto.id) {
        //   user.fullName = dto.fullName;
        //   user.dateOfBirth = dto.dateOfBirth;
        //   user.gender = dto.gender;
        // }
        // return user;
        if (vax.id == dto.id) {
          vax.stock = dto.stock;

          // if 0 remove availability on vaccine
          if (dto.stock == 0) {
            const vaccineData = await getDocs(
              query(
                collection(db, 'MsVaccine'),
                where('id', '==', dto.vaccine.id),
              ),
            );
            const vaxSnap = vaccineData.docs[0];
            const vaxRef = doc(db, 'MsVaccine', vaxSnap.id);
            const vax: IVaccine = vaxSnap.data() as IVaccine;

            const removeClinic = vax.availableAt.find((clinic)=>clinic.id == data.clinic.id);

            if(removeClinic){
              await updateDoc(vaxRef,{
                availableAt: arrayRemove(removeClinic)
              })
            }
          }

          count++;
        }
        return vax;
      });

      const updateRes = await Promise.all(update)

      if (count == 0) {
        var crypto = require('crypto');
        const newId = crypto.randomUUID();
        const newVaccineStock: IVaccineStock = {
          id: newId,
          vaccine: dto.vaccine,
          stock: dto.stock,
        };

        // add availability on vaccine
        const vaccineData = await getDocs(
          query(collection(db, 'MsVaccine'), where('id', '==', dto.vaccine.id)),
        );
        const vaxSnap = vaccineData.docs[0];
        const vaxRef = doc(db, 'MsVaccine', vaxSnap.id);
        const vax: IVaccine = vaxSnap.data() as IVaccine;
        const clinicInVax: IClinic = data.clinic;

        await updateDoc(vaxRef, {
          availableAt: arrayUnion({
            ...clinicInVax,
          }),
        });

        await updateDoc(docRef, {
          'clinic.availableVaccines': arrayUnion({
            ...newVaccineStock,
          }),
        });
      } else {
        await updateDoc(docRef, {
          'clinic.availableVaccines': updateRes,
        });
      }

      const res = await this.getClinicById(accountId);

      return res;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async clinicLogin(dto: IUserLoginData) {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
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
        userRes = x.data() as IClinicAccount;
        userRes.secretKey = '';
        // return user;
      });
      // console.log(userRes)
      return userRes;
    } catch (ex) {
      throw ex;
    }
  }

  async addClinic(request: ICreateClinic) {
    try {
      var crypto = require('crypto');
      const newId = crypto.randomUUID();
      const newClinic: IClinic = {
        id: newId,
        name: request.clinic.name,
        address: request.clinic.address,
        geoLatitude: request.clinic.geoLatitude,
        geoLongtitude: request.clinic.geoLongtitude,
        availableVaccines: [],
        distanceFromUser: null,
        websiteURL: request.clinic.websiteURL,
        googleMapsURL: request.clinic.googleMapsURL,
        reviews: [],
        openTime: request.clinic.openTime,
        closeTime: request.clinic.closeTime,
        scheduledAppointments: [],
        image: request.clinic.image,
      };

      const newClinicAccount: IClinicAccount = {
        id: crypto.randomUUID(),
        email: request.hashedUsername,
        secretKey: request.hashedPassword,
        type: userAccountTypes.clinic,
        clinic: newClinic,
      };

      await addDoc(collection(db, 'MsAccount'), newClinicAccount);
      await addDoc(collection(db, 'MsClinic'), newClinic);

      return newClinicAccount;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async bindClinicAccount(accountId: string, clinic: IClinic) {
    try {
      var userRes: any = null;
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('id', '==', accountId),
          where('type', '==', userAccountTypes.clinic),
        ),
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
          ...clinic,
          id: newId,
        }),
      });

      return userRes;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async getClinicById(clinicId: string) {
    const res = await getDocs(
      query(
        collection(db, 'MsAccount'),
        where('type', '==', userAccountTypes.clinic),
        where('id', '==', clinicId),
      ),
    );
    const resSnap = res.docs[0];
    const resRef = doc(db, 'MsAccount', resSnap.id);
    const resData: IClinicAccount = resSnap.data() as IClinicAccount;

    const returnObj: IClinicAccount = {
      ...resData,
      secretKey: '',
    };
    return returnObj;
  }
}
