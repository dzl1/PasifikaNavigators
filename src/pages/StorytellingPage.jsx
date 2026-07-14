import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'
import './StorytellingPage.css'

const DEFAULT_CENTER = [-35.114, 173.263]
const POINT_COLORS = ['#238ca3', '#c94f3d', '#8f11a8', '#e0a327', '#1963a3']

function makeSlug(title) {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'story'
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

function newPoint(index, lat = DEFAULT_CENTER[0], lng = DEFAULT_CENTER[1]) {
  return {
    id: crypto.randomUUID(),
    title: `Story point ${index + 1}`,
    story: '',
    popup: '',
    imageUrl: '',
    lat,
    lng,
    color: POINT_COLORS[index % POINT_COLORS.length],
  }
}

function parsePoints(value) {
  return Array.isArray(value) ? value.map((point, index) => ({
    ...newPoint(index),
    ...point,
    lat: Number(point.lat) || DEFAULT_CENTER[0],
    lng: Number(point.lng) || DEFAULT_CENTER[1],
  })) : []
}

function StoryMap({ points, selectedId, onSelect, onPlace, placing }) {
  const elementRef = useRef(null)
  const mapRef = useRef(null)
  const markerLayerRef = useRef(null)
  const onPlaceRef = useRef(onPlace)
  onPlaceRef.current = onPlace

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return undefined

    const map = L.map(elementRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, 8)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    markerLayerRef.current = L.layerGroup().addTo(map)
    map.on('click', (event) => onPlaceRef.current?.(event.latlng.lat, event.latlng.lng))
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markerLayerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    points.forEach((point, index) => {
      const active = point.id === selectedId
      const icon = L.divIcon({
        className: 'story-map-pin-wrap',
        html: `<span class="story-map-pin${active ? ' story-map-pin--active' : ''}" style="--pin-color:${point.color}">${index + 1}</span>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      })
      L.marker([point.lat, point.lng], { icon })
        .on('click', () => onSelect?.(point.id))
        .addTo(layer)
    })

    if (points.length && !selectedId) {
      const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]))
      map.fitBounds(bounds.pad(0.35), { maxZoom: 13 })
    }
  }, [points, selectedId, onSelect])

  useEffect(() => {
    const point = points.find((item) => item.id === selectedId)
    if (point && mapRef.current) mapRef.current.flyTo([point.lat, point.lng], Math.max(mapRef.current.getZoom(), 12))
  }, [selectedId])

  return (
    <div className={`story-map${placing ? ' story-map--placing' : ''}`} ref={elementRef} aria-label="Story map" />
  )
}

function StoryLibrary({ session }) {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(Boolean(session))
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session || !isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let active = true
    supabase.from('stories').select('*').eq('owner_id', session.user.id).order('updated_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        setStories(data ?? [])
        setError(queryError?.message ?? '')
        setLoading(false)
      })
    return () => { active = false }
  }, [session])

  const createStory = async () => {
    if (!session || creating) return
    setCreating(true)
    setError('')
    const title = 'My new story'
    const { data, error: insertError } = await supabase.from('stories').insert({
      owner_id: session.user.id,
      title,
      slug: makeSlug(title),
      points: [],
    }).select('id').single()
    setCreating(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    navigate(`/storytelling/${data.id}`)
  }

  return (
    <div className="site-shell storytelling-page">
      <SiteHeader />
      <main>
        <section className="storytelling-hero">
          <div>
            <p className="section-kicker">Digital Storytelling</p>
            <h1>Stories rooted in place.</h1>
            <p>Create a journey across the map, connecting places with memories, images, knowledge, and the voices of our communities.</p>
            {session ? (
              <button className="button button--primary" type="button" onClick={createStory} disabled={creating || !isSupabaseConfigured}>
                {creating ? 'Creating…' : 'Create a story'}
              </button>
            ) : (
              <Link className="button button--primary" to="/login" state={{ from: { pathname: '/storytelling' } }}>Log in to create</Link>
            )}
          </div>
          <div className="storytelling-hero__preview" aria-hidden="true">
            <span className="storytelling-preview__route" />
            <i style={{ '--x': '19%', '--y': '66%' }}>1</i>
            <i style={{ '--x': '49%', '--y': '35%' }}>2</i>
            <i style={{ '--x': '78%', '--y': '60%' }}>3</i>
          </div>
        </section>

        <section className="story-library" aria-labelledby="story-library-title">
          <div className="story-library__heading">
            <div>
              <p className="section-kicker">Your collection</p>
              <h2 id="story-library-title">Your stories</h2>
            </div>
            {session && <button className="button button--dark" type="button" onClick={createStory} disabled={creating}>New story</button>}
          </div>
          {!session ? (
            <div className="story-library__empty"><h3>Ready when you are.</h3><p>Log in or create an account to begin building your first place-based story.</p></div>
          ) : loading ? (
            <p className="story-library__status">Loading your stories…</p>
          ) : error ? (
            <p className="story-message story-message--error" role="alert">{error}</p>
          ) : stories.length ? (
            <div className="story-library__grid">
              {stories.map((story) => (
                <Link className="story-library-card" to={`/storytelling/${story.id}`} key={story.id}>
                  <span>{story.is_published ? 'Published' : 'Draft'}</span>
                  <h3>{story.title}</h3>
                  <p>{story.description || 'Add a description to introduce your story.'}</p>
                  <small>{parsePoints(story.points).length} story points · Updated {new Date(story.updated_at).toLocaleDateString('en-NZ')}</small>
                </Link>
              ))}
            </div>
          ) : (
            <div className="story-library__empty"><h3>No stories yet.</h3><p>Create one, then add places and shape them into a journey.</p></div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function StoryExperience({ session, isPublic = false }) {
  const { id, slug } = useParams()
  const navigate = useNavigate()
  const [story, setStory] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState([])
  const [published, setPublished] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || (!isPublic && !session)) {
      setLoading(false)
      return
    }
    let active = true
    let query = supabase.from('stories').select('*')
    query = isPublic ? query.eq('slug', slug).eq('is_published', true) : query.eq('id', id).eq('owner_id', session.user.id)
    query.single().then(({ data, error: queryError }) => {
      if (!active) return
      if (queryError) setError(isPublic ? 'This story is not available.' : queryError.message)
      if (data) {
        setStory(data); setTitle(data.title); setDescription(data.description ?? '')
        setPoints(parsePoints(data.points)); setPublished(data.is_published)
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [id, slug, session, isPublic])

  const selected = useMemo(() => points.find((point) => point.id === selectedId), [points, selectedId])
  const changeSelected = (change) => setPoints((items) => items.map((point) => point.id === selectedId ? { ...point, ...change } : point))
  const addPoint = (lat = DEFAULT_CENTER[0], lng = DEFAULT_CENTER[1]) => {
    if (isPublic) return
    const point = newPoint(points.length, lat, lng)
    setPoints((items) => [...items, point]); setSelectedId(point.id); setPlacing(false)
  }
  const movePoint = (offset) => setPoints((items) => {
    const index = items.findIndex((point) => point.id === selectedId)
    const target = index + offset
    if (index < 0 || target < 0 || target >= items.length) return items
    const copy = [...items]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy
  })

  const save = async () => {
    if (!story || isPublic) return
    setSaving(true); setError(''); setMessage('')
    const { data, error: updateError } = await supabase.from('stories').update({
      title: title.trim() || 'Untitled story', description: description.trim(), points, is_published: published,
    }).eq('id', story.id).eq('owner_id', session.user.id).select().single()
    setSaving(false)
    if (updateError) setError(updateError.message)
    else { setStory(data); setMessage('Story saved.') }
  }

  const removeStory = async () => {
    if (!story || !window.confirm(`Delete “${title}”? This cannot be undone.`)) return
    const { error: deleteError } = await supabase.from('stories').delete().eq('id', story.id).eq('owner_id', session.user.id)
    if (deleteError) setError(deleteError.message); else navigate('/storytelling')
  }

  if (loading) return <div className="story-loading">Loading story…</div>
  if (error && !story) return <div className="story-loading"><h1>Story unavailable</h1><p>{error}</p><Link to="/storytelling">Back to storytelling</Link></div>
  if (!isPublic && !session) return <StoryLibrary session={session} />

  return (
    <main className={`story-builder${isPublic ? ' story-builder--public' : ''}`}>
      <StoryMap points={points} selectedId={selectedId} onSelect={setSelectedId} onPlace={placing ? addPoint : null} placing={placing} />
      <aside className="story-builder__rail">
        <div className="story-builder__brand"><Link to="/storytelling">← Storytelling</Link><span>{isPublic ? 'Pasifika story' : 'Story builder'}</span></div>
        <section className="story-builder__details">
          {isPublic ? <><h1>{title}</h1>{description && <p>{description}</p>}</> : <>
            <label>Story title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label>Description<textarea rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this story about?" /></label>
            <label className="story-publish"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Publish this story</label>
            {published && story?.slug && <a className="story-share-link" href={`/stories/${story.slug}`} target="_blank" rel="noreferrer">Open public story ↗</a>}
          </>}
        </section>
        {(message || error) && <p className={`story-message${error ? ' story-message--error' : ''}`} role="status">{error || message}</p>}
        <section className="story-points">
          <div className="story-points__heading"><strong>Story points</strong><span>{points.length}</span></div>
          <div className="story-points__list">
            {points.length ? points.map((point, index) => (
              <button className={point.id === selectedId ? 'is-active' : ''} type="button" key={point.id} onClick={() => setSelectedId(point.id)}>
                {point.imageUrl && <img src={point.imageUrl} alt="" />}
                <i style={{ background: point.color }}>{index + 1}</i><span><strong>{point.title}</strong><small>{point.story || 'No story text yet.'}</small></span>
              </button>
            )) : <p>No places have been added yet.</p>}
          </div>
        </section>
        {!isPublic && <div className="story-builder__actions">
          <button type="button" onClick={() => addPoint()}>+ Add point</button>
          <button type="button" className={placing ? 'is-active' : ''} onClick={() => setPlacing((value) => !value)}>{placing ? 'Click the map…' : 'Place on map'}</button>
          <button type="button" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save story'}</button>
          <button type="button" className="danger" onClick={removeStory}>Delete</button>
        </div>}
      </aside>
      {selected && <aside className={`story-point-editor${isPublic ? ' story-point-editor--public' : ''}`}>
        <button className="story-point-editor__close" type="button" onClick={() => setSelectedId(null)} aria-label="Close point">×</button>
        {selected.imageUrl && <img className="story-point-editor__image" src={selected.imageUrl} alt="" />}
        {isPublic ? <><span>Story point</span><h2>{selected.title}</h2><p>{selected.story}</p>{selected.popup && <small>{selected.popup}</small>}</> : <>
          <span>Point editor</span>
          <label>Title<input value={selected.title} onChange={(event) => changeSelected({ title: event.target.value })} /></label>
          <label>Story text<textarea rows="7" value={selected.story} onChange={(event) => changeSelected({ story: event.target.value })} /></label>
          <label>Pin popup text<textarea rows="2" value={selected.popup} onChange={(event) => changeSelected({ popup: event.target.value })} /></label>
          <label>Image URL<input type="url" value={selected.imageUrl} onChange={(event) => changeSelected({ imageUrl: event.target.value })} placeholder="https://…" /></label>
          <div className="story-point-editor__coordinates"><label>Latitude<input type="number" value={selected.lat} onChange={(event) => changeSelected({ lat: Number(event.target.value) })} /></label><label>Longitude<input type="number" value={selected.lng} onChange={(event) => changeSelected({ lng: Number(event.target.value) })} /></label></div>
          <div className="story-point-editor__actions"><button type="button" onClick={() => movePoint(-1)}>Move up</button><button type="button" onClick={() => movePoint(1)}>Move down</button><button type="button" className="danger" onClick={() => { setPoints((items) => items.filter((point) => point.id !== selectedId)); setSelectedId(null) }}>Remove</button></div>
        </>}
      </aside>}
    </main>
  )
}

export default function StorytellingPage({ publicStory = false }) {
  const { session } = useAuth()
  const { id } = useParams()
  if (publicStory) return <StoryExperience session={session} isPublic />
  if (id) return <StoryExperience session={session} />
  return <StoryLibrary session={session} />
}
