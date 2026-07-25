import { access, mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { sv } from '../src/i18n/sv.ts'

const API_URL = 'https://api.openai.com/v1/audio/speech'
const SUPPORTED_FORMATS = new Set(['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'])

// Keep the asset names here, but keep every spoken Swedish string in sv.ts.
// These are reusable, fixed lines; dynamic question text remains browser speech
// until prerecorded speech is deliberately integrated into the game.
const speechAssets = [
  { name: 'map/greeting', text: sv.map.greeting },
  { name: 'station/empty', text: sv.station.empty },
  { name: 'station/full', text: sv.station.ugglisFull },
  { name: 'station/tap-hint', text: sv.station.tapHint },
  ...Object.entries(sv.station.riddles).map(([id, text]) => ({
    name: `station/riddle-${id}`,
    text,
  })),
  { name: 'result/praise', text: sv.result.praise },
  ...sv.level.cheers.map((text, index) => ({
    name: `feedback/cheer-${index + 1}`,
    text,
  })),
  ...sv.level.tryAgain.map((text, index) => ({
    name: `feedback/try-again-${index + 1}`,
    text,
  })),
  ...Object.entries(sv.planets).map(([id, planet]) => ({
    name: `animals/animal-${id}`,
    text: planet.animalName,
  })),
]

function optionValue(args, name, fallback) {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} needs a value`)
  }
  return value
}

function hasFlag(args, name) {
  return args.includes(name)
}

function printHelp() {
  console.log(`Generate fixed Swedish speech assets with the OpenAI Speech API.

Usage:
  npm run generate:speech
  npm run generate:speech -- --dry-run
  npm run generate:speech -- --force --format wav

Options:
  --out-dir <path>  Output directory (default: generated-speech)
  --model <id>      Speech model (default: OPENAI_TTS_MODEL or tts-1-hd)
  --voice <name>    Voice (default: OPENAI_TTS_VOICE or nova)
  --format <format> mp3, opus, aac, flac, wav, or pcm (default: mp3)
  --speed <number>  Speaking speed from 0.25 to 4.0 (default: 1)
  --only <prefix>   Generate only asset names with this prefix
  --name <path>     Output name for one ad hoc pronunciation test
  --text <text>     Text for one ad hoc pronunciation test
  --force           Replace files that already exist
  --dry-run         List files without calling the API
  --help            Show this help

Environment:
  OPENAI_API_KEY is required unless --dry-run is used.`)
}

async function fileExists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function generateSpeech({ apiKey, model, voice, format, speed, text }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: format,
      speed,
    }),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    const details = (await response.text()).slice(0, 1_000)
    throw new Error(`OpenAI returned ${response.status}: ${details}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function main() {
  const args = process.argv.slice(2)
  if (hasFlag(args, '--help')) {
    printHelp()
    return
  }

  const outputDir = path.resolve(optionValue(args, '--out-dir', 'generated-speech'))
  const model = optionValue(args, '--model', process.env.OPENAI_TTS_MODEL || 'tts-1-hd')
  const voice = optionValue(args, '--voice', process.env.OPENAI_TTS_VOICE || 'nova')
  const format = optionValue(args, '--format', 'mp3').toLowerCase()
  const speed = Number(optionValue(args, '--speed', '1'))
  const only = optionValue(args, '--only', '')
  const customName = optionValue(args, '--name', '')
  const customText = optionValue(args, '--text', '')
  const force = hasFlag(args, '--force')
  const dryRun = hasFlag(args, '--dry-run')

  if (!SUPPORTED_FORMATS.has(format)) {
    throw new Error(`Unsupported format: ${format}`)
  }

  if (!Number.isFinite(speed) || speed < 0.25 || speed > 4) {
    throw new Error('Speed must be a number from 0.25 to 4.0')
  }

  if (Boolean(customName) !== Boolean(customText)) {
    throw new Error('--name and --text must be used together')
  }

  if (customName && !/^[a-z0-9][a-z0-9/_-]*$/.test(customName)) {
    throw new Error('--name may only contain lowercase letters, numbers, /, _ and -')
  }

  if (customName && only) {
    throw new Error('--only cannot be combined with --name and --text')
  }

  const availableAssets = customName
    ? [{ name: customName, text: customText }]
    : speechAssets
  const selectedAssets = only
    ? availableAssets.filter((asset) => asset.name.startsWith(only))
    : availableAssets

  if (selectedAssets.length === 0) {
    throw new Error(`No speech assets match prefix: ${only}`)
  }

  if (!dryRun && !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  console.log(`Model: ${model}`)
  console.log(`Voice: ${voice}`)
  console.log(`Format: ${format}`)
  console.log(`Speed: ${speed}`)
  console.log(`Output: ${outputDir}`)
  console.log(`Assets: ${selectedAssets.length}`)

  let generated = 0
  let skipped = 0
  let planned = 0

  for (const asset of selectedAssets) {
    const outputFile = path.join(outputDir, `${asset.name}.${format}`)

    if (!force && (await fileExists(outputFile))) {
      console.log(`skip     ${path.relative(process.cwd(), outputFile)}`)
      skipped += 1
      continue
    }

    if (dryRun) {
      console.log(`generate ${path.relative(process.cwd(), outputFile)}: ${asset.text}`)
      planned += 1
      continue
    }

    await mkdir(path.dirname(outputFile), { recursive: true })
    const temporaryFile = `${outputFile}.tmp-${process.pid}`

    try {
      const audio = await generateSpeech({
        apiKey: process.env.OPENAI_API_KEY,
        model,
        voice,
        format,
        speed,
        text: asset.text,
      })
      await writeFile(temporaryFile, audio, { flag: 'wx' })
      await rename(temporaryFile, outputFile)
      console.log(`generated ${path.relative(process.cwd(), outputFile)}`)
      generated += 1
    } catch (error) {
      await unlink(temporaryFile).catch(() => {})
      throw error
    }
  }

  if (dryRun) {
    console.log(`Dry run: ${planned} files would be generated, ${skipped} skipped.`)
  } else {
    console.log(`Done: ${generated} generated, ${skipped} skipped.`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
