import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  Compass, 
  ExternalLink, 
  Activity, 
  AlertCircle,
  Building2,
  ChevronRight,
  RefreshCw,
  LocateFixed
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function HospitalNavigation({ targetHospital, activePatient, onNavigateBackToTriage }) {
  const { lang, t } = useLanguage();

  const currentPatient = activePatient || (() => {
    try {
      const fromSession = sessionStorage.getItem('activeKioskPatient');
      if (fromSession) return JSON.parse(fromSession);
      const fromLocal = localStorage.getItem('arogya_active_member');
      if (fromLocal) {
        const parsed = JSON.parse(fromLocal);
        if (parsed.relation === 'Walk-in Patient' || parsed.registeredVia === 'kiosk') return parsed;
      }
    } catch (e) {}
    return null;
  })();

  // User coordinates: default fallback (Pune rural) while real GPS acquires
  const [userLocation, setUserLocation] = useState({ lat: 18.5204, lng: 73.8567 });
  const [locationSource, setLocationSource] = useState('Acquiring GPS...');
  const [hospitals, setHospitals] = useState(targetHospital ? [targetHospital] : []);
  const [selectedHospital, setSelectedHospital] = useState(targetHospital || null);
  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineGlowRef = useRef(null);
  const polylineCoreRef = useRef(null);
  const userMarkerRef = useRef(null);
  const hospMarkerRef = useRef(null);

  // Sync targetHospital if prop updates
  useEffect(() => {
    if (targetHospital) {
      setSelectedHospital(targetHospital);
      setHospitals((prev) => {
        const exists = prev.some((h) => (h.id && h.id === targetHospital.id) || h.name === targetHospital.name);
        return exists ? prev : [targetHospital, ...prev];
      });
    }
  }, [targetHospital]);

  // 1. Acquire Live Device GPS
  const acquireGPS = () => {
    setLocationSource('Locating via GPS...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setLocationSource('Live Device GPS');
          fetchNearestHospitals(coords.lat, coords.lng);
        },
        (err) => {
          console.warn('[GPS Error]', err.message);
          setLocationSource('Simulated Rural GPS Coordinates');
          fetchNearestHospitals(userLocation.lat, userLocation.lng);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationSource('Simulated Rural GPS Coordinates');
      fetchNearestHospitals(userLocation.lat, userLocation.lng);
    }
  };

  // 2. Fetch Nearest Hospitals from backend API
  const fetchNearestHospitals = async (lat, lng) => {
    setLoadingHospitals(true);
    try {
      const res = await fetch(`http://localhost:5000/api/hospitals/nearest?lat=${lat}&lng=${lng}&limit=4`);
      if (!res.ok) throw new Error('Failed to fetch hospitals');
      const data = await res.json();
      const fetched = data.hospitals || [];
      if (targetHospital) {
        const merged = [targetHospital, ...fetched.filter(h => h.name !== targetHospital.name)];
        setHospitals(merged);
        setSelectedHospital(targetHospital);
      } else {
        setHospitals(fetched);
        if (fetched.length > 0 && !selectedHospital) {
          setSelectedHospital(fetched[0]);
        }
      }
    } catch (err) {
      console.warn('[Hospitals fetch error, using local dataset]', err.message);
      const fallbackList = [
        {
          id: 'phc_paud',
          name: 'Primary Health Centre (PHC) Paud',
          type: 'Primary Health Centre (PHC)',
          location: { type: 'Point', coordinates: [73.6132, 18.5276] },
          address: 'Mulshi Taluka, Paud Road',
          phone: '020-22922301',
          distanceKm: 2.1,
          specialties: ['General Medicine', 'Maternity', 'Emergency First Aid']
        },
        {
          id: 'sdh_manchar',
          name: 'Sub-District Hospital Manchar',
          type: 'Sub-District Hospital (SDH)',
          location: { type: 'Point', coordinates: [73.9400, 18.9900] },
          address: 'Pune-Nashik Highway, Manchar',
          phone: '02133-223344',
          distanceKm: 14.5,
          specialties: ['Emergency Care', 'Surgery', 'Pediatrics']
        },
        {
          id: 'dh_aundh',
          name: 'District Civil Hospital Aundh',
          type: 'District Hospital (DH)',
          location: { type: 'Point', coordinates: [73.8052, 18.5584] },
          address: 'Aundh Camp, Pune 411027',
          phone: '020-27158900',
          distanceKm: 22.0,
          specialties: ['Trauma Center', 'ICU', 'Cardiology', 'Dialysis']
        }
      ];
      if (targetHospital) {
        setHospitals([targetHospital, ...fallbackList]);
        setSelectedHospital(targetHospital);
      } else {
        setHospitals(fallbackList);
        if (!selectedHospital) setSelectedHospital(fallbackList[0]);
      }
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    acquireGPS();
  }, []);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Fetch Real OSRM Road-to-Road Route when selected hospital or userLocation changes
  useEffect(() => {
    if (!selectedHospital || !mapInstanceRef.current) return;

    const [hospLng, hospLat] = selectedHospital.location.coordinates;
    const userLat = userLocation.lat;
    const userLng = userLocation.lng;

    const fetchOSRMRoute = async () => {
      setLoadingRoute(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${hospLng},${hospLat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          setRouteData({
            distanceKm: (route.distance / 1000).toFixed(1),
            durationMin: Math.round(route.duration / 60),
            steps: route.legs[0]?.steps || [],
          });

          const map = mapInstanceRef.current;

          // Remove old polylines if present
          if (polylineGlowRef.current) map.removeLayer(polylineGlowRef.current);
          if (polylineCoreRef.current) map.removeLayer(polylineCoreRef.current);

          // Render Google-Maps-style glowing polyline (#2563eb core + #60a5fa glow)
          // 1. Glow layer
          polylineGlowRef.current = L.polyline(coords, {
            color: '#60a5fa',
            weight: 9,
            opacity: 0.45,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // 2. Core crisp route layer
          polylineCoreRef.current = L.polyline(coords, {
            color: '#0F5E5E',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          // User live position marker
          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
          const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: `<div style="background-color:#0F5E5E; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(15,94,94,0.6);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
            .bindPopup(`<strong>Your Location</strong><br/>${locationSource}`)
            .addTo(map);

          // Hospital marker
          if (hospMarkerRef.current) map.removeLayer(hospMarkerRef.current);
          const hospIcon = L.divIcon({
            className: 'custom-hosp-marker',
            html: `<div style="background-color:#0F5E5E; color:white; width:28px; height:28px; border-radius:10px; display:flex; align-items:center; justify-content:center; border:2px solid white; font-weight:bold; font-size:12px; box-shadow:0 4px 12px rgba(15,94,94,0.4);">H</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          hospMarkerRef.current = L.marker([hospLat, hospLng], { icon: hospIcon })
            .bindPopup(`<strong>${selectedHospital.name}</strong><br/>${selectedHospital.address || ''}`)
            .addTo(map);

          // Fit bounds to show both user and destination
          map.fitBounds(L.latLngBounds([ [userLat, userLng], [hospLat, hospLng] ]), {
            padding: [50, 50],
          });
        }
      } catch (e) {
        console.warn('[OSRM Route calculation error]', e.message);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchOSRMRoute();
  }, [selectedHospital, userLocation]);

  const [hospLng, hospLat] = selectedHospital?.location?.coordinates || [73.6132, 18.5276];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospLat},${hospLng}&travelmode=driving`;

  return (
    <div className="space-y-6 py-4">

      {/* Active Kiosk Patient Emergency Route Context Banner */}
      {currentPatient && (
        <div className="glass-card p-4 rounded-2xl border border-alert-red/30 bg-alert-red/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-alert-red text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-alert-red">
                  {lang === 'mr' ? 'सक्रिय रुग्ण आपत्कालीन नेव्हिगेशन' : 'Active Patient Emergency Route'}
                </span>
                <span className="font-mono text-[11px] font-bold text-medical-blue bg-medical-blue/10 px-2 py-0.5 rounded-md">
                  {currentPatient.arogyaId || currentPatient.abhaId || 'AR-2026-PAT'}
                </span>
              </div>
              <div className="font-bold text-sm text-deep-navy dark:text-clinical-white">
                {currentPatient.name} ({currentPatient.age} yrs • {currentPatient.gender} • Blood: {currentPatient.bloodGroup || 'Unknown'})
              </div>
              <div className="text-[11px] text-slate-500">
                {currentPatient.village ? `गाव: ${currentPatient.village}` : ''} {currentPatient.phone ? `• Ph: ${currentPatient.phone}` : ''}
              </div>
            </div>
          </div>

          {onNavigateBackToTriage && (
            <button
              onClick={onNavigateBackToTriage}
              className="btn-navy text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-md"
            >
              <span>←</span>
              <span>{lang === 'mr' ? 'लक्षण तपासणीकडे परत' : 'Back to Symptoms Triage'}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-medical-blue">
            Street-Level Emergency Routing
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-deep-navy dark:text-clinical-white">
            Real Road-to-Road Navigation
          </h2>
          <p className="text-xs sm:text-sm text-deep-navy/70 dark:text-dark-muted mt-0.5">
            Calculated over actual drivable rural roads via OSRM, never deceptive straight lines.
          </p>
        </div>

        {/* GPS status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={acquireGPS}
            className="glass-card px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2 text-deep-navy dark:text-clinical-white hover:border-medical-blue transition-colors"
          >
            <LocateFixed className="w-3.5 h-3.5 text-medical-blue" />
            <span>{locationSource}</span>
            <RefreshCw className="w-3 h-3 opacity-60 ml-1" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Leaflet Map with glowing polyline */}
        <div className="lg:col-span-8 glass-card overflow-hidden relative p-2 shadow-xl flex flex-col h-[520px]">
          
          <div ref={mapContainerRef} className="w-full h-full rounded-2xl z-0" />

          {/* Floating Route Overview Pill */}
          {routeData && (
            <div className="absolute top-5 left-5 z-10 glass-card px-4 py-2.5 shadow-xl bg-white/95 dark:bg-dark-card/95 border border-deep-navy/15 flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-medical-blue">
                <Compass className="w-4 h-4" />
                <span className="text-sm">{routeData.distanceKm} km</span>
              </div>
              <div className="w-px h-4 bg-deep-navy/20" />
              <div className="flex items-center gap-1.5 text-deep-navy dark:text-clinical-white">
                <Clock className="w-4 h-4" />
                <span className="text-sm">~{routeData.durationMin} mins driving</span>
              </div>
            </div>
          )}

          {/* Bottom Controls Bar on Map */}
          <div className="absolute bottom-5 left-5 right-5 z-10 glass-card p-3 shadow-2xl bg-white/95 dark:bg-dark-card/95 border border-deep-navy/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" />
              <span className="font-semibold text-deep-navy dark:text-clinical-white">
                Glowing Blue Polyline: Actual Drivable Road Route
              </span>
            </div>

            {/* Google Maps Live Voice Navigation launcher */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-medical-blue text-xs py-2 px-4 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span>Open Google Maps Voice Nav</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Right Column: Nearest Hospitals List & Turn-by-Turn Maneuvers */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="glass-card p-5 space-y-3">
            <h4 className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white uppercase tracking-wide">
              Nearest Rural Health Centers
            </h4>

            {loadingHospitals ? (
              <div className="py-6 text-center text-xs text-deep-navy/60">
                Scanning 2dsphere geo-index...
              </div>
            ) : (
              <div 
                className="space-y-2.5 max-h-56 overflow-y-auto pr-1"
                data-lenis-prevent="true"
              >
                {hospitals.map((hosp) => {
                  const isSelected = hosp.id === selectedHospital?.id;
                  return (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospital(hosp)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-deep-navy text-white border-deep-navy shadow-md dark:bg-clinical-white dark:text-deep-navy'
                          : 'bg-white/60 dark:bg-dark-base/60 border-deep-navy/10 hover:border-medical-blue text-deep-navy dark:text-clinical-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-xs leading-snug">{hosp.name}</div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-medical-blue text-white' : 'bg-deep-navy/10 dark:bg-white/10 text-deep-navy dark:text-clinical-white'
                        }`}>
                          {hosp.distanceKm} km
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isSelected ? 'opacity-85' : 'text-deep-navy/70 dark:text-dark-muted'}`}>
                        {hosp.address}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="font-semibold">{hosp.type}</span>
                        <a 
                          href={`tel:${hosp.phone}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 font-bold text-medical-blue hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {hosp.phone}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Turn-by-Turn Navigation Steps Card */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="font-display font-bold text-sm text-deep-navy dark:text-clinical-white uppercase tracking-wide flex items-center justify-between">
              <span>Turn-by-Turn Route</span>
              <span className="text-[10px] text-medical-blue font-mono">OSRM Engine</span>
            </h4>

            <div 
              className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs"
              data-lenis-prevent="true"
            >
              {routeData?.steps && routeData.steps.length > 0 ? (
                routeData.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-deep-navy/5 dark:border-white/5 last:border-none">
                    <span className="w-5 h-5 rounded-full bg-deep-navy/10 dark:bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 text-deep-navy dark:text-clinical-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-medium text-deep-navy dark:text-clinical-white">
                        {step.maneuver.type} {step.name ? `onto ${step.name}` : ''}
                      </div>
                      <div className="text-[10px] text-deep-navy/60 dark:text-dark-muted">
                        {(step.distance / 1000).toFixed(2)} km
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-deep-navy/60">
                  Select a hospital to calculate turn-by-turn maneuvers.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
