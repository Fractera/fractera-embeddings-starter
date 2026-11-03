// Samples of the door embed-status (`npm run test:embed-status`): exit code 1 on any miss.
// 626-2: before any load the status names the model and says «not ready»; after a load it is ready (needs `npm run model`).
import { handle } from './embed-status.mjs'
import { startModel } from '../../../lib/embed/model.mjs'

let failures = 0
const check = (label, ok, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
}

const before = (await handle({})).body
check('before the load: the model named, not ready', before.model === 'paraphrase-multilingual-MiniLM-L12-v2' && before.dims === 384 && before.ready === false && before.status === 'idle', JSON.stringify(before))
await startModel()
const after = (await handle({})).body
check('after the load: ready, the load time and the memory named', after.ready === true && after.loadedMs > 0 && after.rssMb > 0, JSON.stringify(after))

// No process.exit() once the model is loaded (lib/embed/model.mjs); the loop ends by itself.
if (failures) { console.error(`===TEST_EMBED_STATUS_FAILED=== ${failures}`); process.exitCode = 1 } else console.log('===TEST_EMBED_STATUS_OK===')
