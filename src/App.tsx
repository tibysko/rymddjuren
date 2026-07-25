import { useEffect, useState } from 'react'
import SpaceBackdrop from './components/SpaceBackdrop'
import StarMap from './components/StarMap'
import LevelScreen from './components/LevelScreen'
import ResultScreen from './components/ResultScreen'
import Station from './components/Station'
import { LEVELS } from './game/levels'
import { normalizeProgress, parseProgress, PROGRESS_STORAGE_KEY } from './game/progress'
import { speak } from './game/speech'
import type { Level, Progress } from './game/types'
import { sv } from './i18n/sv'

type Screen = 'map' | 'travel' | 'level' | 'result' | 'station'

interface LastResult {
  stars: number
  correct: number
  newAnimal: boolean
}

function loadProgress(): Progress {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
  } catch {
    return parseProgress(null, LEVELS.length)
  }
  const progress = parseProgress(raw, LEVELS.length)
  // Repair bad or old saves immediately, so every part of the game sees the
  // same safe shape (including Planet 10's adaptive question mix).
  if (raw !== JSON.stringify(progress)) {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Private browsing may disallow storage; the in-memory game still works.
    }
  }
  return progress
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [lastResult, setLastResult] = useState<LastResult | null>(null)
  // A short shower of gold when you enter a station where every animal lives.
  // Only a few seconds – this is a screen the child stays on, so the rain
  // settles back into the calm starfield instead of running forever.
  const [stationParty, setStationParty] = useState(false)
  const stationFull = (progress.animals?.length || 0) >= LEVELS.length

  function saveProgress(next: Progress) {
    const safe = normalizeProgress(next, LEVELS.length)
    setProgress(safe)
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(safe))
    } catch {
      // e.g. private mode – the game still works, it just does not save
    }
  }

  function handlePlay(level: Level) {
    setCurrentLevel(level)
    setScreen('travel') // first a quick rocket ride through hyperspace!
  }

  // The trip is short and asks nothing of the player – the level starts on its own
  useEffect(() => {
    if (screen !== 'travel') return
    if (currentLevel) speak(sv.travel.spoken(currentLevel.name))
    const id = setTimeout(() => setScreen('level'), 1700)
    return () => clearTimeout(id)
  }, [screen, currentLevel])

  useEffect(() => {
    if (screen !== 'station' || !stationFull) {
      setStationParty(false)
      return
    }
    setStationParty(true)
    const id = setTimeout(() => setStationParty(false), 4000)
    return () => clearTimeout(id)
  }, [screen, stationFull])

  function handleLevelDone(stars: number, correct: number) {
    if (!currentLevel) return
    const prevStars = progress.stars[currentLevel.id] || 0
    const isNewAnimal = !progress.animals.includes(currentLevel.id)
    const next: Progress = {
      stars: { ...progress.stars, [currentLevel.id]: Math.max(prevStars, stars) },
      animals: isNewAnimal ? [...progress.animals, currentLevel.id] : progress.animals,
    }
    saveProgress(next)
    setLastResult({ stars, correct, newAnimal: isNewAnimal })
    setScreen('result')
  }

  return (
    <>
      {/* The starfield behind everything – hyperspace on the way to the planet, golden rain once it is cleared! */}
      <SpaceBackdrop
        mode={
          screen === 'result' || stationParty
            ? 'cheer'
            : screen === 'travel'
              ? 'travel'
              : 'calm'
        }
      />
      <div className="app">
      {screen === 'map' && (
        <StarMap progress={progress} onPlay={handlePlay} onStation={() => setScreen('station')} />
      )}
      {screen === 'travel' && currentLevel && (
        <div className="travel">
          <span className="travel-rocket">🚀</span>
          <p className="travel-text">
            {sv.travel.heading(currentLevel.name)}{' '}
            <span className="travel-animal">{currentLevel.animal}</span>
          </p>
          <button
            className="speak-btn"
            onClick={() => speak(sv.travel.spoken(currentLevel.name))}
            aria-label={sv.travel.speakLabel}
          >
            🔊
          </button>
        </div>
      )}
      {screen === 'level' && currentLevel && (
        <LevelScreen level={currentLevel} onDone={handleLevelDone} onQuit={() => setScreen('map')} />
      )}
      {screen === 'result' && currentLevel && lastResult && (
        <ResultScreen
          level={currentLevel}
          stars={lastResult.stars}
          newAnimal={lastResult.newAnimal}
          onBack={() => setScreen('map')}
        />
      )}
      {screen === 'station' && (
        <Station progress={progress} onBack={() => setScreen('map')} />
      )}
      </div>
    </>
  )
}
