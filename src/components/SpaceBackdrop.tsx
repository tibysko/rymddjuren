// Effektlagret: en helskärms-canvas BAKOM spelet (pointer-events: none).
// Ritar ett långsamt drivande stjärnfält i tre parallaxlager, och vid
// "cheer" (resultatskärmen) regnar guld- och rödstjärnor – spelarens färger!
//
// Viktigt: lagret är ren dekoration. Ingen mekanik, inga knappar, ingen
// information som behövs för att lösa uppgifterna får bo här. Saknas
// WebGPU/WebGL, eller vill spelaren ha mindre rörelse (prefers-reduced-motion),
// renderas ingenting – CSS-bakgrunden finns kvar precis som förut.

import { useEffect, useRef } from 'react'
import { Container, Graphics } from 'pixi.js'
import type { Application } from 'pixi.js'
import { createPixiApp, onRendererFallback, prefersReducedMotion } from '../game/pixi'

export type BackdropMode = 'calm' | 'cheer'

// OBS: vi ritar med Graphics direkt (inte generateTexture/Sprite) – det är
// samma väg som hoppbanan använder och den fungerar pålitligt i både
// WebGPU och WebGL. Pixi batchar ändå, så några hundra objekt är billigt.

interface StarG extends Graphics {
  speed: number
}

interface RainG extends Graphics {
  vx: number
  vy: number
  vr: number
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
        s.alpha = [0.35, 0.55, 0.85][layer]
        s.speed = [4, 9, 16][layer] * (0.8 + Math.random() * 0.4)
        stars.push(s)
        field.addChild(s)
      }

      // --- Guldregnet (cheer): spawnas löpande så länge läget är 'cheer' ---
      const rainLayer = new Container()
      app.stage.addChild(rainLayer)
      const rain: RainG[] = []
      let spawnDebt = 0

      app.ticker.add((ticker) => {
        if (!app) return
        const dt = ticker.deltaMS / 1000
        const w = app.screen.width
        const h = app.screen.height

        // Stjärnfältet driver sakta nedåt vänster och wrappar runt
        for (const s of stars) {
          s.x -= s.speed * dt * 0.6
          s.y += s.speed * dt
          if (s.y > h + 8) {
            s.y = -8
            s.x = Math.random() * w
          }
          if (s.x < -8) s.x = w + 8
        }

        // Guldregn
        if (modeRef.current === 'cheer') {
          spawnDebt += dt * 26 // stjärnor per sekund
          while (spawnDebt >= 1 && rain.length < 220) {
            spawnDebt -= 1
            const size = 5 + Math.random() * 9
            const color = Math.random() < 0.75 ? GOLD : RED
            const p = new Graphics().star(0, 0, 5, size, size * 0.45).fill(color) as RainG
            p.x = Math.random() * w
            p.y = -20
            p.rotation = Math.random() * Math.PI
            p.vx = (Math.random() - 0.5) * 40
            p.vy = 70 + Math.random() * 120
            p.vr = (Math.random() - 0.5) * 4
            rain.push(p)
            rainLayer.addChild(p)
          }
        } else {
          spawnDebt = 0
        }
        for (let i = rain.length - 1; i >= 0; i--) {
          const p = rain[i]
          p.vy += 60 * dt // mild gravitation
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.rotation += p.vr * dt
          if (p.y > h + 30) {
            rain.splice(i, 1)
            p.destroy()
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
      document.body.classList.remove('gpu-stars')
      if (app) {
        app.destroy(true, { children: true, texture: true })
        app = null
      }
    }
  }, [])

  return <div ref={holder} className="space-backdrop" aria-hidden="true" />
}
