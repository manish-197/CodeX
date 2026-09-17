import { Hospital } from '../models/Hospital.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../services/inMemoryStore.js';
import { calculateDistanceKm, initialRuralHospitals } from '../services/hospitalService.js';

export async function getNearestHospitals(req, res) {
  try {
    const lat = parseFloat(req.query.lat) || 18.5204;
    const lng = parseFloat(req.query.lng) || 73.8567;
    const limit = parseInt(req.query.limit, 10) || 5;

    let hospitalResults = [];

    if (isDbConnected()) {
      try {
        const results = await Hospital.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distanceMeters',
              spherical: true,
            },
          },
          { $limit: limit },
        ]);

        hospitalResults = results.map(h => ({
          id: h._id,
          name: h.name,
          type: h.type,
          location: h.location,
          address: h.address,
          phone: h.phone,
          specialties: h.specialties,
          emergencyAvailable: h.emergencyAvailable,
          distanceKm: Number((h.distanceMeters / 1000).toFixed(1)),
        }));
      } catch (geoErr) {
        console.warn('[GeoNear fallback to Haversine]', geoErr.message);
      }
    }

    // If MongoDB query returned no results or running on fallback store
    if (hospitalResults.length === 0) {
      const sourceList = Array.from(memoryDb.hospitals.values());
      const listToUse = sourceList.length > 0 ? sourceList : initialRuralHospitals;

      hospitalResults = listToUse.map(h => {
        const [hLng, hLat] = h.location.coordinates;
        const dist = calculateDistanceKm(lat, lng, hLat, hLng);
        return {
          id: h.id || h._id,
          name: h.name,
          type: h.type,
          location: h.location,
          address: h.address,
          phone: h.phone,
          specialties: h.specialties,
          emergencyAvailable: h.emergencyAvailable,
          distanceKm: dist,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
    }

    res.json({
      origin: { lat, lng },
      count: hospitalResults.length,
      hospitals: hospitalResults,
    });
  } catch (err) {
    console.error('[GetNearestHospitals Error]', err);
    res.status(500).json({ error: 'Failed to retrieve nearest hospitals.' });
  }
}
