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
import { db } from 'src/model/entities/firebase';
import { IClinicAccount, IUserAccount } from 'src/model/interfaces/db/IAccount';
import {
  IAppointment,
  IClinicAppointment,
  IUserAppointment,
} from 'src/model/interfaces/db/IAppointment';
import { IClinic } from 'src/model/interfaces/db/IClinic';
import { IUser, IVaccinationHistory } from 'src/model/interfaces/db/IUser';
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
      );

      if (dbData == null) {
        throw new UnauthorizedException('Invalid Account');
      }
      if (clinic == null) {
        throw new UnauthorizedException('Invalid Clinic');
      }

      const docSnap = dbData.docs[0];
      const docRef = doc(db, 'MsAccount', docSnap.id);

      const clinicRef = doc(db, 'MsClinic', clinic.docs[0].id);

      var crypto = require('crypto');
      const newId = crypto.randomUUID();

      const newAppointment: IAppointment = {
        id: newId,
        status: appointmentStatusTypes.pending,
        scheduledDate: dto.selectedDate,
        scheduledTime: dto.selectedStartTime,
        scheduledEndTime: '',
        vaccine: dto.vaccine,
      };

      var clinicAppointment: IClinicAppointment | null = null;
      const data: IUserAccount = docSnap.data() as IUserAccount;
      const mapUser = data.userList.map((user, idx) => {
        if (dto.userId.includes(user.id)) {
          const newUserAppointment: IUserAppointment = {
            ...newAppointment,
            clinic: clinic.docs[0].data() as IClinic,
          };

          const newClinicAppointment: IClinicAppointment = {
            ...newAppointment,
            userAccountId: accountId,
            user: user,
          };

          user.scheduledAppointments.push(newUserAppointment);
          clinicAppointment = newClinicAppointment;
        }

        return user;
      });

      if (clinicAppointment != null) {
        await updateDoc(docRef, {
          userList: mapUser,
        });

        await updateDoc(clinicRef, {
          scheduledAppointments: arrayUnion(clinicAppointment),
        });
      }
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

      const patientData = data.clinic.scheduledAppointments.map(
        async (app) => {
          if (app.id == appointmentId) {
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
                const updateAppointment = um.scheduledAppointments.map((ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.scheduled;
                    uCount++;
                  }
                  return ua;
                });
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
        },
      );

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

      const patientData = data.clinic.scheduledAppointments.map(
        async (app) => {
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
                const updateAppointment = um.scheduledAppointments.map((ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.completed;
                    uCount++;
                  }
                  return ua;
                });

                // generate vaccine certificate
                const certificateUri = await this.generateVaccineCertificate(appointmentId);
                const newHistory: IVaccinationHistory = {
                  id: crypto.randomUUID(),
                  vaccine: app.vaccine,
                  vaccinationDate: new Date(),
                  doseNumber: 1,
                  certificateUri: certificateUri
                }
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
        },
      );

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

      const patientData = data.clinic.scheduledAppointments.map(
        async (app) => {
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
                const updateAppointment = um.scheduledAppointments.map((ua, id) => {
                  if (ua.id == appointmentId) {
                    ua.status = appointmentStatusTypes.cancelled;
                    uCount++;
                  }
                  return ua;
                });
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
        },
      );

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

  async generateVaccineCertificate(appointmentId: string){
    return "";
  }
}
