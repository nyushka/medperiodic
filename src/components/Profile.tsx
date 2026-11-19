import { useEffect, useRef, useState } from 'react'
import { progress, PROFILE_COLORS, useProgress, useProgressUI, type ItemType } from '../lib/progress'

const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?'

export function Avatar({ name, color, size = 30 }: { name: string; color: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, '--c': color } as React.CSSProperties} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

/** Sign in / create a study profile. Profiles live in this browser. */
export function SignInDialog({ onClose }: { onClose: () => void }) {
  useProgress()
  const others = progress.profiles
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROFILE_COLORS[0])
  const [creating, setCreating] = useState(others.length === 0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (creating) input.current?.focus()
  }, [creating])
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className="modal-wrap" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="signin-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">✕</button>
        <h2 id="signin-title">{creating ? 'New profile' : 'Profiles'}</h2>

        {!creating && (
          <div className="profile-list">
            {others.map((p) => (
              <button
                key={p.id}
                className={`profile-row${progress.active.id === p.id ? ' on' : ''}`}
                onClick={() => {
                  progress.switchTo(p.id)
                  onClose()
                }}
              >
                <Avatar name={p.name} color={p.color} size={36} />
                <span>
                  <strong>{p.name}</strong>
                  <small>{Object.keys(p.seen).length} explored · {Object.keys(p.learned).length} learned</small>
                </span>
              </button>
            ))}
            <button className="profile-row add" onClick={() => setCreating(true)}>
              <span className="avatar add" aria-hidden="true">+</span>
              <span><strong>New profile</strong></span>
            </button>
          </div>
        )}

        {creating && (
          <form
            className="signup"
            onSubmit={(e) => {
              e.preventDefault()
              if (!name.trim()) return
              progress.signUp(name, color)
              onClose()
            }}
          >
            <label htmlFor="profile-name">Your name</label>
            <input id="profile-name" ref={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Naomi" maxLength={40} autoComplete="given-name" />
            <span className="lbl-sm">Color</span>
            <div className="swatches" role="radiogroup" aria-label="Profile color">
              {PROFILE_COLORS.map((c) => (
                <button type="button" key={c} role="radio" aria-checked={color === c} className={color === c ? 'on' : ''} style={{ background: c }} onClick={() => setColor(c)} aria-label={`Color ${c}`} />
              ))}
            </div>
            <div className="signup-preview">
              <Avatar name={name || 'Student'} color={color} size={40} />
              <span>{name || 'Your profile'}</span>
            </div>
            <button className="btn-primary" type="submit" disabled={!name.trim()}>
              Start tracking
            </button>
            {others.length > 0 && (
              <button type="button" className="btn-ghost" onClick={() => setCreating(false)}>
                Back to profiles
              </button>
            )}
          </form>
        )}
        <p className="fine">Saved in this browser.</p>
      </div>
    </div>
  )
}

/** Top-bar profile button with a small menu. */
export function ProfileButton({ onStudy }: { onStudy: () => void }) {
  const p = useProgress()
  const { openSignIn } = useProgressUI()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [open])

  if (!progress.signedIn)
    return (
      <button className="signin-btn" onClick={openSignIn}>
        Sign in
      </button>
    )
  return (
    <div className="profile-menu" ref={ref}>
      <button className="profile-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={`Profile: ${p.name}`}>
        <Avatar name={p.name} color={p.color} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-head">
            <strong>{p.name}</strong>
            <small>{Object.keys(p.seen).length} explored · {Object.keys(p.learned).length} learned</small>
          </div>
          <button role="menuitem" onClick={() => { setOpen(false); onStudy() }}>My study</button>
          <button role="menuitem" onClick={() => { setOpen(false); openSignIn() }}>Switch profile</button>
          <button role="menuitem" onClick={() => { setOpen(false); progress.signOut() }}>Sign out</button>
        </div>
      )}
    </div>
  )
}

/** "Mark as learned" toggle used on structure, element and vitamin pages. */
export function LearnedButton({ type, id }: { type: ItemType; id: string }) {
  const p = useProgress()
  const done = !!p.learned[`${type}:${id}`]
  return (
    <button className={`learned-btn${done ? ' on' : ''}`} onClick={() => progress.toggleLearned(type, id)} aria-pressed={done}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {done ? <path d="M3 8.5l3.2 3L13 4.5" /> : <circle cx="8" cy="8" r="5.5" />}
      </svg>
      {done ? 'Learned' : 'Mark as learned'}
    </button>
  )
}
