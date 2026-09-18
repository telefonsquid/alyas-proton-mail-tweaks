// Serves proton-mail-scrapes/ so tweak selectors can be checked against Proton's real
// markup instead of against the mock. Browsers refuse file:// for this.
//
//   bun scripts/serve-scrapes.ts

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { TWEAKS } from '../src/lib/tweaks/registry.ts';
import { defaultSelection, previewCss, selectionFromQuery } from '../src/lib/tweaks/generate.ts';

const ROOT = resolve(import.meta.dirname, '../proton-mail-scrapes');
const PORT = 4321;

// /tweaks.css carries the live registry, so a scrape can be checked without pasting CSS
// into the page. ?on= and ?off= switch tweaks, ?still drops transitions, which otherwise
// freeze mid flight whenever the browser pane is hidden and make every measurement lie.
function tweakSheet(params: URLSearchParams): string {
	const selection = defaultSelection();

	if (params.has('all')) for (const tweak of TWEAKS) selection.enabled[tweak.id] = true;

	const still = params.has('still')
		? '*, *::before, *::after { transition: none !important; animation: none !important; }\n\n'
		: '';

	return still + previewCss(selectionFromQuery(params, selection));
}

Bun.serve({
	port: PORT,
	async fetch(request) {
		const { pathname, searchParams } = new URL(request.url);

		if (pathname === '/tweaks.css') {
			return new Response(tweakSheet(searchParams), {
				headers: { 'content-type': 'text/css', 'cache-control': 'no-store' }
			});
		}

		if (pathname === '/') {
			const dirs = await readdir(ROOT);
			const links: string[] = [];

			// The saved page is named after the mailbox it came from, so each folder has to say
			// what its own page is called
			for (const dir of dirs) {
				for (const entry of await readdir(resolve(ROOT, dir))) {
					if (!entry.endsWith('.htm')) continue;
					const href = `/${encodeURIComponent(dir)}/${encodeURIComponent(entry)}`;
					links.push(`<li><a href="${href}">${dir}</a></li>`);
				}
			}

			return new Response(`<ul>${links.join('')}</ul>`, {
				headers: { 'content-type': 'text/html' }
			});
		}

		const file = Bun.file(resolve(ROOT, '.' + decodeURIComponent(pathname)));
		if (!(await file.exists())) return new Response('not found', { status: 404 });

		// A page saved while Stylus was running carries a copy of these tweaks inside itself,
		// and an older one at that. Left in, it stacks on top of whatever /tweaks.css serves.
		if (pathname.endsWith('.htm')) {
			const html = (await file.text()).replace(/<style class="stylus">[\s\S]*?<\/style>/g, '');
			return new Response(html, { headers: { 'content-type': 'text/html' } });
		}

		return new Response(file);
	}
});

console.log(`scrapes on http://localhost:${PORT}`);
