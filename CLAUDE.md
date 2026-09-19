# Alya's Proton Mail Tweaks

> **Maintenance rule — read this first.**
> This file is the project memory. Whenever Alya gives a new instruction or changes a
> decision, update it in the same turn as the work, unasked. Keep it short and factual: live
> rules and conventions, never a history of what was tried.

## What this is

**Alya's Proton Mail Tweaks**, shipping as 1.0. A CSS tweak file that makes Proton Mail's web
UI more usable, installed through the [Stylus](https://add0n.com/stylus.html) extension, plus
a web page that lets you tick the tweaks you want and get exactly that CSS back.

1. **The stylesheet** — the real product. Every tweak is an independently usable block.
2. **The picker** — a SvelteKit page: checkboxes, sliders, a live preview, install, copy,
   download.

The picker emits a **ready configured `.user.css`**: the blocks you ticked and the numbers you
dialed become the `@var` defaults. Fine tuning afterwards happens in Stylus, not on the page.

## Hard constraints

- **The picker stays minimal in build, not in looks.** No component library, no framework, no
  animation, plain CSS written by hand. The page wears Proton's own design, which is a change
  of paint, not of the "no modern fancy web bullshit" rule.
- **Options carry no explanation.** The title says what a tweak does. A `note` is written only
  where a tweak reaches further than its title admits.
- **The repo may go public.** Nothing personal in any committed file. The author is "Alya", a
  handle standing in for a real name on purpose. See Anonymization.
- **Work byte sized.** Small, reviewable steps. Plan before building.

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| Distribution format | UserCSS, `@preprocessor less` | Every tweak becomes an `@var checkbox` and every density value an `@var range`, so they stay switchable in Stylus' own settings panel after install. |
| Which tweaks start ticked | Everything that only tightens the UI. Anything that takes a feature away starts off | A visitor who lands on the picker should not have to notice that a part of their sidebar went missing. `removeMoreToggle` stays on: it hides a toggle, not the folders behind it. |
| Header of the installed file | A banner comment holding a short README, plus `@author`, `@homepageURL`, `@supportURL` and `@license` | The `.user.css` travels on its own once installed. Both URLs live in `REPO_URL` and `PICKER_URL` in `generate.ts`. |
| Preview | Hand built mock DOM | Proton's real class names with our own approximating CSS, so tweak selectors apply verbatim. Ships no Proton code, so it is safe to publish. |
| Font and marks | Inter self hosted, Proton's mail mark hue rotated 55 degrees | Inter is what Proton ships, and a published page should ask no third party for it. The mark is recognisably the same shape, unmistakably not Proton's tab. `stylus.png` is vendored from the Stylus repo, which ships no SVG. |
| README scope | Header, one sentence, the link, How to use, Features, Compatibility, the AI note | It sells the thing and points at the picker. No build instructions, nothing a visitor has to read past. |
| Stated compatibility | 5.0.132.2 and newer yes, anything older no, both modes, both densities, every theme | The version the scrapes and every measurement come from. Older builds are untested, so they get a plain no rather than a maybe. |

## Installing

The picker is hosted at **proton-mail-tweaks.henkys.dev**, the address the README sends
everyone to.

Stylus takes a UserCSS from a **link** ending in `.user.css`, and only from there. Both obvious
routes fail: pasted code stays in Stylus' plain mode, which ignores every `@var`, and a
downloaded file is reachable over `file://` alone, which Stylus cannot read without a
permission of its own.

So the picker links to `/install/proton-mail-tweaks.user.css`, which serves the current picks
as a real response. Only what differs from the defaults rides along in the query string, in the
same `?on=`/`?off=`/`?knob=value` shape the scrapes server uses. Download and Copy stay for
anyone who wants the file itself.

## Deploying

`bun run build` writes `build/`, which is the whole app: roughly a megabyte, no `node_modules`
beside it, because nothing in `package.json` is a runtime dependency. `node build/index.js`
serves it.

The `Dockerfile` builds it with Bun, so `bun.lock` decides the versions, and runs it on
`node:24-alpine`, which is what `adapter-node` targets. Only `build/` crosses into the second
stage. It listens on 3000 and reads `PORT`, `HOST` and `ORIGIN`.

It runs on an unraid box, rebuilt by `deploy/unraid-update.sh` on a cron job whenever GitHub
moved ahead. Copy that script into a User Script, do not run it from the repo.

A static export is not an option, and fails quietly rather than loudly: the build leaves the
install route out and a fallback answers it with HTML. Stylus also refetches the install URL to
update the style, so it has to keep serving the picked config, not just answer once.

## Anonymization

`tools/anonymize.mjs` rewrites everything under `proton-mail-scrapes/` in place and prunes the
vendor files. Run it after adding any new scrape:

```bash
node tools/anonymize.mjs
```

Rules it follows, which any change must preserve:

- Placeholders are derived from a hash of the original value, so the same address or label maps
  to the same placeholder in a scrape added months later. No mapping table is stored anywhere,
  because storing one would put the real values back into the repo.
- Subjects and labels are replaced by filler of the **same character length**, so column widths
  and text ellipsis still behave like the real thing.
- Proton's own infrastructure addresses (`*.proton.me`) are kept. They identify nobody.
- A word that appears in Proton's shipped stylesheet is treated as markup, never as a person's
  name. Without that guard, `item` gets taken for a name and `item-firstline-infos` turns into
  `Yara-firstline-infos`.
- Replacements never fire inside a class name or identifier (`(?<![A-Za-z0-9_-])` guard).
- Folder and label names are collected from three hooks: `sidebar-label:`,
  `folder-dropdown:folder-` and `item-location-`. A collapsed sidebar carries none of them, and
  a folder can show up in the "Move to" list without being in the sidebar at all.
- The script is safe to re-run. A rename that is already done is skipped, because Windows
  refuses a rename onto the same name.

Never commit a raw scrape. Never paste real addresses, labels or subjects into code, comments,
tests or fixtures.

Check before adding a scrape: the folder holds only `.htm`, `.css` and `.svg`, with no base64
images, no auth token, cookie or UID, no IP or phone number, and no address outside Proton's
own `no-reply@*.proton.me`. The account address in each `<title>` is a placeholder too.

## Scrapes

Saved from Proton Mail, one folder per UI state:

| Folder | Shows |
| --- | --- |
| `2026-09-18_Column_Compact` | Mail list in column mode |
| `2026-09-18_Row_Compact` | Mail list in row mode |
| `2026-09-18_Label-Selector` | The "Label as" dropdown, open |
| `2026-09-18_Views-Expanded_Folders-Expanded` | Sidebar with Views and Folders unfolded, and a message open |
| `2026-09-18_Sidebar-Collapsed` | Sidebar in its collapsed state |
| `2026-09-18_Folders_Move-To-Dialog` | Three folders, one of them nested, and the "Move to" dropdown open |
| `2026-09-18_Comfortable` | The list at Proton's comfortable density, which is a different row |
| `2026-09-18_Troubleshoot_Comfortable_Attachments` | Comfortable again, on a folder whose mails carry attachments |
| `2026-09-19_Screenshot` | A full mailbox at comfortable density, staged for the README shot |

A page saved while Stylus is running carries a copy of these tweaks inside itself, in a
`<style class="stylus">` at the end of the body, and the comfortable scrape does. Left in, it
stacks an older build on top of whatever `/tweaks.css` serves and every measurement drifts.
`scripts/serve-scrapes.ts` strips that block on the way out, so only a file opened directly
still carries it.

## What the tweaks buy

Measured against the scrapes at 1600x900, all tweaks on:

- Sidebar: 41 rows and 1623px down to 7 rows and 219px, or 3 rows and 107px with the folders
  behind More hidden as well. Row height 36px down to 28px.
- Mail rows on one screen: 13 up to 26 in column mode, 17 up to 28 in row mode. Row height 58px
  and 46px down to 30px and 28px. Growth under the pointer 2px down to none.
- Dialogs: 5 of 25 labels up to 12, 6 of 7 folders up to all 7.

Those row numbers are compact. Comfortable starts at 38px plain, 53px with labels and 129px
with an attachment, and lands on the same 30px with every label spelled out.

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
| `Dockerfile` | Two stages: Bun installs and builds, `node:24-alpine` runs `build/` |
| `deploy/unraid-update.sh` | The cron script on the server: fetch, rebuild, replace the container |
| `docs/header.svg` | The README's header lockup: the magenta mark over a wordmark running pink to Proton's purple |
| `docs/logo.png` | The mark at 512px, rasterized from `favicon.svg` for anywhere an SVG will not do |
| `docs/screenshot.png` | The README shot: `2026-09-19_Screenshot` at the defaults, Views and Folders hidden, corners rounded |

A tweak is written **once**, as a function of a `Resolve`. The preview asks it for literal
lengths, the UserCSS build asks it for LESS variables. Never write the rules twice.

The mock mirrors the sibling structure of the real markup, wrapper divs included. That is the
only reason a selector proven in the preview also lands in the app, so check any change to it
against a scrape. Its spacing has to match as closely, now that a tweak pulls on Proton's own
margins: a `gap` Proton has nowhere, or a line break between the inline tags of a row mode
subject, each of which renders as a real space, both show up as room the app does not have.
Keep those tags tight. The mock also carries Proton's hover and checked swap on the comfortable
avatar, because a state the preview cannot reach is a state nobody checks a tweak against.

A utility class the mock's markup uses but `proton.css` never defines does nothing, silently,
and the preview then shows a gap the app has. Diff the classes used against the ones defined
after touching either.

The mock shares a page with the picker, so anything global reaches it. That is why the picker
paints itself in the component styles of `+page.svelte`, which Svelte scopes, and `layout.css`
holds only the font, the tokens and a reset. Tokens there are prefixed `--ui-` so they can
never answer a `var(--primary)` or `var(--background-strong)` inside the mock, where Proton's
own names are in play. Anything new in `layout.css` still has to be checked against the preview.

The picker's design is Proton's, measured from the Troubleshoot scrape: the left bar is the
prominent theme (`#1b1340`, white text, `#b3a3f5` for weak, `#8a6eff` accent, rows 36px at an
8px radius, hover `rgba(74,54,143,.3)`), the install button matches Proton's own New message
(`#6d4aff`, 44px, 8px radius), and the page runs on Inter. Checkbox, slider and segmented
control are drawn by hand, because a native control takes no colour from a theme. The three
action buttons sit outside the scrolling list as a sibling of it, so they need no stickiness to
stay on screen. Each group is its own `section`, separated by a rule in the panel border
colour, and its heading is white and 13px rather than a dim caption, because a list of eighteen
checkboxes reads as one undifferentiated column otherwise.

Never write `display` with `!important` unless the rule is the one doing the hiding. Two tweaks
can reach the same element, and an `!important` layout rule will happily bring back what
another tweak switched off. The star in the hover buttons is both a `.button` and an
`.item-star`.

Tweak ids and knob names share one namespace, because Stylus turns both into LESS variables.
`validate()` in `generate.ts` fails the build on a collision.

## Selector notes

**Sidebar sections.** The section header and the section's items are *siblings* inside
`.navigation-list`, with no wrapper element around a section. Header hooks are `toggle-views`,
`toggle-folders`, `toggle-labels`.

Each section is removed by its own class, not by position. Folder rows carry
`.navigation-item--folder`, label rows `.navigation-item--label`, and Views keeps its one entry
in a bare `div` right after the header, so `header + div` catches it. Never restore with
`display: revert`: Proton sets `display: flex` on `.navigation-link` and
`.navigation-link-header-group`, so reverting collapses the header rows.

The system folders and the Less toggle each sit in their own `<div role="presentation">`, while
headers, folder rows and label rows are direct `li` children. Nothing follows the Labels section
inside the list, so a `~` sweep from a header cannot overshoot past it.

**Nested folders.** A subfolder is a sibling of its parent, not a child of it. The indent comes
from `data-level` on an inner div plus a `.navigation-icon-empty` spacer. Every folder row
carries `.navigation-item--folder` whatever its level, so one class hides the whole tree.
`.navigation-sublist` and `.navigation-sublink` exist in Proton's stylesheet but render in no
scrape.

**Sidebar rows.** `.navigation-link, .navigation-link-header-group { block-size: 2.25rem }` sets
the row height; entries add `mb-0.5` and section headers `mt-4`. A section header needs two
more: `.navigation-link-header-group-link` carries its own `block-size: 2.25rem`, and the add
and settings buttons beside it (`.navigation-link-header-group-control`) size themselves from
`padding: .5em`. Shrink the row without those two and their hover background stands 4px proud of
it on every side.

**The More and Less toggle.** Its hook is `toggle-more-items`, and unlike the three section
headers it sits in a `<div role="presentation">` of its own, as do the folders it reveals.
Everything between it and the Views header is such a div, and the one Views entry after the
header is a bare `<div>`, so `~ div[role='presentation']` from the toggle selects those folders
and nothing else. Removing the toggle freezes the sidebar in whichever state it was left in,
because Proton remembers the open state per account.

**Two generations of scrape.** The six taken first carry a blue accent (`#657ee4`) and
`--optional-border-radius: 3`, a per account corner setting that makes every radius squarer. The
Comfortable and Troubleshoot scrapes carry Proton's defaults: purple `#6d4aff` and radius 8,
which is `--border-radius-md: 8px` and `-sm: 4px`. Measure design values against the two newer
ones, or a chip comes out at 1.5px.

**Theme colours.** Proton sets `--primary` per theme and `.color-primary` reads it, so a rule
written against `var(--primary, currentColor)` follows whichever theme is picked and leaves a
theme that does not define it alone. `--text-norm` and `--text-weak` are the two text colours.

**Mail list.** `.item-container--column` and `.item-container--row` distinguish the two modes.
Padding runs through `--item-container-padding-block` and `--item-container-padding-inline`.
Column mode splits into `.item-firstline` and `.item-secondline`; row mode is already a single
line. Sender is `.item-senders`, subject `.item-subject`, star `.item-star`, label chips
`.label-stack`, folder location icon `[data-testid^='item-location-']`.

**What really sets the row height.** Not the text. `.item-icon-compact`, the round hit area
around the selection box, is a fixed `2rem` with `margin-block: -.1875rem`, so a compact column
row cannot go below 36px however tight the padding. Letting it hug its content
(`block-size: auto`) hands the height back to the 20px text line.

**The folder marker on a row.** Never a bare span. Proton nests it one level in both modes, and
the icon carries `py-0.5 mr-1`, which pads its 16px box out to the 20px text line and holds the
subject off it. Column wraps it in `flex shrink-0`; row wraps it in
`inline-flex shrink-0 align-bottom mr-1`, and that `align-bottom` is what stops the icon
standing on the text baseline, two pixels high. Row nests the whole subject one level deeper
again, in a `div.flex.flex-column.inline-block` where `.flex` wins.

**Hover actions on a list row.** Every row carries a hidden `.item-hover-action-buttons` holding
mark unread, trash, archive and, in column mode only, star. On hover Proton shows them *and*
hides what was in that space: `.item-container:hover` sets `display: none` on
`.item-meta-infos`, `.item-firstline-infos` and, in row mode, `.item-senddate-row`.

The buttons are 28px against a 20px line, so the row grows as the pointer passes. Absolute
positioning would fix the height but lay the buttons over the subject, so instead the container
keeps its place in the flow with `block-size: 0` and `align-items: center`: it still claims its
width, and its children overflow evenly above and below. Proton's own
`inset-block-start: .625rem` pushes them off centre, and `position: static` drops the offset
along with the positioning.

**Label chips.** `.label-stack` runs at `font-size: .6875rem` with `line-height: 1.64`, so a chip
is 18px tall, and `--border-radius-sm` is 4px. The stack usually carries `is-stacked` in column
mode, which collapses every chip after the first to `--item-narrow` (1.5em), scales it to two
thirds and sets `--button-opacity: 0`. One readable label and a row of coloured stubs, never a
row of full chips. Row mode drops `is-stacked` and shows them all.

**Label overflow is a density setting.** At compact, a row renders exactly one
`.label-stack-item` and a `.label-stack-overflow-count` reading `+1`, in both modes. The other
labels are not hidden, they are not in the page at all, so no stylesheet can bring them back. At
comfortable Proton renders every one and drops the counter, which is the only way to see them
all and the reason the comfortable scrape exists.

**The conversation count.** A row with more than one message carries
`<span aria-hidden="true">[2]</span>` followed by `<span class="sr-only">2 messages in
conversation</span>`, the only `span[aria-hidden]` inside `.item-container`, which makes
`span[aria-hidden='true']:has(+ .sr-only)` an exact hook. The count lives in a text node, so no
rule can strip the brackets off it.

They are cut off instead. One sits at either end, so `clip-path: inset(0 0.355em)` hides both and
a margin of `calc(gap - 0.355em)` on each side gives their space back and sets the gap. The box
goes on hugging its own text, so `[100]` is wider than `[4]` and the subjects no longer start at
a fixed column. That 0.355em is the safe middle of a window measured in Inter and in the system
fallback, at every size the knob offers: below 0.333em a bracket survives, above 0.375em the
outer digit loses ink. Remeasure before touching it. The number is then bold and in the accent,
and takes `color: inherit` back on a selected row.

The rule also zeroes the trailing margin of whatever sits right before the count,
`:has(+ span[aria-hidden='true'] + .sr-only)`. That is the wrapper around the folder marker, not
the marker itself, whose own `mr-1` survives, so the count lands at the gap on the right and the
gap plus 4px on the left, in both modes. Without it, a count that reclaimed only its left
bracket reads as far too much room on the right.

**The selected row.** `.item-container.item-is-selected` is painted in
`--email-item-selected-background-color`, which is `--primary` itself, with white text. So
anything a tweak colours in the accent disappears the moment its row is opened, and needs
`color: inherit` back. The mock hands out a weak colour on `.item-secondline` that Proton does
not, so the selected row has to take it back there as well.

**Comfortable is a different row, not a roomier one.** Four things change:

1. The selection box becomes a sender avatar, `.item-checkbox-label > .item-icon`, 28px and
   therefore the tallest thing in the row. `compactList` sizes it from the same knob as the
   compact selection box, whose maximum is the text line, so the row can never grow past it.
   Shrinking it brings three follow ups. Proton's 8px rounding reads as a circle at 16px, so the
   tweak squares it to 2px. The initials behind a missing picture are centred by an `m-auto`
   that only works while they size themselves, so the rule that fills the avatar with a sender
   picture has to leave them out, and their font size follows the knob at 0.625 of the box. And
   a picture covers the grey entirely, leaving it as a frame around the edge, so the avatar
   drops its background whenever one is there. Proton sizes that picture inline at 2rem and its
   wrapper sizes itself, so both are given the avatar's own size and rounding.

   Dropping that background has to stop at hover and at a tick. Proton swaps the picture for a
   checkmark there, white on the accent, and an avatar with no background leaves it white on
   white. The checkmark is a fixed 1rem as well, so it takes the avatar's size too or it hangs
   out of a box the knob shrank.
2. That avatar is inline inside a block label, so it stands on a baseline and drags the
   descender space under it into the row, 1.5px to 5px. A `display: flex` on the label drops the
   line box and with it the gap.
3. The labels move out of the subject line onto a line of their own below it, the second child
   of `.item-column`. `columnSingleLine` dissolves `.item-column`'s wrappers with
   `display: contents` and orders every part in one flex row, so that line joins the others
   instead of stacking under them. Order runs sender, subject, labels, time, hover buttons,
   which is where compact already had them.
4. In a folder with attachments, every attachment becomes a named button in an
   `.attachment-thumbnail-grid`, a third line under the labels. `chipAttachments` cuts the
   button down to a label chip, `columnSingleLine` gives the grid the same order as the labels
   so it lands beside them, and the attachment stays there to click. That grid is also why the
   labels line cannot be picked as the last child of `.item-column`. It is picked by the
   `.item-icons` it holds instead.

Untested: comfortable in row mode, there is no scrape of it. The avatar rule is written against
the label rather than the column, so it should carry over.

**Open mail.** The reading pane is in the Views-Expanded scrape. Hooks: `.message-header-star`,
`.message-header-expanded-label-container`, `.message-header-metas-container`. Hide the wrapper
rather than the chip or the button, so its margin goes with it.

**"Label as" and "Move to" dialogs.** Twins: same chrome, same inline custom properties, only
the list class differs. Two separate limits, and the obvious one is the wrong one.

1. `.label-dropdown-list { max-block-size: 13.5em }` and
   `.move-dropdown-list { max-block-size: 15.5em }` are what actually pin them to a handful of
   rows. Growing the dialog without lifting this changes nothing.
2. Dialog height is not a stylesheet value: Proton's JS writes `--height`, `--available-height`
   and `--custom-max-height` inline on `.dropdown`, and `.dropdown-content` reads them. Override
   `.label-dropdown .dropdown-content` directly, inline custom properties cannot be beaten by
   specificity alone. `--available-height` is measured once when the dialog opens and goes stale
   on resize, so cap against `calc(100vh - var(--top) - 0.5rem)` instead.

Most of the dialog is chrome: header, search box, separator, two checkboxes and the apply
button, each carrying a 1rem margin. Tightening those buys more rows than the row padding does.

## Checking a tweak against the real markup

```bash
bun scripts/serve-scrapes.ts
```

Then load a scrape from `localhost:4321` and add `<link href="/tweaks.css?all&still">`. That
route renders the live registry, so there is no CSS to paste. `?all` turns every tweak on,
`?on=`/`?off=` switch one, `?senderWidth=18` overrides a knob.

**Always pass `?still`.** Proton puts a 150ms transition on nearly everything, and a browser
pane that is not on screen freezes transitions at their starting value. Without it,
`getComputedStyle` reports the old number and a working tweak looks broken.

## Redoing the README screenshot

Same server. Copy the served page next to the scrape with the tweaks linked in, shoot it
headless, quantize, round the corners, then delete the copy:

```bash
curl -s localhost:4321/2026-09-19_Screenshot/all-mail.htm \
  | sed 's#</head>#<link rel="stylesheet" href="/tweaks.css?on=hideViews&on=hideFolders&still"></head>#' > _shot.htm
chrome --headless=new --hide-scrollbars --window-size=1280,744 \
  --screenshot=C:\path\to\raw.png http://localhost:4321/2026-09-19_Screenshot/_shot.htm
magick raw.png -colors 256 flat.png
magick flat.png -alpha set \
  \( -size 1280x744 xc:none -fill white -draw "roundrectangle 0,0,1279,743,14,14" \) \
  -compose DstIn -composite -colors 255 docs/screenshot.png
```

The copy has to sit in the scrape's own folder, or the relative asset links break. Not `?all`:
the picker's defaults plus `hideViews` and `hideFolders`, so the shot shows both what the tweaks
tighten and what they take away. 744px is a whole number of 30px rows against that window, so
the list ends on a row edge rather than through one. Chrome needs a Windows path on
`--screenshot` and writes nothing at all given a POSIX one. The palette pass is lossless to the
eye and cuts the file by two thirds.

The corners are baked into the PNG because GitHub strips `style` off anything in a README, so
there is no other way to round them. Quantize before masking, not after: quantizing an image
that already has transparent corners folds the corner into the palette and it comes back at
1/255 alpha instead of none. 14px reads as Proton's own 8px once the 1280px shot is drawn at
the `width="720"` the README sets, which also keeps it off both margins. The shot carries no
caption.
