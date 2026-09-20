import { supabase } from '../lib/supabaseClient';
import { Professional } from '../types';

// Convertit une ligne Supabase (snake_case) en objet Professional (camelCase)
function mapRow(row: any): Professional {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    sector: row.sector,
    sectorFr: row.sector_fr,
    sectorAr: row.sector_ar,
    titleFr: row.title_fr,
    titleAr: row.title_ar,
    city: row.city,
    addressFr: row.address_fr,
    addressAr: row.address_ar,
    rating: Number(row.rating) || 0,
    reviewsCount: row.reviews_count || 0,
    phone: row.phone,
    fees: Number(row.fees) || 0,
    isSubscribed: !!row.is_subscribed,
    subscriptionPlan: row.subscription_plan || 'FREE',
    subscriptionExpiry: row.subscription_expiry ? new Date(row.subscription_expiry).getTime() : 0,
    imageUrl: row.image_url || undefined,
  };
}

export async function fetchProfessionals(): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchProfessionals error', error);
    return [];
  }
  return (data || []).map(mapRow);
}

export async function createOwnProfessional(
  ownerUserId: string,
  data: Pick<Professional, 'name' | 'sector' | 'sectorFr' | 'sectorAr' | 'titleFr' | 'titleAr' | 'city' | 'phone' | 'fees'>
): Promise<Professional> {
  const { data: row, error } = await supabase
    .from('professionals')
    .insert({
      owner_user_id: ownerUserId,
      name: data.name,
      sector: data.sector,
      sector_fr: data.sectorFr,
      sector_ar: data.sectorAr,
      title_fr: data.titleFr,
      title_ar: data.titleAr,
      city: data.city,
      phone: data.phone,
      fees: data.fees,
      is_subscribed: false,
      subscription_plan: 'FREE',
    })
    .select()
    .single();

  if (error) {
    console.error('createOwnProfessional error', error);
    throw error;
  }
  return mapRow(row);
}

export async function importProfessionals(newPros: Omit<Professional, 'id' | 'ownerUserId'>[]): Promise<Professional[]> {
  const rows = newPros.map((p) => ({
    name: p.name,
    sector: p.sector,
    sector_fr: p.sectorFr,
    sector_ar: p.sectorAr,
    title_fr: p.titleFr,
    title_ar: p.titleAr,
    city: p.city,
    address_fr: p.addressFr,
    address_ar: p.addressAr,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    phone: p.phone,
    fees: p.fees,
    is_subscribed: p.isSubscribed,
    subscription_plan: p.subscriptionPlan,
  }));

  const { data, error } = await supabase.from('professionals').insert(rows).select();
  if (error) {
    console.error('importProfessionals error', error);
    throw error;
  }
  return (data || []).map(mapRow);
}

export async function updateProfessional(pro: Professional): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .update({
      name: pro.name,
      sector: pro.sector,
      sector_fr: pro.sectorFr,
      sector_ar: pro.sectorAr,
      title_fr: pro.titleFr,
      title_ar: pro.titleAr,
      city: pro.city,
      address_fr: pro.addressFr,
      address_ar: pro.addressAr,
      rating: pro.rating,
      reviews_count: pro.reviewsCount,
      phone: pro.phone,
      fees: pro.fees,
      is_subscribed: pro.isSubscribed,
      subscription_plan: pro.subscriptionPlan,
      subscription_expiry: pro.subscriptionExpiry ? new Date(pro.subscriptionExpiry).toISOString() : null,
    })
    .eq('id', pro.id);

  if (error) {
    console.error('updateProfessional error', error);
    throw error;
  }
}
