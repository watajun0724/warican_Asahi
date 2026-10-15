export const STORAGE_KEY = 'hanbutsu-g-drinking-map-v1'
const sampleStores = [
  { registrationNo: 'sample-1', storeName: '銀座ライオン 七丁目店', updatedDate: '2026-10-10', updatedBy: '渡邉', latitude: 35.6698, longitude: 139.7628 },
  { registrationNo: 'sample-2', storeName: 'YEBISU BAR 銀座コリドー街店', updatedDate: '2026-09-20', updatedBy: '佐藤', latitude: 35.6696, longitude: 139.7602 },
  { registrationNo: 'sample-3', storeName: '新宿ライオン', updatedDate: '2026-08-10', updatedBy: '田中', latitude: 35.6904, longitude: 139.7035 },
]
function validCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
}
export function loadStores() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return { stores: sampleStores, error: '' }
    const parsed = JSON.parse(saved)
    const stores = Array.isArray(parsed) ? parsed.map((store) => {
      if (!store || typeof store !== 'object') return store
      const { id, visitedDate, registeredBy, ...record } = store
      return { ...record, registrationNo: record.registrationNo ?? id,
        updatedDate: record.updatedDate ?? visitedDate, updatedBy: record.updatedBy ?? registeredBy }
    }) : parsed
    if (!Array.isArray(stores) || !stores.every((store) => store
      && typeof store.registrationNo === 'string' && store.registrationNo
      && typeof store.storeName === 'string' && store.storeName.trim()
      && typeof store.updatedBy === 'string' && store.updatedBy.trim()
      && typeof store.updatedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(store.updatedDate)
      && validCoordinates(store.latitude, store.longitude))
      || new Set(stores.map((store) => store.registrationNo)).size !== stores.length) throw new Error('Invalid stored data')
    return { stores, error: '' }
  } catch {
    return { stores: [], error: '保存データを読み込めませんでした。ブラウザのストレージ設定を確認してください。' }
  }
}
export function saveStores(stores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stores))
}
let lastSearchAt = 0
export async function searchStores(storeName, signal) {
  if (Date.now() - lastSearchAt < 1100) throw new Error('Please wait before searching again')
  lastSearchAt = Date.now()
  const query = new URLSearchParams({ q: storeName, format: 'jsonv2', countrycodes: 'jp', limit: '5', 'accept-language': 'ja' })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
  })
  if (!response.ok) throw new Error('Location search failed')
  const results = await response.json()
  if (!Array.isArray(results)) throw new Error('Invalid location response')
  return results.map((place) => ({ id: String(place.place_id), label: place.display_name,
    latitude: Number(place.lat), longitude: Number(place.lon) }))
    .filter((place) => typeof place.label === 'string' && validCoordinates(place.latitude, place.longitude))
}