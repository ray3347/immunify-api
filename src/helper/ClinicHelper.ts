import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from 'src/model/entities/firebase';
import { IClinic, IVaccineStock } from 'src/model/interfaces/db/IClinic';
import { IVaccine } from 'src/model/interfaces/db/IVaccine';
import { IClinicFilterRequestDTO } from 'src/model/interfaces/requests/IClinicFilterRequestDTO';
import { ILocationData } from 'src/model/interfaces/requests/ILocationData';
import { distanceCalculator } from 'src/utilities/distanceCalculator';
import { userAccountTypes } from '../constants/types';
import { IUserLoginData } from '../model/interfaces/requests/IUserLoginData';

@Injectable()
export class ClinicHelper {
  async getClinic(request: IClinicFilterRequestDTO) {
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
          collection(db, 'MsClinic'),
          where('name', '==', request.filterName ?? ''),
          where(
            'availableVaccines',
            'array-contains',
            request.filterVaccineId ?? '',
          ),
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

      if (userLocationData != null) {
        return clinicList
          .sort(
            (a, b) =>
              distanceCalculator(userLocationData as ILocationData, {
                latitude: parseInt(a.geoLatitude),
                longtitude: parseInt(a.geoLongtitude),
              }) -
              distanceCalculator(userLocationData as ILocationData, {
                latitude: parseInt(b.geoLatitude),
                longtitude: parseInt(b.geoLongtitude),
              }),
          )
          .slice(0, 5);
      }
      return clinicList;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async modifyClinicVaccineAvailability(
    clinicId: string,
    dto: IVaccineStock[],
  ) {
    try {

    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }

  async clinicLogin(dto: IUserLoginData){

  }

  async addClinic(request: IClinic) {
    try {
      var crypto = require('crypto');
      const newId = crypto.randomUUID();
      const newClinic: IClinic = {
        id: newId,
        name: request.name,
        address: request.address,
        geoLatitude: request.geoLatitude,
        geoLongtitude: request.geoLongtitude,
        availableVaccines: [],
        distanceFromUser: null,
        websiteURL: request.websiteURL,
        googleMapsURL: request.googleMapsURL,
        reviews: [],
        openTime: request.openTime,
        closeTime: request.closeTime,
        scheduledAppointments: [],
        image: request.image,
      };

      await addDoc(collection(db, 'MsClinic'), newClinic);

      return newClinic;
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

  async getClinicDashboardData(clinicId: string){

  }
}
