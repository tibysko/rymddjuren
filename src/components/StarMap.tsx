import type { CSSProperties } from 'react'
import { LEVELS } from '../game/levels'
import type { Level, Progress } from '../game/types'
import { sv } from '../i18n/sv'

interface Props {
  progress: Progress
  onPlay: (level: Level) => void
  onStation: () => void
}

// In dev mode (npm run dev) every level is unlocked so it can be tested right away.
// The built single-file page is a production build → normal unlocking applies there.
const DEV = import.meta.env.DEV

export default function StarMap({ progress, onPlay, onStation }: Props) {
  const stars = progress.stars || {}

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
        <span className="ugglis">🦉</span> {sv.map.greeting}
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
    </div>
  )
}
