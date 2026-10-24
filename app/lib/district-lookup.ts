// Address → council district, using two public PortlandMaps services:
// the city's address geocoder, then the council district boundary layer.

const GEOCODER =
  "https://www.portlandmaps.com/arcgis/rest/services/Public/Address_Geocoding_PDX/GeocodeServer/findAddressCandidates";
const DISTRICTS =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_Boundary/MapServer/1413/query";

// Below this the geocoder is guessing.
const MIN_SCORE = 80;

export type DistrictLookup =
  | { status: "found"; address: string; district: number; lon: number; lat: number }
  | { status: "outside"; address: string; lon: number; lat: number }
  | { status: "not-found" };

export async function lookupDistrict(
  query: string,
  signal?: AbortSignal,
): Promise<DistrictLookup> {
  const geo = new URL(GEOCODER);
  geo.search = new URLSearchParams({
    SingleLine: query,
    outSR: "4326",
    maxLocations: "1",
    f: "json",
  }).toString();
  const geoRes = await fetch(geo, { signal });
  if (!geoRes.ok) throw new Error(`Geocoder returned ${geoRes.status}`);
  const { candidates = [] } = await geoRes.json();
  const match = candidates[0];
  if (!match || match.score < MIN_SCORE) return { status: "not-found" };

  const { x: lon, y: lat } = match.location;
  const q = new URL(DISTRICTS);
  q.search = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "DISTRICT",
    returnGeometry: "false",
    f: "json",
  }).toString();
  const dRes = await fetch(q, { signal });
  if (!dRes.ok) throw new Error(`District lookup returned ${dRes.status}`);
  const { features = [] } = await dRes.json();
  const address = prettyAddress(match.address);
  if (!features.length) return { status: "outside", address, lon, lat };

  return {
    status: "found",
    address,
    district: Number(features[0].attributes.DISTRICT),
    lon,
    lat,
  };
}

// "1120 SW 5TH AVE, Portland, OREGON, 97204" → "1120 SW 5th Ave"
function prettyAddress(raw: string) {
  const street = raw.split(",")[0];
  return street.replace(/\b([A-Z])([A-Z]+)\b/g, (word, first, rest) =>
    // Keep directionals like SW and NE in caps.
    /^(N|S|E|W|NE|NW|SE|SW)$/.test(word) ? word : first + rest.toLowerCase(),
  ).replace(/\b(\d+)(ST|ND|RD|TH)\b/g, (_, n, suffix) => n + suffix.toLowerCase());
}
