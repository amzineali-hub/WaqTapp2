-- =====================================================================
-- WaqtApp — Schéma Supabase (Postgres)
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PROFESSIONALS
-- ---------------------------------------------------------------------
create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  sector text not null,               -- HEALTH | BEAUTY | ADMIN | AUTO | ARTISAN
  sector_fr text not null,
  sector_ar text not null,
  title_fr text not null,
  title_ar text not null,
  city text not null,
  address_fr text,
  address_ar text,
  rating numeric default 0,
  reviews_count int default 0,
  phone text,
  fees numeric default 0,
  is_subscribed boolean default false,
  subscription_plan text default 'FREE',   -- FREE | MAWID_PRO_MONTHLY | MAWID_PRO_YEARLY
  subscription_expiry timestamptz,
  image_url text,
  created_at timestamptz default now()
);

alter table professionals enable row level security;

-- Table des comptes administrateurs (aucune auto-inscription possible —
-- on y ajoute un utilisateur manuellement depuis le SQL Editor Supabase :
--   insert into admin_users (user_id) values ('<uuid de l''utilisateur>');
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admin_users enable row level security;

-- Un utilisateur connecté peut seulement vérifier s'il est lui-même admin
create policy "admin_users_self_check"
  on admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- Tout le monde (visiteurs non connectés inclus) peut consulter l'annuaire
create policy "professionals_public_read"
  on professionals for select
  using (true);

-- Un professionnel connecté peut créer sa propre fiche
create policy "professionals_owner_insert"
  on professionals for insert
  to authenticated
  with check (owner_user_id = auth.uid());

-- Un professionnel connecté peut modifier uniquement sa propre fiche
create policy "professionals_owner_update"
  on professionals for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Un administrateur peut tout créer / modifier / supprimer dans l'annuaire
create policy "professionals_admin_all"
  on professionals for all
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()))
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 2. APPOINTMENTS
-- ---------------------------------------------------------------------
create table if not exists appointments (
  id bigint generated always as identity primary key,
  professional_id uuid references professionals(id) on delete cascade,
  professional_name text not null,
  sector text not null,
  city text not null,
  appointment_date date not null,
  appointment_time text not null,
  user_name text not null,
  user_phone text not null,
  status text not null default 'CONFIRMED',   -- CONFIRMED | CANCELLED | COMPLETED
  notes text,
  sync_google_calendar boolean default false,
  needs_reminders boolean default true,
  cost numeric default 0,
  payment_status text default 'UNPAID',       -- UNPAID | DEPOSIT_PAID | FULLY_PAID
  amount_paid numeric default 0,
  created_at timestamptz default now()
);

alter table appointments enable row level security;

-- Personne ne peut lire directement la table (confidentialité) :
-- la lecture passe uniquement par les fonctions RPC ci-dessous.

-- N'importe qui (même non connecté) peut réserver un rendez-vous
create policy "appointments_public_insert"
  on appointments for insert
  to anon, authenticated
  with check (true);

-- Le professionnel propriétaire peut voir et gérer les RDV de sa fiche
create policy "appointments_owner_select"
  on appointments for select
  to authenticated
  using (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  );

