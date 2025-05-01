import { Injectable, UnauthorizedException } from '@nestjs/common';
import { arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { request } from 'http';
import { db } from 'src/model/entities/firebase';
import { IUserAccount } from 'src/model/interfaces/db/IAccount';
import { IAppointment, IClinicAppointment, IUserAppointment } from 'src/model/interfaces/db/IAppointment';
import { IClinic } from 'src/model/interfaces/db/IClinic';
import { IUser } from 'src/model/interfaces/db/IUser';
import { IBookAppointmentRequestDTO } from 'src/model/interfaces/requests/IBookAppointmentRequestDTO';

@Injectable()
export class AppointmentHelper {
  // client
  async getClinicAvailableTime(
    clinicId: string,
    selectedDate: Date,
    sessionDurationMinutes: number = 15,
  ) {
    try {
      const dbData = await getDocs(
        query(collection(db, 'MsClinic'), where('id', '==', clinicId)),
      );
      const availableSessions: string[] = [];
      dbData.forEach((x) => {
        const clinic: IClinic = x.data() as IClinic;

        const formatToDateTime = (timeStr: string): Date => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const date = new Date(selectedDate);
          date.setHours(hours, minutes, 0, 0);
          return date;
        };

        const toTimeString = (date: Date) => date.toTimeString().slice(0, 5); // "HH:mm"

        const openTime = formatToDateTime(clinic.openTime);
        const closeTime = formatToDateTime(clinic.closeTime);

        // Get all appointments for the selected date
        const appointments = clinic.scheduledAppointments.filter((appt) => {
          const apptDate = new Date(appt.scheduledDate);
          return (
            apptDate.getFullYear() === selectedDate.getFullYear() &&
            apptDate.getMonth() === selectedDate.getMonth() &&
            apptDate.getDate() === selectedDate.getDate() &&
            !appt.isCanceled
          );
        });

        let currentTime = new Date(openTime);

        while (currentTime < closeTime) {
          const endTime = new Date(
            currentTime.getTime() + sessionDurationMinutes * 60000,
          );

          const hasConflict = appointments.some((appt) => {
            const apptStart = formatToDateTime(appt.scheduledTime);
            const apptEnd = formatToDateTime(appt.scheduledEndTime);

            return (
              (currentTime >= apptStart && currentTime < apptEnd) ||
              (endTime > apptStart && endTime <= apptEnd) ||
              (apptStart >= currentTime && apptStart < endTime)
            );
          });

          if (!hasConflict && endTime <= closeTime) {
            availableSessions.push(toTimeString(currentTime));
          }

          currentTime = endTime;
        }
      });

      return availableSessions;
    } catch (ex) {
      throw ex;
    }
  }

  async bookAppointment(accountId: string, dto: IBookAppointmentRequestDTO) {
    try {
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      const clinic = await getDocs(
        query(collection(db, 'MsClinic'), where('id', '==', dto.clinicId)),
      )

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }
      if(clinic == null){
        throw new UnauthorizedException('Invalid Clinic');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);

      const clinicRef = doc(db, 'MsClinic', clinic.docs[0].id);

      var crypto = require('crypto');
      const newId = crypto.randomUUID();

      const newAppointment : IAppointment = {
        id: newId,
        isAllocated: false,
        isCanceled: false,
        isComplete: false,
        scheduledDate: dto.selectedDate,
        scheduledTime: dto.selectedStartTime,
        scheduledEndTime: "",
        vaccine: dto.vaccine
      }

      var clinicAppointment: IClinicAppointment | null = null;
      const data: IUserAccount = docSnap.data() as IUserAccount;
      const mapUser = data.userList.map((user, idx) => {
        if(dto.userId.includes(user.id)){
            const newUserAppointment: IUserAppointment = {
                ...newAppointment,
                clinic: clinic.docs[0].data() as IClinic
            }

            const newClinicAppointment: IClinicAppointment = {
                ...newAppointment,
                user: user
            }

            user.scheduledAppointments.push(newUserAppointment);
            clinicAppointment = newClinicAppointment;
        }

        return user;
      });

      if(clinicAppointment != null){

        await updateDoc(docRef, {
            userList: mapUser
          });
    
          await updateDoc(clinicRef, {
            scheduledAppointments: arrayUnion(clinicAppointment)
          })
      }

    } catch (ex) {
      throw ex;
    }
  }

  // clinic
  async allocateAppointment() {

  }
}
