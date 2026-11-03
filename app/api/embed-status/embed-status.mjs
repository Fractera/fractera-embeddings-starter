// The work of the door GET /api/embed-status: Tells which model counts vectors, its size and readiness.
// Gets the query parameters, returns { status, body }. Pure: no request, no key — route.ts does that.
// 626-2: { model, dims, ready, status, loadedMs, rssMb, calls } — `calls` counts the texts embedded since the start (627-3 reads it);
// a failed load names its reason in `error`. Always 200: the answer itself says whether the model is ready.
import { modelStatus } from '../../../lib/embed/model.mjs'

export async function handle(_input) {
  return { status: 200, body: modelStatus() }
}
