import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { request } from 'http';
import { appointmentStatusTypes, userAccountTypes } from '../constants/types';
import { ClinicHelper } from './ClinicHelper';
import { UserHelper } from './UserHelper';
import { db } from '../model/entities/firebase';
import { IClinicAccount, IUserAccount } from '../model/interfaces/db/IAccount';
import { IAppointment, IUserAppointment, IClinicAppointment } from '../model/interfaces/db/IAppointment';
import { IClinic, IVaccineStock } from '../model/interfaces/db/IClinic';
import { IVaccinationHistory } from '../model/interfaces/db/IUser';
import { IBookAppointmentRequestDTO } from '../model/interfaces/requests/IBookAppointmentRequestDTO';

@Injectable()
export class AppointmentHelper {
  // client
  async getClinicAvailableTime(
    clinicId: string,
    selectedDate: Date,
    sessionDurationMinutes: number = 45,
  ) {
    try {
      const dbData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('clinic.id', '==', clinicId),
        ),
      );
      const availableSessions: string[] = [];
      dbData.forEach((x) => {
        const acc: IClinicAccount = x.data() as IClinicAccount;
        const clinic: IClinic = acc.clinic;

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
          const reqDate = new Date(selectedDate);
          return (
            apptDate.getFullYear() === reqDate.getFullYear() &&
            apptDate.getMonth() === reqDate.getMonth() &&
            apptDate.getDate() === reqDate.getDate() &&
            appt.status !== appointmentStatusTypes.cancelled
            // !appt.isCanceled
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
      console.log('aaaaa', ex);
      throw ex;
    }
  }

  async bookAppointment(accountId: string, dto: IBookAppointmentRequestDTO) {
    try {
      const dbData = await getDocs(
        query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      );

      const clinic = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('clinic.id', '==', dto.clinicId),
        ),
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }
      if (clinic == null) {
        throw new UnauthorizedException('Invalid Clinic');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);

      const clinicRef = doc(db, 'MsAccount', clinic.docs[0].id);

      var crypto = require('crypto');
      const newId = crypto.randomUUID();

      const formatToDateTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(dto.selectedDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
      };

      const currentTime = formatToDateTime(dto.selectedStartTime);

      const endTime = new Date(currentTime.getTime() + 45 * 60000);
      const toTimeString = (date: Date) => date.toTimeString().slice(0, 5);

      const newAppointment: IAppointment = {
        id: newId,
        status: appointmentStatusTypes.pending,
        scheduledDate: dto.selectedDate,
        scheduledTime: dto.selectedStartTime,
        scheduledEndTime: toTimeString(endTime),
        vaccine: dto.vaccine,
      };

      // var clinicAppointment: IClinicAppointment = {
      //   userAccountId: '',
      //   id: '',
      //   scheduledTime: '',
      //   scheduledEndTime: '',
      //   status: '',
      // };
      const data: IUserAccount = docSnap.data() as IUserAccount;

      const mapUser = await data.userList.map(async (user, idx) => {
        if (dto.userId == user.id) {
          const clinicData = clinic.docs[0].data() as IClinicAccount;
          const newUserAppointment: IUserAppointment = {
            ...newAppointment,
            clinic: {
              ...clinicData.clinic,
              scheduledAppointments: [],
              availableVaccines: [],
            },
          };

          const newClinicAppointment: IClinicAppointment = {
            ...newAppointment,
            userAccountId: accountId,
            user: user,
          };

          user.scheduledAppointments.push(newUserAppointment);

          await updateDoc(clinicRef, {
            'clinic.scheduledAppointments': arrayUnion({
              ...newClinicAppointment,
            }),
          });
          // clinicAppointment = newClinicAppointment;
        }

        return user;
      });
      await updateDoc(docRef, {
        userList: mapUser,
      });

      // const returnObj = await getDocs(
      //   query(collection(db, 'MsAccount'), where('id', '==', accountId)),
      // );

      // const resSnap = returnObj.docs[0];
      // const resRef = doc(db, 'MsAccount', resSnap.id);
      // const resData: IUserAccount = resSnap.data() as IUserAccount;

      const helper = new UserHelper();
      const resData = helper.getUserById(accountId);

      return {
        appointmentId: newId,
        dto: resData,
      };
    } catch (ex) {
      throw ex;
    }
  }

  // clinic
  async allocateAppointment(appointmentId: string, clinicId: string) {
    try {
      const clinicData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('id', '==', clinicId),
        ),
      );

      var count = 0;
      const docSnap = clinicData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: IClinicAccount = docSnap.data() as IClinicAccount;

      const patientData = data.clinic.scheduledAppointments.map(async (app) => {
        if (app.id == appointmentId) {
          const helper = new ClinicHelper();
          const checkVax = data.clinic.availableVaccines.find(
            (v) => v.vaccine.id == app.vaccine.id,
          );
          if (checkVax) {
            const req: IVaccineStock = {
              ...checkVax,
              stock: checkVax.stock - 1,
            };
            await helper.modifyClinicVaccineAvailability(data.id, req);
          }
          app.status = appointmentStatusTypes.scheduled;
          count++;

          // update user
          const userData = await getDocs(
            query(
              collection(db, 'MsAccount'),
              where('type', '==', userAccountTypes.user),
              where('id', '==', app.userAccountId),
            ),
          );

          const userSnap = userData.docs[0];
          const userRef = doc(db, 'MsAccount', userSnap.id);
          const u: IUserAccount = userSnap.data() as IUserAccount;
          var uCount = 0;
          const update = u.userList.map((um) => {
            if (um.id == app.user.id) {
              const updateAppointment = um.scheduledAppointments.map(
                (ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.scheduled;
                    uCount++;
                  }
                  return ua;
                },
              );
              um.scheduledAppointments = updateAppointment;
            }

            return um;
          });

          if (uCount == 0) {
            throw new UnauthorizedException('User Not Found');
          } else {
            await updateDoc(userRef, {
              userList: update,
            });
          }
          // send email and push notif here
        }

        return app;
      });

      if (count == 0) {
        throw new UnauthorizedException('Appointment Not Found');
      } else {
        await updateDoc(docRef, {
          'clinic.scheduledAppointments': patientData,
        });
      }
    } catch (ex) {
      throw ex;
    }
  }

  async completeAppointment(appointmentId: string, clinicId: string) {
    try {
      const clinicData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('id', '==', clinicId),
        ),
      );

      var count = 0;
      const docSnap = clinicData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: IClinicAccount = docSnap.data() as IClinicAccount;

      const patientData = data.clinic.scheduledAppointments.map(async (app) => {
        if (app.id == appointmentId) {
          app.status = appointmentStatusTypes.completed;
          count++;

          // update user
          const userData = await getDocs(
            query(
              collection(db, 'MsAccount'),
              where('type', '==', userAccountTypes.user),
              where('id', '==', app.userAccountId),
            ),
          );

          const userSnap = userData.docs[0];
          const userRef = doc(db, 'MsAccount', userSnap.id);
          const u: IUserAccount = userSnap.data() as IUserAccount;
          var uCount = 0;
          const update = u.userList.map(async (um) => {
            if (um.id == app.user.id) {
              const updateAppointment = um.scheduledAppointments.map(
                (ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.completed;
                    uCount++;
                  }
                  return ua;
                },
              );

              // generate vaccine certificate
              const certificateUri =
                await this.generateVaccineCertificate(appointmentId);
              const newHistory: IVaccinationHistory = {
                id: crypto.randomUUID(),
                vaccine: app.vaccine,
                vaccinationDate: new Date(),
                doseNumber: 1,
                certificateUri: certificateUri,
              };
              um.scheduledAppointments = updateAppointment;
              um.vaccinationHistory.push(newHistory);
            }

            return um;
          });

          if (uCount == 0) {
            throw new UnauthorizedException('User Not Found');
          } else {
            await updateDoc(userRef, {
              userList: update,
            });
          }
          // send email and push notif here
        }

        return app;
      });

      if (count == 0) {
        throw new UnauthorizedException('Appointment Not Found');
      } else {
        await updateDoc(docRef, {
          'clinic.scheduledAppointments': patientData,
        });
      }
    } catch (ex) {
      throw ex;
    }
  }

  async cancelAppointment(appointmentId: string, clinicId: string) {
    try {
      const clinicData = await getDocs(
        query(
          collection(db, 'MsAccount'),
          where('type', '==', userAccountTypes.clinic),
          where('id', '==', clinicId),
        ),
      );

      var count = 0;
      const docSnap = clinicData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);
      const data: IClinicAccount = docSnap.data() as IClinicAccount;

      const patientData = data.clinic.scheduledAppointments.map(async (app) => {
        if (app.id == appointmentId) {
          app.status = appointmentStatusTypes.cancelled;
          count++;

          // update user
          const userData = await getDocs(
            query(
              collection(db, 'MsAccount'),
              where('type', '==', userAccountTypes.user),
              where('id', '==', app.userAccountId),
            ),
          );

          const userSnap = userData.docs[0];
          const userRef = doc(db, 'MsAccount', userSnap.id);
          const u: IUserAccount = userSnap.data() as IUserAccount;
          var uCount = 0;
          const update = u.userList.map((um) => {
            if (um.id == app.user.id) {
              const updateAppointment = um.scheduledAppointments.map(
                (ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.cancelled;
                    uCount++;
                  }
                  return ua;
                },
              );
              um.scheduledAppointments = updateAppointment;
            }

            return um;
          });

          if (uCount == 0) {
            throw new UnauthorizedException('User Not Found');
          } else {
            await updateDoc(userRef, {
              userList: update,
            });
          }
          // send email and push notif here
        }

        return app;
      });

      if (count == 0) {
        throw new UnauthorizedException('Appointment Not Found');
      } else {
        await updateDoc(docRef, {
          'clinic.scheduledAppointments': patientData,
        });
      }
    } catch (ex) {
      throw ex;
    }
  }

  async generateVaccineCertificate(appointmentId: string) {
    return '';
  }
}
