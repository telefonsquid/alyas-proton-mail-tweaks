<script lang="ts">
	import Icon from './Icon.svelte';
	import { LABELS } from './data';
</script>

<!-- Proton's script writes --top, --height and --available-height inline, so the mock does
     too. A tweak that only raised specificity would lose against these. -->
<div
	class="dropdown dropdown--bottom rounded label-dropdown outline-none"
	style="--top: 3.5rem; --height: auto; --available-height: calc(100vh - 5rem);"
>
	<div class="dropdown-content flex flex-column flex-nowrap items-stretch">
		<form class="flex flex-column flex-nowrap items-stretch flex-auto">
			<div class="flex shrink-0 items-center m-4 mb-0">
				<span class="text-bold flex-1">Label as</span>
				<button
					class="button-solid-norm flex items-center"
					type="button"
					data-testid="label-dropdown:add-label"
				>
					<Icon name="plus" />
					<span class="sr-only">Create label</span>
				</button>
			</div>

			<div class="shrink-0 m-4 mb-0">
				<input class="field w-full" type="search" placeholder="Filter labels" />
			</div>

			<div class="label-dropdown-list mt-4 flex-auto" data-testid="label-dropdown-list">
				<ul class="unstyled my-0">
					{#each LABELS as label (label.name)}
						<li class="dropdown-item dropdown-item-button w-full flex flex-nowrap items-center">
							<span class="checkbox-container">
								<span class="checkbox-fakecheck"></span>
							</span>
							<span class="flex flex-1 items-center flex-nowrap" title={label.name}>
								<span class="ml-2 flex" style="color: {label.color};"><Icon name="tag" /></span>
								<span class="ml-2 text-ellipsis">{label.name}</span>
							</span>
						</li>
					{/each}
				</ul>
			</div>

			<hr class="m-0 shrink-0" />

			<div class="px-4 mt-4 shrink-0">
				<span class="checkbox-container">
					<span class="checkbox-fakecheck"></span>
					<span>Always label sender's emails</span>
				</span>
			</div>

			<div class="px-4 mt-4 shrink-0">
				<span class="checkbox-container">
					<span class="checkbox-fakecheck"></span>
					<span>Also archive</span>
				</span>
			</div>

			<div class="m-4 shrink-0">
				<button class="button-solid-norm w-full" type="button" data-testid="label-dropdown:apply"
					>Apply</button
				>
			</div>
		</form>
	</div>
</div>
