import type { CSSProperties } from 'react'
import { LEVELS } from '../game/levels'
import type { Level, Progress } from '../game/types'

interface Props {
  progress: Progress
  onPlay: (level: Level) => void
  onStation: () => void
}

// I dev-läge (npm run dev) är alla banor upplåsta så man kan testa direkt.
// Den byggda spela.html är en produktionsbygge → normal upplåsning gäller där.
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
        <h1>🚀 Rymddjuren{DEV && <span className="dev-badge">🔧 DEV</span>}</h1>
        <button className="station-btn" onClick={onStation}>
          🛰️ Min rymdstation
        </button>
      </header>

      <p className="ugglis-hello">
        <span className="ugglis">🦉</span> Hej! Jag är Ugglis. Vilken planet ska vi flyga till?
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
                {unlocked ? level.desc : 'Låst'}
                {unlocked && !level.generate ? ' (kommer snart!)' : ''}
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
