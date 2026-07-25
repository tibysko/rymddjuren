// "My space station" – the reward screen. Every animal you have rescued lives
// here: they float weightlessly, and tapping one makes it cheer (bounce, star
// burst and its name read aloud). The station itself grows – one module lights
// up per animal. The NEXT animal is teased as a dark silhouette with a spoken
// riddle; the ones after it stay secret behind a question mark, so a new animal
// moving in is still a surprise.

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { LEVELS } from '../game/levels'
import type { Progress } from '../game/types'
import { cheerBurst } from '../game/fx'
import { prefersReducedMotion } from '../game/pixi'
import { speak } from '../game/speech'
import { sv } from '../i18n/sv'
import Ugglis from './Ugglis'

interface Props {
  progress: Progress
  onBack: () => void
}

/** How long the happy bounce runs before the animal goes back to floating */
const CHEER_MS = 700
/** A random animal wiggles now and then so the station feels alive */
const WIGGLE_EVERY_MS = 4200
const WIGGLE_MS = 900

export default function Station({ progress, onBack }: Props) {
  const collected = progress.animals || []
  const stars = progress.stars || {}
  const total = LEVELS.length
  // The animal in line to move in: the lowest level id not collected yet
  const next = LEVELS.find((l) => !collected.includes(l.id)) ?? null

  // Which animal is celebrating right now. The tick makes a second tap on the
  // same animal restart the animation (the element is remounted by its key).
  const [cheering, setCheering] = useState<{ id: number; tick: number } | null>(null)
  const [wiggling, setWiggling] = useState<number | null>(null)

  const ugglisLine =
    collected.length === 0
      ? sv.station.empty
      : collected.length === total
        ? sv.station.ugglisFull
        : sv.station.ugglisSome(collected.length, total - collected.length)

  // Back to floating once the bounce is done
  useEffect(() => {
    if (!cheering) return
    const id = setTimeout(() => setCheering(null), CHEER_MS)
    return () => clearTimeout(id)
  }, [cheering])

  // Idle life: one random animal wiggles at a time (never with reduced motion)
  useEffect(() => {
    if (collected.length === 0 || prefersReducedMotion()) return
    let stop: ReturnType<typeof setTimeout> | null = null
    const id = setInterval(() => {
      const pick = collected[Math.floor(Math.random() * collected.length)]
      setWiggling(pick)
      stop = setTimeout(() => setWiggling(null), WIGGLE_MS)
    }, WIGGLE_EVERY_MS)
    return () => {
      clearInterval(id)
      if (stop) clearTimeout(stop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collected.length])

  /** Tap an animal: it bounces, stars explode and Ugglis says its name */
  function celebrate(id: number, animalName: string) {
    setCheering((prev) => ({ id, tick: (prev?.tick ?? 0) + 1 }))
    cheerBurst()
    speak(animalName)
  }

  return (
    <div className="station">
      <div className="station-heading">
        <h1>{sv.station.title}</h1>
        <button
          className="speak-btn"
          onClick={() => speak(ugglisLine)}
          aria-label={sv.station.speakLabel}
        >
          🔊
        </button>
      </div>

      {/* The station grows: one lit module per animal that has moved in */}
      <div className="station-hull">
        <span className="station-core">🛰️</span>
        <span className="station-modules">
          {LEVELS.map((l) => {
            const on = collected.includes(l.id)
            return (
              <span key={l.id} className={on ? 'station-module on' : 'station-module'}>
                {on ? '🔆' : '🔅'}
              </span>
            )
          })}
        </span>
      </div>
      <p className="station-counter">{sv.station.counter(collected.length, total)}</p>

      <p className="station-ugglis">
        <Ugglis /> {ugglisLine}
      </p>

      {collected.length > 0 && <p className="station-hint">{sv.station.tapHint}</p>}

      <div className="station-animals">
        {LEVELS.map((level, i) => {
          const cardStyle = {
            '--animal-color': level.color,
            // Offsets so the animals do not bob in sync
            '--float-delay': `${(i % 5) * 0.37}s`,
            '--float-time': `${3.2 + (i % 3) * 0.6}s`,
          } as CSSProperties

          // 1. Collected – alive, tappable, shows the stars earned on that planet
          if (collected.includes(level.id)) {
            const isCheering = cheering?.id === level.id
            const levelStars = stars[level.id] || 0
            return (
              <button
                key={level.id}
                className={`station-animal home${isCheering ? ' cheering' : ''}${
                  wiggling === level.id && !isCheering ? ' wiggling' : ''
                }`}
                style={cardStyle}
                onClick={() => celebrate(level.id, level.animalName)}
              >
                <span
                  // A fresh key restarts the bounce when the same animal is tapped again
                  key={isCheering ? `cheer${cheering.tick}` : 'idle'}
                  className="station-animal-emoji"
                >
                  {level.animal}
                </span>
                <span className="station-animal-name">{level.animalName}</span>
                <span className="station-animal-stars">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={s <= levelStars ? 'star on' : 'star'}>
                      ★
                    </span>
                  ))}
                </span>
              </button>
            )
          }

          // 2. Next in line – a dark silhouette you can guess from, plus a riddle
          if (next && level.id === next.id) {
            const riddle = sv.station.riddles[level.id]
            return (
              <button
                key={level.id}
                className="station-animal next"
                style={cardStyle}
                onClick={() => speak(riddle)}
              >
                <span className="station-animal-emoji silhouette">{level.animal}</span>
                <span className="station-animal-name">{sv.station.nextLabel}</span>
                <span className="station-animal-riddle">🔊 {riddle}</span>
              </button>
            )
          }

          // 3. Still a secret – only how many are left is revealed
          return (
            <div key={level.id} className="station-animal unknown" aria-hidden="true">
              <span className="station-animal-emoji">❓</span>
              <span className="station-animal-name">{sv.station.unknownLabel}</span>
            </div>
          )
        })}
      </div>

      <button className="big-btn" onClick={onBack}>
        {sv.station.back}
      </button>
    </div>
  )
}
