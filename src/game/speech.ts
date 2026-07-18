// Uppläsning med svensk talsyntes (om webbläsaren stödjer det)

export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'sv-SE'
  u.rate = 0.9
  const voices = window.speechSynthesis.getVoices()
  const sv = voices.find((v) => v.lang.startsWith('sv'))
  if (sv) u.voice = sv
  window.speechSynthesis.speak(u)
}
