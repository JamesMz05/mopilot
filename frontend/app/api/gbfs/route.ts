// app/api/gbfs/route.ts
// Server-seitiger Proxy für ZEO GBFS-Daten
// Ruft alle 3 Feeds ab und liefert sie zusammengeführt an den Client

import { NextResponse } from 'next/server';

const BASE_URL = 'https://mds.evemo.io/1a606e0d-fbd7-470f-bf0c-79b946c7c16a/gbfs/2.3';

// Cache: 60 Sekunden serverseitig (GBFS TTL ist 300s)
export const revalidate = 60;

interface VehicleTypeRaw {
  vehicle_type_id: string;
  name: string;
  make: string;
  model: string;
  max_range_meters: number;
  rider_capacity: number;
  vehicle_image?: string;
  propulsion_type: string;
  form_factor: string;
}

interface StationInfoRaw {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  post_code: string;
}

interface StationStatusRaw {
  station_id: string;
  num_bikes_available: number;
  is_installed: boolean;
  is_renting: boolean;
  is_returning: boolean;
  last_reported: number;
  vehicle_types_available: Array<{
    vehicle_type_id: string;
    count: number;
  }>;
}

export async function GET() {
  try {
    const [vtRes, siRes, ssRes] = await Promise.all([
      fetch(`${BASE_URL}/vehicle_types.json`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/station_information.json`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/station_status.json`, { next: { revalidate: 60 } }),
    ]);

    if (!vtRes.ok || !siRes.ok || !ssRes.ok) {
      return NextResponse.json(
        { error: 'GBFS-Endpunkt nicht erreichbar' },
        { status: 502 }
      );
    }

    const vtData = await vtRes.json();
    const siData = await siRes.json();
    const ssData = await ssRes.json();

    // Fahrzeugtypen aufbereiten
    const fahrzeugTypen: Record<string, {
      id: string;
      name: string;
      hersteller: string;
      modell: string;
      reichweiteKm: number;
      sitzplaetze: number;
      bild: string | null;
      antrieb: string;
    }> = {};

    vtData.data.vehicle_types.forEach((vt: VehicleTypeRaw) => {
      fahrzeugTypen[vt.vehicle_type_id] = {
        id: vt.vehicle_type_id,
        name: vt.name,
        hersteller: vt.make,
        modell: vt.model,
        reichweiteKm: Math.round(vt.max_range_meters / 1000),
        sitzplaetze: vt.rider_capacity,
        bild: vt.vehicle_image || null,
        antrieb: vt.propulsion_type,
      };
    });

    // Status-Map erstellen
    const statusMap: Record<string, StationStatusRaw> = {};
    ssData.data.stations.forEach((s: StationStatusRaw) => {
      statusMap[s.station_id] = s;
    });

    // Stationen zusammenführen
    const stationen = siData.data.stations.map((si: StationInfoRaw) => {
      const status = statusMap[si.station_id];
      const verfuegbar = status?.num_bikes_available || 0;
      const fahrzeugeAnStation = (status?.vehicle_types_available || []).map(
        (vt: { vehicle_type_id: string; count: number }) => ({
          typId: vt.vehicle_type_id,
          anzahl: vt.count,
          typ: fahrzeugTypen[vt.vehicle_type_id] || null,
        })
      );

      return {
        id: si.station_id,
        name: si.name,
        lat: si.lat,
        lon: si.lon,
        adresse: si.address,
        plz: si.post_code,
        verfuegbar,
        istAktiv: status?.is_installed ?? false,
        vermietet: status?.is_renting ?? false,
        fahrzeuge: fahrzeugeAnStation,
      };
    });

    // Zusammenfassung
    const zusammenfassung = {
      stationenGesamt: stationen.length,
      fahrzeugeVerfuegbar: stationen.reduce(
        (sum: number, s: { verfuegbar: number }) => sum + s.verfuegbar,
        0
      ),
      stationenLeer: stationen.filter(
        (s: { verfuegbar: number }) => s.verfuegbar === 0
      ).length,
      stationenMitFahrzeug: stationen.filter(
        (s: { verfuegbar: number }) => s.verfuegbar > 0
      ).length,
      fahrzeugTypenAnzahl: Object.keys(fahrzeugTypen).length,
    };

    return NextResponse.json({
      aktualisiert: new Date(ssData.last_updated * 1000).toISOString(),
      ttl: ssData.ttl,
      zusammenfassung,
      fahrzeugTypen: Object.values(fahrzeugTypen),
      stationen,
    });
  } catch (error) {
    console.error('GBFS-Abruf fehlgeschlagen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der GBFS-Daten' },
      { status: 500 }
    );
  }
}
