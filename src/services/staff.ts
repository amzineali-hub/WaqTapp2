import { supabase } from '../lib/supabaseClient';
import { StaffMember } from '../types';

function mapRow(row: any): StaffMember {
  return {
    id: row.id,
    professionalId: row.professional_id,
    name: row.name,
    roleId: row.role_id,
    phone: row.phone,
    email: row.email,
  };
}

export async function fetchStaffForOwner(): Promise<StaffMember[]> {
  const { data, error } = await supabase.from('staff').select('*').order('id', { ascending: true });
  if (error) {
    console.error('fetchStaffForOwner error', error);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function addStaffMember(member: Omit<StaffMember, 'id'>): Promise<StaffMember> {
  const { data, error } = await supabase
    .from('staff')
    .insert({
      professional_id: member.professionalId,
      name: member.name,
      role_id: member.roleId,
      phone: member.phone,
      email: member.email,
    })
    .select()
    .single();

  if (error) {
    console.error('addStaffMember error', error);
    throw error;
  }
  return mapRow(data);
}

export async function deleteStaffMember(id: number): Promise<void> {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) {
    console.error('deleteStaffMember error', error);
    throw error;
  }
}
