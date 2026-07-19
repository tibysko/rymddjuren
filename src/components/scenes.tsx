// Scener för planet 5–10. Varje scen äger sin egen animation och ropar
// onRight()/onWrong(text) – LevelScreen sköter jubel, andra chansen och
// räkningen. Scenerna monteras om per fråga (key={index}), så intern state
// nollställs automatiskt.
//
// Designregeln överallt: fel svar ger ett SYNLIGT, begripligt resultat i
// spelvärlden – gungbrädan tippar, vågen lutar, hästen stannar.

import { useEffect, useRef, useState } from 'react'
import { playPatternTone, playTone } from '../game/sound'
import { speak } from '../game/speech'
import type {
  BalanceQuestion,
  DoubleQuestion,
  PairQuestion,
  PatternQuestion,
  ShareQuestion,
  Via10Question,
} from '../game/types'

interface SceneProps<Q> {
  q: Q
  locked: boolean
  onRight: () => void
  onWrong: (msg: string) => void
}

function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t))
    },
    [],
  )
  return {
    later(fn: () => void, ms: number) {
      timers.current.push(setTimeout(fn, ms))
    },
    every(fn: () => void, ms: number): ReturnType<typeof setInterval> {
      const id = setInterval(fn, ms)
      timers.current.push(id)
      return id
    },
  }
}

// ---- Tvillingplaneten: gungbrädan – dela lika ----
// Brädan tippar HELA TIDEN mot den tyngre sidan: obalans syns och känns.

export function ShareScene({ q, locked, onRight, onWrong }: SceneProps<ShareQuestion>) {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const remaining = q.total - left - right
  const tilt = Math.max(-14, Math.min(14, (right - left) * 4))

  function give(side: 'left' | 'right') {
    if (locked || remaining === 0) return
    if (side === 'left') setLeft((n) => n + 1)
    else setRight((n) => n + 1)
  }

  function takeBack(side: 'left' | 'right') {
    if (locked) return
    if (side === 'left' && left > 0) setLeft((n) => n - 1)
    if (side === 'right' && right > 0) setRight((n) => n - 1)
  }

  function check() {
    if (locked) return
    if (remaining > 0) {
      onWrong('Dela ut alla pinnar först!')
    } else if (left !== right) {
      onWrong(`Gungbrädan tippar! ${left} och ${right} är inte lika.`)
    } else {
      onRight()
    }
  }

  return (
    <>
      <div className="share-pile" data-total={q.total}>
        {remaining > 0 ? (
          Array.from({ length: remaining }).map((_, i) => (
            <span key={i} className="share-pile-item">{q.item}</span>
          ))
        ) : (
          <span className="share-pile-empty">Allt utdelat!</span>
        )}
      </div>
      <div className="seesaw">
        <div className="seesaw-beam" style={{ transform: `rotate(${tilt}deg)` }}>
          <div className="seesaw-end">
            <button className="seesaw-panda" data-side="left" onClick={() => give('left')} aria-label="Ge vänster panda">
              🐼
            </button>
            <button className="seesaw-items" onClick={() => takeBack('left')} aria-label="Ta tillbaka från vänster">
              {Array.from({ length: left }).map((_, i) => (
                <span key={i}>{q.item}</span>
              ))}
              <b className="seesaw-count">{left}</b>
            </button>
          </div>
          <div className="seesaw-end">
            <button className="seesaw-panda" data-side="right" onClick={() => give('right')} aria-label="Ge höger panda">
              🐼
            </button>
            <button className="seesaw-items" onClick={() => takeBack('right')} aria-label="Ta tillbaka från höger">
              {Array.from({ length: right }).map((_, i) => (
                <span key={i}>{q.item}</span>
              ))}
              <b className="seesaw-count">{right}</b>
            </button>
          </div>
        </div>
        <div className="seesaw-base" />
      </div>
      <button className="big-btn check-btn" onClick={check}>
        Klart! ✅
      </button>
    </>
  )
}

// ---- Tvillingplaneten: studsmattan – valt tal × 2 = landningen ----

export function DoubleScene({ q, locked, onRight, onWrong }: SceneProps<DoubleQuestion>) {
  const [pos, setPos] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const { later, every } = useTimers()

  function choose(c: number) {
    if (locked || busy) return
    setBusy(true)
    setChosen(c)
    let p = 0
    // Fas 1: hoppa fram till studsmattan på c...
    const first = every(() => {
      p += 1
      setPos(p)
      if (p === c) {
        clearInterval(first)
        playTone(392, 260) // boing!
        // ...fas 2: studsmattan skickar kaninen lika långt till – dubbelt!
        later(() => {
          const second = every(() => {
            p += 1
            setPos(p)
            if (p === 2 * c) {
              clearInterval(second)
              if (2 * c === q.target) {
                onRight()
              } else {
                onWrong(`Du hoppade ${c} – studsmattan gjorde ${2 * c}! Stjärnan är på ${q.target}.`)
                later(() => {
                  setPos(0)
                  setChosen(null)
                  setBusy(false)
                }, 2100)
              }
            }
          }, 240)
        }, 420)
      }
    }, 330)
  }

  return (
    <>
      <div className="stones long" data-target={q.target}>
        {Array.from({ length: q.hi + 1 }).map((_, n) => (
          <div key={n} className="stone-col">
            <span className="stone-top">
              {pos === n ? '🐰' : n === q.target ? '⭐' : chosen === n ? '🌀' : ''}
            </span>
            <span className={`stone ${n === q.target ? 'target' : ''} ${chosen === n ? 'tramp' : ''}`}>{n}</span>
          </div>
        ))}
      </div>
      <div className="choices">
        {q.choices.map((c) => (
          <button key={c} className="choice-btn" onClick={() => choose(c)}>
            {c}
          </button>
        ))}
      </div>
    </>
  )
}

