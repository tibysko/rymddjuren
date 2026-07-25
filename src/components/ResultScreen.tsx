import type { Level } from '../game/types'
import { speak } from '../game/speech'
import { sv } from '../i18n/sv'
import Ugglis from './Ugglis'

interface Props {
  level: Level
  stars: number
  newAnimal: boolean
  onBack: () => void
}

export default function ResultScreen({ level, stars, newAnimal, onBack }: Props) {
  const resultSpeech = sv.result.spoken(level.name, level.animalName, newAnimal, stars)

  return (
    <div className="result result-panel">
      <div className="result-heading">
        <h1>{sv.result.heading(level.name)}</h1>
        <button className="speak-btn" onClick={() => speak(resultSpeech)} aria-label={sv.result.speakLabel}>
          🔊
        </button>
      </div>
      <div className="result-stars">
        {[1, 2, 3].map((s) => (
          <span key={s} className={s <= stars ? 'star big on' : 'star big'}>★</span>
        ))}
      </div>
      {newAnimal && (
        <p className="result-animal">
          <span className="result-animal-emoji">{level.animal}</span>
          <br />
          {sv.result.newAnimal(level.animalName)}
        </p>
      )}
      <p className="ugglis-hello">
        <Ugglis /> {sv.result.praise}
      </p>
      <button className="big-btn" onClick={onBack}>
        {sv.result.back}
      </button>
    </div>
  )
}
