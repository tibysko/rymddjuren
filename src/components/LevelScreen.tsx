import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { QUESTIONS_PER_LEVEL, starsFor } from '../game/levels'
import { speak } from '../game/speech'
import type { Level } from '../game/types'

const CHEERS = ['Bra jobbat!', 'Superbra!', 'Wow, vad duktig du är!', 'Rätt! 🎉', 'Hurra!']
const TRY_AGAIN = ['Nästan! Prova igen!', 'Inte riktigt – du klarar det!', 'Försök en gång till!']

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Props {
  level: Level
  onDone: (stars: number, correct: number) => void
  onQuit: () => void
}

interface Feedback {
  text: string
  happy: boolean
}

export default function LevelScreen({ level, onDone, onQuit }: Props) {
  const questions = useMemo(() => level.generate!(), [level])
  const [index, setIndex] = useState(0)
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [attempted, setAttempted] = useState(false) // fel på första försöket?
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [wrongChoice, setWrongChoice] = useState<number | null>(null)
  const [fed, setFed] = useState<number[]>([]) // matade index i feed-frågor
  const [locked, setLocked] = useState(false)
  const [rabbitPos, setRabbitPos] = useState<number | null>(null) // position i hopp-frågor
  const hopTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const q = questions[index]

  useEffect(() => () => clearInterval(hopTimer.current), [])

  function nextQuestion(wasFirstTry: boolean) {
    if (wasFirstTry) setFirstTryCorrect((n) => n + 1)
    setFeedback({ text: pick(CHEERS), happy: true })
    setLocked(true)
    setTimeout(() => {
      setFeedback(null)
      setWrongChoice(null)
      setFed([])
      setRabbitPos(null)
      setAttempted(false)
      setLocked(false)
      if (index + 1 >= questions.length) {
        const correct = wasFirstTry ? firstTryCorrect + 1 : firstTryCorrect
        onDone(starsFor(correct), correct)
      } else {
        setIndex(index + 1)
      }
    }, 1200)
  }

  function wrongAnswer(choice: number | null) {
    setWrongChoice(choice)
    setFeedback({ text: pick(TRY_AGAIN), happy: false })
    setAttempted(true)
    setTimeout(() => setFeedback(null), 1500)
  }

  function answerChoice(choice: number) {
    if (locked) return
    if (q.type !== 'choice') return
    if (choice === q.answer) {
      nextQuestion(!attempted)
    } else {
      wrongAnswer(choice)
    }
  }

  // Hopp-frågor: kaninen hoppar sten för sten när svaret är rätt
  function answerHop(choice: number) {
    if (locked) return
    if (q.type !== 'hop') return
    if (choice !== q.answer) {
      wrongAnswer(choice)
      return
    }
    setLocked(true)
    const wasFirstTry = !attempted
    const dir = q.target > q.start ? 1 : -1
    let pos = q.start
    hopTimer.current = setInterval(() => {
      pos += dir
      setRabbitPos(pos)
      if (pos === q.target) {
        clearInterval(hopTimer.current)
        setLocked(false)
        nextQuestion(wasFirstTry)
      }
    }, 380)
  }

  function toggleFeed(i: number) {
    if (locked) return
    setFed((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))
  }

  function checkFeed() {
    if (locked) return
    if (q.type !== 'feed') return
    if (fed.length === q.target) {
      nextQuestion(!attempted)
    } else {
      wrongAnswer(null)
    }
  }

  return (
    <div className="level" style={{ '--planet-color': level.color } as CSSProperties}>
      <header className="level-header">
        <button className="quit-btn" onClick={onQuit}>⬅️</button>
        <div className="progress-dots">
          {questions.map((_, i) => (
            <span key={i} className={`dot ${i < index ? 'done' : i === index ? 'now' : ''}`} />
          ))}
        </div>
        <span className="level-count">{index + 1}/{QUESTIONS_PER_LEVEL}</span>
      </header>

      <div className="prompt-row">
        <h2 className="prompt">{q.prompt}</h2>
        <button className="speak-btn" onClick={() => speak(q.spoken)} aria-label="Läs upp">
          🔊
        </button>
      </div>

      {q.type === 'choice' && (
        <>
          {q.item && (
            <div className="count-items">
              {Array.from({ length: q.count ?? 0 }).map((_, i) => (
                <span key={i} className="count-item">{q.item}</span>
              ))}
            </div>
          )}
          {q.numberline && (
            <div className="stones">
              {q.numberline.map((n, i) => (
                <div key={i} className="stone-col">
                  <span className="stone-top" />
                  <span className={`stone ${n === null ? 'missing' : ''}`}>
                    {n === null ? '?' : n}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="choices">
            {q.choices.map((c) => (
              <button
                key={c}
                className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
                onClick={() => answerChoice(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'hop' && (
        <>
          <div className="stones">
            {q.stones.map((n) => {
              const pos = rabbitPos ?? q.start
              return (
                <div key={n} className="stone-col">
                  <span className="stone-top">
                    {pos === n ? '🐰' : n === q.target ? '⭐' : ''}
                  </span>
                  <span className={`stone ${n === q.target ? 'target' : ''}`}>{n}</span>
                </div>
              )
            })}
          </div>
          <div className="choices">
            {q.choices.map((c) => (
              <button
                key={c}
                className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
                onClick={() => answerHop(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'feed' && (
        <>
          <div className="feed-animal">
            <span className="feed-animal-emoji">{q.animal}</span>
            <span className="feed-bowl">{fed.length > 0 ? q.item.repeat(fed.length) : '🍽️'}</span>
          </div>
          <div className="feed-items">
            {Array.from({ length: q.total }).map((_, i) => (
              <button
                key={i}
                className={`feed-item ${fed.includes(i) ? 'fed' : ''}`}
                onClick={() => toggleFeed(i)}
              >
                {q.item}
              </button>
            ))}
          </div>
          <button className="big-btn check-btn" onClick={checkFeed}>
            Klart! ✅
          </button>
        </>
      )}

      {feedback && (
        <div className={`ugglis-feedback ${feedback.happy ? 'happy' : 'oops'}`}>
          <span className="ugglis">🦉</span> {feedback.text}
        </div>
      )}
    </div>
  )
}
