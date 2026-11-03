// WHERE THE MODEL LIES AND WHETHER IT IS THE PINNED ONE (node step 626-2). The model folder is the element's data folder at the node
// (`SERVICE_DATA_DIR/model`, absolute, outside the build and the clone — a rebuild or a reinstall does not download it again). The
// loader and `npm run model` check the same way: the size, then the sha256 of every file — a broken or replaced file is named, and the
// model is never loaded from it.
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { FILES } from './manifest.mjs'

/** `SERVICE_DATA_DIR` from the environment, or from this element's `.env.local` (an npm script does not read it by itself). */
function serviceDataDir(elementDir) {
  if (process.env.SERVICE_DATA_DIR?.trim()) return process.env.SERVICE_DATA_DIR.trim()
  try {
    const m = readFileSync(join(elementDir, '.env.local'), 'utf8').replace(/^﻿/, '').match(/^SERVICE_DATA_DIR=(.*)$/m)
    const v = m?.[1].trim().replace(/^["']|["']$/g, '')
    if (v) return v
  } catch { /* no .env.local — a developer's folder */ }
  return null
}

/** The model folder: the node's data folder of this element. Without a node (a developer's folder) — the user's cache, never inside
 *  the element: the build's scanners walk the element's tree, and the tokenizer's 17 MB of control characters would stop them. */
export function modelDir(elementDir = process.env.ELEMENT_DIR?.trim() || process.cwd()) {
  const data = serviceDataDir(elementDir)
  if (data) return join(data, 'model')
  return join(process.env.LOCALAPPDATA?.trim() || join(homedir(), '.cache'), 'fractera-embeddings', 'model')
}

export function sha256Of(file) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256')
    createReadStream(file).on('error', reject).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex')))
  })
}

/** Windows: the runtime's DLLs import the Microsoft Visual C++ 2015–2022 runtime (read from the import table of onnxruntime.dll and
 *  onnxruntime_binding.node 1.21.0, 2026-11-03) — a clean Windows may lack it, and the load then fails with a bare «The specified
 *  module could not be found». The missing ones are named so the failed load can say what to install; elsewhere — []. */
export function windowsRuntimeMissing() {
  if (process.platform !== 'win32') return []
  const system = join(process.env.SystemRoot || 'C:\\Windows', 'System32')
  return ['vcruntime140.dll', 'vcruntime140_1.dll', 'msvcp140.dll', 'msvcp140_1.dll'].filter((f) => !existsSync(join(system, f)))
}

/** Every pinned file present with its size and sha256 → { ok: true }; otherwise the files that are missing or wrong, with why. */
export async function checkModel(dir) {
  const wrong = []
  for (const f of FILES) {
    const file = join(dir, f.path)
    if (!existsSync(file)) { wrong.push({ path: f.path, reason: 'missing' }); continue }
    const size = statSync(file).size
    if (size !== f.bytes) { wrong.push({ path: f.path, reason: `${size} bytes, the pinned file has ${f.bytes}` }); continue }
    const sha = await sha256Of(file)
    if (sha !== f.sha256) wrong.push({ path: f.path, reason: `sha256 ${sha.slice(0, 12)}…, the pinned file ${f.sha256.slice(0, 12)}…` })
  }
  return wrong.length ? { ok: false, wrong } : { ok: true }
}
