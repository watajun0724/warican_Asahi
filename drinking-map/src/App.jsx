import { useEffect, useRef, useState } from 'react'
import { Beer, Check, MapPin, Plus, Search, Trash2, X } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { loadStores, saveStores, searchStores } from './stores.js'
import './App.css'

const tokyo = [35.6762, 139.765]

function StoreLink({ storeName }) {
  const url = new URL('https://www.google.com/search')
  url.searchParams.set('q', storeName)
  return <a className="store-name" href={url.href} target="_blank" rel="noopener noreferrer" title={`${storeName}をGoogleで検索（新しいタブ）`}>{storeName}</a>
}

function MapView({ stores }) {
  const map = useMap()
  useEffect(() => {
    if (stores.length) {
      map.fitBounds(stores.map((store) => [store.latitude, store.longitude]), { padding: [48, 48], maxZoom: 15 })
    } else {
      map.setView(tokyo, 13)
    }
  }, [map, stores])
  return stores.map((store, index) => (
    <Marker key={store.registrationNo} position={[store.latitude, store.longitude]} title={store.storeName}
      icon={divIcon({ className: 'store-marker', html: `<span>${index + 1}</span>`, iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -36] })}>
      <Popup><strong><StoreLink storeName={store.storeName} /></strong><br />{store.updatedDate.replaceAll('-', '/')} · {store.updatedBy}</Popup>
    </Marker>
  ))
}

