// Simple tones using the browser's built-in WebAudio – no dependencies.
// Sound is icing, not cake: everything must work just as well without it.

let ctx: AudioContext | null = null

export function playTone(freq: number, ms = 200): void {
  try {
    ctx ??= new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + ms / 1000)
  } catch {
    // no AudioContext (or it is blocked) – silence is fine too
  }
}

/** Every pattern colour has its own tone – so the pattern is HEARD as a melody */
const PATTERN_TONES: Record<string, number> = {
  '🔴': 262, // C
  '🟡': 330, // E
  '🔵': 392, // G
  '🟢': 523, // high C
}

export function playPatternTone(emoji: string): void {
  const freq = PATTERN_TONES[emoji]
  if (freq) playTone(freq)
}