// ---- Kompisplaneten: para ihop två högar till rävens tal ----

export function PairScene({ q, locked, onRight, onWrong }: SceneProps<PairQuestion>) {
  const [sel, setSel] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const { later } = useTimers()

  function clickPile(i: number) {
    if (locked || busy) return
    if (sel.includes(i)) {
      setSel(sel.filter((x) => x !== i))
      return
    }
    const next = [...sel, i]
    setSel(next)
    if (next.length === 2) {
      setBusy(true)
      const [a, b] = next.map((x) => q.piles[x])
      later(() => {
        if (a + b === q.want) {
          playTone(523, 300)
          onRight()
        } else {
          onWrong(`${a} och ${b} blir ${a + b} – räven vill ha ${q.want}!`)
          later(() => {
            setSel([])
            setBusy(false)
          }, 1700)
        }
      }, 600)
    }
  }

  return (
    <>
      <div className="fox-row" data-want={q.want}>
        <span className="fox-emoji">🦊</span>
        <span className="fox-bubble">
          <b>{q.want}</b>
          <span className="fox-dots">
            {Array.from({ length: q.want }).map((_, i) => (
              <i key={i} />
            ))}
          </span>
        </span>
      </div>
      <div className="piles">
        {q.piles.map((n, i) => (
          <button
            key={i}
            className={`pile ${sel.includes(i) ? 'picked' : ''}`}
            data-value={n}
            onClick={() => clickPile(i)}
          >
            <span className="pile-items">
              {Array.from({ length: n }).map((_, j) => (
                <span key={j}>{q.item}</span>
              ))}
            </span>
            <b>{n}</b>
          </button>
        ))}
      </div>
    </>
  )
}

// ---- Vågplaneten: gör lika – vågen tippar mot den tyngre sidan ----

function Basket({ value }: { value: number | null }) {
  return (
    <span className={`basket ${value === null ? 'empty' : ''}`}>
      <span className="basket-dots">
        {value !== null &&
          Array.from({ length: value }).map((_, i) => <i key={i} />)}
      </span>
      <b>{value === null ? '?' : value}</b>
    </span>
  )
}

export function BalanceScene({ q, locked, onRight, onWrong }: SceneProps<BalanceQuestion>) {
  const [placed, setPlaced] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const { later } = useTimers()

  const sumL = q.left.reduce((a, b) => a + b, 0)
  const sumR = q.right.reduce((a, b) => a + b, 0) + (placed ?? 0)
  const diff = sumL - sumR
  const tilt = Math.max(-13, Math.min(13, diff * 4))

  function choose(c: number) {
    if (locked || busy) return
    setBusy(true)
    setPlaced(c)
    const d = sumL - (q.right.reduce((a, b) => a + b, 0) + c)
    later(() => {
      if (d === 0) {
        playTone(523, 350)
        onRight()
      } else {
        onWrong(
          d > 0
            ? `Vågen tippar åt vänster – ${c} är för lite i facket!`
            : `Vågen tippar åt höger – ${c} är för mycket i facket!`,
        )
        later(() => {
          setPlaced(null)
          setBusy(false)
        }, 1900)
      }
    }, 900)
  }

  return (
    <>
      <div className="balance" data-left={sumL} data-right={q.right.reduce((a, b) => a + b, 0)}>
        <span className={`balance-lizard ${diff === 0 && placed !== null ? 'happy' : ''}`}>🦎</span>
        <div className="balance-beam" style={{ transform: `rotate(${-tilt}deg)` }}>
          <div className="balance-pan">
            {q.left.map((v, i) => (
              <Basket key={i} value={v} />
            ))}
          </div>
          <div className="balance-pan">
            {q.right.map((v, i) => (
              <Basket key={i} value={v} />
            ))}
            <Basket value={placed} />
          </div>
        </div>
        <div className="balance-base" />
      </div>
      <div className="choices">
        {q.choices.map((c) => (
          <button key={c} className="choice-btn" onClick={() => choose(c)}>
            {c}
          </button>
        ))}
      </div>
    </>
  )
}

// ---- Mönsterbältet: galoppbanan – mönstret bär hästen (och hörs!) ----

