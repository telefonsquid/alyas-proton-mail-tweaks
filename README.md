# Alya's Proton Mail Tweaks

A set of CSS tweaks that make Proton Mail's web UI denser and drop the parts you do not
use, plus a small page to pick the ones you want.

Roughly what it buys you, measured at 1600x900 with everything switched on:

| | before | after |
| --- | --- | --- |
| Sidebar rows | 41 | 7 |
| Mail rows on one screen, column mode | 13 | 26 |
| Mail row height, column / row | 58px / 46px | 30px / 28px |
| Labels visible in "Label as" | 5 of 25 | 12 of 25 |

## Install

The tweaks ship as a [UserCSS](https://github.com/openstyles/stylus/wiki/UserCSS) style for
[Stylus](https://add0n.com/stylus.html).

1. Install Stylus for [Firefox](https://addons.mozilla.org/firefox/addon/styl-us/) or
   [Chrome](https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne).
2. Open the picker, tick what you want, dial the sliders, and press **Install in Stylus**.
3. Every tweak and every slider stays adjustable afterwards in Stylus' own settings panel,
   so you never have to come back to the page to change your mind.

Stylus installs from a link and only from a link. Pasting the code into a new style leaves
it in Stylus' plain mode, where none of the switches work, and a downloaded file needs
"Allow access to file URLs" turned on first. Use the button.

## What is in it

| Tweak | Does |
| --- | --- |
| Remove everything Starred | The star on every row, in an open mail, and the sidebar entry |
| Remove Views, Folders, Labels | Each sidebar section on its own switch, optionally everywhere else too |
| Compact sidebar | Row height, gap between rows, gap above a section |
| Remove the More and Less button | Optionally hides the folders behind it as well |
| Compact mail list | Padding per mode, selection box size, and column mode on one line |
| Bold senders | Sets the sender apart from the subject in column mode |
| Accent the folder icons | Archive and Sent markers in the theme accent |
| Accent the conversation count | `[2]` becomes the bare number, bold and in the accent |
| Steady hover buttons | Stops the row growing as the pointer passes |
| Attachments as chips | Shrinks comfortable density's attachment buttons to label chips |
| Taller "Label as" dialog | More rows in "Label as" and "Move to", which share one defect |

## Running the picker

```bash
bun install
bun run dev
```

`bun run build:usercss` writes the all-on stylesheet to
`static/proton-mail-tweaks.user.css`.

The preview is a hand built mock that reuses Proton's class names with approximating CSS
of our own. It ships none of Proton's code, and a selector proven against it lands in the
app unchanged.

## The scrapes

`proton-mail-scrapes/` holds saved Proton Mail pages used as selector reference. They are
anonymized before they are committed: addresses, display names, subjects, folder and label
names and opaque IDs are all replaced, and the vendor JavaScript is pruned.

```bash
node tools/anonymize.mjs
```

Placeholders come from a hash of the original value, so the same address maps to the same
placeholder in a scrape added months later. No mapping table is kept anywhere.

## Not affiliated with Proton

Proton and Proton Mail are trademarks of Proton AG. This is an unofficial third party
stylesheet, made by a user, with no involvement from or endorsement by Proton.

## License

MIT. See [LICENSE](LICENSE).
