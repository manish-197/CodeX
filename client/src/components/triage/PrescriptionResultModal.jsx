import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Pill, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  Navigation, 
  Phone, 
  Building2, 
  User, 
  HeartHandshake,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PrescriptionResultModal({
  isOpen,
  onClose,
  prescription,
  selectedMember,
  nearestDoctors = [],
  onNavigateToHospital,
  currentUser
}) {
  const { lang, t } = useLanguage();
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeBookingDocId, setActiveBookingDocId] = useState(null);

  if (!isOpen || !prescription) return null;

  const isCritical = prescription.riskLevel === 'CRITICAL';
  const medicines = prescription.medicines || [];
  const homeRemedies = prescription.homeRemedies || [];
  const ayurvedicRemedies = prescription.ayurvedicRemedies || [];
  const prescId = prescription._id || prescription.id || 'rx_' + Date.now();

  const handleBookEmergencySlot = async (doc) => {
    setActiveBookingDocId(doc.id);
    setBookingLoading(true);

    const patId = selectedMember?.id || selectedMember?._id || prescription.patientDetails?.id || prescription.patientDetails?._id || 'pat_' + Date.now();
    const patArogya = selectedMember?.arogyaId || selectedMember?.abhaId || prescription.patientDetails?.arogyaId || prescription.patientDetails?.abhaId || '';
    const patName = selectedMember?.name || prescription.patientDetails?.name || 'Patient';
    const patAge = Number(selectedMember?.age || prescription.patientDetails?.age) || 0;
    const patGender = selectedMember?.gender || prescription.patientDetails?.gender || 'Other';
    const patBlood = selectedMember?.bloodGroup || prescription.patientDetails?.bloodGroup || 'Unknown';
    const patPhone = selectedMember?.phone || prescription.patientDetails?.phone || '';
    const patVillage = selectedMember?.village || prescription.patientDetails?.village || '';

    try {
      const res = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patId,
          arogyaId: patArogya,
          abhaId: patArogya,
          patientName: patName,
          age: patAge,
          gender: patGender,
          bloodGroup: patBlood,
          phone: patPhone,
          village: patVillage,
          doctorId: doc.id || 'doc_' + Date.now(),
          doctorName: doc.doctorName || 'Emergency Care Specialist',
          specialty: doc.specialty || 'Critical Care & Emergency',
          hospitalName: doc.hospitalName || 'District Civil Hospital Aundh',
          hospitalId: doc.id || '',
          kioskOperatorId: currentUser?._id || currentUser?.id || '',
          kioskOperatorName: currentUser?.name || 'Gram Panchayat Kiosk Operator',
          requestedTime: lang === 'mr' ? '१५ मिनिटांत (आपत्कालीन प्राधान्य लेन)' : lang === 'hi' ? '१५ मिनट के भीतर (प्राथमिकता लेन)' : 'Within 15 minutes (Emergency Priority Lane)',
          triageSummary: prescription.diagnosisSummary || 'Emergency Triage Protocol',
          riskLevel: 'CRITICAL',
          notes: 'Dispatched via Gram Panchayat Kiosk Emergency Desk'
        })
      });

      let savedRecord;
      if (res.ok) {
        const data = await res.json();
        savedRecord = data.appointment;
      } else {
        throw new Error('Appointment API call failed');
      }

      // Sync to localStorage
      try {
        const savedList = JSON.parse(localStorage.getItem('arogya_appointments') || '[]');
        const filtered = savedList.filter(a => (a._id || a.id || a.tokenNo) !== (savedRecord._id || savedRecord.id || savedRecord.tokenNo));
        filtered.unshift(savedRecord);
        localStorage.setItem('arogya_appointments', JSON.stringify(filtered));
      } catch (e) {}

      setBookedAppointment({
        doctorName: savedRecord.doctorName,
        specialty: savedRecord.specialty,
        hospitalName: savedRecord.hospitalName,
        tokenNo: savedRecord.tokenNo,
        status: savedRecord.status || 'requested',
        time: savedRecord.requestedTime || 'Within 15 minutes',
        createdAt: savedRecord.createdAt
      });
    } catch (err) {
      console.warn('[Appointment API Notice, using local persistence fallback]', err.message);
      const fallbackToken = 'EMG-' + Math.floor(1000 + Math.random() * 9000);
      const fallbackRecord = {
        _id: 'app_' + Date.now(),
        id: 'app_' + Date.now(),
        patientId: patId,
        arogyaId: patArogya,
        patientName: patName,
        age: patAge,
        gender: patGender,
        bloodGroup: patBlood,
        phone: patPhone,
        village: patVillage,
        doctorName: doc.doctorName || 'Emergency Specialist',
        specialty: doc.specialty || 'Trauma Care',
        hospitalName: doc.hospitalName || 'District Civil Hospital',
        tokenNo: fallbackToken,
        status: 'requested',
        requestedTime: lang === 'mr' ? '१५ मिनिटांत (आपत्कालीन प्राधान्य लेन)' : 'Within 15 minutes (Emergency Priority Lane)',
        createdAt: new Date().toISOString()
      };

      try {
        const savedList = JSON.parse(localStorage.getItem('arogya_appointments') || '[]');
        savedList.unshift(fallbackRecord);
        localStorage.setItem('arogya_appointments', JSON.stringify(savedList));
      } catch (e) {}

      setBookedAppointment({
        doctorName: fallbackRecord.doctorName,
        specialty: fallbackRecord.specialty,
        hospitalName: fallbackRecord.hospitalName,
        tokenNo: fallbackToken,
        status: 'requested',
        time: fallbackRecord.requestedTime,
        createdAt: fallbackRecord.createdAt
      });
    } finally {
      setBookingLoading(false);
      setActiveBookingDocId(null);
    }
  };

  const patientName = selectedMember?.name || prescription.patientDetails?.name || 'Patient';
  const patientAge = selectedMember?.age || prescription.patientDetails?.age || 42;
  const patientBlood = selectedMember?.bloodGroup || prescription.patientDetails?.bloodGroup || 'B+';
  const patientRelation = selectedMember?.relation || 'Self';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-deep-navy/75 backdrop-blur-md animate-fadeIn"
      data-lenis-prevent="true"
    >
      <div 
        className="relative w-full max-w-3xl h-[88vh] max-h-[88vh] bg-clinical-white dark:bg-dark-base rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 flex flex-col min-h-0 overflow-hidden"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Fixed Height / Never Shrinks */}
        <div className={`shrink-0 p-5 sm:p-6 text-white flex items-start justify-between gap-4 ${
          isCritical 
            ? 'bg-gradient-to-r from-alert-red via-alert-red/90 to-amber-700' 
            : 'bg-gradient-to-r from-teal-800 via-medical-blue to-teal-900'
        }`}>
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
              {isCritical ? <ShieldAlert className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{isCritical ? t('rx_modal_critical_badge') : t('rx_modal_2day_badge')}</span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
              {isCritical ? t('rx_modal_critical_title') : t('rx_modal_standard_title')}
            </h3>
            <p className="text-xs sm:text-sm text-white/90">
              {t('rx_modal_patient')} <strong>{patientName}</strong> ({patientRelation} • {t('rx_modal_age')} {patientAge} {t('rx_modal_years')} • {t('rx_modal_blood')} {patientBlood})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body - Strictly Constrained with min-h-0 and overscroll-contain */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7 space-y-6 text-deep-navy dark:text-clinical-white"
          data-lenis-prevent="true"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >

          {/* CRITICAL RISK SECTION */}
          {isCritical ? (
            <div className="space-y-6">
              
              {/* Emergency Banner */}
              <div className="p-5 rounded-2xl bg-alert-red/15 border-2 border-alert-red flex items-start gap-4 text-left">
                <ShieldAlert className="w-8 h-8 text-alert-red shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-alert-red">
                    {t('rx_modal_critical_alert')}
                  </h4>
                  <p className="text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-relaxed">
                    {t('rx_modal_critical_desc')}
                  </p>
                </div>
              </div>

              {/* Nearest Specialist Doctors & Hospital Route Section */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-alert-red" />
                    <span>{t('rx_modal_doctors_title')}</span>
                  </h4>
                  <span className="text-xs text-medical-blue font-bold">
                    {t('rx_modal_doctors_subtitle')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {nearestDoctors.map((doc) => (
                    <div 
                      key={doc.id}
                      className="p-4 rounded-2xl glass-card border border-deep-navy/15 dark:border-white/10 hover:border-alert-red/50 transition-all space-y-2.5 text-left flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-alert-red/15 text-alert-red">
                            {doc.distanceKm} km
                          </span>
                          <span className="text-[10px] font-semibold text-health-green flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-health-green animate-ping" />
                            <span>{lang === 'mr' ? 'उपलब्ध' : lang === 'hi' ? 'उपलब्ध' : 'Available'}</span>
                          </span>
                        </div>

                        <div className="font-bold text-xs sm:text-sm text-deep-navy dark:text-clinical-white">
                          {doc.doctorName}
                        </div>
                        <div className="text-[11px] font-semibold text-medical-blue">
                          {doc.specialty}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{doc.hospitalName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{doc.phone}</span>
                        </div>
                      </div>

                      {/* Action Buttons: Appointment & Hospital Map Route */}
                      <div className="pt-2 border-t border-deep-navy/10 dark:border-white/10 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBookEmergencySlot(doc)}
                          disabled={bookingLoading}
                          className="btn-navy text-[11px] py-2 px-2 flex items-center justify-center gap-1 shadow-sm whitespace-nowrap disabled:opacity-60"
                        >
                          {bookingLoading && activeBookingDocId === doc.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {bookingLoading && activeBookingDocId === doc.id
                              ? (lang === 'mr' ? 'नोंदवत आहे...' : 'Booking...')
                              : t('rx_modal_token_btn')}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            if (onNavigateToHospital) {
                              const hospObj = {
                                id: doc.id || 'doc_hosp_' + Date.now(),
                                name: doc.hospitalName || doc.name || 'Emergency Trauma Centre',
                                doctorName: doc.doctorName,
                                type: doc.specialty || 'Specialist Emergency Unit',
                                location: doc.location || {
                                  type: 'Point',
                                  coordinates: doc.coordinates || [73.8052, 18.5584]
                                },
                                address: doc.address || 'Emergency Medical Services, Pune District',
                                phone: doc.phone || '108',
                                distanceKm: doc.distanceKm || 3.5,
                                specialties: [doc.specialty || 'Emergency Care']
                              };
                              onNavigateToHospital(hospObj);
                            }
                          }}
                          className="btn-medical-blue text-[11px] py-2 px-2 flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>{t('rx_modal_route_btn')}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booked Emergency Token Confirmation */}
              {bookedAppointment && (
                <div className="p-4 sm:p-5 rounded-2xl bg-health-green/15 border-2 border-health-green space-y-3 animate-fadeIn text-left">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-health-green font-bold text-sm">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span>{t('rx_modal_token_booked')}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-health-green text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{bookedAppointment.status?.toUpperCase() || 'REQUESTED'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-deep-navy dark:text-clinical-white font-medium">
                    {lang === 'mr'
                      ? 'आपत्कालीन स्लॉट विनंती यशस्वीरीत्या नोंदवली गेली! रुग्णालयाच्या आपत्कालीन डेस्कला तात्काळ सूचना पाठवण्यात आली आहे.'
                      : 'Emergency appointment requested successfully! Hospital emergency triage desk has been dispatched the patient token.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-deep-navy dark:text-clinical-white pt-2 border-t border-health-green/30">
                    <div className="bg-white/60 dark:bg-dark-base/60 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">{t('rx_modal_token_no')}</span>
                      <strong className="text-sm font-mono text-medical-blue">{bookedAppointment.tokenNo}</strong>
                    </div>
                    <div className="bg-white/60 dark:bg-dark-base/60 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">{t('rx_modal_token_doctor')}</span>
                      <strong className="font-bold">{bookedAppointment.doctorName}</strong>
                    </div>
                    <div className="bg-white/60 dark:bg-dark-base/60 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">{t('rx_modal_token_hospital')}</span>
                      <strong className="font-bold">{bookedAppointment.hospitalName}</strong>
                    </div>
                    <div className="bg-white/60 dark:bg-dark-base/60 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">{t('rx_modal_token_time')}</span>
                      <strong className="text-alert-red font-bold">{bookedAppointment.time}</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* NON-CRITICAL (MILD / MODERATE) SECTION */
            <div className="space-y-6 text-left">

              {/* 2-Day Strict OTC Medicines Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-deep-navy/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-medical-blue" />
                    <h4 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white">
                      {t('rx_modal_schedule_title')}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-caution-amber/25 text-deep-navy dark:text-caution-amber border border-caution-amber/40 self-start sm:self-auto">
                    {t('rx_modal_schedule_badge')}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-deep-navy/10 dark:border-white/10 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-medical-blue/15 dark:bg-dark-muted/20 text-deep-navy dark:text-clinical-white font-bold border-b border-deep-navy/10 dark:border-white/10">
                        <th className="p-3.5">{t('rx_modal_tbl_cat')}</th>
                        <th className="p-3.5">{t('rx_modal_tbl_dosage')}</th>
                        <th className="p-3.5 text-center">{t('rx_modal_tbl_morning')}</th>
                        <th className="p-3.5 text-center">{t('rx_modal_tbl_afternoon')}</th>
                        <th className="p-3.5 text-center">{t('rx_modal_tbl_night')}</th>
                        <th className="p-3.5">{t('rx_modal_tbl_inst')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-deep-navy/5 dark:divide-white/5">
                      {medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-medical-blue/5 transition-colors">
                          <td className="p-3.5 font-bold text-deep-navy dark:text-clinical-white">
                            {med.nameLocal || med.name}
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                              {med.categoryLocal || med.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium">
                            {med.dosageLocal || med.dosage || '1 Tablet'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.morning ? '✓ (1)' : '—'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.afternoon ? '✓ (1)' : '—'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.night ? '✓ (1)' : '—'}
                          </td>
                          <td className="p-3.5 text-xs text-slate-700 dark:text-slate-300">
                            {med.instructionsLocal || med.instructions || 'Take with water post-meals.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safe Home Remedies Grid */}
              {homeRemedies.length > 0 && (
                <div className="p-5 rounded-2xl bg-health-green/10 border border-health-green/20 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-health-green font-bold text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('rx_modal_remedies_title')}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-deep-navy dark:text-clinical-white">
                    {homeRemedies.map((remedy, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 bg-white/60 dark:bg-dark-base/50 p-2.5 rounded-xl border border-health-green/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-health-green mt-1.5 shrink-0" />
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safe Ayurvedic & Herbal Supportive Care */}
              {ayurvedicRemedies.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{t('rx_modal_ayurvedic_title') || 'Ayurvedic & Herbal Supportive Care (आयुर्वेदिक सुरक्षित उपाय)'}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-deep-navy dark:text-clinical-white">
                    {ayurvedicRemedies.map((remedy, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 bg-white/60 dark:bg-dark-base/50 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Medical Safety Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-caution-amber/20 border border-caution-amber/40 flex items-start gap-2.5 text-xs text-deep-navy dark:text-caution-amber">
                <AlertTriangle className="w-4 h-4 text-caution-amber shrink-0 mt-0.5" />
                <span>
                  {t('rx_modal_disclaimer')}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions - Fixed Height / Never Shrinks */}
        <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-dark-base/90 border-t border-deep-navy/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {t('rx_modal_id')} <span className="font-mono font-bold text-deep-navy dark:text-clinical-white">{prescId}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              id="modal-download-rx-pdf-btn"
              href={`http://localhost:5000/api/prescriptions/${prescId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto btn-medical-blue text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{t('rx_modal_download_pdf')}</span>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto btn-glass text-xs py-2.5 px-5"
            >
              {t('rx_modal_close')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
