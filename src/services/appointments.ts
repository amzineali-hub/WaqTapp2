import { supabase } from '../lib/supabaseClient';
import { UserAppointment } from '../types';

function mapRow(row: any): UserAppointment {
  return {
    id: row.id,
    professionalId: row.professional_id,
    professionalName: row.professional_name,
    sector: row.sector,
    city: row.city,
    date: row.appointment_date,
    time: row.appointment_time,
    userName: row.user_name,
    userPhone: row.user_phone,
    status: row.status,
    notes: row.notes || '',
    syncGoogleCalendar: !!row.sync_google_calendar,
    needsReminders: !!row.needs_reminders,
    cost: Number(row.cost) || 0,
    paymentStatus: row.payment_status || 'UNPAID',
    amountPaid: Number(row.amount_paid) || 0,
    createdTimestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

/**
 * Rendez-vous visibles par le professionnel actuellement connecté
 * (RLS : uniquement ceux de son propre cabinet).
 */
export async function fetchAppointmentsForOwner(): Promise<UserAppointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAppointmentsForOwner error', error);
    return [];
  }
  return (data || []).map(mapRow);
}

/**
 * Rendez-vous d'un client, retrouvés uniquement via son numéro de
 * téléphone (fonction RPC sécurisée côté serveur — aucun accès direct
 * à la table n'est nécessaire ni possible pour un visiteur anonyme).
 */
export async function fetchMyAppointments(phone: string): Promise<UserAppointment[]> {
  const { data, error } = await supabase.rpc('get_my_appointments', { p_phone: phone });
  if (error) {
    console.error('fetchMyAppointments error', error);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function bookAppointment(
  appointment: Omit<UserAppointment, 'id' | 'createdTimestamp'>
): Promise<void> {
  const { error } = await supabase.from('appointments').insert({
    professional_id: appointment.professionalId,
    professional_name: appointment.professionalName,
    sector: appointment.sector,
    city: appointment.city,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    user_name: appointment.userName,
    user_phone: appointment.userPhone,
    status: appointment.status,
    notes: appointment.notes,
    sync_google_calendar: appointment.syncGoogleCalendar,
    needs_reminders: appointment.needsReminders,
    cost: appointment.cost,
    payment_status: appointment.paymentStatus,
    amount_paid: appointment.amountPaid,
  });
  // Remarque : pas de .select() ici — un visiteur anonyme n'a pas le droit
  // de relire une ligne de la table appointments (confidentialité), même
  // celle qu'il vient de créer. L'écran "Mes rendez-vous" la récupère
  // juste après via la fonction sécurisée get_my_appointments().

  if (error) {
    console.error('bookAppointment error', error);
    throw error;
  }
}

/**
 * Annulation côté client : protégée par le numéro de téléphone
 * (fonction RPC — un client ne peut annuler qu'un RDV dont il connaît
 * le numéro utilisé lors de la réservation).
 */
export async function cancelMyAppointment(id: number, phone: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_my_appointment', { p_id: id, p_phone: phone });
  if (error) {
    console.error('cancelMyAppointment error', error);
    throw error;
  }
}

/**
 * Mise à jour de statut côté professionnel (Confirmer / Terminer / Annuler).
 */
export async function updateAppointmentStatus(
  id: number,
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
  if (error) {
    console.error('updateAppointmentStatus error', error);
    throw error;
  }
}