export function PatternScene({ q, locked, onRight, onWrong }: SceneProps<PatternQuestion>) {
  const [horse, setHorse] = useState(-1) // index hästen står på
  const [filled, setFilled] = useState<string | null>(null)
  const [busy, setBusy] = useState(true) // upptagen under introgaloppen
  const [oops, setOops] = useState(false)
  const { later, every } = useTimers()

  // Introgalopp: hästen travar över mönstret i rytm – varje färg är en ton
  useEffect(() => {
    if (q.mode !== 'next') {
      setBusy(false)
      return
    }
    let i = -1
    const id = every(() => {
      i += 1
      setHorse(i)
      playPatternTone(q.sequence[i])
      if (i >= q.sequence.length - 1) {
        clearInterval(id)
        setBusy(false)
      }
    }, 420)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function choose(c: string) {
    if (locked || busy) return
    if (q.mode === 'unit') {
      if (c === q.answer) onRight()
      else onWrong('Nästan! Vilken bit kommer om och om igen?')
      return
    }
    setBusy(true)
    setFilled(c)
    later(() => {
      setHorse(q.sequence.length) // hästen hoppar på den valda asteroiden
      if (c === q.answer) {
        playPatternTone(c)
        onRight()
      } else {
        playTone(147, 350) // dov "fel" ton – mönstret bröts
        setOops(true)
        onWrong('Hoppsan – det bröt mönstret! Titta och lyssna igen.')
        later(() => {
          setFilled(null)
          setOops(false)
          setHorse(q.sequence.length - 1)
          setBusy(false)
        }, 1900)
      }
    }, 450)
  }

  return (
    <>
      <div className="pattern-row" data-mode={q.mode}>
        {q.sequence.map((s, i) => (
          <span key={i} className="pattern-cell">
            <span className="pattern-horse">{q.mode === 'next' && horse === i ? '🐴' : ''}</span>
            <span className="pattern-emoji">{s}</span>
          </span>
        ))}
        {q.mode === 'next' && (
          <span className="pattern-cell">
            <span className={`pattern-horse ${oops ? 'oops' : ''}`}>
              {horse >= q.sequence.length ? '🐴' : ''}
            </span>
            <span className={`pattern-emoji missing ${oops ? 'bounce-away' : ''}`}>{filled ?? '❓'}</span>
          </span>
        )}
      </div>
      <div className="choices">
        {q.choices.map((c) => (
          <button key={c} className={`choice-btn emoji-btn ${q.mode === 'unit' ? 'wide' : ''}`} onClick={() => choose(c)}>
            {c}
          </button>
        ))}
      </div>
    </>
  )
}

// ---- Jätteplaneten: jättehopp i två steg – via vilostationen på 10 ----

export function Via10Scene({ q, locked, onRight, onWrong }: SceneProps<Via10Question>) {
  const [pos, setPos] = useState(q.start)
  const [phase, setPhase] = useState<1 | 2>(1)
  const [busy, setBusy] = useState(false)
  const [oopsAt, setOopsAt] = useState<number | null>(null)
  const { later, every } = useTimers()

  const dir = q.target > q.start ? 1 : -1

  function choose(c: number) {
    if (locked || busy) return
    setBusy(true)
    setOopsAt(null)
    const from = phase === 1 ? q.start : 10
    const goal = phase === 1 ? 10 : q.target
    const landing = from + dir * c
    let p = pos
    const id = every(() => {
      p += dir
      setPos(p)
      speak(String(p)) // Ugglis räknar hoppen högt
      if (p === landing) {
        clearInterval(id)
        if (landing === goal) {
          if (phase === 1) {
            playTone(659, 350) // vilostationen firar!
            later(() => {
              setPhase(2)
              setBusy(false)
            }, 700)
          } else {
            onRight()
          }
        } else {
          setOopsAt(landing)
          onWrong(
            phase === 1
              ? `Oj! Du landade på ${landing} – hoppa till tian först!`
              : `Oj! Du landade på ${landing} – stjärnan är på ${q.target}.`,
          )
          later(() => {
            setPos(from)
            setOopsAt(null)
            setBusy(false)
          }, 2100)
        }
      }
    }, 420)
  }

  return (
    <>
      <div className="stones long" data-phase={phase}>
        {Array.from({ length: q.hi - q.lo + 1 }).map((_, i) => {
          const n = q.lo + i
          return (
            <div key={n} className="stone-col">
              <span className={`stone-top ${oopsAt === n ? 'oops' : ''}`}>
                {pos === n ? '🐰' : n === q.target ? '⭐' : n === 10 ? '🚩' : ''}
              </span>
              <span className={`stone ${n === q.target ? 'target' : ''} ${n === 10 ? 'rest-stop' : ''}`}>{n}</span>
            </div>
          )
        })}
      </div>
      <p className="via10-hint">{phase === 1 ? 'Först: hoppa till tian! 🚩' : 'Nu resten – till stjärnan! ⭐'}</p>
      <div className="choices">
        {(phase === 1 ? q.choices1 : q.choices2).map((c) => (
          <button key={c} className="choice-btn" onClick={() => choose(c)}>
            {c}
          </button>
        ))}
      </div>
    </>
  )
}
