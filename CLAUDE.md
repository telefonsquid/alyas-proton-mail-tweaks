# Alya's Proton Mail Tweaks

> **Maintenance rule — read this first.**
> This file is the project memory. Whenever Alya gives a new instruction, changes a
> decision, or adds a feature to the wishlist, update this file in the same turn as the
> work. Do not wait to be asked. Keep it factual: decisions and their reasons, current
> feature status, conventions. No changelog prose, no history of what was tried.

## What this is

**Alya's Proton Mail Tweaks**, shipping as 1.0. A CSS tweak file that makes Proton Mail's
web UI more usable, pasteable into the [Stylus](https://add0n.com/stylus.html) browser
extension, plus a small web page that lets you tick the tweaks you want and get exactly
that CSS back. The name appears in the page title, the `@name` of the UserCSS, the
`package.json` name and the README. The repo folder keeps its old name.

Two deliverables:

1. **The stylesheet** — the real product. Every tweak is an independently usable block.
2. **The picker** — a SvelteKit page: checkboxes, a live preview, generated CSS with a
   copy button.

## Hard constraints

- **The picker stays minimal in build, not in looks.** No component library, no framework,
  no animation, plain CSS written by hand. Tailwind came with the template and has been
  removed, dependencies included. Since 1.0 the page wears Proton's own design rather than
  browser defaults, which is a change of paint, not of the "no modern fancy web bullshit"
  rule.
- **Options carry no explanation.** The title says what a tweak does. A `note` is written
  only where a tweak reaches further than its title admits, and six of the eighteen have
  one.
- **The repo may go public.** Nothing personal in any committed file. See Anonymization.
- **Work byte sized.** Small, reviewable steps. Plan before building.

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| Preview | Hand built mock DOM | Reuses Proton's real class names with our own approximating CSS, so tweak selectors apply verbatim. Ships no Proton code, loads instantly, safe to publish. |
| Scrapes | Anonymized, JS pruned | Kept the `.htm` pages and Proton's CSS as selector reference. Dropped ~15 MB of vendor JS and the one saved mail body. |
| Anonymization depth | Full scrub | Addresses, display names, subjects, label names and opaque IDs all replaced. |
| Styling of the picker | Plain CSS | See Hard constraints. |
| Distribution format | UserCSS, `@preprocessor less` | Every tweak becomes an `@var checkbox` and every density value an `@var range`, so they stay switchable inside Stylus' own settings panel after install. No revisiting the page to change your mind. |
| Which tweaks start ticked | Everything that only tightens the UI. Every tweak that takes a feature away starts off | Density is a safe default; removing Views, Folders, Labels or Starred is not, because a visitor who lands on the picker should not have to notice that a part of their sidebar went missing. `removeMoreToggle` stays on: it hides a toggle, not the folders behind it. |
| Header of the installed file | A banner comment holding a short version of the README, plus `@author`, `@homepageURL`, `@supportURL` and `@license` in the metadata | The `.user.css` travels on its own once installed. Whoever opens it months later gets the tagline, both links, the supported version, the AI note and the Proton disclaimer without going looking. Both URLs live in `REPO_URL` and `PICKER_URL` in `generate.ts`. |
| Density control | Range sliders | Row height, list padding and dialog height each get an `<input type=range>`, live in the preview. |
| Look of the picker | Proton's own | The left bar is painted in Proton's prominent theme and the controls follow its metrics, so the page reads as an extension of the app it tweaks. |
| Font | Inter, self hosted | What Proton ships. The latin subset sits in `src/lib/assets`, so a published page asks no third party for it. |
| Favicon | Proton's mail mark, hue rotated 55 degrees | Recognisably the same shape, unmistakably not Proton's tab. |
| Stylus logo | Vendored from the Stylus repo | `src/lib/assets/stylus.png`. Upstream ships no SVG, only the PNG icon set. |
| README scope | Header, one sentence, the link, How to use, Features, Compatibility, a note on AI | It sells the thing and points at the picker. No build instructions, no scrapes section, nothing a visitor has to read past. |
| Stated compatibility | A table: 5.0.132.2 and newer yes, anything older no, both modes, both densities, every theme | The version the scrapes and every measurement come from. Older builds are untested, so they get a plain no rather than a maybe. Maintained actively, because Alya runs these tweaks daily, and the section points at the issue tracker. |
| AI disclosure | Stated in the README, under "A note on AI" | The first tweaks were hand written; Claude keeps them current, because a selector that moves on every Proton update is more upkeep than a CSS tweak is worth by hand. Said plainly rather than left to be discovered. |
| License | MIT, copyright "Alya" | A public repo without one is all rights reserved. The handle stands in for a real name on purpose. |

The picker therefore emits a **ready configured `.user.css`**: the blocks you ticked and
the numbers you dialed become the `@var` defaults. Fine tuning afterwards happens in
Stylus, not on the page.

## Installing

The picker is hosted at **proton-mail-tweaks.henkys.dev**, which is the address the README
sends everyone to.

Stylus takes a UserCSS from a **link** ending in `.user.css`, and only from there. The two
obvious routes both fail:

- Pasting the code into a new style leaves it in Stylus' plain mode, which reports
  "Code that depends on @preprocessor won't work because this style wasn't created in
  UserCSS mode" and ignores every `@var`.
- A downloaded file is reachable over `file://` alone, which Stylus cannot read until you
  turn on "Allow access to file URLs" in its extension settings.

So the picker links to `/install/proton-mail-tweaks.user.css`, which serves the current
picks as a real response. Only the values that differ from the defaults ride along in the
query string, in the same `?on=`/`?off=`/`?knob=value` shape the scrapes server uses.
Download and Copy stay for anyone who wants the file itself.

## Anonymization

`tools/anonymize.mjs` rewrites everything under `proton-mail-scrapes/` in place and
prunes the vendor files. Run it after adding any new scrape:

```bash
node tools/anonymize.mjs
```

Rules it follows, which any change must preserve:

- Placeholders are derived from a hash of the original value, so the same address or
  label maps to the same placeholder in a scrape added months later. No mapping table is
  stored anywhere, because storing one would put the real values back into the repo.
- Subjects and labels are replaced by filler of the **same character length**, so column
  widths and text ellipsis still behave like the real thing.
- Proton's own infrastructure addresses (`*.proton.me`) are kept. They identify nobody.
- A word that appears in Proton's shipped stylesheet is treated as markup, never as a
  person's name. This guard exists because an early run rewrote `item-firstline-infos`
  into `Yara-firstline-infos` after `item` was picked up as a name.
- Replacements never fire inside a class name or identifier (`(?<![A-Za-z0-9_-])` guard).
- Folder and label names are collected from three hooks: `sidebar-label:`,
  `folder-dropdown:folder-` and `item-location-`. A collapsed sidebar carries none of them,
  and a folder can show up in the "Move to" list without being in the sidebar at all.
- The script is safe to re-run. A rename that is already done is skipped, because Windows
  refuses a rename onto the same name.

Never commit a raw scrape. Never paste real addresses, labels or subjects into code,
comments, tests or fixtures.

Swept before 1.0, and worth repeating before any scrape is added: the folder holds only
`.htm`, `.css` and `.svg`, with no base64 images, no auth token, cookie or UID, no IP or
phone number, and no address outside Proton's own `no-reply@*.proton.me`. The account
address in each `<title>` is a placeholder too.

## Scrapes

Saved from Proton Mail on 2026-09-18, one folder per UI state:

| Folder | Shows |
| --- | --- |
| `2026-09-18_Column_Compact` | Mail list in column mode |
| `2026-09-18_Row_Compact` | Mail list in row mode |
| `2026-09-18_Label-Selector` | The "Label as" dropdown, open |
| `2026-09-18_Views-Expanded_Folders-Expanded` | Sidebar with Views and Folders unfolded |
| `2026-09-18_Sidebar-Collapsed` | Sidebar in its collapsed state |
| `2026-09-18_Folders_Move-To-Dialog` | Three real folders, one of them nested, and the "Move to" dropdown open |
| `2026-09-18_Comfortable` | The list at Proton's comfortable density, which is a different row |
| `2026-09-18_Troubleshoot_Comfortable_Attachments` | Comfortable again, on a folder whose mails carry attachments |

A page saved while Stylus is running carries a copy of these tweaks inside itself, in a
`<style class="stylus">` at the end of the body, and the comfortable scrape does. Left in, it
stacks an older build on top of whatever `/tweaks.css` serves and every measurement drifts.
`scripts/serve-scrapes.ts` strips that block on the way out, so only a file opened directly
still carries it.

## Feature wishlist

Status: `todo` / `wip` / `done`.

| # | Tweak | Options | Status |
| --- | --- | --- | --- |
| 1 | Remove Starred | list star button, open mail, sidebar entry | done |
| 2 | Remove Views from the sidebar | — | done |
| 3 | Remove Folders from the sidebar | plus: remove folders everywhere else | done |
| 4 | Remove Labels from the sidebar | plus: remove labels everywhere else | done |
| 5 | Compact sidebar | row height, gap between rows, gap above a section | done |
| 6 | Compact mail list | separate padding for column and row mode; column mode on one line with an adjustable sender width; selection box size | done |
| 7 | Bold senders in column mode | visual separation between entries | done |
| 8 | Taller "Label as" dialog | dialog height, row padding, space around the buttons. Covers "Move to" too, which has the same defect | done |
| 9 | Steady hover buttons | button size. Stops the row growing as the pointer passes, and centres the buttons | done |
| 10 | Accent the folder icons | strength. The Archive and Sent markers on a list row in the theme accent, and back in the text colour on the selected row, which is painted in that same accent | done |
| 11 | Remove the More and Less button | plus: hide the folders behind it instead of keeping them shown | done |
| 12 | Accent the conversation count | space around, font size. The `[2]` in front of a subject as the bare number, bold and in the accent | done |
| 13 | Show every label on a row | — | done, by switching Proton to comfortable |
| 14 | Comfortable reads like compact | — | done |
| 15 | Attachments as chips | — | done |

Measured against the scrapes at 1600x900, all tweaks on:

| | before | after |
| --- | --- | --- |
| Sidebar rows / height | 41 rows, 1623px | 7 rows, 219px |
| Sidebar row height | 36px | 28px |
| Mail rows on one screen, column | 13 | 26 |
| Mail rows on one screen, row mode | 17 | 28 |
| Mail row height, column / row | 58px / 46px | 30px / 28px |
| Row growth under the pointer | 2px | 0px |
| Labels visible in "Label as" | 5 of 25 | 12 of 25 |
| Folders visible in "Move to" | 6 of 7 | 7 of 7 |

The sidebar numbers come from the Folders scrape, the only one that has folders in it.
Hiding the folders behind More as well takes it to 3 rows and 107px.

The mail row numbers are compact, Proton's own density setting. Comfortable starts at 38px
for a plain row and 53px for one with labels, and lands on the same 30px, with every label
spelled out instead of a counter. A row with an attachment starts at 129px and lands there
too, once its attachment sits in the row as a chip.

## Layout

| Path | Holds |
| --- | --- |
| `src/lib/tweaks/registry.ts` | Every tweak: metadata, knobs, and a `css(v)` that writes the rules |
| `src/routes/+page.svelte` | The picker: checkboxes, sliders, install button, copy and download, and all of its styling |
| `src/routes/layout.css` | Page wide tokens, the Inter face and a small reset. Nothing that paints a control |
| `src/lib/assets/` | Inter, the magenta favicon, the Stylus logo |
| `src/routes/install/proton-mail-tweaks.user.css/+server.ts` | Serves the picked config at a URL Stylus will install from |
| `src/lib/mock/` | The preview: sidebar, mail list, dialog, and a stylesheet approximating Proton's |
| `src/lib/tweaks/generate.ts` | Turns the registry into preview CSS or into the installable UserCSS |
| `scripts/build-usercss.ts` | `bun run build:usercss` → `static/proton-mail-tweaks.user.css` |
| `scripts/serve-scrapes.ts` | `bun scripts/serve-scrapes.ts` → the scrapes on `localhost:4321` |
| `tools/anonymize.mjs` | Scrubs a newly added scrape |
| `docs/header.svg` | The README's header lockup: the magenta mark over a gradient wordmark |

A tweak is written **once**, as a function of a `Resolve`. The preview asks it for literal
lengths, the UserCSS build asks it for LESS variables. Never write the rules twice.

The mock mirrors the sibling structure of the real markup, wrapper divs included. That is
the only reason a selector proven in the preview also lands in the app, so check any
change to it against a scrape.

Its spacing has to match as closely, now that a tweak pulls on Proton's own margins. Two
things made the preview show more room around the conversation count than the app does: a
`gap` on `.item-subject` that Proton has nowhere, and the line breaks between the inline tags
of a row mode subject, each of which renders as a real space. Keep those tags tight. The mock
carries Proton's hover and checked swap on the comfortable avatar for the same reason: a state
the preview cannot reach is a state nobody checks a tweak against.

A utility class the mock's markup uses but `proton.css` never defines does nothing, silently,
and the preview then shows a gap the app has. `mr-1` was missing that way for a while. Diff the
classes used against the ones defined after touching either.

The mock shares a page with the picker, so anything global reaches it. That is why the
picker paints itself in the component styles of `+page.svelte`, which Svelte scopes, and
`layout.css` holds only the font, the tokens and a reset. Tokens there are prefixed
`--ui-` so they can never answer a `var(--primary)` or `var(--background-strong)` inside
the mock, where Proton's own names are in play. Anything new added to `layout.css` still
has to be checked against the preview.

The picker's design is Proton's, measured from the Troubleshoot scrape: the left bar is
the prominent theme (`#1b1340`, white text, `#b3a3f5` for weak, `#8a6eff` accent, rows
36px at an 8px radius, hover `rgba(74,54,143,.3)`), the install button matches Proton's
own New message (`#6d4aff`, 44px, 8px radius), and the page runs on Inter. Checkbox,
slider and segmented control are drawn by hand, because a native control takes no colour
from a theme. The three action buttons sit outside the scrolling list as a sibling of it,
so they need no stickiness to stay on screen.

Each group is its own `section`, separated by a rule in the panel border colour, and
its heading is white and 13px rather than a dim caption. A list of eighteen checkboxes
reads as one undifferentiated column otherwise.

Never write `display` with `!important` unless the rule is the one doing the hiding. Two
tweaks can reach the same element, and an `!important` layout rule will happily bring back
what another tweak switched off. The star in the hover buttons is both a `.button` and an
`.item-star`, and that is exactly how it came back.

Tweak ids and knob names share one namespace, because Stylus turns both into LESS
variables. `validate()` in `generate.ts` fails the build on a collision, which is how the
`labelDialogHeight` tweak and its knob of the same name got caught.

## Selector notes

Written down because they cost time to find and are not obvious from the markup.

**Sidebar sections.** The section header and the section's items are *siblings* inside
`.navigation-list`, with no wrapper element around a section. Header hooks are
`toggle-views`, `toggle-folders`, `toggle-labels`.

Each section is removed by its own class, not by position. Folder rows carry
`.navigation-item--folder`, label rows `.navigation-item--label`, and Views keeps its one
entry in a bare `div` right after the header, so `header + div` catches it. Never restore
with `display: revert`: Proton sets `display: flex` on `.navigation-link` and
`.navigation-link-header-group`, so reverting collapses the header rows.

The system folders and the Less toggle each sit in their own `<div role="presentation">`,
while headers, folder rows and label rows are direct `li` children. Nothing follows the
Labels section inside the list, so a `~` sweep from a header cannot overshoot past it.

**Nested folders.** A subfolder is a sibling of its parent, not a child of it. The indent
comes from `data-level` on an inner div plus a `.navigation-icon-empty` spacer. Every
folder row carries `.navigation-item--folder` whatever its level, so one class hides the
whole tree. `.navigation-sublist` and `.navigation-sublink` exist in Proton's stylesheet
but render in no scrape.

**Two generations of scrape.** The six taken first carry a blue accent (`#657ee4`) and
`--optional-border-radius: 3`, a per account corner setting that makes every radius
squarer. The Comfortable and Troubleshoot scrapes carry Proton's defaults: purple
`#6d4aff` and radius 8, which is `--border-radius-md: 8px` and `-sm: 4px`. Measure design
values against the two newer ones, or a chip comes out at 1.5px.

**Theme colours.** Proton sets `--primary` per theme and `.color-primary` reads it, so a
rule written against `var(--primary, currentColor)` follows whichever theme is picked and
leaves a theme that does not define it alone. `--text-norm` and `--text-weak` are the two
text colours.

**Mail list.** `.item-container--column` and `.item-container--row` distinguish the two
modes. Padding runs through `--item-container-padding-block` and
`--item-container-padding-inline`. Column mode splits into `.item-firstline` and
`.item-secondline`; row mode is already a single line. Sender is `.item-senders`,
subject `.item-subject`, star `.item-star`, label chips `.label-stack`, folder location
icon `[data-testid^='item-location-']`.

**The folder marker on a row.** It is never a bare span. Proton nests it one level in both
modes, and the icon itself carries `py-0.5 mr-1`, which pads its 16px box out to the 20px
text line and holds the subject off it. Column wraps it in `flex shrink-0`; row wraps it in
`inline-flex shrink-0 align-bottom mr-1`, and that `align-bottom` is what stops the icon
standing on the text baseline, two pixels high. Row nests the whole subject one level deeper
again, in a `div.flex.flex-column.inline-block` where `.flex` wins.

**Hover actions on a list row.** Every row carries a hidden
`.item-hover-action-buttons` holding mark unread, trash, archive and, in column mode only,
star. On hover Proton shows them *and* hides what was in that space:
`.item-container:hover` sets `display: none` on `.item-meta-infos`, `.item-firstline-infos`
and, in row mode, `.item-senddate-row`.

The buttons are 28px against a 20px line, so the row grows as the pointer passes. Absolute
positioning would fix the height but lay the buttons over the subject, so instead the
container keeps its place in the flow with `block-size: 0` and `align-items: center`: it
still claims its width, and its children overflow evenly above and below. Proton's own
`inset-block-start: .625rem` pushes them off centre, and `position: static` drops the offset
along with the positioning.

**What really sets the row height.** Not the text. `.item-icon-compact`, the round hit area
around the selection box, is a fixed `2rem` with `margin-block: -.1875rem`, so a compact
column row cannot go below 36px however tight the padding. Letting it hug its content
(`block-size: auto`) hands the height back to the 20px text line.

**Label chips.** `.label-stack` runs at `font-size: .6875rem` with `line-height: 1.64`, so a
chip is 18px tall, and `--border-radius-sm` is 4px. The stack
usually carries `is-stacked` in column mode, which collapses every chip after the first to
`--item-narrow` (1.5em), scales it to two thirds and sets `--button-opacity: 0`. One
readable label and a row of coloured stubs, never a row of full chips. Row mode drops
`is-stacked` and shows them all.

**Sidebar rows.** `.navigation-link, .navigation-link-header-group { block-size: 2.25rem }`
sets the row height; the entries add `mb-0.5` and section headers add `mt-4`.

A section header needs two more. `.navigation-link-header-group-link` carries its own
`block-size: 2.25rem`, and the add and settings buttons beside it
(`.navigation-link-header-group-control`) size themselves from `padding: .5em`. Shrink the
row without shrinking those two and their hover background stands 4px proud of the row on
every side.

**The More and Less toggle.** Its hook is `toggle-more-items`, and unlike the three section
headers it sits in a `<div role="presentation">` of its own, as do the folders it reveals.
Everything between it and the Views header is such a div, and the one Views entry after the
header is a bare `<div>`, so `~ div[role='presentation']` from the toggle selects those
folders and nothing else.

Every one of those wrappers carries an empty `class=""` while the toggle's own carries no
class attribute at all, which is what a conditional class looks like once it resolves to
nothing. So a collapsed folder is most likely still in the page under Proton's
`.hidden { display: none }` and can be brought back by CSS. Unconfirmed: every scrape was
taken expanded. It matters little either way, because Proton remembers the open state per
account, so removing the toggle freezes the sidebar in whichever state it was left in.

**The conversation count.** A row with more than one message carries
`<span aria-hidden="true">[2]</span>` followed by `<span class="sr-only">2 messages in
conversation</span>`, and that is the only `span[aria-hidden]` inside `.item-container`,
which makes `span[aria-hidden='true']:has(+ .sr-only)` an exact hook. The count lives in a
text node, so no rule can strip the brackets off it.

They are cut off instead. One sits at either end, so `clip-path: inset(0 0.355em)` hides
both and a margin of `calc(gap - 0.355em)` on each side gives their space back and sets the
gap. The box goes on hugging its own text, so `[100]` is wider than `[4]` and the subjects no longer start at a fixed
column. That 0.355em is the safe middle of a window measured in Inter and in the system
fallback, at every size the knob offers: below 0.333em a bracket survives, above 0.375em the
outer digit loses ink. Remeasure before touching it. The number is then bold and in the
accent, and takes `color: inherit` back on a selected row like every other accented part.

Both sides, because a count that reclaimed its left bracket and nothing more sat 4px further
off the subject than off what precedes it, which reads as far too much room on the right. So
the rule also zeroes the trailing margin of whatever sits right before the count,
`:has(+ span[aria-hidden='true'] + .sr-only)`. That is the wrapper around the folder marker,
not the marker itself, whose own `mr-1` survives, so the count lands at the gap on the right
and the gap plus 4px on the left, in both modes.

Dropped for it: un-hiding the screen reader twin in a box too narrow for the word after the
number, so the line broke right there and one line of height hid the rest. It worked, but
the box needed a fixed width, which put every count in the same slot.

**The selected row.** `.item-container.item-is-selected` is painted in
`--email-item-selected-background-color`, which is `--primary` itself, with white text. So
anything a tweak colours in the accent disappears the moment its row is opened, and needs
`color: inherit` back. The mock hands out a weak colour on `.item-secondline` that Proton
does not, so the selected row has to take it back there as well.

**Label overflow is a density setting.** At compact, a row renders exactly one
`.label-stack-item` and a `.label-stack-overflow-count` reading `+1`, in column and row mode
alike. The other labels are not hidden, they are not in the page at all, so no stylesheet can
bring them back. At comfortable Proton renders every one of them and drops the counter, which
is the only way to see them all and the reason the comfortable scrape exists.

**Comfortable is a different row, not a roomier one.** Three things change, and each one had
to be answered:

1. The selection box becomes a sender avatar, `.item-checkbox-label > .item-icon`, 28px and
   therefore the tallest thing in the row. `compactList` sizes it from the same knob as the
   compact selection box, whose maximum is the text line, so the row can never grow past it.
   Shrinking it brings three follow ups. Proton's 8px rounding reads as a circle at 16px, so
   the tweak squares it to 2px. The initials behind a missing picture are centred by an
   `m-auto` that only works while they size themselves, so the rule that fills the avatar with
   a sender picture has to leave them out, and their font size follows the knob at 0.625 of
   the box. And a picture covers the grey entirely, leaving it as a frame around the edge, so
   the avatar drops its background whenever one is there. Proton sizes that picture inline at
   2rem and its wrapper sizes itself, so both the wrapper and the picture are given the
   avatar's own size and rounding.

   Dropping that background has to stop at hover and at a tick. Proton swaps the picture for
   a checkmark there, white on the accent, and an avatar with no background leaves it white on
   white. The checkmark is a fixed 1rem as well, so it takes the avatar's size too or it hangs
   out of a box the knob shrank.
2. That avatar is inline inside a block label, so it stands on a baseline and drags the
   descender space under it into the row, 1.5px to 5px depending on the row. A `display: flex`
   on the label drops the line box and with it the gap.
3. The labels move out of the subject line onto a line of their own below it, the second child
   of `.item-column`. `columnSingleLine` dissolves `.item-column`'s wrappers with
   `display: contents` and orders every part in one flex row, so that line joins the others
   instead of stacking under them. Order runs sender, subject, labels, time, hover buttons,
   which is where compact already had them.

There is a fourth, and it only shows up in a folder that has attachments: every attachment
becomes a named button in an `.attachment-thumbnail-grid`, a third line under the labels.
`chipAttachments` cuts the button down to a label chip, `columnSingleLine` gives the grid the
same order as the labels so it lands beside them, and the attachment stays there to click.

That grid is also why the labels line cannot be picked as the last child of `.item-column`.
It is picked by the `.item-icons` it holds instead.

Untested: comfortable in row mode, there is no scrape of it. The avatar rule is written
against the label rather than the column, so it should carry over.

**Open mail.** The reading pane is in the Views-Expanded scrape, which has a message open.
Hooks: `.message-header-star`, `.message-header-expanded-label-container`,
`.message-header-metas-container`. Hide the wrapper rather than the chip or the button,
so its margin goes with it.

**"Label as" and "Move to" dialogs.** Twins: same chrome, same inline custom properties,
only the list class differs. Two separate limits, and the obvious one is the wrong one.

1. `.label-dropdown-list { max-block-size: 13.5em }` and
   `.move-dropdown-list { max-block-size: 15.5em }` are what actually pin them to a
   handful of rows. Growing the dialog without lifting this changes nothing.
2. Dialog height is not a stylesheet value: Proton's JS writes `--height`,
   `--available-height` and `--custom-max-height` inline on `.dropdown`, and
   `.dropdown-content` reads them. Override `.label-dropdown .dropdown-content`
   directly, inline custom properties cannot be beaten by specificity alone.
   `--available-height` is measured once when the dialog opens and goes stale on resize,
   so cap against `calc(100vh - var(--top) - 0.5rem)` instead.

Most of the dialog is chrome: header, search box, separator, two checkboxes and the
apply button, each carrying a 1rem margin. Tightening those buys more rows than the row
padding does.

## Checking a tweak against the real markup

```bash
bun scripts/serve-scrapes.ts
```

Then load a scrape from `localhost:4321` and add `<link href="/tweaks.css?all&still">`.
That route renders the live registry, so there is no CSS to paste. `?all` turns every
tweak on, `?on=`/`?off=` switch one, `?senderWidth=18` overrides a knob.

**Always pass `?still`.** Proton puts a 150ms transition on nearly everything, and a
browser pane that is not on screen freezes transitions at their starting value. Without
it, `getComputedStyle` reports the old number and a working tweak looks broken. This cost
an hour once already.
