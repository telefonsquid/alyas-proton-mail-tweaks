<script lang="ts">
	import './proton.css';
	import Icon from './Icon.svelte';
	import LabelDialog from './LabelDialog.svelte';
	import MailList from './MailList.svelte';
	import Sidebar from './Sidebar.svelte';

	let {
		css = '',
		mode = 'column',
		density = 'compact',
		dialog = false
	}: {
		css?: string;
		mode?: 'column' | 'row';
		density?: 'compact' | 'comfortable';
		dialog?: boolean;
	} = $props();
</script>

<!-- The generated sheet has to reach the mock unscoped, which a component style block cannot do.
     Its content is built from the registry, never from anything a visitor types. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html `<style>${css}</style>`}

<div class="mock is-{density}">
	<Sidebar />

	<div class="pane">
		<div class="toolbar">
			<button class="toolbar-button" type="button" data-testid="toolbar:moveto">
				<Icon name="folder" /> Move to
			</button>
			<button class="toolbar-button" type="button" data-testid="toolbar:labelas">
				<Icon name="tag" /> Label as
			</button>
			<button class="toolbar-button" type="button" data-testid="toolbar:movetotrash">
				<Icon name="trash" /> Delete
			</button>
		</div>

		<MailList {mode} {density} />

		{#if dialog}<LabelDialog />{/if}
	</div>
</div>

<style>
	/* Frame around the mock. Not Proton's, so it carries none of its class names. */
	.mock {
		display: flex;
		block-size: 100%;
		overflow: hidden;
	}

	.pane {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}
</style>
