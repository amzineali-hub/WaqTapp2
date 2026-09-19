import { Professional, UserAppointment, AppNotification, RolePermission, StaffMember } from '../types';
import { INITIAL_PROFESSIONALS, INITIAL_ROLES, INITIAL_STAFF, INITIAL_NOTIFICATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  PROFESSIONALS: 'waqtapp_professionals_v1',
  APPOINTMENTS: 'waqtapp_appointments_v1',
  NOTIFICATIONS: 'waqtapp_notifications_v1',
  ROLES: 'waqtapp_roles_v1',
  STAFF: 'waqtapp_staff_v1',
  LANGUAGE: 'waqtapp_language_v1',
};

export const getStoredProfessionals = (): Professional[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading professionals", e);
  }
  return INITIAL_PROFESSIONALS;
};

export const saveStoredProfessionals = (pros: Professional[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(pros));
  } catch (e) {
    console.error("Error saving professionals", e);
  }
};

export const getStoredAppointments = (): UserAppointment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading appointments", e);
  }
  // Default sample appointment to showcase on first load
  return [
    {
      id: 101,
      professionalId: 1,
      professionalName: "Dr. Ali Alami",
      sector: "HEALTH",
      city: "Casablanca",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: "10:30",
      userName: "Karim Idrissi",
      userPhone: "0661223344",
      status: "CONFIRMED",
      notes: "Consultation cardiologie de contrôle",
      syncGoogleCalendar: true,
      needsReminders: true,
      cost: 300,
      paymentStatus: "DEPOSIT_PAID",
      amountPaid: 50,
      createdTimestamp: Date.now() - 3600000,
    }
  ];
};

export const saveStoredAppointments = (apps: UserAppointment[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apps));
  } catch (e) {
    console.error("Error saving appointments", e);
  }
};

export const getStoredNotifications = (): AppNotification[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading notifications", e);
  }
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifs: AppNotification[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error("Error saving notifications", e);
  }
};

export const getStoredStaff = (): StaffMember[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading staff", e);
  }
  return INITIAL_STAFF;
};

export const saveStoredStaff = (staff: StaffMember[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (e) {
    console.error("Error saving staff", e);
  }
};

export const getStoredRoles = (): RolePermission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error reading roles", e);
  }
  return INITIAL_ROLES;
};
