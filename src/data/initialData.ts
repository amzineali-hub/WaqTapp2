import { RolePermission } from '../types';

// Les professionnels, rendez-vous, staff et notifications de démonstration
// sont désormais initialisés côté base de données (voir supabase/schema.sql).
// Seuls les rôles restent définis ici : c'est un référentiel global fixe,
// identique à celui seedé dans Supabase (table `roles`).
export const INITIAL_ROLES: RolePermission[] = [
  {
    id: "ROLE_ADMIN",
    roleNameFr: "Administrateur / Gérant",
    roleNameAr: "المدير المسؤول",
    canManageAppointments: true,
    canViewClientInfo: true,
    canManageStaffSchedules: true
  },
  {
    id: "ROLE_RECEPTIONIST",
    roleNameFr: "Réceptionniste",
    roleNameAr: "موظف الاستقبال",
    canManageAppointments: true,
    canViewClientInfo: true,
    canManageStaffSchedules: false
  },
  {
    id: "ROLE_STAFF",
    roleNameFr: "Collaborateur (Staff)",
    roleNameAr: "عضو الفريق / موظف",
    canManageAppointments: true,
    canViewClientInfo: false,
    canManageStaffSchedules: false
  }
];
