<script lang="ts">
	import Icon from './Icon.svelte';
	import { FOLDERS, LABELS, SYSTEM } from './data';

	// Proton splits the system folders around a Less toggle and keeps the first four above it
	const ABOVE = SYSTEM.slice(0, 4);
	const BELOW = SYSTEM.slice(4);
</script>

<nav class="navigation max-w-full flex-auto flex-nowrap flex-column flex">
	<ul class="unstyled my-0 navigation-list">
		{#each ABOVE as entry (entry.name)}
			<div role="presentation">
				<li class="navigation-item w-full px-3" data-testid="sidebar-label:{entry.name}">
					<a
						class="navigation-link"
						class:active={entry.name === 'Inbox'}
						title={entry.name}
						href="#{entry.name}"
					>
						<span class="flex flex-nowrap w-full items-center gap-2">
							<Icon class="navigation-icon" name={entry.icon} />
							<span class="flex-1 flex items-center flex-nowrap gap-2">
								<span class="text-ellipsis">{entry.name}</span>
							</span>
							{#if entry.count}<span class="navigation-counter-item">{entry.count}</span>{/if}
						</span>
					</a>
				</li>
			</div>
		{/each}

		<div role="presentation">
			<li
				class="navigation-item w-full px-3 navigation-link-header-group navigation-link-header-group--expandable"
			>
				<div class="flex flex-nowrap w-full">
					<h3 class="sr-only">Less</h3>
					<button
						class="navigation-link-header-group-link"
						type="button"
						title="Less"
						aria-expanded="true"
						data-shortcut-target="toggle-more-items"
					>
						<span class="shrink-0"><Icon class="navigation-icon--expand" name="caret" /></span>
						<span class="ml-2 text-ellipsis">Less</span>
					</button>
				</div>
			</li>
		</div>

		{#each BELOW as entry (entry.name)}
			<div role="presentation">
				<li class="navigation-item w-full px-3" data-testid="sidebar-label:{entry.name}">
					<a class="navigation-link" title={entry.name} href="#{entry.name}">
						<span class="flex flex-nowrap w-full items-center gap-2">
							<Icon class="navigation-icon" name={entry.icon} />
							<span class="flex-1 flex items-center flex-nowrap gap-2">
								<span class="text-ellipsis">{entry.name}</span>
							</span>
						</span>
					</a>
				</li>
			</div>
		{/each}

		<li
			class="navigation-item w-full px-3 navigation-link-header-group navigation-link-header-group--expandable mt-4"
		>
			<div class="flex flex-nowrap w-full">
				<h3 class="sr-only">Views</h3>
				<button
					class="navigation-link-header-group-link"
					type="button"
					title="Views"
					aria-expanded="true"
					data-shortcut-target="toggle-views"
				>
					<span class="shrink-0"><Icon class="navigation-icon--expand" name="caret" /></span>
					<span class="ml-2 text-ellipsis">Views</span>
				</button>
			</div>
		</li>

		<div>
			<li class="navigation-item w-full px-3" data-testid="sidebar-label:Mailing lists">
				<a class="navigation-link" title="Mailing lists" href="#mailing-lists">
					<span class="flex flex-nowrap w-full items-center gap-2">
						<Icon class="navigation-icon" name="views" />
						<span class="flex-1 flex items-center flex-nowrap gap-2">
							<span class="text-ellipsis">Mailing lists</span>
						</span>
					</span>
				</a>
			</li>
		</div>

		<li
			class="navigation-item w-full px-3 navigation-link-header-group navigation-link-header-group--expandable mt-4"
		>
			<div class="flex flex-nowrap w-full">
				<h3 class="sr-only">Folders</h3>
				<button
					class="navigation-link-header-group-link"
					type="button"
					title="Folders"
					aria-expanded="true"
					data-shortcut-target="toggle-folders"
				>
					<span class="shrink-0"><Icon class="navigation-icon--expand" name="caret" /></span>
					<span class="ml-2 text-ellipsis">Folders</span>
				</button>
				<div class="flex items-center">
					<button
						class="navigation-link-header-group-control"
						type="button"
						data-testid="navigation-link:add-folder"
					>
						<Icon name="plus" />
						<span class="sr-only">Create a new folder</span>
					</button>
					<a class="navigation-link-header-group-control" href="#folder-settings">
						<Icon class="navigation-icon" name="gear" />
						<span class="sr-only">Manage your folders</span>
					</a>
				</div>
			</div>
		</li>

		{#each FOLDERS as folder (folder.name)}
			<li
				class="navigation-item w-full px-3 navigation-item--folder"
				data-testid="sidebar-label:{folder.name}"
			>
				<a class="navigation-link" title={folder.name} href="#{folder.name}">
					<span class="flex flex-nowrap w-full items-center gap-2">
						<span class="flex-1 flex items-center flex-nowrap gap-2">
							<div class="flex flex-nowrap items-center gap-2" data-level={folder.level}>
								<span class="navigation-icon-empty shrink-0"></span>
								<Icon class="navigation-icon" name="folder" />
								<div class="text-ellipsis">{folder.name}</div>
							</div>
						</span>
					</span>
				</a>
			</li>
		{/each}

		<li
			class="navigation-item w-full px-3 navigation-link-header-group navigation-link-header-group--expandable mt-4"
		>
			<div class="flex flex-nowrap w-full">
				<h3 class="sr-only">Labels</h3>
				<button
					class="navigation-link-header-group-link"
					type="button"
					title="Labels"
					aria-expanded="true"
					data-shortcut-target="toggle-labels"
				>
					<span class="shrink-0"><Icon class="navigation-icon--expand" name="caret" /></span>
					<span class="ml-2 text-ellipsis">Labels</span>
				</button>
				<div class="flex items-center">
					<button
						class="navigation-link-header-group-control"
						type="button"
						data-testid="navigation-link:add-label"
					>
						<Icon name="plus" />
						<span class="sr-only">Create a new label</span>
					</button>
				</div>
			</div>
		</li>

		{#each LABELS as label (label.name)}
			<li
				class="navigation-item w-full px-3 navigation-item--label"
				data-testid="sidebar-label:{label.name}"
			>
				<a class="navigation-link" title={label.name} href="#{label.name}">
					<span class="flex flex-nowrap w-full items-center gap-2">
						<Icon class="navigation-icon" name="tag" />
						<span class="flex-1 flex items-center flex-nowrap gap-2">
							<span class="text-ellipsis">{label.name}</span>
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
