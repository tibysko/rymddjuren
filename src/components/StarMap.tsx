import { useState, type CSSProperties } from 'react'
import { LEVELS } from '../game/levels'
import type { Level, Progress } from '../game/types'
import { sv } from '../i18n/sv'
import Ugglis from './Ugglis'

interface Props {
  progress: Progress
  onPlay: (level: Level) => void
  onStation: () => void
}

// In dev mode (npm run dev) every level is unlocked so it can be tested right away.
// The built single-file page is a production build → normal unlocking applies there.
const DEV = import.meta.env.DEV
const BUILD_ID = import.meta.env.VITE_BUILD_ID?.slice(0, 7) || sv.map.buildLocal

export default function StarMap({ progress, onPlay, onStation }: Props) {
  const stars = progress.stars || {}
  const [buildInfoOpen, setBuildInfoOpen] = useState(false)

  function isUnlocked(level: Level): boolean {
    if (DEV) return true
    if (level.id === 1) return true
    return (stars[level.id - 1] || 0) > 0
  }

  return (
    <div className="starmap">
      <header className="starmap-header">
        <h1>
          {sv.map.title}
          {DEV && <span className="dev-badge">🔧 DEV</span>}
        </h1>
        <button className="station-btn" onClick={onStation}>
          {sv.map.stationButton}
        </button>
      </header>

      <p className="ugglis-hello">
        <Ugglis /> {sv.map.greeting}
      </p>

      <div className="planets">
        {LEVELS.map((level) => {
          const unlocked = isUnlocked(level)
          const ready = unlocked && level.generate !== null
          const levelStars = stars[level.id] || 0
          return (
            <button
              key={level.id}
              className={`planet ${ready ? '' : 'locked'}`}
              style={{ '--planet-color': level.color } as CSSProperties}
              onClick={() => ready && onPlay(level)}
              disabled={!ready}
            >
              <span className="planet-ball">{unlocked ? level.animal : '🔒'}</span>
              <span className="planet-name">{level.name}</span>
              <span className="planet-desc">
                {unlocked ? level.desc : sv.map.locked}
                {unlocked && !level.generate ? sv.map.comingSoon : ''}
              </span>
              <span className="planet-stars">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={s <= levelStars ? 'star on' : 'star'}>
                    ★
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="build-info">
        <button className="build-info-button" type="button" onClick={() => setBuildInfoOpen(true)}>
          {sv.map.buildButton}
        </button>
        {buildInfoOpen && (
          <section className="build-info-panel" role="dialog" aria-modal="true" aria-labelledby="build-info-heading">
            <h2 id="build-info-heading">{sv.map.buildHeading}</h2>
            <p>{sv.map.buildVersion(BUILD_ID)}</p>
            <button type="button" onClick={() => setBuildInfoOpen(false)}>
              {sv.map.buildClose}
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
