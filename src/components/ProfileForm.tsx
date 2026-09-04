import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { validatePesel, PeselValidationResult } from '../lib/pesel';
import { DEFAULT_TEST_PROFILE } from '../lib/storage';
import { CheckCircle2, AlertCircle, Sparkles, Lock } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [peselStatus, setPeselStatus] = useState<PeselValidationResult>({ isValid: false });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setFormData(profile);
    if (profile.pesel) {
      setPeselStatus(validatePesel(profile.pesel));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value, updatedAt: new Date().toISOString() };
    setFormData(updated);

    if (name === 'pesel') {
      const res = validatePesel(value);
      setPeselStatus(res);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validatePesel(formData.pesel);
    if (!res.isValid) {
      alert(`Błąd formularza: ${res.errorMessage}`);
      return;
    }
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFillTestData = () => {
    setFormData(DEFAULT_TEST_PROFILE);
    setPeselStatus(validatePesel(DEFAULT_TEST_PROFILE.pesel));
    onSaveProfile(DEFAULT_TEST_PROFILE);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Twoje Dane Identyfikacyjne</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Weryfikacja RODO
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dane niezbędne operatorom do kwerendy w bazach bilingowych zgodnie z Prawem Komunikacji Elektronicznej.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleFillTestData}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wypełnij danymi testowymi (Jan Kowalski)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Imię *</label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="np. Jan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nazwisko *</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="np. Kowalski"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Numer PESEL (11 cyfr) *</label>
              {peselStatus.isValid ? (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Suma poprawna ({peselStatus.birthDate}, {peselStatus.gender})</span>
                </span>
              ) : formData.pesel.length > 0 ? (
                <span className="text-[11px] text-rose-400 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{peselStatus.errorMessage}</span>
                </span>
              ) : null}
            </div>
            <input
              type="text"
              name="pesel"
              required
              maxLength={11}
              value={formData.pesel}
              onChange={handleChange}
              placeholder="np. 44051401359 (lub 00000000000)"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-slate-100 text-sm font-mono tracking-wider ${
                peselStatus.isValid
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : formData.pesel.length > 0
                  ? 'border-rose-500/50 focus:border-rose-500'
                  : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Seria i numer dowodu tożsamości / paszportu *
            </label>
            <input
              type="text"
              name="idCardSeriesNumber"
              required
              value={formData.idCardSeriesNumber}
              onChange={handleChange}
              placeholder="np. ABC123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-sm font-mono uppercase"
            />
          </div>
        </div>

        {/* Adres zamieszkania */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Ulica *</label>
            <input
              type="text"
              name="street"
              required
              value={formData.street}
              onChange={handleChange}
              placeholder="np. Marszałkowska"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nr domu *</label>
              <input
                type="text"
                name="houseNumber"
                required
                value={formData.houseNumber}
                onChange={handleChange}
                placeholder="10"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nr lokalu</label>
              <input
                type="text"
                name="apartmentNumber"
                value={formData.apartmentNumber || ''}
                onChange={handleChange}
                placeholder="5"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kod pocztowy *</label>
            <input
              type="text"
              name="postalCode"
              required
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="00-001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Miejscowość *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="Warszawa"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm"
            />
          </div>
        </div>

        {/* Kanały kontaktowe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Adres e-mail do odpowiedzi IOD *
            </label>
            <input
              type="email"
              name="contactEmail"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="jan.kowalski@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Telefon kontaktowy (opcjonalny)
            </label>
            <input
              type="text"
              name="contactPhone"
              value={formData.contactPhone || ''}
              onChange={handleChange}
              placeholder="+48 500 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Twój Adres e-Doręczeń ADE (opcjonalny)
            </label>
            <input
              type="text"
              name="edoreczeniaAddress"
              value={formData.edoreczeniaAddress || ''}
              onChange={handleChange}
              placeholder="AE:PL-XXXXX-XXXXX-XXXXX-XX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-sm font-mono text-xs"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dane nie są przekazywane na żaden serwer (Zero-Knowledge).</span>
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Zapisz profil</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profil został pomyślnie zaktualizowany w pamięci lokalnej przeglądarki!</span>
          </div>
        )}
      </form>
    </div>
  );
};
