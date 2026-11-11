# `widget-static-embeddings-landing` — the home page of the embeddings element

The whole home page of this element (node step 626, the owner 2026-11-03: «Да, по образцу vectors»; «call impeccable skill and check
stripe landing»): what the element solves, how a text becomes a vector, real vectors side by side, how another element connects, what
is under the hood. A static widget: drawn on the server, part of the prerendered page. Built after the Stripe element's landing.

## Where its words come from

From the items of the home page, `../../../_data/en.json` and `ru.json` (`words.ts`). The page is `bare` (`_data/meta.json`): only this
widget is drawn, and the items are its words and the page's text copy for search and agents (`index.md`, `llms-full.txt`), so
`markdown.ts` returns nothing of its own. A corrected sentence shows up without a rebuild (ISR, or `npm run pages:refresh`).

| Items in the data | How the widget draws them |
|---|---|
| `section-hero-centered` | first screen: title, lead, two buttons (anchors), the badge |
| `section-head` id `route` + pairs `text-h4`/`text-p` + `text-small` | the way of a text on the first screen; the small text is where the vector goes next |
| id `vector` + `text-p`, `text-list`, `text-small` | the texts of the list drawn as their real 384 numbers from `lib/embed/reference-626-1.json`, each with its cosine to the first (`vector.tsx`) |
| id `solves` + `text-table` | «without it / with it», two columns |
| id `connect` + `text-p`, `text-code`, `text-p` | the call of `POST /api/embed` |
| id `hood` + `text-table` | the parts of the element |
| id `credits` + `text-p` | who built it, the licences |
| any other `id` | the element's typography (`TEXT_SET`) |

A new section in the data appears without a code change; a section needs code only for its own look. A text in the `vector` list that
the reference does not hold is not drawn.

## Look

Design tokens of «Design», shadcn (`Badge`, `Table`, `buttonVariants` on links) and the element's typography; icons from `lucide-react`.
One motion: the way of a text fades in on the first screen (`motion-safe`). One authored picture: real vectors, no decoration. No door:
the widget only reads the page data and the reference file.
