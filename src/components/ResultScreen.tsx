import type { Level } from '../game/types'

interface Props {
  level: Level
  stars: number
  newAnimal: boolean
  onBack: () => void
}

export default function ResultScreen({ level, stars, newAnimal, onBack }: Props) {
  return (
    <div className="result">
      <h1>Du klarade {level.name}! 🎉</h1>
      <div className="result-stars">
        {[1, 2, 3].map((s) => (
          <span key={s} className={s <= stars ? 'star big on' : 'star big'}>★</span>
        ))}
      </div>
      {newAnimal && (
        <p className="result-animal">
          <span className="result-animal-emoji">{level.animal}</span>
          <br />
          {level.animalName} flyttar in i din rymdstation!
        </p>
      )}
      <p className="ugglis-hello">
        <span className="ugglis">🦉</span> Bra jobbat, rymdhjälte!
      </p>
      <button className="big-btn" onClick={onBack}>
        Till stjärnkartan 🚀
      </button>
    </div>
  )
}
