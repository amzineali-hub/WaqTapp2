import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, FileText, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Professional, UserAppointment } from '../types';
import { Language, translations } from '../utils/translations';
import { Button, Input } from './ui';

interface BookingModalProps {
  professional: Professional;
  currentLang: Language;
  onClose: () => void;
  onConfirm: (appointment: Omit<UserAppointment, 'id' | 'createdTimestamp'>) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  professional,
  currentLang,
  onClose,
  onConfirm,
}) => {
  const t = translations[currentLang];
  const b = t.bookingModal;

  // Defaults
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");
  const [userName, setUserName] = useState("Mme / M. Client");
  const [userPhone, setUserPhone] = useState("0661000000");
  const [notes, setNotes] = useState("");
  const [syncGoogleCalendar, setSyncGoogleCalendar] = useState(true);
  const [needsReminders, setNeedsReminders] = useState(true);
  const [paymentOption, setPaymentOption] = useState<'ON_SITE' | 'DEPOSIT' | 'FULL'>('ON_SITE');

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim()) return;

    let depositAmount = 0;
    let paymentStatus: 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID' = 'UNPAID';

    if (paymentOption === 'DEPOSIT') {
      depositAmount = Math.min(50, professional.fees);
      paymentStatus = 'DEPOSIT_PAID';
    } else if (paymentOption === 'FULL') {
      depositAmount = professional.fees;
      paymentStatus = 'FULLY_PAID';
    }

    onConfirm({
      professionalId: professional.id,
      professionalName: professional.name,
      sector: professional.sector,
      city: professional.city,
      date,
      time,
      userName: userName.trim(),
      userPhone: userPhone.trim(),
      status: "CONFIRMED",
      notes: notes.trim(),
      syncGoogleCalendar,
      needsReminders,
      cost: professional.fees,
      paymentStatus,
      amountPaid: depositAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="absolute inset-0 pattern-zellige pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-teal-200">
              {currentLang === 'FR' ? professional.sectorFr : professional.sectorAr}
            </span>
            <h3 className="text-base sm:text-lg font-bold">{b.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="relative p-1.5 rounded-full text-teal-100 hover:text-white hover:bg-teal-600 transition min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Professional Summary Card */}
        <div className="bg-teal-50/70 p-3.5 sm:p-4 border-b border-teal-100 flex items-start justify-between shrink-0 gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{professional.name}</h4>
            <p className="text-xs font-medium text-teal-700">
              {currentLang === 'FR' ? professional.titleFr : professional.titleAr}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {currentLang === 'FR' ? professional.addressFr : professional.addressAr}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 block">{t.freeConsultation}</span>
            <span className="text-base sm:text-lg font-extrabold text-teal-800">
              {professional.fees} {t.dh}
            </span>
          </div>
        </div>

        {/* Booking Form (Scrollable body) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              {b.selectDate}
            </label>
            <Input
              type="date"
              required
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              {b.selectTime}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 touch-manipulation min-h-[36px] border ${
                    time === slot
                      ? 'bg-gradient-to-b from-teal-500 to-teal-600 text-white font-bold border-teal-700/40 shadow-[0_2px_0_0_#115e59]'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                {b.clientName}
              </label>
              <Input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Karim Benani"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-teal-600" />
                {b.clientPhone}
              </label>
              <Input
                type="tel"
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="06XXXXXXXX"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              {b.notes}
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Première consultation..."
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {b.paymentOption}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('ON_SITE')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150 touch-manipulation ${
                  paymentOption === 'ON_SITE'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-[inset_0_2px_4px_0_rgba(13,148,136,0.2)] ring-1 ring-teal-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{b.payOnSite}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">0 DH acompte</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('DEPOSIT')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150 touch-manipulation ${
                  paymentOption === 'DEPOSIT'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-[inset_0_2px_4px_0_rgba(13,148,136,0.2)] ring-1 ring-teal-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{b.payDeposit}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Stripe / CMI Démo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('FULL')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all duration-150 touch-manipulation ${
                  paymentOption === 'FULL'
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-[inset_0_2px_4px_0_rgba(13,148,136,0.2)] ring-1 ring-teal-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>{b.payFull}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">{professional.fees} {t.dh}</span>
              </button>
            </div>
          </div>

          {/* Sync & Reminders Toggles */}
          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={syncGoogleCalendar}
                onChange={(e) => setSyncGoogleCalendar(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                {b.googleCalendar}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={needsReminders}
                onChange={(e) => setNeedsReminders(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                {b.reminders}
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 shrink-0">
            <Button type="button" variant="ghost" fullWidth onClick={onClose} className="sm:w-auto">
              {b.cancelBtn}
            </Button>
            <Button type="submit" fullWidth className="sm:w-auto">
              <CheckCircle className="w-4 h-4" />
              {b.confirmBtn}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
