export type SectorType = 'ALL' | 'HEALTH' | 'BEAUTY' | 'ADMIN' | 'AUTO' | 'ARTISAN';

export interface UserAppointment {
  id: number;
  professionalId: number;
  professionalName: string;
  sector: string;
  city: string;
  date: string;
  time: string;
  userName: string;
  userPhone: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string;
  syncGoogleCalendar: boolean;
  needsReminders: boolean;
  cost: number;
  paymentStatus: 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID';
  amountPaid: number;
  createdTimestamp: number;
}

export interface Professional {
  id: number;
  name: string;
  sector: string;
  sectorFr: string;
  sectorAr: string;
  titleFr: string;
  titleAr: string;
  city: string;
  addressFr: string;
  addressAr: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  fees: number;
  isSubscribed: boolean;
  subscriptionPlan: 'FREE' | 'MAWID_PRO_MONTHLY' | 'MAWID_PRO_YEARLY';
  subscriptionExpiry: number;
  imageUrl?: string;
}

export interface AppNotification {
  id: number;
  titleFr: string;
  titleAr: string;
  messageFr: string;
  messageAr: string;
  timestamp: number;
  isRead: boolean;
}

export interface RolePermission {
  id: string;
  roleNameFr: string;
  roleNameAr: string;
  canManageAppointments: boolean;
  canViewClientInfo: boolean;
  canManageStaffSchedules: boolean;
}

export interface StaffMember {
  id: number;
  name: string;
  roleId: string;
  phone: string;
  email: string;
}

export interface PaymentTransaction {
  id: number;
  appointmentId: number;
  amountPaid: number;
  totalAmount: number;
  paymentType: 'DEPOSIT' | 'FULL';
  paymentGateway: 'Stripe' | 'PayTabs' | 'CMI';
  cardLast4: string;
  clientName: string;
  transactionStatus: 'SUCCESS';
  paymentDate: number;
}
