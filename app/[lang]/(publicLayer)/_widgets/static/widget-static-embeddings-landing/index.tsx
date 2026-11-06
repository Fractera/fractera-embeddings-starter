import { Binary, Boxes, Check, CornerDownLeft, Cpu, KeyRound, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { H1, H2, H3, Lead, P, Small } from "@/components/ui/typography"
import { inline } from "@/lib/blocks/inline"
import { renderBlocks } from "@/lib/content/blocks/registry"
import type { Block } from "@/lib/content/blocks/types"
import { TEXT_SET } from "@/lib/content/text-set"
import { cn } from "@/lib/utils"
import { VectorView } from "./vector"
import { landing, type Hero, type Section } from "./words"

// THE HOME PAGE OF THE EMBEDDINGS ELEMENT (node step 626, the owner 2026-11-03: «Да, по образцу vectors»; «for landing for embending
// call imcabale scill and check stripe landing»). Built like the Stripe element's landing (step 573-7): the words are the page's data
// blocks (`words.ts`), a section is a `block-section-head` and the blocks up to the next, its look is chosen by its `id`, and an
// unknown `id` gets the element's typography — a new section in the data needs no code. The look is Design tokens, shadcn and the
// typography only (skill impeccable, the «Launcher unavailable» path); one motion — the route on the first screen; one authored
// picture — real vectors (`vector.tsx`).

type Of<K extends Block["kind"]> = Block & { kind: K }
const first = <K extends Block["kind"]>(s: Section, kind: K) => s.blocks.find((b): b is Of<K> => b.kind === kind)
const all = <K extends Block["kind"]>(s: Section, kind: K) => s.blocks.filter((b): b is Of<K> => b.kind === kind)

const WRAP = "mx-auto w-full max-w-6xl px-6"
const ROUTE_ICONS = [Boxes, KeyRound, Cpu, Binary]

export function EmbeddingsLanding({ lang }: { lang: string }) {
  const { hero, sections } = landing(lang)
  const route = sections.find((s) => s.id === "route")
  return (
    <div data-block="pybdv" className="bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {hero && <HeroView hero={hero} route={route} />}
      {sections.filter((s) => s !== route).map((s) => <SectionView key={s.id} section={s} />)}
    </div>
  )
}

function SectionView({ section }: { section: Section }) {
  switch (section.id) {
    case "vector": return <VectorView section={section} wrap={WRAP} />
    case "solves": return <Contrast section={section} />
    case "connect": return <Connect section={section} />
    case "hood": return <Hood section={section} />
    case "credits": return <Credits section={section} />
    default: return <Generic section={section} />
  }
}

function HeroView({ hero, route }: { hero: Hero; route?: Section }) {
  return (
    <section data-block="ihzya" className="border-b border-border">
      <div data-block="r4pva" className={cn(WRAP, "grid items-center gap-12 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16 md:py-24")}>
        <div data-block="wn0ap" className="flex flex-col gap-6">
          <H1 data-block="hl5un" scale="hero" className="text-balance">{hero.title}</H1>
          <Lead data-block="mmyfj" className="max-w-[58ch] text-pretty">{inline(hero.description, "hero")}</Lead>
          <div data-block="iljxy" className="flex flex-wrap items-center gap-3 pt-2">
            {hero.cta && <a href={hero.cta.href} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>{hero.cta.label}</a>}
            {hero.secondary && (
              <a href={hero.secondary.href} className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 px-5 text-base")}>{hero.secondary.label}</a>
            )}
          </div>
          {hero.pill && <Badge data-block="pja08" variant="outline" className="w-fit">{hero.pill}</Badge>}
        </div>
        {route && <Route section={route} />}
      </div>
    </section>
  )
}

/** The way of a text: stations are pairs `text-h4` (name) + `text-p` (what it does); where the vector goes next — `text-small`. */
function Route({ section }: { section: Section }) {
  const stations: { name: string; text: string }[] = []
  for (const b of section.blocks) {
    if (b.kind === "text-h4") stations.push({ name: b.text, text: "" })
    else if (b.kind === "text-p" && stations.length && !stations[stations.length - 1].text) stations[stations.length - 1].text = b.text
  }
  const back = first(section, "text-small")
  return (
    <figure data-block="nql5c" className="rounded-[calc(var(--radius)*2)] border border-border bg-card p-6 text-card-foreground shadow-[0_28px_64px_-32px_color-mix(in_oklab,var(--primary)_45%,transparent)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 md:p-8">
      <figcaption data-block="qvs6x"><H2 data-block="op7yu" variant="ui">{section.title}</H2></figcaption>
      <ol data-block="lmo1p" className="mt-6 flex flex-col">
        {stations.map((s, i) => {
          const Icon = ROUTE_ICONS[i % ROUTE_ICONS.length]
          return (
            <li data-block="v57be" key={s.name} className="relative flex gap-4 pb-7 last:pb-0">
              {i < stations.length - 1 && <span aria-hidden className="absolute top-11 bottom-1 left-5 w-px -translate-x-1/2 bg-border" />}
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-5" aria-hidden />
              </span>
              <div data-block="mrmmp" className="min-w-0 pt-1">
                <H3 data-block="t13ml" variant="ui">{s.name}</H3>
                <Small data-block="asxn3" className="mt-1 text-pretty">{inline(s.text, `route-${i}`)}</Small>
              </div>
            </li>
          )
        })}
      </ol>
      {back && (
        <div data-block="hx8k4" className="mt-6 flex gap-3 rounded-[var(--radius)] border border-dashed border-primary/40 bg-primary/5 p-4">
          <CornerDownLeft className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <Small data-block="skmqd" className="text-pretty">{inline(back.text, "route-back")}</Small>
        </div>
      )}
    </figure>
  )
}

/** «Without it / with it»: two columns, the pain on the left, the answer on the right. */
function Contrast({ section }: { section: Section }) {
  const table = first(section, "text-table")
  return (
    <section data-block="t4q97" id={section.id} className={cn(WRAP, "scroll-mt-20 py-16 md:py-24")}>
      <H2 data-block="fdvim" className="max-w-[24ch] text-balance">{section.title}</H2>
      {table && (
        <div data-block="c1wmt" className="mt-10 overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-border">
          <Table data-block="yndo2">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-1/2 px-5 whitespace-normal text-muted-foreground">{table.head[0]}</TableHead>
                <TableHead className="w-1/2 px-5 whitespace-normal text-primary">{table.head[1]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="px-5 py-4 align-top whitespace-normal text-muted-foreground">
                    <span className="flex gap-3"><X className="mt-1 size-4 shrink-0" aria-hidden /><span>{inline(r[0] ?? "", `solves-${i}-a`)}</span></span>
                  </TableCell>
                  <TableCell className="px-5 py-4 align-top whitespace-normal font-medium text-foreground">
                    <span className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden /><span>{inline(r[1] ?? "", `solves-${i}-b`)}</span></span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

/** Connecting an element: the words, the real call of the door, what to read next. */
function Connect({ section }: { section: Section }) {
  const [lead, ...rest] = all(section, "text-p")
  const code = first(section, "text-code")
  return (
    <section data-block="x9bbd" id={section.id} className="scroll-mt-20 border-y border-border bg-muted/40">
      <div data-block="wzatw" className={cn(WRAP, "py-16 md:py-24")}>
        <H2 data-block="n2lo8" className="text-balance">{section.title}</H2>
        {lead && <P data-block="gcd8v" className="mt-5 max-w-[68ch] text-pretty">{inline(lead.text, "connect-lead")}</P>}
        {code && (
          <pre className="mt-8 max-w-full overflow-x-auto rounded-[calc(var(--radius)*1.5)] border border-border bg-card p-5 font-mono text-[length:var(--fs-small)] leading-6 text-card-foreground shadow-sm">
            <code>{code.text}</code>
          </pre>
        )}
        {rest.map((p, i) => <P data-block="pmrd4" key={i} className="mt-6 max-w-[68ch] text-pretty">{inline(p.text, `connect-${i}`)}</P>)}
      </div>
    </section>
  )
}

/** Under the hood: the parts of the element — the name on the left, what it is on the right. */
function Hood({ section }: { section: Section }) {
  const table = first(section, "text-table")
  const COLS = "md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
  return (
    <section data-block="j46n5" id={section.id} className={cn(WRAP, "scroll-mt-20 py-16 md:py-24")}>
      <H2 data-block="liy0c" className="text-balance">{section.title}</H2>
      {table && (
        <div data-block="rblxz" className="mt-10 border-y border-border">
          <div data-block="kostc" className={cn("hidden gap-8 border-b border-border py-3 md:grid", COLS)}>
            <Small data-block="owbq4" className="font-medium">{table.head[0]}</Small>
            <Small data-block="jkpx0" className="font-medium">{table.head[1]}</Small>
          </div>
          <dl data-block="ihj43" className="divide-y divide-border">
            {table.rows.map((r, i) => (
              <div data-block="e3pki" key={i} className={cn("grid gap-1 py-4 md:gap-8", COLS)}>
                <dt data-block="z6etv" className="font-medium text-foreground">{inline(r[0] ?? "", `hood-${i}-a`)}</dt>
                <dd data-block="qffxk" className="text-pretty text-muted-foreground">{inline(r[1] ?? "", `hood-${i}-b`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  )
}

function Credits({ section }: { section: Section }) {
  const p = first(section, "text-p")
  return (
    <section data-block="pca9d" id={section.id} className="border-t border-border bg-muted/40">
      <div data-block="vcwek" className={cn(WRAP, "flex flex-col gap-2 py-10")}>
        <H2 data-block="gbk4j" variant="ui">{section.title}</H2>
        {p && <Small data-block="lqyfj" className="max-w-[80ch] text-pretty [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">{inline(p.text, "credits")}</Small>}
      </div>
    </section>
  )
}

/** A section with an unknown `id` — the element's own typography. */
// onlyFaq
function Generic({ section }: { section: Section }) {
  return (
    <section data-block="vy1yu" id={section.id} className={cn(WRAP, "scroll-mt-20 py-16 md:py-24")}>
      {/* 662-2: a section of only questions and answers — the block draws its own heading. */}
      {!(section.blocks.length === 1 && (section.blocks[0].kind as string) === "block-faq") && <H2 data-block="evd82" className="text-balance">{section.title}</H2>}
      <div data-block="cpkfk" className="mt-6 flex max-w-[70ch] flex-col gap-4">
        {section.blocks.map((b, i) => {
          const Render = TEXT_SET[b.kind]
          // 662-2: a catalogue block (questions and answers, cards) is drawn by the block registry, as on the graph's landing.
          if (Render) return <Render key={i} blockKey={`${section.id}-${i}`} {...b} />
          return <div data-block="e8bpq" key={i} className="min-w-0">{renderBlocks([b], `${section.id}-${i}`)}</div>
        })}
      </div>
    </section>
  )
}
