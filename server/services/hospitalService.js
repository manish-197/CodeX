import { Hospital } from '../models/Hospital.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from './inMemoryStore.js';

// Real curated primary health centres and rural hospitals in India
export const initialRuralHospitals = [
  {
    id: 'hosp_1',
    name: 'Primary Health Centre (PHC) Paud',
    type: 'Primary Health Centre (PHC)',
    location: { type: 'Point', coordinates: [73.6132, 18.5276] },
    address: 'Mulshi Taluka, Paud Road, Pune District',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '020-22922301',
    specialties: ['General Medicine', 'Maternity Care', 'Emergency First Response'],
    emergencyAvailable: true,
  },
  {
    id: 'hosp_2',
    name: 'Rural Sub-District Hospital Shirur',
    type: 'Sub-District Hospital',
    location: { type: 'Point', coordinates: [74.3789, 18.8274] },
    address: 'Near Bus Stand, Shirur, Pune District',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '02138-222108',
    specialties: ['General Surgery', 'Pediatrics', 'Trauma Care', 'Cardiology Stabilisation'],
    emergencyAvailable: true,
  },
  {
    id: 'hosp_3',
    name: 'Community Health Centre (CHC) Junnar',
    type: 'Community Health Centre (CHC)',
    location: { type: 'Point', coordinates: [73.8762, 19.2081] },
    address: 'Kalyan Highway, Junnar',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '02132-222045',
    specialties: ['Orthopedics', 'OB-GYN', 'Intensive Monitoring'],
    emergencyAvailable: true,
  },
  {
    id: 'hosp_4',
    name: 'District Civil Hospital Aundh',
    type: 'District Hospital',
    location: { type: 'Point', coordinates: [73.8052, 18.5636] },
    address: 'Chest Hospital Compound, Aundh, Pune',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '020-25880872',
    specialties: ['Emergency Critical Care', 'Cardiology', 'Pulmonology', 'ICU'],
    emergencyAvailable: true,
  },
  {
    id: 'hosp_5',
    name: 'Sub-District Hospital Baramati',
    type: 'Sub-District Hospital',
    location: { type: 'Point', coordinates: [74.5815, 18.1517] },
    address: 'MIDC Area, Baramati',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '02112-243108',
    specialties: ['Multi-Specialty Emergency', 'Dialysis', 'Blood Bank'],
    emergencyAvailable: true,
  }
];

// Initialize in-memory hospitals store
initialRuralHospitals.forEach(hosp => {
  memoryDb.hospitals.set(hosp.id, hosp);
});

// Seed MongoDB if connected and empty
export async function seedHospitalsIfEmpty() {
  if (!isDbConnected()) return;
  try {
    const count = await Hospital.countDocuments();
    if (count === 0) {
      await Hospital.insertMany(initialRuralHospitals.map(h => ({
        name: h.name,
        type: h.type,
        location: h.location,
        address: h.address,
        district: h.district,
        state: h.state,
        phone: h.phone,
        specialties: h.specialties,
        emergencyAvailable: h.emergencyAvailable,
      })));
      console.log('[Hospitals] Seeded rural hospital database');
    }
  } catch (err) {
    console.warn('[Hospital Seed Error]', err.message);
  }
}

// Haversine formula for exact distance in kilometres
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
