import { LEVELS } from '../game/levels'
import type { Progress } from '../game/types'
import { sv } from '../i18n/sv'

interface Props {
  progress: Progress
  onBack: () => void
}

export default function Station({ progress, onBack }: Props) {
  const collected = progress.animals || []

  return (
    <div className="station">
      <h1>{sv.station.title}</h1>
      {collected.length === 0 ? (
        <p className="station-empty">
          <span className="ugglis">🦉</span> {sv.station.empty}
        </p>
      ) : (
        <div className="station-animals">
          {LEVELS.filter((l) => collected.includes(l.id)).map((l) => (
            <div key={l.id} className="station-animal">
              <span className="station-animal-emoji">{l.animal}</span>
              <span>{l.animalName}</span>
            </div>
          ))}
        </div>
      )}
      <button className="big-btn" onClick={onBack}>
        {sv.station.back}
      </button>
    </div>
  )
}
