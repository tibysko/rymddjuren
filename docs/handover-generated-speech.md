# Handover: generated Swedish speech assets

Date: 2026-07-25

## Status

Paused at the owner's request. The asset generator and pronunciation experiments
exist, but **no generated audio is integrated into the game**. Do not wire these
files into components until the owner explicitly resumes this work.

The repository already had unrelated uncommitted work before this task. Preserve
it. In particular, do not overwrite the existing `docs/handover-speech.md`; that
file covers the separate browser speech-synthesis UI task.

## What was added

- `npm run generate:speech` in `package.json`.
- `scripts/generate-speech.mjs`, using Node's built-in `fetch` and filesystem
  APIs. No dependency was added for speech generation.
- A README section describing offline speech generation.
- A DESIGN.md note stating that prerecorded files are not integrated yet.

The generator calls `POST https://api.openai.com/v1/audio/speech` and reads the
API key only from `OPENAI_API_KEY`. The key is never written to disk or sent to
the browser.

Default settings:

- model: `tts-1-hd`
- voice: `nova`
- format: `mp3`
- speed: `1`
- output: `generated-speech/`

Supported command options:

- `--out-dir <path>`
- `--model <id>`
- `--voice <name>`
- `--format mp3|opus|aac|flac|wav|pcm`
- `--speed <0.25..4>`
- `--only <asset-prefix>`
- `--name <safe-output-name>` together with `--text <ad-hoc-text>`
- `--force`
- `--dry-run`

Run `npm run generate:speech -- --help` for the current help text.

## Language-source rule

The normal batch contains 33 fixed assets and obtains all production Swedish
text from `src/i18n/sv.ts`. It includes the map greeting, station lines and
riddles, result praise, correct/second-chance feedback, and animal names.

The `--name` plus `--text` mode exists only for ad-hoc pronunciation experiments.
Production text must still live in `sv.ts`, per the repository's language rule.

## Generated experiments

All generated files are currently untracked under `generated-speech/`. They are
valid 16-bit mono PCM WAV files at 24 kHz. Do not delete or commit them without
confirming the desired asset policy with the owner.

### Voice comparison

Five feedback lines were generated at speed `0.9` with:

- `nova`
- `shimmer`
- `coral`

Paths:

```text
generated-speech/voice-tests/<voice>/feedback/cheer-1.wav
...
generated-speech/voice-tests/<voice>/feedback/cheer-5.wav
```

The owner listened and reported that **Nova and Coral sound good**. Shimmer was
not selected as a finalist.

Attempts to use `marin` and `cedar` with `tts-1-hd` returned HTTP 400. The live
API response listed these supported voices for that model: `nova`, `shimmer`,
`echo`, `onyx`, `fable`, `alloy`, `ash`, `sage`, and `coral`. No WAV files were
created for Marin or Cedar.

### Harder Swedish words and riddles

Nova and Coral each generated these six matching tests at speed `0.9`:

- animal 2: `Rymdsköldpadda`
- animal 4: `Stjärnpapegoja`
- animal 6: `Stjärnräv`
- station riddles 2, 4, and 10

Paths:

```text
generated-speech/voice-tests/<voice>/animals/
generated-speech/voice-tests/<voice>/station/
```

Owner feedback:

- `Rymdsköldpadda` sounded bad with both Nova and Coral.
- The tested riddle sounded good with both voices.

This indicates a word/compound-pronunciation problem rather than a general voice
quality problem.

### Rymdsköldpadda pronunciation variants

Three variants were generated with both Nova and Coral:

```text
Rymd-sköldpadda
Rymd sköldpadda
Rymd, sköldpadda
```

Paths:

```text
generated-speech/voice-tests/<voice>/pronunciation/animal-2-hyphen.wav
generated-speech/voice-tests/<voice>/pronunciation/animal-2-space.wav
generated-speech/voice-tests/<voice>/pronunciation/animal-2-pause.wav
```

The owner has not yet reported which, if any, of these six files sounds correct.

## Research findings

OpenAI's documented Speech endpoint exposes text, model, voice, instructions,
format, speed, and streaming options. It does **not** document SSML, IPA/phoneme
input, or a pronunciation lexicon:

- https://developers.openai.com/api/reference/resources/audio/subresources/speech/methods/create
- https://developers.openai.com/api/docs/guides/text-to-speech

Important model differences:

- `tts-1-hd` is quality-oriented but does not support the `instructions` field.
- The TTS guide says `gpt-4o-mini-tts` supports prompting for accent,
  intonation, speed, and tone.
- Current OpenAI documentation is inconsistent: the TTS guide calls
  `gpt-4o-mini-tts` the newest/reliable option, while the model catalog labels
  it deprecated. The Speech API reference still accepts both
  `gpt-4o-mini-tts` and the pinned `gpt-4o-mini-tts-2025-12-15` snapshot.
- OpenAI states that built-in voices are optimized for English even though
  Swedish input is supported. Swedish pronunciation therefore requires
  listening tests.

## Recommended continuation

1. First collect the owner's verdict on the six `Rymdsköldpadda` variants.
2. Keep visible text and spoken text separate in `src/i18n/sv.ts`, for example
   `animalName` and an optional `spokenAnimalName`. Never distort the visible
   Swedish spelling to fix TTS.
3. If punctuation/spacing is insufficient, test the word in a natural full
   sentence rather than in isolation.
4. Optionally run a small, static-asset-only experiment with the pinned
   `gpt-4o-mini-tts-2025-12-15` model and an instruction such as: pronounce the
   Swedish compound as `rymd` plus `sköldpadda`, with natural compound stress and
   no pause. Do not make the runtime depend on this model.
5. If exact pronunciation still fails, use a human-recorded clip or a provider
   with explicit phoneme/SSML support for that word.
6. Choose Nova or Coral only after testing the remaining difficult Swedish
   names. Generate the full bank once, review it manually, and keep approved
   static files stable.
7. Treat game integration as a separate task. Retain browser speech synthesis
   as the accessibility fallback unless a later design explicitly replaces it.

## Useful commands

Dry-run the normal batch:

```bash
npm run generate:speech -- --dry-run
```

Generate only feedback as WAV with slower speech:

```bash
npm run generate:speech -- \
  --format wav \
  --speed 0.9 \
  --voice coral \
  --only feedback/cheer- \
  --out-dir generated-speech/coral
```

Generate one pronunciation test:

```bash
npm run generate:speech -- \
  --format wav \
  --speed 0.9 \
  --voice nova \
  --name pronunciation/example \
  --text "<temporary pronunciation text>" \
  --out-dir generated-speech/voice-tests/nova
```

## Verification already completed

- `npm run generate:speech -- --dry-run`
- `npm run generate:speech -- --help`
- `npm run build`
- `git diff --check`
- WAV headers checked with `file`; generated WAVs were 16-bit mono PCM at
  24 kHz.

No automated browser test was needed because no game runtime or UI integration
was changed.
