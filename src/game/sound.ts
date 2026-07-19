// Enkla toner med webbläsarens inbyggda WebAudio – inga beroenden.
// Ljudet är grädde, inte kaka: allt ska funka precis lika bra utan.

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
    // ingen AudioContext (eller blockerad) – tyst är också okej
  }
}

/** Varje mönsterfärg har en egen ton – så mönstret HÖRS som en melodi */
const PATTERN_TONES: Record<string, number> = {
  '🔴': 262, // C
  '🟡': 330, // E
  '🔵': 392, // G
  '🟢': 523, // hög C
}

export function playPatternTone(emoji: string): void {
  const freq = PATTERN_TONES[emoji]
  if (freq) playTone(freq)
}