function Modal({ title, onClose, children }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  return (
    <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={(event) => {
      event.preventDefault()
      onClose()
    }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" type="button" title="閉じる" aria-label="閉じる" onClick={onClose}><X size={20} /></button>
      </div>
      {children}
    </dialog>
  )
}

function AddStore({ onClose, onSave, saveError, initialStoreName, repeatStore }) {
  const [storeName, setStoreName] = useState(initialStoreName)
  const [updatedDate, setUpdatedDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [updatedBy, setUpdatedBy] = useState('')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(repeatStore ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(null)
  const showRegister = Boolean(selected) || candidates.length > 0
  useEffect(() => () => request.current?.abort(), [])
  async function submit(event) {
    event.preventDefault()
    if (!storeName.trim() || !updatedBy.trim() || !updatedDate) {
      setError('すべての項目を入力してください。')
      return
    }
    if (selected) {
      onSave({ registrationNo: crypto.randomUUID(), storeName: storeName.trim(), updatedDate,
        updatedBy: updatedBy.trim(), latitude: selected.latitude, longitude: selected.longitude })
      return
    }
    setBusy(true)
    setError('')
    const controller = new AbortController()
    request.current = controller
    try {
      const results = await searchStores(storeName.trim(), controller.signal)
      setCandidates(results)
      if (!results.length) setError('店舗が見つかりませんでした。地域名を含めた店舗名で再度お試しください。')
    } catch (failure) {
      if (failure.name !== 'AbortError') setError('位置情報を取得できませんでした。通信環境を確認し、しばらくしてから再度お試しください。')
    } finally {
      if (!controller.signal.aborted) setBusy(false)
    }
  }
  return (
    <Modal title={repeatStore ? '訪問を登録' : '店舗を追加'} onClose={onClose}>
      <form onSubmit={submit}>
        <label htmlFor="store-name">店舗名 <span className="required">必須</span></label>
        <input id="store-name" required maxLength={120} autoFocus={!repeatStore} readOnly={Boolean(repeatStore)} value={storeName} placeholder="例：銀座ライオン 七丁目店" disabled={busy} onChange={(event) => {
          setStoreName(event.target.value)
          setCandidates([])
          setSelected(null)
          setError('')
        }} />
        <label htmlFor="updated-date">最終更新日 <span className="required">必須</span></label>
        <input id="updated-date" type="date" required autoFocus={Boolean(repeatStore)} value={updatedDate} onChange={(event) => setUpdatedDate(event.target.value)} />
        <label htmlFor="updated-by">更新者 <span className="required">必須</span></label>
        <input id="updated-by" required maxLength={60} value={updatedBy} placeholder="名前" onChange={(event) => setUpdatedBy(event.target.value)} />
        {candidates.length > 0 && <fieldset className="candidates">
          <legend>店舗の所在地</legend>
          {candidates.map((candidate) => <label className="candidate" key={candidate.id}>
            <input type="radio" name="location" checked={selected?.id === candidate.id} onChange={() => setSelected(candidate)} />
            <span>{candidate.label}</span>
          </label>)}
        </fieldset>}
        {(error || saveError) && <p className="error" role="alert">{error || saveError}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>キャンセル</button>
          <button className="primary-button" type="submit" disabled={busy || (candidates.length > 0 && !selected)}>
            {showRegister ? <Check size={17} /> : <Search size={17} />}{busy ? '検索中…' : showRegister ? '登録' : '検索'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function App() {
  const [initial] = useState(loadStores)
  const [stores, setStores] = useState(initial.stores)
  const [adding, setAdding] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const sortedStores = [...stores].sort((first, second) => second.updatedDate.localeCompare(first.updatedDate))
  const visitCounts = new Map()
  for (const store of stores) {
    visitCounts.set(store.storeName, (visitCounts.get(store.storeName) ?? 0) + 1)
  }
  function updateStores(nextStores, message) {
    try {
      saveStores(nextStores)
      setStores(nextStores)
      setSaveError('')
      setNotice(message)
      return true
    } catch {
      setSaveError('保存できませんでした。ブラウザのストレージ設定や空き容量を確認してください。')
      return false
    }
  }
  return (
    <>
      <header className="app-header"><div className="header-inner">
        <div className="brand"><span className="brand-icon"><Beer size={23} /></span><h1>販物G <span>飲み会MAP</span></h1></div>
      </div></header>
      <main>
        {initial.error && <p className="error" role="alert">{initial.error}</p>}
        <section className="map-section" aria-label="登録店舗の地図">
          <div className="section-heading"><h2><MapPin size={18} />飲み会マップ</h2><span className="count">{stores.length} 件</span></div>
          <div className="map-frame"><MapContainer center={tokyo} zoom={13} scrollWheelZoom={false} className="store-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <MapView stores={sortedStores} />
          </MapContainer></div>
        </section>
        <section className="list-section" aria-labelledby="list-title">
          <div className="section-heading"><h2 id="list-title">過去に行ったお店</h2><span className="list-order">最終更新日が新しい順</span></div>
          <div className="table-scroll"><table>
            <thead><tr><th scope="col">店舗</th><th scope="col">訪問数</th><th scope="col">最終更新日</th><th scope="col">更新者</th><th scope="col"><span className="sr-only">追加・削除</span></th></tr></thead>
            <tbody>{sortedStores.map((store, index) => <tr key={store.registrationNo}>
              <td><div className="store-cell"><span className="store-number">{String(index + 1).padStart(2, '0')}</span><StoreLink storeName={store.storeName} /></div></td>
              <td className="visit-count-cell">{visitCounts.get(store.storeName)} 回</td>
              <td className="date-cell">{store.updatedDate.replaceAll('-', '/')}</td><td>{store.updatedBy}</td>
              <td><div className="row-actions">
                <button className="repeat-button" title={`${store.storeName}をもう一度登録`} aria-label={`${store.storeName}をもう一度登録`} onClick={() => { setSaveError(''); setAdding({ storeName: store.storeName, repeatStore: store }) }}><Plus size={15} /><span>1</span></button>
                <button className="icon-button delete-button" title={`${store.storeName}を削除`} aria-label={`${store.storeName}を削除`} onClick={() => { setSaveError(''); setDeleting(store) }}><Trash2 size={18} /></button>
              </div></td>
            </tr>)}
            {stores.length === 0 && <tr><td colSpan={5}><div className="empty-state"><MapPin size={28} /><p>登録された店舗はありません</p></div></td></tr>}
            <tr className="add-row"><td colSpan={5}><button className="primary-button" onClick={() => { setSaveError(''); setAdding({ storeName: '' }) }}><Plus size={18} />店舗を追加</button></td></tr>
            </tbody>
          </table></div>
          <p className="notice" role="status">{notice}</p>
        </section>
      </main>
      <footer><span>販物G 飲み会MAP</span><span>全 {stores.length} 件</span></footer>
      {adding && <AddStore initialStoreName={adding.storeName} repeatStore={adding.repeatStore} onClose={() => setAdding(null)} saveError={saveError} onSave={(store) => {
        if (updateStores([...stores, store], `「${store.storeName}」を登録しました。`)) setAdding(null)
      }} />}
      {deleting && <Modal title="店舗を削除" onClose={() => setDeleting(null)}>
        <p className="delete-question">「{deleting.storeName}」を削除しますか？</p>
        {saveError && <p role="alert" className="error">{saveError}</p>}
        <div className="dialog-actions">
          <button className="secondary-button" onClick={() => setDeleting(null)}>キャンセル</button>
          <button className="danger-button" onClick={() => {
            if (updateStores(stores.filter((store) => store.registrationNo !== deleting.registrationNo), `「${deleting.storeName}」を削除しました。`)) setDeleting(null)
          }}><Trash2 size={17} />削除</button>
        </div>
      </Modal>}
    </>
  )
}