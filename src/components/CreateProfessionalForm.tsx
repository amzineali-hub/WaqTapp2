import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Language } from '../utils/translations';
import { SectorType } from '../types';
import { Button, Card, Input, Select } from './ui';

interface CreateProfessionalFormProps {
  currentLang: Language;
  onCreate: (data: {
    name: string;
    sector: Exclude<SectorType, 'ALL'>;
    sectorFr: string;
    sectorAr: string;
    titleFr: string;
    titleAr: string;
    city: string;
    phone: string;
    fees: number;
  }) => Promise<void>;
}

const SECTOR_LABELS: Record<Exclude<SectorType, 'ALL'>, { fr: string; ar: string }> = {
  HEALTH: { fr: 'Santé', ar: 'الصحية' },
  BEAUTY: { fr: 'Beauté & Spa', ar: 'الجميل والراحة' },
  ADMIN: { fr: 'Notaire & Adoul', ar: 'التوثيق والعدول' },
  AUTO: { fr: 'Auto & Technique', ar: 'ميكانيك السيارات' },
  ARTISAN: { fr: 'Artisans & Travaux', ar: 'الحرف والأعمال' },
};

export const CreateProfessionalForm: React.FC<CreateProfessionalFormProps> = ({ currentLang, onCreate }) => {
  const isFr = currentLang === 'FR';
  const [name, setName] = useState('');
  const [sector, setSector] = useState<Exclude<SectorType, 'ALL'>>('HEALTH');
  const [titleFr, setTitleFr] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [phone, setPhone] = useState('');
  const [fees, setFees] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        name,
        sector,
        sectorFr: SECTOR_LABELS[sector].fr,
        sectorAr: SECTOR_LABELS[sector].ar,
        titleFr,
        titleAr: titleFr,
        city,
        phone,
        fees: Number(fees) || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="max-w-lg mx-auto mt-6 space-y-4">
      <div className="text-center space-y-1">
        <Briefcase className="w-8 h-8 mx-auto text-teal-600" />
        <h3 className="font-bold text-slate-900">
          {isFr ? 'Créez votre fiche professionnelle' : 'أنشئوا بطاقتكم المهنية'}
        </h3>
        <p className="text-xs text-slate-500">
          {isFr
            ? "Dernière étape avant d'accéder à votre tableau de bord Mawid Pro."
            : "الخطوة الأخيرة قبل الوصول إلى لوحة تحكم موعد برو."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isFr ? 'Nom / Nom du cabinet' : 'الاسم / اسم المكتب'}
        />
        <Select value={sector} onChange={(e) => setSector(e.target.value as Exclude<SectorType, 'ALL'>)}>
          {Object.entries(SECTOR_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label.fr}</option>
          ))}
        </Select>
        <Input
          required
          value={titleFr}
          onChange={(e) => setTitleFr(e.target.value)}
          placeholder={isFr ? 'Titre / Spécialité (ex: Cardiologue)' : 'اللقب / التخصص'}
        />
        <Input
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={isFr ? 'Ville' : 'المدينة'}
        />
        <Input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={isFr ? 'Téléphone' : 'الهاتف'}
        />
        <Input
          required
          type="number"
          min={0}
          value={fees}
          onChange={(e) => setFees(e.target.value)}
          placeholder={isFr ? 'Tarif de la consultation (DH)' : 'ثمن الاستشارة (درهم)'}
        />

        <Button type="submit" fullWidth loading={loading}>
          {loading ? (isFr ? 'Création...' : 'جارٍ الإنشاء...') : (isFr ? 'Créer ma fiche' : 'إنشاء بطاقتي')}
        </Button>
      </form>
    </Card>
  );
};
