import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { cheerBurst } from '../game/fx'
import { QUESTIONS_PER_LEVEL, starsFor } from '../game/levels'
import { speak } from '../game/speech'
import type { Level } from '../game/types'
import { BalanceScene, DoubleScene, PairScene, PatternScene, ShareScene, Via10Scene } from './scenes'
import JumpScene from './JumpScene'

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
  // Komettrappan (Kometkalaset): kaninens trappsteg + "oj!"-skak vid fel landning
  const [stairPos, setStairPos] = useState<number | null>(null)
  const [stairOops, setStairOops] = useState(false)
  // Kalasbordet: hur många godisar papegojan ätit hittills (animeras synligt)
  const [eatenSoFar, setEatenSoFar] = useState(0)
  const [eating, setEating] = useState(false)
  const eatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const q = questions[index]

  useEffect(
    () => () => {
      clearInterval(hopTimer.current)
      clearInterval(eatTimer.current)
    },
    [],
  )

  // Kalasbordet: när en ät-fråga visas äter papegojan upp godisarna en i taget,
  // synligt, INNAN barnet svarar – "ta bort" blir en händelse, inte en siffra.
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
    cheerBurst() // stjärnexplosion i rymden bakom – varje rätt svar firas!
    setFeedback({ text: pick(CHEERS), happy: true })
    setLocked(true)
    setTimeout(() => {
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

  // Komettrappan: kaninen studsar ALLTID exakt så många steg som barnet väljer,
  // ett steg i taget, och Ugglis räknar varje tal högt ("åtta… sju… sex!").
  // Fel svar → kaninen stannar synligt på fel trappsteg. Trappan slutar vid 0,
  // så det GÅR inte att ta bort mer än man har.
  function answerStair(choice: number) {
    if (locked) return
    if (q.type !== 'stair') return
    setLocked(true)
    setStairOops(false)
    const wasFirstTry = !attempted
    const dir = q.dir === 'ner' ? -1 : 1
    const landing = q.start + dir * choice
    let pos = q.start
    hopTimer.current = setInterval(() => {
      pos += dir
      setStairPos(pos)
      speak(String(pos)) // Ugglis räknar stegen högt – barnet hör talraden
      if (pos === landing) {
        clearInterval(hopTimer.current)
        if (landing === q.target) {
          setLocked(false)
          nextQuestion(wasFirstTry)
        } else {
          // Landade på fel trappsteg – låt det synas, hoppa sen tillbaka
          setStairOops(true)
          setWrongChoice(choice)
          setAttempted(true)
          const thing = q.dir === 'ner' ? 'godiset' : 'papegojan'
          const word = q.dir === 'ner' ? 'steg' : 'hopp'
          const short = dir === -1 ? landing > q.target : landing < q.target
          setFeedback({
            text: short
              ? `Oj! ${choice} ${word} räckte inte till ${thing}. Prova igen!`
              : `Oj! ${choice} ${word} var för många – kaninen for förbi ${thing}! Prova igen!`,
            happy: false,
          })
          setTimeout(() => {
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

  // Scenerna för planet 5–10 (scenes.tsx) äger sina egna animationer och
  // ropar hit när barnet svarat – LevelScreen sköter jubel och andra chansen.
  function sceneRight() {
    nextQuestion(!attempted)
  }

  function sceneWrong(msg: string) {
    setAttempted(true)
    setFeedback({ text: msg, happy: false })
    setTimeout(() => setFeedback(null), 2200)
  }

  // Kalasbordet: fel svar → de uppätna godisarna visas som bleka spöken,
  // så barnet kan räkna både de som är kvar och de som är borta.
  function answerEat(choice: number) {
    if (locked || eating) return
    if (q.type !== 'eat') return
    if (choice === q.answer) {
      nextQuestion(!attempted)
    } else {
      setWrongChoice(choice)
      setAttempted(true)
      setFeedback({ text: 'Titta! De bleka är uppätna. Räkna dem som är kvar!', happy: false })
      setTimeout(() => setFeedback(null), 2500)
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
        <button className="quit-btn" onClick={onQuit}>⬅️</button>
        <div className="progress-dots">
          {questions.map((_, i) =>
            level.id === 10 ? (
              // Festplaneten: varje rätt svar tänder en festlykta!
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
        <button className="speak-btn" onClick={() => speak(q.spoken)} aria-label="Läs upp">
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
        <JumpScene key={index} q={q} locked={locked} onRight={sceneRight} onWrong={sceneWrong} />
      )}

      {q.type === 'stair' && (
        <>
          <div className="stair-scene">
            <span className="stair-comet">☄️</span>
            {Array.from({ length: q.hi - q.lo + 1 }).map((_, i) => {
              const n = q.lo + i
              const leftPct = ((n - q.lo + 0.5) / (q.hi - q.lo + 1)) * 100
              const h = 16 + n * 14 // trappsteg n:s höjd i px – höjden ÄR talet
              return (
                <div key={n} className={`stair-col ${n === q.target ? 'goal' : ''}`} style={{ left: `${leftPct}%` }}>
                  {n === q.target && (
                    <span className="stair-goal-emoji" style={{ bottom: `${h + 2}px` }}>
                      {q.dir === 'ner' ? '🍬' : '🦜'}
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
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {q.type === 'eat' && (
        <>
          <div className="party-scene">
            <span className={`party-parrot ${eating ? 'munching' : ''}`}>🦜</span>
            <div className="party-table">
              {Array.from({ length: q.total }).map((_, i) => {
                const isEaten = i >= q.total - eatenSoFar
                return (
                  <span key={i} className={`candy ${isEaten ? (attempted ? 'ghost' : 'gone') : ''}`}>
                    {q.item}
                  </span>
                )
              })}
            </div>
            <span className="party-table-leg" />
          </div>
          <div className={`choices ${eating ? 'waiting' : ''}`}>
            {q.choices.map((c) => (
              <button
                key={c}
                className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
                onClick={() => answerEat(c)}
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
          <span className="ugglis">🦉</span> {feedback.text}
        </div>
      )}
    </div>
  )
}
