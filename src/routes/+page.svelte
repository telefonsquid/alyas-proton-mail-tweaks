<script lang="ts">
	import { resolve } from '$app/paths';

	import mark from '$lib/assets/favicon.svg';
	import stylus from '$lib/assets/stylus.png';
	import Preview from '$lib/mock/Preview.svelte';
	import { TWEAKS } from '$lib/tweaks/registry';
	import {
		defaultSelection,
		isActive,
		previewCss,
		selectionToQuery,
		userCss
	} from '$lib/tweaks/generate';
	import { GROUPS } from '$lib/tweaks/types';
	import type { Knob, Tweak } from '$lib/tweaks/types';

	let selection = $state(defaultSelection());
	let mode = $state<'column' | 'row'>('column');
	let density = $state<'compact' | 'comfortable'>('compact');
	let dialog = $state(false);
	let copied = $state(false);

	const css = $derived(previewCss(selection));
	// Split rather than glued, because resolve() types the whole string against the routes
	const INSTALL = '/install/proton-mail-tweaks.user.css';

	const installUrl = $derived.by(() => {
		const query = selectionToQuery(selection);
		return query ? resolve(`${INSTALL}?${query}`) : resolve(INSTALL);
	});

	const parents = (group: string) => TWEAKS.filter((t) => t.group === group && !t.requires);
	const children = (tweak: Tweak) => TWEAKS.filter((t) => t.requires === tweak.id);

	// How far along its track the slider is painted
	const fill = (knob: Knob) => {
		const value = selection.knobs[knob.name] ?? knob.value;
		return `${((value - knob.min) / (knob.max - knob.min)) * 100}%`;
	};

	function download() {
		const blob = new Blob([userCss(selection)], { type: 'text/css' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		link.href = url;
		link.download = 'proton-mail-tweaks.user.css';
		link.click();
		URL.revokeObjectURL(url);
	}

	async function copy() {
		await navigator.clipboard.writeText(userCss(selection));
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<svelte:head><title>Alya's Proton Mail Tweaks</title></svelte:head>

{#snippet knobs(tweak: Tweak)}
	{#if isActive(tweak, selection)}
		{#each tweak.knobs ?? [] as knob (knob.name)}
			<div class="knob">
				<span>{knob.label}</span>
				<input
					type="range"
					min={knob.min}
					max={knob.max}
					step={knob.step}
					style="--fill: {fill(knob)}"
					bind:value={selection.knobs[knob.name]}
				/>
				<output>{selection.knobs[knob.name]}{knob.unit}</output>
			</div>
		{/each}
	{/if}
{/snippet}

{#snippet entry(tweak: Tweak, disabled: boolean)}
	<label class="check" class:disabled>
		<input type="checkbox" bind:checked={selection.enabled[tweak.id]} {disabled} />
		<span class="box"></span>
		<span>{tweak.title}</span>
	</label>

	{#if tweak.note}
		<p class="note">{tweak.note}</p>
	{/if}

	{@render knobs(tweak)}
{/snippet}

<main>
	<aside class="picker">
		<header>
			<img src={mark} alt="" width="30" height="30" />
			<h1>Alya's Proton Mail Tweaks</h1>
		</header>

		<div class="list">
			{#each GROUPS as group (group)}
				<section class="group">
					<h2>{group}</h2>

					{#each parents(group) as tweak (tweak.id)}
						<div class="tweak">
							{@render entry(tweak, false)}

							{#each children(tweak) as child (child.id)}
								<div class="child">
									{@render entry(child, !selection.enabled[tweak.id])}
								</div>
							{/each}
						</div>
					{/each}
				</section>
			{/each}
		</div>

		<div class="actions">
			<a class="install" href={installUrl} data-sveltekit-reload>
				<img src={stylus} alt="" width="20" height="20" />
				Install in Stylus
			</a>
			<button onclick={download}>Download</button>
			<button onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
		</div>
	</aside>

	<section class="preview">
		<div class="bar">
			<div class="seg">
				<label><input type="radio" bind:group={mode} value="column" /><span>Column</span></label>
				<label><input type="radio" bind:group={mode} value="row" /><span>Row</span></label>
			</div>

			<div class="seg">
				<label>
					<input type="radio" bind:group={density} value="compact" /><span>Compact</span>
				</label>
				<label>
					<input type="radio" bind:group={density} value="comfortable" /><span>Comfortable</span>
				</label>
			</div>

			<label class="check light">
				<input type="checkbox" bind:checked={dialog} />
				<span class="box"></span>
				<span>Label as</span>
			</label>
		</div>

		<div class="frame">
			<Preview {css} {mode} {density} {dialog} />
		</div>
	</section>
</main>

<style>
	main {
		display: flex;
		block-size: 100vh;
	}

	/* The picker wears Proton's prominent theme, the one its own sidebar is painted in */
	.picker {
		display: flex;
		flex-direction: column;
		inline-size: 21rem;
		flex-shrink: 0;
		background: var(--ui-panel);
		color: var(--ui-panel-text);
	}

	.picker header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 1rem 1.25rem 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	h2 {
		margin: 0 0 0.5rem 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-panel-text);
	}

	/* A rule between groups, so a heading starts one instead of reading as another row */
	.group + .group {
		margin-block-start: 1rem;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--ui-panel-border);
	}

	.list {
		flex: 1;
		overflow: auto;
		padding: 0.375rem 0.75rem 1rem;

		/* A default scrollbar is a white stripe down the dark panel */
		scrollbar-width: thin;
		scrollbar-color: rgb(255 255 255 / 20%) transparent;
	}

	.child {
		margin-inline-start: 1.5rem;
	}

	/* A row of the list, sized and rounded like one of Proton's own sidebar entries */
	.check {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		min-block-size: 2rem;
		padding: 0.25rem 0.5rem;
		border-radius: var(--ui-radius);
		font-size: 0.875rem;
		cursor: pointer;
	}

	.check:hover {
		background: var(--ui-panel-hover);
	}

	.check.disabled {
		opacity: 0.45;
		cursor: default;
	}

	.check input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 1rem;
		block-size: 1rem;
		flex-shrink: 0;
		border: 1px solid rgb(255 255 255 / 40%);
		border-radius: var(--ui-radius-sm);
	}

	.box::after {
		content: '';
		inline-size: 0.25rem;
		block-size: 0.5rem;
		margin-block-start: -0.125rem;
		border: solid #fff;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		opacity: 0;
	}

	.check input:checked + .box {
		background: var(--ui-panel-accent);
		border-color: var(--ui-panel-accent);
	}

	.check input:checked + .box::after {
		opacity: 1;
	}

	.check input:focus-visible + .box {
		outline: 2px solid var(--ui-panel-accent);
		outline-offset: 2px;
	}

	.note {
		margin: 0 0 0.25rem 2.125rem;
		font-size: 0.75rem;
		color: var(--ui-panel-weak);
	}

	.knob {
		display: grid;
		grid-template-columns: 8rem 1fr 3rem;
		align-items: center;
		gap: 0.5rem;
		margin: 0.25rem 0 0.375rem 2.125rem;
		font-size: 0.75rem;
		color: var(--ui-panel-weak);
	}

	.knob output {
		text-align: end;
		font-variant-numeric: tabular-nums;
		color: var(--ui-panel-text);
	}

	/* Native sliders ignore every colour here, so both engines get the track by hand */
	.knob input[type='range'] {
		appearance: none;
		inline-size: 100%;
		block-size: 0.875rem;
		margin: 0;
		background: none;
		cursor: pointer;
	}

	.knob input[type='range']::-webkit-slider-runnable-track {
		block-size: 0.25rem;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--ui-panel-accent) var(--fill),
			rgb(255 255 255 / 15%) var(--fill)
		);
	}

	.knob input[type='range']::-moz-range-track {
		block-size: 0.25rem;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--ui-panel-accent) var(--fill),
			rgb(255 255 255 / 15%) var(--fill)
		);
	}

	.knob input[type='range']::-webkit-slider-thumb {
		appearance: none;
		inline-size: 0.875rem;
		block-size: 0.875rem;
		margin-block-start: -0.3125rem;
		border-radius: 50%;
		background: #fff;
	}

	.knob input[type='range']::-moz-range-thumb {
		inline-size: 0.875rem;
		block-size: 0.875rem;
		border: 0;
		border-radius: 50%;
		background: #fff;
	}

	/* Outside the scrolling list, so the three of them are on screen at any scroll position */
	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		padding: 0.75rem 1rem 1rem;
		border-block-start: 1px solid var(--ui-panel-border);
	}

	.install {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		block-size: 2.75rem;
		border-radius: var(--ui-radius);
		background: var(--ui-accent);
		color: #fff;
		font-size: 1rem;
		text-decoration: none;
	}

	.install:hover {
		background: var(--ui-accent-hover);
	}

	.install img {
		border-radius: var(--ui-radius-sm);
	}

	.actions button {
		block-size: 2.25rem;
		border: 1px solid rgb(255 255 255 / 20%);
		border-radius: var(--ui-radius);
		background: none;
		color: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.actions button:hover {
		background: rgb(255 255 255 / 10%);
	}

	.preview {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
		background: var(--ui-surface);
	}

	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		padding: 0.5rem 1rem;
		border-block-end: 1px solid var(--ui-border);
		font-size: 0.8125rem;
	}

	/* Two buttons in one pill, the way Proton switches its own list between modes */
	.seg {
		display: flex;
		padding: 2px;
		border-radius: var(--ui-radius);
		background: var(--ui-bg);
		border: 1px solid var(--ui-border);
	}

	.seg label {
		cursor: pointer;
	}

	.seg input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.seg span {
		display: block;
		padding: 0.1875rem 0.625rem;
		border-radius: calc(var(--ui-radius) - 2px);
		color: var(--ui-text-weak);
	}

	.seg input:checked + span {
		background: var(--ui-surface);
		color: var(--ui-text);
		font-weight: 600;
	}

	.check.light {
		min-block-size: auto;
		font-size: 0.8125rem;
	}

	.check.light:hover {
		background: var(--ui-hover);
	}

	.check.light .box {
		border-color: var(--ui-border-strong);
	}

	.check.light input:checked + .box {
		background: var(--ui-accent);
		border-color: var(--ui-accent);
	}

	.frame {
		flex: 1;
		min-block-size: 0;
		overflow: hidden;
	}
</style>
