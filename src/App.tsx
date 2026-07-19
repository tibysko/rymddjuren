import { useEffect, useState } from 'react'
import SpaceBackdrop from './components/SpaceBackdrop'
import StarMap from './components/StarMap'
import LevelScreen from './components/LevelScreen'
import ResultScreen from './components/ResultScreen'
import Station from './components/Station'
import type { Level, Progress } from './game/types'

const STORAGE_KEY = 'rymddjuren-progress'

type Screen = 'map' | 'travel' | 'level' | 'result' | 'station'

interface LastResult {
  stars: number
  correct: number
  newAnimal: boolean
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Progress
  } catch {
    // trasig data – börja om
  }
  return { stars: {}, animals: [] }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null)
  const [lastResult, setLastResult] = useState<LastResult | null>(null)

  function saveProgress(next: Progress) {
    setProgress(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // t.ex. privat läge – spelet funkar ändå, men sparar inte
    }
  }

  function handlePlay(level: Level) {
    setCurrentLevel(level)
    setScreen('travel') // först en snabb raketresa genom hyperrymden!
  }

  // Resan är kort och kräver ingenting av spelaren – banan startar av sig själv
  useEffect(() => {
    if (screen !== 'travel') return
    const id = setTimeout(() => setScreen('level'), 1700)
    return () => clearTimeout(id)
  }, [screen])

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
      {/* Stjärnfältet bakom allt – hyperrymd på väg till planeten, guldregn när den är klarad! */}
      <SpaceBackdrop mode={screen === 'result' ? 'cheer' : screen === 'travel' ? 'travel' : 'calm'} />
      <div className="app">
      {screen === 'map' && (
        <StarMap progress={progress} onPlay={handlePlay} onStation={() => setScreen('station')} />
      )}
      {screen === 'travel' && currentLevel && (
        <div className="travel">
          <span className="travel-rocket">🚀</span>
          <p className="travel-text">
            Mot {currentLevel.name}! <span className="travel-animal">{currentLevel.animal}</span>
          </p>
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
