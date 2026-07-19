// Effektlagret: en helskärms-canvas BAKOM spelet (pointer-events: none).
//
// Lägen:
//  - 'calm'   – stjärnfält i tre parallaxlager som blinkar, med stjärnfall
//               då och då och en och annan komet. (Stjärnkartan, banorna.)
//  - 'travel' – hyperrymd! Stjärnorna strimmar förbi – raketen är på väg.
//  - 'cheer'  – guld- och rödstjärnor regnar. (Resultatskärmen.)
// Dessutom: cheerBurst() (src/game/fx.ts) ger en stjärnexplosion när som
// helst – används vid varje rätt svar.
//
// Viktigt: lagret är ren dekoration. Ingen mekanik, inga knappar, ingen
// information som behövs för att lösa uppgifterna får bo här. Saknas
// WebGPU/WebGL, eller vill spelaren ha mindre rörelse (prefers-reduced-motion),
// renderas ingenting – CSS-bakgrunden finns kvar precis som förut.
//
// OBS: vi ritar med Graphics/Text direkt (inte generateTexture/Sprite) –
// det fungerar pålitligt i både WebGPU och WebGL. Pixi batchar ändå.

import { useEffect, useRef } from 'react'
import { Container, Graphics, Text } from 'pixi.js'
import type { Application } from 'pixi.js'
import { registerBurst } from '../game/fx'
import { createPixiApp, onRendererFallback, prefersReducedMotion } from '../game/pixi'

export type BackdropMode = 'calm' | 'cheer' | 'travel'

interface StarG extends Graphics {
  speed: number
  baseAlpha: number
  twSpeed: number
  twPhase: number
}

/** Fri partikel: regn, bursts, stjärnfall, kometer */
interface Particle {
  g: Graphics | Text
  vx: number
  vy: number
  vr: number
  life: number
  maxLife: number
  grav: number
}

const GOLD = 0xffd32a
const RED = 0xff4d4d
const WHITE = 0xfff8ec

