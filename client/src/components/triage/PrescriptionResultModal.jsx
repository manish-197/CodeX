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

export default function PrescriptionResultModal({
  isOpen,
  onClose,
  prescription,
  selectedMember,
  nearestDoctors = [],
  onNavigateToHospital
}) {
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  if (!isOpen || !prescription) return null;

  const isCritical = prescription.riskLevel === 'CRITICAL';
  const medicines = prescription.medicines || [];
  const homeRemedies = prescription.homeRemedies || [];
  const prescId = prescription._id || prescription.id || 'rx_' + Date.now();

  const handleBookEmergencySlot = (doc) => {
    setBookingLoading(true);
    setTimeout(() => {
      const tokenNo = 'EMG-' + Math.floor(1000 + Math.random() * 9000);
      setBookedAppointment({
        doctorName: doc.doctorName || 'Dr. Suhas Joshi',
        specialty: doc.specialty || 'Emergency Cardiology',
        hospitalName: doc.hospitalName || 'District Civil Hospital Aundh',
        tokenNo,
        time: 'Within 15 minutes (Emergency Priority Lane)'
      });
      setBookingLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-navy/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 bg-clinical-white dark:bg-dark-base rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-6 sm:p-7 text-white flex items-start justify-between gap-4 ${
          isCritical 
            ? 'bg-gradient-to-r from-alert-red via-alert-red/90 to-amber-700' 
            : 'bg-gradient-to-r from-teal-800 via-medical-blue to-teal-900'
        }`}>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
              {isCritical ? <ShieldAlert className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{isCritical ? 'तात्काळ वैद्यकीय आणीबाणी (Critical Emergency)' : '२ दिवसांचे तात्पुरते प्रिस्क्रिप्शन (2-Day Rx)'}</span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
              {isCritical ? 'तातडीने रुग्णालय तपासणी आवश्यक' : 'आरोग्य मूल्यांकन व औषध सल्ला'}
            </h3>
            <p className="text-xs sm:text-sm text-white/90">
              रुग्ण: <strong>{selectedMember?.name || prescription.patientDetails?.name || 'Patient'}</strong> ({selectedMember?.relation || 'Self'} • वय: {selectedMember?.age || 42} वर्षे • रक्तगट: {selectedMember?.bloodGroup || 'B+'})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-deep-navy dark:text-clinical-white">

          {/* CRITICAL RISK SECTION */}
          {isCritical ? (
            <div className="space-y-6">
              
              {/* Emergency Banner */}
              <div className="p-5 rounded-2xl bg-alert-red/15 border-2 border-alert-red flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-alert-red shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1 text-left">
                  <h4 className="font-bold text-base text-alert-red">
                    धोक्याचा इशारा: स्वतः कोणतेही औषध घेऊ नका!
                  </h4>
                  <p className="text-xs sm:text-sm text-deep-navy dark:text-clinical-white leading-relaxed">
                    निवडलेली लक्षणे अतिगंभीर स्वरूपाची असून तात्काळ वैद्यकीय मदतीची गरज आहे. घरगुती गोळ्या किंवा औषधांमुळे वेळ वाया जाऊ शकतो. कृपया खालील जवळच्या तज्ज्ञ डॉक्टरांशी संपर्क साधा किंवा १०८ रुग्णवाहिका बोलवा.
                  </p>
                </div>
              </div>

              {/* Nearest Specialist Doctors & Hospital Route Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-base text-deep-navy dark:text-clinical-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-alert-red" />
                    <span>जवळचे विशेषज्ञ डॉक्टर व रुग्णालये (GPS द्वारे शोधलेले)</span>
                  </h4>
                  <span className="text-xs text-medical-blue font-bold">
                    स्थानिक आपत्कालीन सुविधा
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearestDoctors.map((doc, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-white/80 dark:bg-dark-base/70 border border-deep-navy/15 dark:border-white/10 space-y-3 shadow-md hover:border-alert-red/50 transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-sm text-deep-navy dark:text-clinical-white">
                            {doc.doctorName}
                          </h5>
                          <p className="text-xs text-medical-blue font-semibold">
                            {doc.specialty}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{doc.hospitalName}</span>
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-xl text-xs font-extrabold bg-medical-blue/15 text-medical-blue shrink-0">
                          {doc.distanceKm} km
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-health-green shrink-0" />
                        <span className="font-mono font-bold">{doc.phone}</span>
                      </div>

                      {/* Action Buttons: Appointment & Hospital Map Route */}
                      <div className="pt-2 border-t border-deep-navy/10 dark:border-white/10 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBookEmergencySlot(doc)}
                          disabled={bookingLoading}
                          className="btn-navy text-[11px] py-2 px-2.5 flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>टोकन मिळवा</span>
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
                              onClose();
                            }
                          }}
                          className="btn-medical-blue text-[11px] py-2 px-2.5 flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>मॅपवर रस्ता पहा</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booked Emergency Token Confirmation */}
              {bookedAppointment && (
                <div className="p-4 rounded-2xl bg-health-green/15 border border-health-green space-y-2 animate-fadeIn text-left">
                  <div className="flex items-center gap-2 text-health-green font-bold text-sm">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>आपत्कालीन स्लॉट बुक झाला आहे!</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-deep-navy dark:text-clinical-white pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block">टोकन क्रमांक:</span>
                      <strong className="text-sm font-mono text-medical-blue">{bookedAppointment.tokenNo}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">डॉक्टर:</span>
                      <strong className="font-bold">{bookedAppointment.doctorName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">रुग्णालय:</span>
                      <strong className="font-bold">{bookedAppointment.hospitalName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">प्राधान्य वेळ:</span>
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
                      २ दिवसांचे तात्पुरते औषधोपचार (Strict 2-Day Relief Schedule)
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-caution-amber/25 text-deep-navy dark:text-caution-amber border border-caution-amber/40 self-start sm:self-auto">
                    कालावधी: फक्त २ दिवस (2 Days Only)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-deep-navy/10 dark:border-white/10 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-medical-blue/15 dark:bg-dark-muted/20 text-deep-navy dark:text-clinical-white font-bold border-b border-deep-navy/10 dark:border-white/10">
                        <th className="p-3.5">औषधाचा गट (Category)</th>
                        <th className="p-3.5">डोस (Dosage)</th>
                        <th className="p-3.5 text-center">सकाळी</th>
                        <th className="p-3.5 text-center">दुपारी</th>
                        <th className="p-3.5 text-center">रात्री</th>
                        <th className="p-3.5">सूचना (Instructions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-deep-navy/5 dark:divide-white/5">
                      {medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-medical-blue/5 transition-colors">
                          <td className="p-3.5 font-bold text-deep-navy dark:text-clinical-white">
                            {med.name}
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                              {med.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium">
                            {med.dosage || '१ गोळी'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.morning ? '✓ (१)' : '—'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.afternoon ? '✓ (१)' : '—'}
                          </td>
                          <td className="p-3.5 text-center font-bold text-medical-blue">
                            {med.timingSchedule?.night ? '✓ (१)' : '—'}
                          </td>
                          <td className="p-3.5 text-xs text-slate-700 dark:text-slate-300">
                            {med.instructions || 'जेवणानंतर कोमट पाण्यासोबत घ्यावे.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safe Home Remedies Grid */}
              <div className="p-5 rounded-2xl bg-health-green/10 border border-health-green/20 space-y-3">
                <div className="flex items-center gap-2 text-health-green font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>घरगुती सुरक्षित उपाय (Safe Home Remedies)</span>
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

              {/* Mandatory Medical Safety Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-caution-amber/20 border border-caution-amber/40 flex items-start gap-2.5 text-xs text-deep-navy dark:text-caution-amber">
                <AlertTriangle className="w-4 h-4 text-caution-amber shrink-0 mt-0.5" />
                <span>
                  <strong>वैद्यकीय सूचना:</strong> हे २ दिवसांचे प्राथमिक लक्षणमुक्ती प्रिस्क्रिप्शन आहे. जर २ दिवसांत आराम न पडल्यास किंवा लक्षणे वाढल्यास तात्काळ वैद्यकीय अधिकाऱ्यांचा सल्ला घ्यावा.
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-dark-base/90 border-t border-deep-navy/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            प्रिस्क्रिप्शन आयडी: <span className="font-mono font-bold text-deep-navy dark:text-clinical-white">{prescId}</span>
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
              <span>प्रिस्क्रिप्शन PDF डाउनलोड करा</span>
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto btn-glass text-xs py-2.5 px-5"
            >
              बंद करा
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
