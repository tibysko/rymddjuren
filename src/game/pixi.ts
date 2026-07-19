// Delad PixiJS-hjälpare. Pixi v8 väljer WebGPU där det finns och faller
// automatiskt tillbaka till WebGL annars. Om ingen av dem fungerar (mycket
// gammal webbläsare) returnerar vi null – spelet fungerar då precis som förut,
// canvas-lagren är ren glasyr.

import { Application, Container, Graphics, Text } from 'pixi.js'
import type { ApplicationOptions } from 'pixi.js'

let loggedRenderer = false

// Om WebGPU visar sig trasigt minns vi det – i sessionen OCH i localStorage,
// så att spelet startar direkt på WebGL nästa gång. Går att styra för hand
// med ?renderer=webgl eller ?renderer=webgpu i adressraden.
const RENDERER_KEY = 'rymddjuren-renderer'

function rendererOverride(): 'webgl' | 'webgpu' | null {
  try {
    const p = new URLSearchParams(location.search).get('renderer')
    return p === 'webgl' || p === 'webgpu' ? p : null
  } catch {
    return null
  }
}

let webgpuBroken = (() => {
  const forced = rendererOverride()
  if (forced === 'webgpu') {
    try {
      localStorage.removeItem(RENDERER_KEY) // ge WebGPU en ny chans
    } catch {
      /* ok */
    }
    return false
  }
  if (forced === 'webgl') return true
  try {
    return localStorage.getItem(RENDERER_KEY) === 'webgl'
  } catch {
    return false
  }
})()

// Lyssnare som vill veta när vi ger upp WebGPU mitt i en session
// (t.ex. bakgrunden, som lever länge och behöver starta om sig på WebGL)
type FallbackCb = () => void
const fallbackCbs = new Set<FallbackCb>()

export function onRendererFallback(cb: FallbackCb): () => void {
  fallbackCbs.add(cb)
  return () => {
    fallbackCbs.delete(cb)
  }
}

function markWebgpuBroken(notify = false) {
  webgpuBroken = true
  try {
    localStorage.setItem(RENDERER_KEY, 'webgl')
  } catch {
    /* ok */
  }
  if (notify) {
    webgpuActive = false // larma bara en gång
    fallbackCbs.forEach((cb) => cb())
  }
}

// Vissa WebGPU-fel dyker upp först mitt under en senare rendering och går
// inte att fånga vid init. Vakten: första okontrollerade GPU-felet →
// WebGL från och med nästa scen (scenerna monteras om per fråga, så spelet
// läker sig självt inom en fråga – och helt vid nästa start).
let webgpuActive = false
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (webgpuActive && /GPU/i.test(String(e.message))) markWebgpuBroken(true)
  })
  window.addEventListener('unhandledrejection', (e) => {
    if (webgpuActive && /GPU/i.test(String(e.reason))) markWebgpuBroken(true)
  })
}

async function tryInit(
  preference: 'webgpu' | 'webgl',
  options: Partial<ApplicationOptions>,
): Promise<Application> {
  const app = new Application()
  await app.init({
    preference,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoDensity: true,
    ...options,
  })
  // Kanariefågeln: rendera EN provbild innan vi litar på renderaren.
  // Vissa WebGPU-miljöer klarar init men kraschar först vid riktig rendering
  // (texturuppladdning eller buffertar) – då vill vi upptäcka det direkt och
  // byta till WebGL, inte lämna barnet med en tom bana. Provet härmar därför
  // spelets verkliga last: stora emoji-texter + lika mycket geometri som
  // stjärnfältet. (Canvasen sitter inte i DOM än, så inget syns.)
  try {
    const probe = new Container()
    probe.addChild(new Text({ text: '🐰🍌🐵', style: { fontSize: 48 } }))
    const g = new Graphics()
    for (let i = 0; i < 300; i++) {
      g.circle((i % 20) * 8, Math.floor(i / 20) * 8, 3).fill(0xffffff)
    }
    probe.addChild(g)
    app.stage.addChild(probe)
    app.render()
    probe.destroy({ children: true })
    return app
  } catch (err) {
    app.destroy(true, { children: true, texture: true })
    throw err
  }
}

export async function createPixiApp(
  options: Partial<ApplicationOptions>,
): Promise<Application | null> {
  let app: Application | null = null
  if (!webgpuBroken) {
    try {
      // 'webgpu' = WebGPU där det finns; Pixi väljer själv WebGL annars
      app = await tryInit('webgpu', options)
      if (app.renderer.type === 2) webgpuActive = true
    } catch {
      markWebgpuBroken()
    }
  }
  if (!app) {
    try {
      app = await tryInit('webgl', options)
    } catch {
      return null
    }
  }
  if (!loggedRenderer) {
    loggedRenderer = true
    // 1 = WebGL, 2 = WebGPU (RendererType i Pixi v8)
    console.info(`Rymddjuren: ritar med ${app.renderer.type === 2 ? 'WebGPU ✨' : 'WebGL'}`)
  }
  return app
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
