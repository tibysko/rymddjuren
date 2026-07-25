// Shared PixiJS helper. Pixi v8 picks WebGPU where it exists and falls back
// to WebGL automatically otherwise. If neither works (very old browser) we
// return null – the game then works exactly as before, the canvas layers are
// pure icing.

import { Application, Container, Graphics, Text } from 'pixi.js'
import type { ApplicationOptions } from 'pixi.js'

let loggedRenderer = false

// If WebGPU turns out to be broken we remember it – for the session AND in
// localStorage, so the game starts straight on WebGL next time. Can be forced
// by hand with ?renderer=webgl or ?renderer=webgpu in the address bar.
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
      localStorage.removeItem(RENDERER_KEY) // give WebGPU another chance
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

// Listeners that want to know when we give up on WebGPU mid-session
// (e.g. the backdrop, which is long-lived and needs to restart on WebGL)
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
    webgpuActive = false // only raise the alarm once
    fallbackCbs.forEach((cb) => cb())
  }
}

// Some WebGPU errors only show up in the middle of a later render and cannot
// be caught at init. The guard: the first uncaught GPU error → WebGL from the
// next scene onwards (scenes remount per question, so the game heals itself
// within a question – and completely on the next start).
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
  // The canary: render ONE probe frame before we trust the renderer.
  // Some WebGPU environments survive init but crash on the first real render
  // (texture upload or buffers) – we want to catch that right away and switch
  // to WebGL rather than leaving the child with an empty level. The probe
  // therefore mimics the game's real load: large emoji text + as much geometry
  // as the starfield. (The canvas is not in the DOM yet, so nothing shows.)
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
      // 'webgpu' = WebGPU where available; Pixi picks WebGL on its own otherwise
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
    // 1 = WebGL, 2 = WebGPU (RendererType in Pixi v8)
    console.info(`Rymddjuren: drawing with ${app.renderer.type === 2 ? 'WebGPU ✨' : 'WebGL'}`)
  }
  return app
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
