<script lang="ts">
	// Drawn here rather than copied, so the preview carries none of Proton's artwork
	const PATHS: Record<string, string> = {
		inbox: 'M2.5 9h3l1 2h3l1-2h3M2.5 3.5h11v9h-11z',
		draft: 'M3 13l1-3 7-7 2 2-7 7z',
		sent: 'M2 8l12-5-5 12-2-5z',
		star: 'M8 2.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L8 11.2 4.6 13l.7-3.8L2.5 6.5l3.8-.5z',
		archive: 'M2.5 5.5h11v7h-11zM1.5 3h13v2.5h-13zM6.5 8h3',
		spam: 'M8 2.5L14.5 13.5h-13zM8 6.5v3M8 11.3v.5',
		trash: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5',
		allmail: 'M2.5 4h11v8h-11zM2.5 4.5l5.5 4.5 5.5-4.5',
		views: 'M1.5 8s2.5-4 6.5-4 6.5 4 6.5 4-2.5 4-6.5 4-6.5-4-6.5-4zM8 6.3a1.7 1.7 0 100 3.4 1.7 1.7 0 000-3.4z',
		folder: 'M2 4.5h4.5l1.2 1.5H14v6.5H2z',
		tag: 'M8.5 2H14v5.5l-6.5 6.5L2 8.5zM11.2 4.8v.01',
		clip: 'M11 6.3L6.8 10.5a1.8 1.8 0 002.5 2.5l4.2-4.2a3.3 3.3 0 00-4.7-4.7L4.2 8.7',
		check: 'M3.5 8.3l3 3 6-6',
		caret: 'M4.5 6.5L8 10l3.5-3.5',
		plus: 'M8 3v10M3 8h10',
		gear: 'M8 5.8a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zM8 1.8l1 1.6 1.9-.4.6 1.8 1.8.6-.4 1.9 1.3 1.4-1.3 1.4.4 1.9-1.8.6-.6 1.8-1.9-.4-1 1.6-1-1.6-1.9.4-.6-1.8-1.8-.6.4-1.9L1.3 8.7l1.3-1.4-.4-1.9 1.8-.6.6-1.8 1.9.4z',
		search: 'M7.2 2.4a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zM10.8 10.8l2.8 2.8'
	};

	let {
		name,
		size = 16,
		class: cls = ''
	}: { name: keyof typeof PATHS | string; size?: number; class?: string } = $props();
</script>

<svg
	viewBox="0 0 16 16"
	class={cls}
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	stroke-width="1.2"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	focusable="false"
	aria-hidden="true"
>
	<path d={PATHS[name] ?? PATHS.tag} />
</svg>
