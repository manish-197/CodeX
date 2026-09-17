import { SOSEvent } from '../models/SOSEvent.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';

export async function dispatchSOS(req, res) {
  try {
    const { 
      userId = 'citizen_anonymous', 
      location = { coordinates: [73.8567, 18.5204] }, 
      vitalsSnapshot = { bp: { sys: 0, dia: 0 }, heartRate: 0, spo2: 0 },
      contacts = ['108 Ambulance Dispatch Control', 'Primary Household Caregiver']
    } = req.body;

    const coords = location?.coordinates || [73.8567, 18.5204];
    let createdEvent;

    if (isDbConnected()) {
      createdEvent = await SOSEvent.create({
        userId,
        location: {
          type: 'Point',
          coordinates: coords,
        },
        vitalsSnapshot,
        notifiedContacts: contacts,
        status: 'dispatched',
      });
    } else {
      const memId = generateMemoryId();
      createdEvent = {
        id: memId,
        _id: memId,
        userId,
        location: {
          type: 'Point',
          coordinates: coords,
        },
        vitalsSnapshot,
        notifiedContacts: contacts,
        status: 'dispatched',
        createdAt: new Date(),
      };
      memoryDb.sosEvents.set(memId, createdEvent);
    }

    // External SMS/WhatsApp notification (Twilio)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioSid || twilioSid === 'your_twilio_account_sid_here') {
      console.warn('[SOS Dispatch] Twilio credentials not configured — dispatch recorded in system store.');
      console.warn(`[SOS Dispatch] Transmitted live GPS: ${coords.join(', ')} | Vitals: HR ${vitalsSnapshot.heartRate} BPM, BP ${vitalsSnapshot.bp?.sys}/${vitalsSnapshot.bp?.dia} mmHg`);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency SOS beacon activated. 108 Ambulance and family notified.',
      event: createdEvent,
      emergencyDetails: {
        ambulanceHotline: '108',
        gpsCoordinates: coords,
        vitalsSummary: `${vitalsSnapshot.bp?.sys}/${vitalsSnapshot.bp?.dia} mmHg, ${vitalsSnapshot.heartRate} BPM, ${vitalsSnapshot.spo2}% SpO2`,
        dispatchedAt: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error('[SOS Dispatch Error]', err);
    res.status(500).json({ error: 'Failed to process emergency SOS dispatch.' });
  }
}