create policy "appointments_owner_update"
  on appointments for update
  to authenticated
  using (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 3. STAFF (collaborateurs d'un professionnel)
-- ---------------------------------------------------------------------
create table if not exists staff (
  id bigint generated always as identity primary key,
  professional_id uuid references professionals(id) on delete cascade,
  name text not null,
  role_id text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

alter table staff enable row level security;

create policy "staff_owner_all"
  on staff for all
  to authenticated
  using (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  )
  with check (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 4. ROLES (référentiel global, en lecture publique)
-- ---------------------------------------------------------------------
create table if not exists roles (
  id text primary key,
  role_name_fr text not null,
  role_name_ar text not null,
  can_manage_appointments boolean default false,
  can_view_client_info boolean default false,
  can_manage_staff_schedules boolean default false
);

alter table roles enable row level security;

create policy "roles_public_read"
  on roles for select
  using (true);

insert into roles (id, role_name_fr, role_name_ar, can_manage_appointments, can_view_client_info, can_manage_staff_schedules)
values
  ('ROLE_ADMIN', 'Administrateur / Gérant', 'المدير المسؤول', true, true, true),
  ('ROLE_RECEPTIONIST', 'Réceptionniste', 'موظف الاستقبال', true, true, false),
  ('ROLE_STAFF', 'Collaborateur (Staff)', 'عضو الفريق / موظف', true, false, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 4bis. SEED — professionnels de démonstration (UUID fixes pour pouvoir
--       les référencer facilement pendant les tests)
-- ---------------------------------------------------------------------
insert into professionals (id, name, sector, sector_fr, sector_ar, title_fr, title_ar, city, address_fr, address_ar, rating, reviews_count, phone, fees, is_subscribed, subscription_plan, subscription_expiry)
values
  ('00000000-0000-4000-8000-000000000001', 'Dr. Ali Alami', 'HEALTH', 'Santé', 'الصحية', 'Cardiologue - Cabinet Anfa', 'أخصائي أمراض القلب - عيادة آنفا', 'Casablanca', '142 Boulevard d''Anfa, Étage 3, Casablanca', '142 شارع أنفا، الطابق 3، الدار البيضاء', 4.9, 124, '0522458921', 300, true, 'MAWID_PRO_MONTHLY', now() + interval '15 days'),
  ('00000000-0000-4000-8000-000000000002', 'Nadia Benjelloun', 'BEAUTY', 'Beauté & Spa', 'الجميل والراحة', 'Directrice - L''Oranger Spa & Salon', 'مديرة - صالون وسبا برتقال', 'Rabat', '8 Rue les Orangers, Hay Riad, Rabat', '8 زنقة البرتقال، حي الرياض، الرباط', 4.7, 89, '0537771234', 150, true, 'MAWID_PRO_YEARLY', now() + interval '240 days'),
  ('00000000-0000-4000-8000-000000000003', 'Maître Youssef Tazi', 'ADMIN', 'Notaire & Adoul', 'التوثيق والعدول', 'Notaire Agréé', 'موثق معتمد', 'Marrakech', 'Avenue Mohammed V, Immeuble Atlas, Marrakech', 'شارع محمد الخامس، عمارة الأطلس، مراكش', 4.8, 56, '0524439088', 500, true, 'MAWID_PRO_YEARLY', now() + interval '300 days'),
  ('00000000-0000-4000-8000-000000000004', 'Omar Amrani', 'ARTISAN', 'Artisans & Travaux', 'الحرف والأعمال', 'Plomberie & Chauffage Pro', 'ترصيص وصيانة التدفئة المنزلية', 'Tanger', 'Quartier Iberia, Rue de Fès, Tanger', 'حي إيبيريا، زنقة فاس، طنجة', 4.5, 37, '0661998844', 120, false, 'FREE', null),
  ('00000000-0000-4000-8000-000000000005', 'SOS Auto Amine', 'AUTO', 'Auto & Technique', 'ميكانيك السيارات', 'Chef d''Atelier Diagnostic & Réparation', 'رئيس ورشة تشخيص وصيانة السيارات', 'Casablanca', 'Zone Industrielle Oulad Haddou, Casablanca', 'المنطقة الصناعية أولاد حدو، الدار البيضاء', 4.6, 42, '0650221144', 200, true, 'MAWID_PRO_MONTHLY', now() + interval '20 days'),
  ('00000000-0000-4000-8000-000000000006', 'Dr. Leila Kadiri', 'HEALTH', 'Santé', 'الصحية', 'Pédiatrie & Nutrition Infantile', 'طب الأطفال والتغذية', 'Rabat', 'Angle Avenue de France et Rue Agadir, Rabat', 'زاوية شارع فرنسا وزقة أكادير، الرباط', 4.9, 153, '0537689911', 250, false, 'FREE', null),
  ('00000000-0000-4000-8000-000000000007', 'Elite Salon Karim', 'BEAUTY', 'Beauté & Spa', 'الجميل والراحة', 'Styliste Visagiste Hommes', 'حلاق ومصفف شعر للرجال', 'Casablanca', '24 Rue Goulmima, Bourgogne, Casablanca', '24 زنقة كلميمة، بوركون، الدار البيضاء', 4.4, 61, '0615998877', 80, false, 'FREE', null),
  ('00000000-0000-4000-8000-000000000008', 'Maître Adil Bennani', 'ADMIN', 'Notaire & Adoul', 'التوثيق والعدول', 'Adoul Jurisconsulte', 'عدل ومستشار شرعي وقانوني', 'Fès', 'Boulevard Allal Ben Abdellah, Fès', 'شارع علال بن عبد الله، فاس', 4.8, 48, '0535624411', 400, true, 'MAWID_PRO_MONTHLY', now() + interval '5 days')
on conflict (id) do nothing;

insert into staff (professional_id, name, role_id, phone, email)
values
  ('00000000-0000-4000-8000-000000000001', 'Dr. Ali Alami', 'ROLE_ADMIN', '0522458921', 'contact@alami-heart.ma'),
  ('00000000-0000-4000-8000-000000000001', 'Fatima Zahra (Accueil)', 'ROLE_RECEPTIONIST', '0661994433', 'reception@alami-heart.ma'),
  ('00000000-0000-4000-8000-000000000001', 'Rachid Amrani (Technique)', 'ROLE_STAFF', '0770552211', 'rachid@alami-heart.ma')
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 5. NOTIFICATIONS (scopées par professionnel)
-- ---------------------------------------------------------------------
create table if not exists notifications (
  id bigint generated always as identity primary key,
  professional_id uuid references professionals(id) on delete cascade,
  title_fr text not null,
  title_ar text not null,
  message_fr text not null,
  message_ar text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "notifications_owner_select"
  on notifications for select
  to authenticated
  using (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  );

create policy "notifications_owner_update"
  on notifications for update
  to authenticated
  using (
    professional_id in (
      select id from professionals where owner_user_id = auth.uid()
    )
  );

-- Génère automatiquement une notification au professionnel concerné
-- à chaque nouvelle réservation ou changement de statut (aucun accès
-- direct en écriture côté client requis pour cette table).
create or replace function handle_appointment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into notifications (professional_id, title_fr, title_ar, message_fr, message_ar)
    values (
      new.professional_id,
      'Nouvelle réservation',
      'حجز جديد',
      format('%s a réservé un rendez-vous le %s à %s.', new.user_name, new.appointment_date, new.appointment_time),
      format('قام %s بحجز موعد بتاريخ %s على الساعة %s.', new.user_name, new.appointment_date, new.appointment_time)
    );
  elsif (tg_op = 'UPDATE' and old.status is distinct from new.status) then
    insert into notifications (professional_id, title_fr, title_ar, message_fr, message_ar)
    values (
      new.professional_id,
      'Statut de rendez-vous mis à jour',
      'تم تحديث حالة الموعد',
      format('Le rendez-vous #%s est maintenant "%s".', new.id, new.status),
      format('أصبحت حالة الموعد #%s: %s.', new.id, new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_appointment_notification on appointments;
create trigger trg_appointment_notification
  after insert or update on appointments
  for each row execute function handle_appointment_notification();

-- ---------------------------------------------------------------------
-- 6. RPC — accès "Mes rendez-vous" côté client, sans compte ni accès
--    direct à la table (sécurité : filtrage strictement côté serveur)
-- ---------------------------------------------------------------------
create or replace function get_my_appointments(p_phone text)
returns setof appointments
language sql
security definer
set search_path = public
as $$
  select * from appointments
  where user_phone = p_phone
  order by created_at desc;
$$;

grant execute on function get_my_appointments(text) to anon, authenticated;

create or replace function cancel_my_appointment(p_id bigint, p_phone text)
returns void
language sql
security definer
set search_path = public
as $$
  update appointments
  set status = 'CANCELLED'
  where id = p_id and user_phone = p_phone;
$$;

grant execute on function cancel_my_appointment(bigint, text) to anon, authenticated;
