// Apornas planet (planet 3): ravinhoppet som riktig canvas-bana i PixiJS.
// Talet barnet väljer ÄR hoppets kraft: kaninen flyger en parabelbåge exakt
// så många steg. Rätt → landar hos apan med bananen. För kort → faller
// SYNLIGT ner i ravinen. För långt → hoppar förbi bananen. Kameran följer
// mjukt med och bakgrundens stjärnor rör sig i parallax – plattformskänsla
// utan att någon motorik krävs.
//
// Knappar, Ugglis och uppläsning bor kvar i DOM. Om varken WebGPU eller
// WebGL fungerar faller komponenten tillbaka till den gamla DOM-scenen –
// exakt samma matte, bara enklare grafik.

import { useEffect, useRef, useState } from 'react'
import { Container, Graphics, Text } from 'pixi.js'
import type { Application } from 'pixi.js'
import { playTone } from '../game/sound'
import { createPixiApp } from '../game/pixi'
import type { JumpQuestion } from '../game/types'

interface Props {
  q: JumpQuestion
  locked: boolean
  onRight: () => void
  onWrong: (msg: string) => void
}

const FLIGHT_MS = 750
const H = 320 // scenens höjd i px
const COL_W = 88 // en talenhet i px – bredare än skärmen → kameran får jobba
const GROUND_H = 58
const ARC = 92 // hoppbågens höjd
const RESET_MS = 2300 // samma paus som förut innan nytt försök

// Minns om Pixi inte fungerar i den här webbläsaren (testas bara en gång)
let pixiBroken = false

export default function JumpScene(props: Props) {
  const [fallback, setFallback] = useState(pixiBroken)
  if (fallback) return <JumpSceneDom {...props} />
  return <JumpScenePixi {...props} onFail={() => setFallback(true)} />
}

// ---------------------------------------------------------------- Pixi-banan

type Phase = 'idle' | 'fly' | 'fall' | 'past' | 'celebrate'

