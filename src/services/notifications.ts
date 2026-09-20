import { supabase } from '../lib/supabaseClient';
import { AppNotification } from '../types';

function mapRow(row: any): AppNotification {
  return {
    id: row.id,
    professionalId: row.professional_id,
    titleFr: row.title_fr,
    titleAr: row.title_ar,
    messageFr: row.message_fr,
    messageAr: row.message_ar,
    timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    isRead: !!row.is_read,
  };
}

/**
 * Les notifications sont générées automatiquement côté base de données
 * (déclencheur SQL sur la table appointments) — ce service ne fait que
 * les lire et les marquer comme lues pour le professionnel connecté.
 */
export async function fetchNotificationsForOwner(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchNotificationsForOwner error', error);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  if (error) {
    console.error('markAllNotificationsAsRead error', error);
    throw error;
  }
}

export async function clearAllNotifications(): Promise<void> {
  const { error } = await supabase.from('notifications').delete().neq('id', 0);
  if (error) {
    console.error('clearAllNotifications error', error);
    throw error;
  }
}
