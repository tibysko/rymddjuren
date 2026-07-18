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
  const [landedWrong, setLandedWrong] = useState(false) // kaninen landade fel
  const hopTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  // Ravinhopp (Apornas planet): kaninens position i talenheter (x) och höjd i px (y)
  const [jumpX, setJumpX] = useState<number | null>(null)
  const [jumpY, setJumpY] = useState(0)
  const [jumpFell, setJumpFell] = useState(false) // föll ner i ravinen
  const jumpRaf = useRef<number | undefined>(undefined)

  const q = questions[index]

  useEffect(
    () => () => {
      clearInterval(hopTimer.current)
      if (jumpRaf.current !== undefined) cancelAnimationFrame(jumpRaf.current)
    },
    [],
  )

  function nextQuestion(wasFirstTry: boolean) {
    if (wasFirstTry) setFirstTryCorrect((n) => n + 1)
    setFeedback({ text: pick(CHEERS), happy: true })
    setLocked(true)
    setTimeout(() => {
      setFeedback(null)
      setWrongChoice(null)
      setFed([])
      setRabbitPos(null)
      setLandedWrong(false)
      setJumpX(null)
      setJumpY(0)
      setJumpFell(false)
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

  // Hopp-frågor: kaninen hoppar ALLTID exakt så många hopp som barnet väljer.
  // Rätt svar → landar på stjärnan. Fel svar → landar synligt fel på tallinjen,
  // så barnet ser varför t.ex. 3 hopp inte räcker fram till stjärnan.
  function answerHop(choice: number) {
    if (locked) return
    if (q.type !== 'hop') return
    setLocked(true)
    setLandedWrong(false)
    const wasFirstTry = !attempted
    const dir = q.target > q.start ? 1 : -1
    const landing = q.start + dir * choice
    let pos = q.start
    hopTimer.current = setInterval(() => {
      pos += dir
      setRabbitPos(pos)
      if (pos === landing) {
        clearInterval(hopTimer.current)
        if (landing === q.target) {
          setLocked(false)
          nextQuestion(wasFirstTry)
        } else {
          // Landade fel – låt det synas en stund, hoppa sen tillbaka till start
          setLandedWrong(true)
          setWrongChoice(choice)
          setAttempted(true)
          const short = (dir === 1 ? landing < q.target : landing > q.target)
          setFeedback({
            text: short
              ? `Oj! ${choice} hopp räckte inte fram. Prova igen!`
              : `Oj! ${choice} hopp var för långt. Prova igen!`,
            happy: false,
          })
          setTimeout(() => {
            setFeedback(null)
            setLandedWrong(false)
            setRabbitPos(q.start)
            setWrongChoice(null)
            setLocked(false)
          }, 2200)
        }
      }
    }, 380)
  }

  // Ravinhopp: kaninen hoppar en parabelbåge exakt så långt barnet valt.
  // Rätt hopp → landar vid bananen. För kort → faller ner i ravinen.
  // För långt → hoppar förbi bananen. Talet = hoppets kraft (start + hopp).
  const FLIGHT_MS = 750
  const ARC_H = 80 // hoppbågens höjd i px
  const DROP = 120 // fall ner i ravinen i px

  function answerJump(choice: number) {
    if (locked) return
    if (q.type !== 'jump') return
    setLocked(true)
    setJumpFell(false)
    setWrongChoice(null)
    const start = q.start
    const target = q.target
    const landing = start + choice
    const wasFirstTry = !attempted
    let t0: number | null = null
    const step = (t: number) => {
      if (t0 === null) t0 = t
      const p = Math.min(1, (t - t0) / FLIGHT_MS)
      setJumpX(start + (landing - start) * p)
      setJumpY(ARC_H * 4 * p * (1 - p)) // parabel: 0 → topp → 0
      if (p < 1) {
        jumpRaf.current = requestAnimationFrame(step)
        return
      }
      jumpRaf.current = undefined
      if (landing === target) {
        setJumpX(landing)
        setJumpY(0)
        setLocked(false)
        nextQuestion(wasFirstTry)
        return
      }
      // Fel landning – låt det synas, hoppa sen tillbaka till start
      setAttempted(true)
      setWrongChoice(choice)
      setJumpX(landing)
      if (landing < target) {
        setJumpFell(true)
        setJumpY(-DROP)
        setFeedback({ text: `Oj! ${choice} räckte inte fram – kaninen föll i ravinen! Prova igen.`, happy: false })
      } else {
        setJumpY(0)
        setFeedback({ text: `Oj! ${choice} var för långt – kaninen hoppade förbi bananen! Prova igen.`, happy: false })
      }
      setTimeout(() => {
        setFeedback(null)
        setJumpFell(false)
        setJumpX(start)
        setJumpY(0)
        setWrongChoice(null)
        setLocked(false)
      }, 2300)
    }
    jumpRaf.current = requestAnimationFrame(step)
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
              const rabbitHere = pos === n
              return (
                <div key={n} className="stone-col">
                  <span className={`stone-top ${rabbitHere && landedWrong ? 'oops' : ''}`}>
                    {rabbitHere ? '🐰' : n === q.target ? '⭐' : ''}
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

      {q.type === 'jump' && (
        <>
          <div className="jump-scene">
            {Array.from({ length: q.hi - q.lo + 1 }).map((_, i) => {
              const n = q.lo + i
              const leftPct = ((n - q.lo + 0.5) / (q.hi - q.lo + 1)) * 100
              const isRavine = n > q.start && n < q.target
              return (
                <div
                  key={n}
                  className={`jump-col ${isRavine ? 'ravine' : 'ground'} ${n === q.target ? 'goal' : ''}`}
                  style={{ left: `${leftPct}%` }}
                >
                  {n === q.target && <span className="jump-banana">🍌🐵</span>}
                  <span className="jump-platform" />
                  <span className="jump-num">{n}</span>
                </div>
              )
            })}
            <span
              className={`jump-rabbit ${jumpFell ? 'falling' : ''}`}
              style={{
                left: `${(((jumpX ?? q.start) - q.lo + 0.5) / (q.hi - q.lo + 1)) * 100}%`,
                bottom: `calc(var(--jump-ground) + ${jumpY}px)`,
              }}
            >
              🐰
            </span>
          </div>
          <div className="choices">
            {q.choices.map((c) => (
              <button
                key={c}
                className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
                onClick={() => answerJump(c)}
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