export default function SpaceBackdrop({ mode }: { mode: BackdropMode }) {
  const holder = useRef<HTMLDivElement>(null)
  const modeRef = useRef<BackdropMode>(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (prefersReducedMotion()) return

    let app: Application | null = null
    let disposed = false

    async function boot() {
      const created = await createPixiApp({ resizeTo: window })
      if (!created) return
      if (disposed || !holder.current) {
        created.destroy(true, { children: true, texture: true })
        return
      }
      app = created
      holder.current.appendChild(app.canvas)
      // Canvas-stjärnorna tar över – släck CSS-prickarna så det inte blir dubbelt
      document.body.classList.add('gpu-stars')

      // --- Stjärnfältet: tre lager, längre bort = mindre och långsammare ---
      const field = new Container()
      app.stage.addChild(field)
      const stars: StarG[] = []
      const area = app.screen.width * app.screen.height
      const count = Math.min(260, Math.round(area / 4200))
      for (let i = 0; i < count; i++) {
        const layer = i % 3 // 0 = längst bort
        const color = i % 5 === 0 ? GOLD : WHITE
        const r = [0.9, 1.4, 2.3][layer] * (0.7 + Math.random() * 0.6)
        const s = (
          layer === 2 && i % 9 === 0
            ? new Graphics().star(0, 0, 5, r * 2.4, r).fill(color)
            : new Graphics().circle(0, 0, r).fill(color)
        ) as StarG
        s.x = Math.random() * app.screen.width
        s.y = Math.random() * app.screen.height
        s.baseAlpha = [0.35, 0.55, 0.85][layer]
        s.alpha = s.baseAlpha
        s.speed = [4, 9, 16][layer] * (0.8 + Math.random() * 0.4)
        s.twSpeed = 0.8 + Math.random() * 2.2 // blinktakt
        s.twPhase = Math.random() * Math.PI * 2
        stars.push(s)
        field.addChild(s)
      }

      // --- Fria partiklar: guldregn, bursts, stjärnfall och kometer ---
      const fxLayer = new Container()
      app.stage.addChild(fxLayer)
      const parts: Particle[] = []

      function addPart(g: Graphics | Text, p: Omit<Particle, 'g'>) {
        fxLayer.addChild(g)
        parts.push({ g, ...p })
      }

      function spawnRainStar(w: number) {
        const size = 5 + Math.random() * 10
        const color = Math.random() < 0.75 ? GOLD : RED
        const g = new Graphics().star(0, 0, 5, size, size * 0.45).fill(color)
        g.x = Math.random() * w
        g.y = -20
        g.rotation = Math.random() * Math.PI
        addPart(g, {
          vx: (Math.random() - 0.5) * 40,
          vy: 70 + Math.random() * 130,
          vr: (Math.random() - 0.5) * 4,
          life: 30, // dör via nedre kanten
          maxLife: 30,
          grav: 60,
        })
      }

      // Stjärnexplosion – vid varje rätt svar! (registreras i fx.ts)
      function burst() {
        if (!app) return
        const w = app.screen.width
        const cx = w * (0.25 + Math.random() * 0.5)
        const cy = app.screen.height * (0.2 + Math.random() * 0.25)
        const n = 26
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + Math.random() * 0.3
          const speed = 130 + Math.random() * 200
          const size = 4 + Math.random() * 6
          const color = [GOLD, RED, WHITE][i % 3]
          const g = new Graphics().star(0, 0, 5, size, size * 0.45).fill(color)
          g.x = cx
          g.y = cy
          addPart(g, {
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            vr: (Math.random() - 0.5) * 8,
            life: 0.9 + Math.random() * 0.5,
            maxLife: 1.2,
            grav: 220,
          })
        }
      }

      // Stjärnfall: en ljus strimma som far diagonalt och lämnar spår
      function spawnShootingStar(w: number, h: number) {
        const g = new Graphics().circle(0, 0, 2.6).fill(WHITE)
        g.x = Math.random() * w * 0.8
        g.y = Math.random() * h * 0.3
        const speed = 520 + Math.random() * 260
        const ang = Math.PI * (0.12 + Math.random() * 0.12) // snett nedåt höger
        addPart(g, {
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          vr: 0,
          life: 0.7,
          maxLife: 0.7,
          grav: 0,
        })
      }

      // Komet: seglar långsamt förbi med glittersvans
      function spawnComet(w: number, h: number) {
        const c = new Text({ text: '☄️', style: { fontSize: 30 + Math.random() * 14 } })
        c.anchor.set(0.5)
        c.x = w + 40
        c.y = h * (0.08 + Math.random() * 0.3)
        c.alpha = 0.85
        addPart(c, {
          vx: -(50 + Math.random() * 40),
          vy: 14 + Math.random() * 12,
          vr: 0,
          life: 30,
          maxLife: 30,
          grav: 0,
        })
      }

      registerBurst(burst)

      let clock = 0
      let spawnDebt = 0
      let shootIn = 2.5 + Math.random() * 4 // första stjärnfallet kommer snart
      let cometIn = 9 + Math.random() * 14
      let streak = 1 // 1 = vanlig prick, högre = hyperrymdsstrimma

      app.ticker.add((ticker) => {
        if (!app) return
        const dt = ticker.deltaMS / 1000
        clock += dt
        const w = app.screen.width
        const h = app.screen.height
        const m = modeRef.current

        // Hyperrymd: mjuk övergång in/ut ur strimm-läget
        const targetStreak = m === 'travel' ? 9 : 1
        streak += (targetStreak - streak) * Math.min(1, dt * 6)
        const speedFactor = 1 + (streak - 1) * 5 // strimmigare = snabbare

        for (const s of stars) {
          s.x -= s.speed * dt * 0.6
          s.y += s.speed * dt * speedFactor
          if (s.y > h + 30) {
            s.y = -30
            s.x = Math.random() * w
          }
          if (s.x < -8) s.x = w + 8
          s.scale.y = streak
          // Blinka lugnt – men inte mitt i hyperrymden
          s.alpha =
            streak > 1.5
              ? s.baseAlpha
              : s.baseAlpha * (0.65 + 0.35 * Math.sin(clock * s.twSpeed + s.twPhase))
        }

        if (m === 'calm') {
          shootIn -= dt
          if (shootIn <= 0) {
            shootIn = 4 + Math.random() * 7
            spawnShootingStar(w, h)
          }
          cometIn -= dt
          if (cometIn <= 0) {
            cometIn = 16 + Math.random() * 22
            spawnComet(w, h)
          }
        }

        // Guldregn på resultatskärmen – tätt och festligt!
        if (m === 'cheer') {
          spawnDebt += dt * 44
          while (spawnDebt >= 1 && parts.length < 320) {
            spawnDebt -= 1
            spawnRainStar(w)
          }
        } else {
          spawnDebt = 0
        }

        // Uppdatera alla fria partiklar
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]
          p.life -= dt
          p.vy += p.grav * dt
          p.g.x += p.vx * dt
          p.g.y += p.vy * dt
          p.g.rotation += p.vr * dt
          // Stjärnfall och kometer lämnar glitterspår efter sig
          const isComet = p.g instanceof Text
          if (p.grav === 0 && (Math.abs(p.vx) > 220 || isComet) && Math.random() < (isComet ? 0.45 : 0.75)) {
            const t = new Graphics().circle(0, 0, isComet ? 1.9 : 1.6).fill(isComet || p.vx < 0 ? GOLD : WHITE)
            t.x = p.g.x + (isComet ? 12 : 0)
            t.y = p.g.y + (isComet ? 6 : 0)
            addPart(t, { vx: 0, vy: 8, vr: 0, life: isComet ? 0.8 : 0.4, maxLife: isComet ? 0.8 : 0.4, grav: 0 })
          }
          // Tona ut mot slutet av livet
          if (p.maxLife <= 2) p.g.alpha = Math.min(1, p.life / (p.maxLife * 0.5))
          if (p.life <= 0 || p.g.y > h + 40 || p.g.x < -60) {
            parts.splice(i, 1)
            p.g.destroy()
          }
        }
      })
    }

    boot()

    // Om WebGPU går sönder mitt i sessionen: riv och starta om på WebGL
    const offFallback = onRendererFallback(() => {
      if (disposed) return
      if (app) {
        app.destroy(true, { children: true, texture: true })
        app = null
      }
      document.body.classList.remove('gpu-stars')
      boot()
    })

    return () => {
      disposed = true
      offFallback()
      registerBurst(null)
      document.body.classList.remove('gpu-stars')
      if (app) {
        app.destroy(true, { children: true, texture: true })
        app = null
      }
    }
  }, [])

  return <div ref={holder} className="space-backdrop" aria-hidden="true" />
}
