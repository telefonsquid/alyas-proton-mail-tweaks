import { selectionFromQuery, userCss } from '$lib/tweaks/generate';

import type { RequestHandler } from './$types';

// Stylus only offers to install from a link ending in .user.css. A saved file is reachable
// over file:// alone, which the extension cannot read without a permission of its own, so
// the picked config is served from here instead.
export const GET: RequestHandler = ({ url }) => {
	return new Response(userCss(selectionFromQuery(url.searchParams)), {
		headers: { 'content-type': 'text/css', 'cache-control': 'no-store' }
	});
};
