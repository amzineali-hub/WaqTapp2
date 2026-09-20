import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { ProfessionalView } from './components/ProfessionalView';
import { AdminDirectoryView } from './components/AdminDirectoryView';
import { NotificationModal } from './components/NotificationModal';
import { UpcomingAppointmentAlert } from './components/UpcomingAppointmentAlert';
import { AuthGate } from './components/AuthGate';
import { CreateProfessionalForm } from './components/CreateProfessionalForm';
import {
  fetchProfessionals,
  importProfessionals,
  updateProfessional,
  createOwnProfessional,
} from './services/professionals';
import {
  fetchAppointmentsForOwner,
  updateAppointmentStatus as updateAppointmentStatusService,
} from './services/appointments';
import { fetchStaffForOwner, addStaffMember, deleteStaffMember } from './services/staff';
import {
  fetchNotificationsForOwner,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from './services/notifications';
import { getCurrentSession, onAuthStateChange, signOutProfessional, checkIsAdmin } from './services/auth';
import { INITIAL_ROLES } from './data/initialData';
import { Professional, UserAppointment, AppNotification, StaffMember } from './types';
import { Language } from './utils/translations';
import {
  isAppointmentWithinOneHour,
  getMinutesRemaining,
  getNotified1hAlerts,
  mark1hAlertAsNotified,
  playAlertChime,
  sendBrowserNotification,
} from './utils/appointmentAlerts';
import { ShieldCheck, Zap, LogOut, Loader2, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [activeTab, setActiveTab] = useState<'CITOYEN' | 'PRO' | 'ADMIN'>('CITOYEN');
  const [clientSubTab, setClientSubTab] = useState<'DIRECTORY' | 'MY_APPOINTMENTS'>('DIRECTORY');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [dismissed1hAlertIds, setDismissed1hAlertIds] = useState<number[]>([]);

  // Annuaire public (visible par tout le monde)
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);

  // Authentification (partagée entre Espace Pro et Espace Admin)
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Données scoppées au professionnel connecté (RLS gère déjà le filtrage
  // côté serveur : ces requêtes ne renvoient que ce qui appartient à l'owner)
  const [proAppointments, setProAppointments] = useState<UserAppointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const roles = INITIAL_ROLES;

  const myProfessional = session
    ? professionals.find((p) => p.ownerUserId === session.user.id) || null
    : null;

  // --- Chargement initial : annuaire public + session existante ---
  useEffect(() => {
    fetchProfessionals().then((list) => {
      setProfessionals(list);
      setLoadingProfessionals(false);
    });

    getCurrentSession().then((s) => {
      setSession(s);
      setSessionChecked(true);
    });

    const unsubscribe = onAuthStateChange((s) => setSession(s));
    return unsubscribe;
  }, []);

  // --- Statut admin, recalculé à chaque changement de session ---
  useEffect(() => {
    if (session) {
      checkIsAdmin(session.user.id).then(setIsAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  // --- Données du cabinet (RDV, staff, notifications) une fois qu'on sait
  //     quelle fiche professionnelle appartient à l'utilisateur connecté ---
  const refreshProData = useCallback(async () => {
    if (!myProfessional) {
      setProAppointments([]);
      setStaff([]);
      setNotifications([]);
      return;
    }
    const [apps, staffList, notifs] = await Promise.all([
      fetchAppointmentsForOwner(),
      fetchStaffForOwner(),
      fetchNotificationsForOwner(),
    ]);
    setProAppointments(apps);
    setStaff(staffList);
    setNotifications(notifs);
  }, [myProfessional]);

  useEffect(() => {
    refreshProData();
  }, [refreshProData]);

  // RTL / LTR document effect
  useEffect(() => {
    document.documentElement.dir = currentLang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.toLowerCase();
  }, [currentLang]);

  // Scanner d'alerte "RDV dans 1h" — désormais côté professionnel connecté
  useEffect(() => {
    const scanAppointmentsFor1hAlert = () => {
      const now = Date.now();
      const notifiedList = getNotified1hAlerts();

      proAppointments.forEach((app) => {
        if (app.status === 'CONFIRMED' && isAppointmentWithinOneHour(app, now)) {
          if (!notifiedList.includes(app.id)) {
            mark1hAlertAsNotified(app.id);
            playAlertChime();
            sendBrowserNotification(
              `WaqtApp - Rendez-vous dans 1 heure !`,
              `RDV avec ${app.userName} à ${app.time}.`
            );
          }
        }
      });
    };

    scanAppointmentsFor1hAlert();
    const interval = setInterval(scanAppointmentsFor1hAlert, 20000);
    return () => clearInterval(interval);
  }, [proAppointments]);

  const urgentAppointments = proAppointments.filter(
    (app) => isAppointmentWithinOneHour(app) && !dismissed1hAlertIds.includes(app.id)
  );

  const handleViewUrgentAppointment = (_app: UserAppointment) => {
    setActiveTab('PRO');
  };

  const handleDismissUrgentAlert = (appId: number) => {
    setDismissed1hAlertIds((prev) => [...prev, appId]);
  };

  // --- Actions Espace Pro ---
  const handleUpdateAppointmentStatus = async (
    id: number,
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  ) => {
    await updateAppointmentStatusService(id, status);
    refreshProData();
  };

  const handleSubscribe = async (plan: 'FREE' | 'MAWID_PRO_MONTHLY' | 'MAWID_PRO_YEARLY') => {
    if (!myProfessional) return;
    const updated: Professional = {
      ...myProfessional,
      isSubscribed: plan !== 'FREE',
      subscriptionPlan: plan,
      subscriptionExpiry:
        Date.now() + (plan === 'MAWID_PRO_MONTHLY' ? 30 : 365) * 24 * 60 * 60 * 1000,
    };
    await updateProfessional(updated);
    setProfessionals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddStaff = async (member: Omit<StaffMember, 'id' | 'professionalId'>) => {
    if (!myProfessional) return;
    await addStaffMember({ ...member, professionalId: myProfessional.id });
    refreshProData();
  };

  const handleDeleteStaff = async (id: number) => {
    await deleteStaffMember(id);
    refreshProData();
  };

  const handleCreateOwnProfessional = async (data: Parameters<
    typeof createOwnProfessional
  >[1]) => {
    if (!session) return;
    const created = await createOwnProfessional(session.user.id, data);
    setProfessionals((prev) => [created, ...prev]);
  };

  const handleSignOut = async () => {
    await signOutProfessional();
    setActiveTab('CITOYEN');
  };

  // --- Actions Espace Admin ---
  const handleImportProfessionals = async (
    newPros: Parameters<typeof importProfessionals>[0]
  ) => {
    const created = await importProfessionals(newPros);
    setProfessionals((prev) => [...created, ...prev]);
  };

  const handleUpdateProfessional = async (updatedPro: Professional) => {
    await updateProfessional(updatedPro);
    setProfessionals((prev) => prev.map((p) => (p.id === updatedPro.id ? updatedPro : p)));
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
  };

  const handleClearAllNotifications = async () => {
    setNotifications([]);
    await clearAllNotifications();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">

      {/* Top Navigation Bar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setShowNotificationModal(true)}
      />

      {/* Visual 1-Hour Upcoming Appointment Alert Banner (côté Pro) */}
      <UpcomingAppointmentAlert
        urgentAppointments={urgentAppointments}
        currentLang={currentLang}
        onViewAppointment={handleViewUrgentAppointment}
        onDismiss={handleDismissUrgentAlert}
      />

      {/* Demo Mode Notice Banner */}
      <div className="bg-teal-700 text-white text-xs py-2 px-3 sm:px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="leading-snug">
              {currentLang === 'FR'
                ? "Espace Citoyen en accès libre, sans inscription. Un compte est requis pour les espaces Professionnel et Administration."
                : "الفضاء المخصص للمواطنين مفتوح بدون تسجيل. يتطلب فضاءا المهني والإدارة إنشاء حساب."}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-teal-100 bg-teal-800/60 px-2.5 py-0.5 rounded-full border border-teal-600/60 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>{currentLang === 'FR' ? 'Connecté à Supabase' : 'متصل بقاعدة البيانات'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {loadingProfessionals ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-teal-600" />
            <p className="text-sm">
              {currentLang === 'FR' ? "Chargement de l'annuaire..." : 'جارٍ تحميل الدليل...'}
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'CITOYEN' && (
              <ClientView
                professionals={professionals}
                currentLang={currentLang}
                activeSubTab={clientSubTab}
                onSubTabChange={setClientSubTab}
              />
            )}

            {activeTab === 'PRO' && (
              !sessionChecked ? null : !session ? (
                <AuthGate currentLang={currentLang} context="PRO" onAuthenticated={() => {}} />
              ) : !myProfessional ? (
                <CreateProfessionalForm currentLang={currentLang} onCreate={handleCreateOwnProfessional} />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {currentLang === 'FR' ? 'Se déconnecter' : 'تسجيل الخروج'}
                    </button>
                  </div>
                  <ProfessionalView
                    currentPro={myProfessional}
                    appointments={proAppointments}
                    staff={staff}
                    roles={roles}
                    currentLang={currentLang}
                    onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                    onSubscribe={handleSubscribe}
                    onAddStaff={handleAddStaff}
                    onDeleteStaff={handleDeleteStaff}
                  />
                </div>
              )
            )}

            {activeTab === 'ADMIN' && (
              !sessionChecked ? null : !session ? (
                <AuthGate currentLang={currentLang} context="ADMIN" onAuthenticated={() => {}} />
              ) : !isAdmin ? (
                <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
                  <ShieldAlert className="w-10 h-10 mx-auto text-red-500" />
                  <p className="text-sm text-slate-700 font-medium">
                    {currentLang === 'FR'
                      ? "Ce compte n'a pas les droits d'administration."
                      : "هذا الحساب لا يملك صلاحيات الإدارة."}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                  >
                    {currentLang === 'FR' ? 'Se déconnecter' : 'تسجيل الخروج'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={handleSignOut}
                      className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {currentLang === 'FR' ? 'Se déconnecter' : 'تسجيل الخروج'}
                    </button>
                  </div>
                  <AdminDirectoryView
                    professionals={professionals}
                    currentLang={currentLang}
                    onImportProfessionals={handleImportProfessionals}
                    onUpdateProfessional={handleUpdateProfessional}
                  />
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Notifications Modal */}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          currentLang={currentLang}
          onClose={() => setShowNotificationModal(false)}
          onMarkAllAsRead={handleMarkAllNotificationsRead}
          onClearAll={handleClearAllNotifications}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            WaqtApp • {currentLang === 'FR' ? "L'Art de Gérer son Temps et ses Rendez-vous au Maroc" : "منصة حجز المواعيد والخدمات في المغرب"}
          </p>
          <p>
            {currentLang === 'FR'
              ? 'Application Web Réactive • Déploiement optimisé pour Vercel'
              : 'تطبيق ويب متجاوب وسريع • جاهز للنشر على منصة Vercel'}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
