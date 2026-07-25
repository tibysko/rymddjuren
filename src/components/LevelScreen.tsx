import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { cheerBurst } from '../game/fx'
import { QUESTIONS_PER_LEVEL, starsFor } from '../game/levels'
import { speak } from '../game/speech'
import type { Level } from '../game/types'
import { sv } from '../i18n/sv'
import Ugglis from './Ugglis'
import { BalanceScene, DoubleScene, PairScene, PatternScene, ShareScene, Via10Scene } from './scenes'
import JumpScene from './JumpScene'

function pick(arr: readonly string[]): string {
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
  const [attempted, setAttempted] = useState(false) // wrong on the first try?
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [wrongChoice, setWrongChoice] = useState<number | null>(null)
  const [fed, setFed] = useState<number[]>([]) // fed indices in feed questions
  const [locked, setLocked] = useState(false)
  const [rabbitPos, setRabbitPos] = useState<number | null>(null) // position in hop questions
  const [landedWrong, setLandedWrong] = useState(false) // the rabbit landed wrong
  const hopTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const sessionTimeouts = useRef(new Set<ReturnType<typeof setTimeout>>())
  // The comet stairs (Comet Party): the rabbit's step + an "oops" shake on a wrong landing
  const [stairPos, setStairPos] = useState<number | null>(null)
  const [stairOops, setStairOops] = useState(false)
  // The party table: how many sweets the parrot has eaten so far (visibly animated)
  const [eatenSoFar, setEatenSoFar] = useState(0)
  const [eating, setEating] = useState(false)
  const eatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const q = questions[index]

  function later(callback: () => void, ms: number) {
    const id = setTimeout(() => {
      sessionTimeouts.current.delete(id)
      callback()
    }, ms)
    sessionTimeouts.current.add(id)
  }

  function clearSessionTimers() {
    sessionTimeouts.current.forEach((id) => clearTimeout(id))
    sessionTimeouts.current.clear()
    clearInterval(hopTimer.current)
    clearInterval(eatTimer.current)
  }

  function quitLevel() {
    clearSessionTimers()
    onQuit()
  }

  useEffect(
    () => () => {
      clearSessionTimers()
    },
    [],
  )

  // The party table: when an eat question appears the parrot eats the sweets one
  // at a time, visibly, BEFORE the child answers – "take away" becomes an event
  // rather than a digit.
  useEffect(() => {
    if (q.type !== 'eat') return
    setEatenSoFar(0)
    setEating(true)
    const startDelay = setTimeout(() => {
      let n = 0
      eatTimer.current = setInterval(() => {
        n += 1
        setEatenSoFar(n)
        if (n >= q.eaten) {
          clearInterval(eatTimer.current)
          setEating(false)
        }
      }, 700)
    }, 900)
    return () => {
      clearTimeout(startDelay)
      clearInterval(eatTimer.current)
    }
  }, [q])

  function nextQuestion(wasFirstTry: boolean) {
    if (wasFirstTry) setFirstTryCorrect((n) => n + 1)
    cheerBurst() // a star burst in the space behind – every correct answer is celebrated!
    setFeedback({ text: pick(sv.level.cheers), happy: true })
    setLocked(true)
    later(() => {
      setFeedback(null)
      setWrongChoice(null)
      setFed([])
      setRabbitPos(null)
      setLandedWrong(false)
      setStairPos(null)
      setStairOops(false)
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
    setFeedback({ text: pick(sv.level.tryAgain), happy: false })
    setAttempted(true)
    later(() => setFeedback(null), 1500)
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

  // Hop questions: the rabbit ALWAYS hops exactly as many times as the child
  // picks. Right answer → it lands on the star. Wrong answer → it lands visibly
  // wrong on the number line, so the child sees why e.g. 3 hops fall short.
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
          // Landed wrong – let it show for a moment, then hop back to the start
          setLandedWrong(true)
          setWrongChoice(choice)
          setAttempted(true)
          const short = (dir === 1 ? landing < q.target : landing > q.target)
          setFeedback({
            text: short ? sv.hop.tooShort(choice) : sv.hop.tooFar(choice),
            happy: false,
          })
          later(() => {
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

  // The comet stairs: the rabbit ALWAYS bounces exactly as many steps as the
  // child picks, one step at a time, and Ugglis counts each number out loud
  // ("eight… seven… six!"). Wrong answer → the rabbit visibly stops on the wrong
  // step. The stairs end at 0, so you CANNOT take away more than you have.
  function answerStair(choice: number) {
    if (locked) return
    if (q.type !== 'stair') return
    setLocked(true)
    setStairOops(false)
    const wasFirstTry = !attempted
    const dir = q.dir === 'down' ? -1 : 1
    const landing = q.start + dir * choice
    let pos = q.start
    hopTimer.current = setInterval(() => {
      pos += dir
      setStairPos(pos)
      speak(String(pos)) // Ugglis counts the steps out loud – the child hears the number line
      if (pos === landing) {
        clearInterval(hopTimer.current)
        if (landing === q.target) {
          setLocked(false)
          nextQuestion(wasFirstTry)
        } else {
          // Landed on the wrong step – let it show, then hop back
          setStairOops(true)
          setWrongChoice(choice)
          setAttempted(true)
          const goal = q.dir === 'down' ? sv.stair.goalDown : sv.stair.goalUp
          const move = q.dir === 'down' ? sv.stair.moveDown : sv.stair.moveUp
          const short = dir === -1 ? landing > q.target : landing < q.target
          setFeedback({
            text: short
              ? sv.stair.tooShort(choice, move, goal)
              : sv.stair.tooFar(choice, move, goal),
            happy: false,
          })
          later(() => {
            setFeedback(null)
            setStairOops(false)
            setStairPos(q.start)
            setWrongChoice(null)
            setLocked(false)
          }, 2300)
        }
      }
    }, 550)
  }

  // The scenes for planets 5–10 (scenes.tsx) own their own animations and call
  // back here once the child has answered – LevelScreen handles the cheering
  // and the second chance.
  function sceneRight() {
    nextQuestion(!attempted)
  }

  function sceneWrong(msg: string) {
    setAttempted(true)
    setFeedback({ text: msg, happy: false })
    later(() => setFeedback(null), 2200)
  }

  // The party table: a wrong answer → the eaten sweets are shown as pale ghosts,
  // so the child can count both the ones left and the ones that are gone.
  function answerEat(choice: number) {
    if (locked || eating) return
    if (q.type !== 'eat') return
    if (choice === q.answer) {
      nextQuestion(!attempted)
    } else {
      setWrongChoice(choice)
      setAttempted(true)
      setFeedback({ text: sv.eat.countTheRest(q.total, q.eaten, q.answer), happy: false })
      later(() => setFeedback(null), 2500)
    }
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
        <button className="quit-btn" onClick={quitLevel} aria-label={sv.level.backToMap}>{sv.level.backToMap}</button>
        <div className="progress-dots">
          {questions.map((_, i) =>
            level.id === 10 ? (
              // The Party Planet: every correct answer lights a party lantern!
              <span key={i} className={`lantern ${i < index ? 'lit' : ''} ${i === index ? 'now' : ''}`}>
                🏮
              </span>
            ) : (
              <span key={i} className={`dot ${i < index ? 'done' : i === index ? 'now' : ''}`} />
            ),
          )}
        </div>
        <span className="level-count">{index + 1}/{QUESTIONS_PER_LEVEL}</span>
      </header>

      <div className="prompt-row">
        <h2 className="prompt">{q.prompt}</h2>
        <button className="speak-btn" onClick={() => speak(q.spoken)} aria-label={sv.level.speakLabel}>
          🔊
        </button>
      </div>

      {q.type === 'choice' && (
        <>
          {q.item && (
            <div className={`count-items ${q.mirror ? 'mirrored' : ''}`}>
              {Array.from({ length: q.count ?? 0 }).map((_, i) => (
                <span key={i} className="count-item">{q.item}</span>
              ))}
              {q.mirror && (
                <div className="mirror-row">
                  {Array.from({ length: q.count ?? 0 }).map((_, i) => (
                    <span key={i} className="count-item mirror-item">{q.item}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {q.tenframe !== undefined && (
            <div className="tenframe" data-filled={q.tenframe}>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className={`tf-cell ${i < q.tenframe! ? 'filled' : ''}`}>
                  {i < q.tenframe! ? '🪵' : ''}
                </span>
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
                disabled={locked}
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
                disabled={locked}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'jump' && (
        <JumpScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}

      {q.type === 'stair' && (
        <>
          <div className="stair-scene">
            <span className="stair-comet">☄️</span>
            {Array.from({ length: q.hi - q.lo + 1 }).map((_, i) => {
              const n = q.lo + i
              const leftPct = ((n - q.lo + 0.5) / (q.hi - q.lo + 1)) * 100
              const h = 16 + n * 14 // the height of step n in px – the height IS the number
              return (
                <div key={n} className={`stair-col ${n === q.target ? 'goal' : ''}`} style={{ left: `${leftPct}%` }}>
                  {n === q.target && (
                    <span className="stair-goal-emoji" style={{ bottom: `${h + 2}px` }}>
                      {q.dir === 'down' ? '🍬' : '🦜'}
                    </span>
                  )}
                  <span className="stair-step" style={{ height: `${h}px` }} />
                  <span className="stair-num">{n}</span>
                </div>
              )
            })}
            <span
              className={`stair-rabbit ${stairOops ? 'oops' : ''}`}
              style={{
                left: `${(((stairPos ?? q.start) - q.lo + 0.5) / (q.hi - q.lo + 1)) * 100}%`,
                bottom: `${16 + (stairPos ?? q.start) * 14 + 2}px`,
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
                onClick={() => answerStair(c)}
                disabled={locked}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'eat' && (
        <>
          <div className="party-scene" aria-live="polite">
            <span className={`party-parrot ${eating ? 'munching' : ''}`}>🦜</span>
            <div className="party-table">
              {Array.from({ length: q.total }).map((_, i) => {
                const isEaten = i >= q.total - eatenSoFar
                return (
                  <span key={i} className={`candy ${isEaten ? 'ghost' : ''}`}>
                    {q.item}
                  </span>
                )
              })}
            </div>
            <span className="party-table-leg" />
          </div>
          {!eating && (
            <div className="eat-story">
              <span>{sv.eat.start(q.total)}</span>
              <span>{sv.eat.eaten(q.eaten)}</span>
              <span className="eat-left">{sv.eat.left(q.answer)}</span>
            </div>
          )}
          <div className={`choices ${eating ? 'waiting' : ''}`}>
            {q.choices.map((c) => (
              <button
                key={c}
                className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
                onClick={() => answerEat(c)}
                disabled={locked || eating}
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
                disabled={locked}
              >
                {q.item}
              </button>
            ))}
          </div>
          <button className="big-btn check-btn" onClick={checkFeed} disabled={locked}>
            {sv.level.check}
          </button>
        </>
      )}

      {q.type === 'share' && (
        <ShareScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}
      {q.type === 'double' && (
        <DoubleScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}
      {q.type === 'pair' && (
        <PairScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}
      {q.type === 'balance' && (
        <BalanceScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}
      {q.type === 'pattern' && (
        <PatternScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}
      {q.type === 'via10' && (
        <Via10Scene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}

      {feedback && (
        <div className={`ugglis-feedback ${feedback.happy ? 'happy' : 'oops'}`}>
          <span role="status"><Ugglis /> {feedback.text}</span>
          <button
            className="speak-btn feedback-speak-btn"
            onClick={() => speak(feedback.text)}
            aria-label={sv.level.feedbackSpeakLabel}
          >
            🔊
          </button>
        </div>
      )}
    </div>
  )
}
