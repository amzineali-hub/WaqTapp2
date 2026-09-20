import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Phone, Star, CheckCircle, Calendar, ShieldCheck, XCircle, Clock, Check, Zap, BellRing, Loader2 } from 'lucide-react';
import { Professional, SectorType, UserAppointment } from '../types';
import { Language, translations } from '../utils/translations';
import { BookingModal } from './BookingModal';
import { isAppointmentWithinOneHour, getMinutesRemaining } from '../utils/appointmentAlerts';
import { fetchMyAppointments, cancelMyAppointment, bookAppointment as bookAppointmentService } from '../services/appointments';

interface ClientViewProps {
  professionals: Professional[];
  currentLang: Language;
  activeSubTab?: 'DIRECTORY' | 'MY_APPOINTMENTS';
  onSubTabChange?: (tab: 'DIRECTORY' | 'MY_APPOINTMENTS') => void;
  onSimulateUrgentAppointment?: () => void;
}

export const ClientView: React.FC<ClientViewProps> = ({
  professionals,
  currentLang,
  activeSubTab: controlledSubTab,
  onSubTabChange,
  onSimulateUrgentAppointment,
}) => {
  const t = translations[currentLang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorType>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [bookingPro, setBookingPro] = useState<Professional | null>(null);
  const [internalSubTab, setInternalSubTab] = useState<'DIRECTORY' | 'MY_APPOINTMENTS'>('DIRECTORY');
  const [myPhone, setMyPhone] = useState<string>(() => sessionStorage.getItem('waqtapp_my_phone') || '');
  const [phoneInput, setPhoneInput] = useState('');
  const [myAppointments, setMyAppointments] = useState<UserAppointment[]>([]);
  const [loadingMyAppointments, setLoadingMyAppointments] = useState(false);
  const [bookingConfirmedMsg, setBookingConfirmedMsg] = useState<string | null>(null);

  const refreshMyAppointments = useCallback(async (phone: string) => {
    if (!phone) {
      setMyAppointments([]);
      return;
    }
    setLoadingMyAppointments(true);
    try {
      const list = await fetchMyAppointments(phone);
      setMyAppointments(list);
    } finally {
      setLoadingMyAppointments(false);
    }
  }, []);

  useEffect(() => {
    refreshMyAppointments(myPhone);
  }, [myPhone, refreshMyAppointments]);

  const handleCancelMyAppointment = async (id: number) => {
    await cancelMyAppointment(id, myPhone);
    refreshMyAppointments(myPhone);
  };

  const activeSubTab = controlledSubTab ?? internalSubTab;
  const handleSubTabClick = (tab: 'DIRECTORY' | 'MY_APPOINTMENTS') => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  // Filter professionals
  const filteredPros = professionals.filter((pro) => {
    const matchesSearch =
      pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.titleFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.titleAr.includes(searchQuery) ||
      pro.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.addressFr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector = selectedSector === 'ALL' || pro.sector === selectedSector;
    const matchesCity = selectedCity === 'ALL' || pro.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesSector && matchesCity;
  });

  const categories: { id: SectorType; label: string; icon: string }[] = [
    { id: 'ALL', label: t.categories.ALL, icon: '🌟' },
    { id: 'HEALTH', label: t.categories.HEALTH, icon: '🩺' },
    { id: 'BEAUTY', label: t.categories.BEAUTY, icon: '✨' },
    { id: 'ADMIN', label: t.categories.ADMIN, icon: '📜' },
    { id: 'AUTO', label: t.categories.AUTO, icon: '🚗' },
    { id: 'ARTISAN', label: t.categories.ARTISAN, icon: '🔧' },
  ];

  const citiesList = ["ALL", "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès"];

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation: Annuaire vs Mes Rendez-vous */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSubTabClick('DIRECTORY')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center text-center touch-manipulation min-h-[40px] ${
              activeSubTab === 'DIRECTORY'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {currentLang === 'FR' ? '🔎 Trouver un Pro' : '🔎 دليل المهنيين'}
          </button>
          <button
            onClick={() => handleSubTabClick('MY_APPOINTMENTS')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition text-center touch-manipulation min-h-[40px] ${
              activeSubTab === 'MY_APPOINTMENTS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">{currentLang === 'FR' ? 'Mes Rendez-vous' : 'مواعيدي'}</span>
            {myAppointments.length > 0 && (
              <span className="text-[10px] sm:text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                {myAppointments.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:block text-xs font-semibold text-slate-500">
          {filteredPros.length} {currentLang === 'FR' ? 'professionnels disponibles' : 'مهني متاح في المغرب'}
        </div>
      </div>

      {activeSubTab === 'DIRECTORY' ? (
        <>
          {/* Search Bar & City Selector */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                />
              </div>

              {/* City filter dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto flex items-center">
                  <MapPin className="absolute left-3 w-4 h-4 text-teal-600 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-base sm:text-sm font-medium rounded-xl pl-9 pr-8 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden appearance-none"
                  >
                    {citiesList.map((c) => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? t.allCities : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-pan-x -mx-1 px-1">
              {categories.map((cat) => {
                const isSelected = selectedSector === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSector(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation min-h-[36px] ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs scale-102'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Professionals List */}
          {filteredPros.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">{t.noResults}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('ALL');
                  setSelectedCity('ALL');
                }}
                className="mt-3 text-xs text-teal-600 font-bold hover:underline"
              >
                {currentLang === 'FR' ? 'Réinitialiser les filtres' : 'إعادة ضبط الفلاتر'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPros.map((pro) => (
                <div
                  key={pro.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 space-y-3">
                    
                    {/* Header: Sector & Pro Subscriber Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/60">
                        {currentLang === 'FR' ? pro.sectorFr : pro.sectorAr}
                      </span>
                      {pro.isSubscribed && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <CheckCircle className="w-3 h-3 text-amber-600" />
                          {t.proSubscribed}
                        </span>
                      )}
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition">
                        {pro.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-600 mt-0.5">
                        {currentLang === 'FR' ? pro.titleFr : pro.titleAr}
                      </p>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-500 font-bold gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{pro.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        {pro.reviewsCount} {t.reviews}
                      </span>
                    </div>

                    {/* Address & City */}
                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          {currentLang === 'FR' ? pro.addressFr : pro.addressAr} ({pro.city})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`tel:${pro.phone}`}
                          className="hover:text-teal-700 font-medium"
                        >
                          {pro.phone}
                        </a>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Fee & Action Button */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">{t.freeConsultation}</span>
                      <span className="font-extrabold text-slate-900 text-base">
                        {pro.fees} {t.dh}
                      </span>
                    </div>
                    <button
                      onClick={() => setBookingPro(pro)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-teal-600/20 transition flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {t.bookBtn}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* MY APPOINTMENTS SECTION */
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-6 shadow-xs">
          {bookingConfirmedMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {bookingConfirmedMsg}
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              {t.myAppointments}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              {onSimulateUrgentAppointment && (
                <button
                  onClick={onSimulateUrgentAppointment}
                  className="w-full sm:w-auto justify-center text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-2 sm:py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5 touch-manipulation min-h-[36px]"
                  title={currentLang === 'FR' ? "Créer un rendez-vous dans 50 min pour tester l'alerte visuelle 1h" : "إنشاء موعد تجريبي بعد 50 دقيقة"}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{t.appointmentAlert?.simulateBtn || (currentLang === 'FR' ? "Simuler un RDV dans 50 min" : "تجربة موعد بعد 50 دقيقة")}</span>
                </button>
              )}
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-center">
                {myAppointments.length} {currentLang === 'FR' ? 'rendez-vous' : 'موعد'}
              </span>
              {myPhone && (
                <button
                  onClick={() => { sessionStorage.removeItem('waqtapp_my_phone'); setMyPhone(''); setPhoneInput(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  {currentLang === 'FR' ? 'Changer de numéro' : 'تغيير الرقم'}
                </button>
              )}
            </div>
          </div>

          {!myPhone ? (
            <div className="py-10 text-center max-w-sm mx-auto space-y-3">
              <Phone className="w-10 h-10 mx-auto text-teal-600" />
              <p className="text-sm text-slate-600">
                {currentLang === 'FR'
                  ? "Entrez le numéro utilisé lors de votre réservation pour retrouver vos rendez-vous."
                  : "أدخلوا رقم الهاتف المستخدم عند الحجز لاسترجاع مواعيدكم."}
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder={currentLang === 'FR' ? 'Ex: 0661223344' : '0661223344'}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
                <button
                  onClick={() => {
                    const trimmed = phoneInput.trim();
                    if (!trimmed) return;
                    sessionStorage.setItem('waqtapp_my_phone', trimmed);
                    setMyPhone(trimmed);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {currentLang === 'FR' ? 'Valider' : 'تأكيد'}
                </button>
              </div>
            </div>
          ) : loadingMyAppointments ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-teal-600" />
              <p className="text-sm">
                {currentLang === 'FR' ? 'Chargement de vos rendez-vous...' : 'جارٍ تحميل مواعيدكم...'}
              </p>
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-medium text-sm">
                {currentLang === 'FR'
                  ? "Vous n'avez aucun rendez-vous pour le moment."
                  : 'ليس لديكم أي موعد مسجل في الوقت الحالي.'}
              </p>
              <button
                onClick={() => handleSubTabClick('DIRECTORY')}
                className="mt-3 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {t.bookBtn}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map((app) => {
                const isUrgent = isAppointmentWithinOneHour(app);
                const minutesLeft = getMinutesRemaining(app);

                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isUrgent
                        ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-300 shadow-md relative'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      {isUrgent && (
                        <div className="mb-2 flex items-center justify-between gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
                          <div className="flex items-center gap-1.5">
                            <BellRing className="w-3.5 h-3.5 animate-bounce shrink-0" />
                            <span>
                              {currentLang === 'FR'
                                ? `⏰ Alerte 1 Heure : ${minutesLeft !== null && minutesLeft > 0 ? `Commence dans ${minutesLeft} min` : 'Commence maintenant !'} — Préparez votre départ.`
                                : `⏰ تنبيه ساعة واحدة : ${minutesLeft !== null && minutesLeft > 0 ? `يبدأ خلال ${minutesLeft} دقيقة` : 'يبدأ الآن !'} — يرجى الاستعداد.`}
                            </span>
                          </div>
                          <span className="bg-white/25 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-black">
                            {currentLang === 'FR' ? 'Imminent' : 'عاجل'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{app.professionalName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.appointmentStatus[app.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {app.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {app.time}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {app.city}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-slate-500 italic mt-1">"{app.notes}"</p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span>Tarif: {app.cost} {t.dh}</span>
                        <span>•</span>
                        <span>
                          Paiement: {app.paymentStatus === 'FULLY_PAID' ? 'Réglé' : app.paymentStatus === 'DEPOSIT_PAID' ? `Acompte (${app.amountPaid} DH)` : 'Sur place'}
                        </span>
                        {app.syncGoogleCalendar && (
                          <>
                            <span>•</span>
                            <span className="text-teal-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Google Calendar
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {app.status === 'CONFIRMED' && (
                      <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleCancelMyAppointment(app.id)}
                          className="w-full sm:w-auto justify-center px-3 py-2 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 touch-manipulation min-h-[36px]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {currentLang === 'FR' ? 'Annuler le rendez-vous' : 'إلغاء الموعد'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {bookingPro && (
        <BookingModal
          professional={bookingPro}
          currentLang={currentLang}
          onClose={() => setBookingPro(null)}
          onConfirm={async (appointmentData) => {
            await bookAppointmentService(appointmentData);
            sessionStorage.setItem('waqtapp_my_phone', appointmentData.userPhone);
            setMyPhone(appointmentData.userPhone);
            await refreshMyAppointments(appointmentData.userPhone);
            setBookingConfirmedMsg(
              currentLang === 'FR'
                ? `Rendez-vous confirmé avec ${appointmentData.professionalName} !`
                : `تم تأكيد الموعد مع ${appointmentData.professionalName} !`
            );
            setTimeout(() => setBookingConfirmedMsg(null), 6000);
            setBookingPro(null);
            handleSubTabClick('MY_APPOINTMENTS');
          }}
        />
      )}

    </div>
  );
};
