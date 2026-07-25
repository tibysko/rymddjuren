// Reading out loud with speech synthesis (when the browser supports it)

import { SPEECH_LANG } from '../i18n/sv'

export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = SPEECH_LANG
  u.rate = 0.9
  // Prefer a voice in the game language; otherwise the browser default is used
  const prefix = SPEECH_LANG.split('-')[0]
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find((v) => v.lang.startsWith(prefix))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}
