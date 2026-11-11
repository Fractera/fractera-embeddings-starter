import reference from "@/lib/embed/reference-626-1.json"
import { H2, P, Small } from "@/components/ui/typography"
import { inline } from "@/lib/content/inline"
import type { PageItem } from "@/lib/content/page-items"
import { cn } from "@/lib/utils"
import type { Section } from "./words"

// THE PAGE'S ONE AUTHORED PICTURE: real vectors, not an illustration. The texts named by the section's `text-list` are looked up in
// the 626-1 reference this element tests itself against (`lib/embed/reference-626-1.json`), and each is drawn as its 384 numbers —
// one bar a number, up for positive, down for negative. Next to every row after the first: its cosine with the first row, counted
// here from the same numbers. A text missing from the reference is simply not drawn.
type Of<K extends PageItem["kind"]> = PageItem & { kind: K }
const first = <K extends PageItem["kind"]>(s: Section, kind: K) => s.body.find((b): b is Of<K> => b.kind === kind)

const W = 384
const H = 56
const MID = H / 2

const vectorOf = (text: string): number[] | null => {
  const i = reference.texts.indexOf(text)
  return i >= 0 ? reference.vectors[i] : null
}
const cosine = (a: number[], b: number[]) => {
  let d = 0, x = 0, y = 0
  for (let i = 0; i < a.length; i += 1) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i] }
  return d / Math.sqrt(x * y)
}
/** One path for the bars of one sign, so 384 numbers stay two short strings; a bar taller than the strip stops at its edge. */
const bars = (v: number[], scale: number, sign: 1 | -1) =>
  v.reduce((d, n, i) => (n * sign > 0 ? `${d}M${i + 0.5} ${MID}V${Math.min(H - 1, Math.max(1, MID - n * scale)).toFixed(2)}` : d), "")

export function VectorView({ section, wrap }: { section: Section; wrap: string }) {
  const lead = first(section, "text-p")
  const note = first(section, "text-small")
  const rows = (first(section, "text-list")?.items ?? [])
    .map((text) => ({ text, v: vectorOf(text) }))
    .filter((r): r is { text: string; v: number[] } => r.v !== null)
  // The scale is the 98th percentile of the magnitudes, not the largest one: MiniLM has a few outlier numbers (one is 0.53 where most
  // stay under 0.1), and scaling by them flattened the other 383 bars into a line — the shape that shows two texts agree was lost.
  const mags = rows.flatMap((r) => r.v.map(Math.abs)).sort((a, b) => a - b)
  const top = Math.max(mags[Math.floor(mags.length * 0.98)] ?? 0, 0.01)
  const scale = (MID - 2) / top
  return (
    <section data-block="huqkv" id={section.id} className="scroll-mt-20 border-y border-border bg-muted/40">
      <div data-block="miu70" className={cn(wrap, "grid gap-10 py-16 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-16 md:py-24")}>
        <div data-block="e5csa" className="flex flex-col gap-5">
          <H2 data-block="pjf1i" className="text-balance">{section.title}</H2>
          {lead && <P data-block="qogpq" className="text-pretty">{inline(lead.text, "vector-lead")}</P>}
        </div>
        <figure data-block="f68q6" className="flex min-w-0 flex-col gap-6">
          {rows.map((r, i) => {
            const cos = i > 0 ? cosine(rows[0].v, r.v) : 1
            const close = cos > 0.5
            return (
              <div data-block="djb64" key={r.text} className="flex min-w-0 flex-col gap-2">
                <div data-block="kgsqm" className="flex items-baseline justify-between gap-4">
                  <span className="truncate font-medium text-foreground">{r.text}</span>
                  {i > 0 && <span className={cn("shrink-0 tabular-nums", close ? "text-primary" : "text-muted-foreground")}>{cos.toFixed(3)}</span>}
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={r.text} className="h-14 w-full overflow-visible">
                  <line x1="0" x2={W} y1={MID} y2={MID} className="stroke-border" strokeWidth="0.5" />
                  <path d={bars(r.v, scale, 1)} className={close ? "stroke-primary" : "stroke-muted-foreground"} strokeWidth="0.7" />
                  <path d={bars(r.v, scale, -1)} className="stroke-muted-foreground/70" strokeWidth="0.7" />
                </svg>
              </div>
            )
          })}
          {note && <Small data-block="r7ney" className="text-pretty">{inline(note.text, "vector-note")}</Small>}
        </figure>
      </div>
    </section>
  )
}
