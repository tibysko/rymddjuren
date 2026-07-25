import type { Progress } from './types'

export const PROGRESS_STORAGE_KEY = 'rymddjuren-progress'

export function emptyProgress(): Progress {
  return { stars: {}, animals: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function planetId(value: unknown, levelCount: number): number | null {
  const id = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(id) && id >= 1 && id <= levelCount ? id : null
}

/**
 * Keep a save usable even when it was written by an older build, edited by
 * hand, or only partly made it to localStorage. The game only ever awards
 * zero to three stars and has one animal per planet.
 */
export function normalizeProgress(value: unknown, levelCount: number): Progress {
  if (!isRecord(value)) return emptyProgress()

  const stars: Record<number, number> = {}
  if (isRecord(value.stars)) {
    for (const [rawId, rawStars] of Object.entries(value.stars)) {
      const id = planetId(rawId, levelCount)
      if (id === null || typeof rawStars !== 'number' || !Number.isFinite(rawStars)) continue
      const count = Math.max(0, Math.min(3, Math.floor(rawStars)))
      if (count > 0) stars[id] = count
    }
  }

  const animals: number[] = []
  if (Array.isArray(value.animals)) {
    for (const rawId of value.animals) {
      // JSON object keys are strings, but the animal list is an actual list of
      // planet ids. Do not silently turn arbitrary text into collected animals.
      const id = typeof rawId === 'number' ? planetId(rawId, levelCount) : null
      if (id !== null && !animals.includes(id)) animals.push(id)
    }
  }

  return { stars, animals }
}

/** Parse a persisted value without letting malformed JSON reach the app. */
export function parseProgress(raw: string | null, levelCount: number): Progress {
  if (!raw) return emptyProgress()
  try {
    return normalizeProgress(JSON.parse(raw), levelCount)
  } catch {
    return emptyProgress()
  }
}