function JumpScenePixi({ q, locked, onRight, onWrong, onFail }: Props & { onFail: () => void }) {
  const holder = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [wrongChoice, setWrongChoice] = useState<number | null>(null)
  const jumpRef = useRef<(c: number) => void>(() => {})
  const cbRef = useRef({ onRight, onWrong, onFail })
  cbRef.current = { onRight, onWrong, onFail }

  useEffect(() => {
    let app: Application | null = null
    let disposed = false
    const timers: ReturnType<typeof setTimeout>[] = []

    ;(async () => {
      app = await createPixiApp({ resizeTo: holder.current ?? undefined })
      if (!app) {
        pixiBroken = true
        if (!disposed) cbRef.current.onFail()
        return
      }
      if (disposed || !holder.current) {
        app.destroy(true, { children: true, texture: true })
        return
      }
      holder.current.appendChild(app.canvas)

      const cols = q.hi - q.lo + 1
      const worldW = cols * COL_W
      const groundY = H - GROUND_H // plattformarnas ovansida
      const xOf = (n: number) => (n - q.lo + 0.5) * COL_W

      // Parallaxlager längst bak: stjärnor + en avlägsen planet
      const far = new Container()
      const near = new Container()
      const world = new Container()
      app.stage.addChild(far, near, world)
      for (let i = 0; i < 40; i++) {
        const tint = i % 4 === 0 ? 0xffd32a : 0xfff8ec
        const layer = i % 2 === 0 ? far : near
        const s = new Graphics().circle(0, 0, i % 2 === 0 ? 1.5 : 2.2).fill({ color: tint, alpha: i % 2 === 0 ? 0.4 : 0.6 })
        s.x = Math.random() * (worldW + 400)
        s.y = Math.random() * (H - GROUND_H - 30)
        layer.addChild(s)
      }
      const planet = new Text({ text: '🪐', style: { fontSize: 42 } })
      planet.alpha = 0.5
      planet.x = worldW * 0.7
      planet.y = 30
      far.addChild(planet)

      // Mark, ravin och tal
      for (let i = 0; i < cols; i++) {
        const n = q.lo + i
        const x = i * COL_W
        const isRavine = n > q.start && n < q.target
        const g = new Graphics()
        if (isRavine) {
          // Ravinen: ett mörkt schakt – hit faller man om hoppet är för kort
          g.rect(x + 3, groundY + 26, COL_W - 6, GROUND_H - 26).fill({ color: 0x0d0620, alpha: 0.9 })
          g.moveTo(x + 3, groundY + 26)
        } else {
          // Plattform med gräsig ovansida
          g.roundRect(x + 3, groundY, COL_W - 6, GROUND_H - 12, 9).fill(0x3c6127)
          g.roundRect(x + 3, groundY, COL_W - 6, 12, 9).fill(0x5a8f3c)
        }
        world.addChild(g)
        const label = new Text({
          text: String(n),
          style: {
            fill: n === q.target ? 0xffd32a : 0xfff8ec,
            fontSize: n === q.target ? 24 : 19,
            fontWeight: '800',
            fontFamily: "'Baloo 2', system-ui, sans-serif",
          },
        })
        label.anchor.set(0.5)
        label.alpha = isRavine ? 0.45 : 0.95
        label.x = xOf(n)
        label.y = isRavine ? H - 12 : groundY + 30
        world.addChild(label)
      }

      // Målet: apan väntar med bananen
      const monkey = new Text({ text: '🐵', style: { fontSize: 42 } })
      monkey.anchor.set(0.5, 1)
      monkey.x = xOf(q.target) + 20
      monkey.y = groundY + 2
      const banana = new Text({ text: '🍌', style: { fontSize: 34 } })
      banana.anchor.set(0.5, 1)
      banana.x = xOf(q.target) - 14
      banana.y = groundY + 2
      world.addChild(monkey, banana)

      // Kaninen
      const rabbit = new Text({ text: '🐰', style: { fontSize: 46 } })
      rabbit.anchor.set(0.5, 1)
      rabbit.x = xOf(q.start)
      rabbit.y = groundY + 2
      world.addChild(rabbit)

      // Partiklar: gnistspår i luften, dammpuff vid landning, stjärnor vid rätt
      interface P {
        g: Graphics
        vx: number
        vy: number
        life: number
        maxLife: number
        grav: number
      }
      const parts: P[] = []
      const partLayer = new Container()
      world.addChild(partLayer)

      function addP(g: Graphics, vx: number, vy: number, life: number, grav: number) {
        partLayer.addChild(g)
        parts.push({ g, vx, vy, life, maxLife: life, grav })
      }

      function sparkle(x: number, y: number) {
        const g = new Graphics().circle(0, 0, 1.8 + Math.random() * 1.6).fill(0xffd32a)
        g.x = x + (Math.random() - 0.5) * 8
        g.y = y - 20 + (Math.random() - 0.5) * 8
        addP(g, (Math.random() - 0.5) * 30, 20 + Math.random() * 30, 0.45, 60)
      }

      function puff(x: number, y: number, color: number) {
        for (let i = 0; i < 9; i++) {
          const g = new Graphics().circle(0, 0, 2.5 + Math.random() * 3).fill({ color, alpha: 0.8 })
          g.x = x + (Math.random() - 0.5) * 14
          g.y = y - 2
          const ang = Math.PI + (i / 9) * Math.PI // uppåt/utåt
          addP(g, Math.cos(ang) * (30 + Math.random() * 50), -Math.abs(Math.sin(ang)) * (20 + Math.random() * 40), 0.55, 140)
        }
      }

      function starBurst(x: number, y: number) {
        for (let i = 0; i < 14; i++) {
          const size = 3.5 + Math.random() * 4
          const color = i % 3 === 0 ? 0xff4d4d : 0xffd32a
          const g = new Graphics().star(0, 0, 5, size, size * 0.45).fill(color)
          g.x = x
          g.y = y - 24
          const ang = (i / 14) * Math.PI * 2
          const sp = 90 + Math.random() * 130
          addP(g, Math.cos(ang) * sp, Math.sin(ang) * sp - 60, 0.9, 260)
        }
      }

      // Tillstånd för animationen (utanför React – tickern äger det här)
      let phase: Phase = 'idle'
      let t = 0
      let fromX = 0
      let toX = 0
      let landing = 0
      let choice = 0
      let cam = 0
      let camInit = false
      let clock = 0

      jumpRef.current = (c: number) => {
        if (phase !== 'idle') return
        choice = c
        landing = q.start + c
        fromX = xOf(q.start)
        toX = xOf(landing)
        t = 0
        phase = 'fly'
        setBusy(true)
        playTone(392, 180) // avstamp!
      }

      const resetLater = () => {
        timers.push(
          setTimeout(() => {
            rabbit.x = xOf(q.start)
            rabbit.y = groundY + 2
            rabbit.rotation = 0
            rabbit.alpha = 1
            phase = 'idle'
            setWrongChoice(null)
            setBusy(false)
          }, RESET_MS),
        )
      }

      app.ticker.add((ticker) => {
        if (!app) return
        const dt = ticker.deltaMS / 1000
        clock += dt

        // Bananen vinkar lite hela tiden – dit ska man!
        banana.y = groundY + 2 - Math.abs(Math.sin(clock * 2.2)) * 6
        if (phase === 'celebrate') {
          monkey.scale.set(1 + 0.16 * Math.sin(clock * 9))
          rabbit.y = groundY + 2 - Math.abs(Math.sin(clock * 7)) * 14 // glädjeskutt!
        }

        if (phase === 'fly') {
          t += ticker.deltaMS / FLIGHT_MS
          const p = Math.min(1, t)
          rabbit.x = fromX + (toX - fromX) * p
          rabbit.y = groundY + 2 - ARC * 4 * p * (1 - p)
          rabbit.rotation = 0.2 * Math.sin(Math.PI * p) * (toX > fromX ? 1 : -1)
          if (Math.random() < 0.7) sparkle(rabbit.x, rabbit.y) // gnistspår i luften
          if (p >= 1) {
            rabbit.rotation = 0
            if (landing === q.target) {
              phase = 'celebrate'
              puff(rabbit.x, groundY, 0x7bc24a)
              starBurst(rabbit.x, groundY) // stjärnor yr hos apan!
              playTone(523, 300)
              cbRef.current.onRight()
            } else if (landing < q.target) {
              phase = 'fall'
              t = 0
              puff(rabbit.x, groundY + 30, 0x4a3a66) // mörkt damm ur ravinen
              cbRef.current.onWrong(`Oj! ${choice} räckte inte fram – kaninen föll i ravinen! Prova igen.`)
              setWrongChoice(choice)
              playTone(147, 350)
              resetLater()
            } else {
              phase = 'past'
              t = 0
              puff(rabbit.x, groundY, 0x9b8ac2) // dammpuff – hård landning!
              cbRef.current.onWrong(`Oj! ${choice} var för långt – kaninen hoppade förbi bananen! Prova igen.`)
              setWrongChoice(choice)
              playTone(147, 350)
              resetLater()
            }
          }
        } else if (phase === 'fall') {
          // Ner i ravinen – synligt och begripligt, aldrig läskigt
          t += dt
          rabbit.y = Math.min(groundY + 150, groundY + 2 + t * 260)
          rabbit.rotation = Math.min(0.6, t * 1.2)
          rabbit.alpha = Math.max(0.25, 1 - t * 0.5)
        } else if (phase === 'past') {
          // Landade förbi – kaninen vinglar till
          t += dt
          rabbit.rotation = 0.25 * Math.sin(t * 14) * Math.max(0, 1 - t)
        }

        // Uppdatera partiklarna
        for (let i = parts.length - 1; i >= 0; i--) {
          const pt = parts[i]
          pt.life -= dt
          pt.vy += pt.grav * dt
          pt.g.x += pt.vx * dt
          pt.g.y += pt.vy * dt
          pt.g.alpha = Math.max(0, pt.life / pt.maxLife)
          if (pt.life <= 0) {
            parts.splice(i, 1)
            pt.g.destroy()
          }
        }

        // Kameran: följ kaninen mjukt, håll dig innanför världen
        const viewW = app.screen.width
        let target = rabbit.x - viewW * 0.45
        if (worldW <= viewW) {
          target = (worldW - viewW) / 2 // liten värld → centrera
        } else {
          target = Math.max(0, Math.min(worldW - viewW, target))
        }
        if (!camInit) {
          cam = target
          camInit = true
        }
        cam += (target - cam) * Math.min(1, dt * 5)
        world.x = -cam
        near.x = -cam * 0.35
        far.x = -cam * 0.15
      })
    })()

    return () => {
      disposed = true
      timers.forEach((id) => clearTimeout(id))
      jumpRef.current = () => {}
      if (app) {
        app.destroy(true, { children: true, texture: true })
        app = null
      }
    }
    // Scenen monteras om per fråga (key={index}) – q är stabil här
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div ref={holder} className="jump-canvas" />
      <div className="choices">
        {q.choices.map((c) => (
          <button
            key={c}
            className={`choice-btn ${wrongChoice === c ? 'wrong' : ''}`}
            onClick={() => {
              if (!locked && !busy) jumpRef.current(c)
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </>
  )
}

// ------------------------------------------------- DOM-fallback (som förut)

function JumpSceneDom({ q, locked, onRight, onWrong }: Props) {
  const [jumpX, setJumpX] = useState<number | null>(null)
  const [jumpY, setJumpY] = useState(0)
  const [jumpFell, setJumpFell] = useState(false)
  const [wrongChoice, setWrongChoice] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const raf = useRef<number | undefined>(undefined)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const ARC_H = 80
  const DROP = 120

  useEffect(
    () => () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
      timers.current.forEach((id) => clearTimeout(id))
    },
    [],
  )

  function answerJump(choice: number) {
    if (locked || busy) return
    setBusy(true)
    setJumpFell(false)
    setWrongChoice(null)
    const landing = q.start + choice
    let t0: number | null = null
    const step = (ts: number) => {
      if (t0 === null) t0 = ts
      const p = Math.min(1, (ts - t0) / FLIGHT_MS)
      setJumpX(q.start + (landing - q.start) * p)
      setJumpY(ARC_H * 4 * p * (1 - p))
      if (p < 1) {
        raf.current = requestAnimationFrame(step)
        return
      }
      raf.current = undefined
      if (landing === q.target) {
        setJumpX(landing)
        setJumpY(0)
        setBusy(false)
        onRight()
        return
      }
      setWrongChoice(choice)
      setJumpX(landing)
      if (landing < q.target) {
        setJumpFell(true)
        setJumpY(-DROP)
        onWrong(`Oj! ${choice} räckte inte fram – kaninen föll i ravinen! Prova igen.`)
      } else {
        setJumpY(0)
        onWrong(`Oj! ${choice} var för långt – kaninen hoppade förbi bananen! Prova igen.`)
      }
      timers.current.push(
        setTimeout(() => {
          setJumpFell(false)
          setJumpX(q.start)
          setJumpY(0)
          setWrongChoice(null)
          setBusy(false)
        }, RESET_MS),
      )
    }
    raf.current = requestAnimationFrame(step)
  }

  return (
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
  )
}
