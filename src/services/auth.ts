import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export async function signUpProfessional(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInProfessional(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutProfessional() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Vérifie si l'utilisateur connecté figure dans la table admin_users.
 * Renvoie false pour un visiteur non connecté ou une erreur réseau.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('checkIsAdmin error', error);
    return false;
  }
  return !!data;
}

/**
 * S'abonne aux changements de session (connexion / déconnexion) et
 * renvoie une fonction de désinscription (à appeler dans le cleanup
 * d'un useEffect).
 */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
