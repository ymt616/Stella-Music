import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { api } from '../api/spotify'
import TrackCard from '../components/UI/TrackCard'
import { IconPlay, IconEdit } from '../components/UI/Icons'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableTrack({ id, track, index, contextUri, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      <div {...listeners} {...attributes} style={{
        cursor: 'grab', color: 'var(--text-dim)', fontSize: '14px', padding: '0 6px',
        userSelect: 'none',
      }}>⠿</div>
      <div style={{ flex: 1 }}>
        <TrackCard track={track} index={index} contextUri={contextUri} showIndex onRemove={onRemove} />
      </div>
    </div>
  )
}

export default function Playlist() {
  const { id } = useParams()
  const { accessToken, user } = useAuth()
  const { playContext } = usePlayer()

  const [playlist, setPlaylist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  async function loadPlaylist() {
    const token = accessToken || window.__access_token
    if (!token) return
    try {
      const [plRes, trRes] = await Promise.all([
        api.getPlaylist(token, id),
        api.getPlaylistTracks(token, id),
      ])
      setPlaylist(plRes.data)
      setEditName(plRes.data.name)
      setEditDesc(plRes.data.description || '')
      // Feb 2026: field renamed from i.track → i.item
      setTracks(trRes.data.items?.map(i => i.item || i.track).filter(Boolean) || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const token = accessToken || window.__access_token
    if (token && id) loadPlaylist()
  }, [accessToken, id])

  async function handleSaveEdit() {
    try {
      await api.updatePlaylist(accessToken, id, { name: editName, description: editDesc })
      setPlaylist(p => ({ ...p, name: editName, description: editDesc }))
      setEditing(false)
    } catch (e) { console.error(e) }
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = tracks.findIndex(t => t.id === active.id)
    const newIdx = tracks.findIndex(t => t.id === over.id)
    const newOrder = arrayMove(tracks, oldIdx, newIdx)
    setTracks(newOrder)
    try {
      await api.reorderPlaylistTracks(accessToken, id, oldIdx, newIdx)
    } catch (e) { console.error(e) }
  }

  async function removeTrack(uri) {
    try {
      await api.removeTracksFromPlaylist(accessToken, id, [uri])
      setTracks(t => t.filter(tr => tr.uri !== uri))
    } catch (e) { console.error(e) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!playlist) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Playlist not found.</div>

  const isOwner = user?.id === playlist.owner?.id
  const image = playlist.images?.[0]?.url

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero */}
      <div style={{
        padding: '40px 24px 32px',
        background: `linear-gradient(to bottom, rgba(13,27,62,0.8) 0%, var(--bg-primary) 100%)`,
        display: 'flex', gap: 28, alignItems: 'flex-end',
        borderBottom: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Bg blur from image */}
        {image && <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(40px) saturate(0.5) brightness(0.2)',
        }} />}

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 28, alignItems: 'flex-end', width: '100%' }}>
          {image ? (
            <img src={image} alt={playlist.name} style={{
              width: 200, height: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: 200, height: 200, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--brown))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 64, flexShrink: 0,
            }}>🌸</div>
          )}

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Playlist</div>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{
                    fontSize: '2rem', fontWeight: 700, fontFamily: "'Playfair Display', serif",
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)',
                    outline: 'none', width: '100%',
                  }}
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Add a description..."
                  style={{
                    fontSize: '13px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 12px', color: 'var(--text-secondary)',
                    outline: 'none', width: '100%',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSaveEdit} style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--accent-hot)', color: '#fff', fontSize: '13px', fontWeight: 600 }}>Save</button>
                  <button onClick={() => setEditing(false)} style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', marginBottom: 8, lineHeight: 1.1 }}>{playlist.name}</h1>
                {playlist.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 8, maxWidth: 500 }}
                    dangerouslySetInnerHTML={{ __html: playlist.description }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {playlist.owner?.display_name} · {tracks.length} songs
                  </span>
                  <button
                    onClick={() => playContext(playlist.uri)}
                    className="btn-primary"
                  >
                    <IconPlay size={14} color="#fff" strokeWidth={2.5} style={{ marginLeft: 2 }} /> Play
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border)', color: 'var(--text-muted)',
                        fontSize: '13px', transition: 'all var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                      <IconEdit size={13} /> Edit
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Track list */}
      <div style={{ padding: '24px' }}>
        {isOwner ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tracks.map((track, i) => (
                <SortableTrack
                  key={track.id + i}
                  id={track.id}
                  track={track}
                  index={i}
                  contextUri={playlist.uri}
                  onRemove={() => removeTrack(track.uri)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          tracks.map((track, i) => (
            <TrackCard key={track.id + i} track={track} index={i} contextUri={playlist.uri} showIndex />
          ))
        )}

        {tracks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: 12 }}>🌸</div>
            <p>This playlist is empty. Add some songs!</p>
          </div>
        )}
      </div>
    </div>
  )
}
