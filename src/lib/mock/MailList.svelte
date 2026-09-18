<script lang="ts">
	import Icon from './Icon.svelte';
	import { LABELS, MAILS } from './data';

	let {
		mode = 'column',
		density = 'compact'
	}: { mode?: 'column' | 'row'; density?: 'compact' | 'comfortable' } = $props();

	const colorOf = (name: string) => LABELS.find((l) => l.name === name)?.color ?? '#706d6b';

	// Comfortable shows a sender avatar, and the mock draws initials rather than a picture
	const initials = (sender: string) =>
		sender
			.split(' ')
			.map((word) => word[0])
			.slice(0, 2)
			.join('');
</script>

<div class="relative items-column-list w-full is-{mode} enhanced-list-container">
	{#each MAILS as mail (mail.subject)}
		<div class="item-container-wrapper relative">
			<div
				class="relative flex-1 flex flex-nowrap item-container item-container--{mode}"
				class:unread={mail.unread}
				class:item-is-selected={mail.selected}
			>
				{#if density === 'comfortable'}
					<label class="item-checkbox-label relative mr-3">
						<input
							type="checkbox"
							class="item-checkbox absolute inset-0 cursor-pointer m-0"
							data-testid="item-checkbox"
							aria-label="Select conversation"
						/>
						<span
							class="item-icon shrink-0 relative rounded inline-flex item-icon--small"
							aria-hidden="true"
						>
							<span class="m-auto item-abbr rounded overflow-hidden">
								{#if mail.avatar}
									<!-- Proton sizes the picture inline, which is what the tweak has to beat -->
									<img
										class="rounded relative item-sender-image ratio-square"
										alt=""
										width="32"
										src={mail.avatar}
										style="inline-size: 2rem;"
									/>
								{:else}
									{initials(mail.sender)}
								{/if}
							</span>
							<span class="item-icon-fakecheck m-auto"
								><Icon name="check" class="item-icon-fakecheck-icon" /></span
							>
						</span>
					</label>
				{:else}
					<label class="checkbox-container relative gap-2 item-icon-compact mr-3">
						<input type="checkbox" class="checkbox-input" data-testid="item-checkbox" />
						<span class="checkbox-fakecheck"></span>
						<span class="sr-only">Select conversation</span>
					</label>
				{/if}

				{#if mode === 'column'}
					<div
						class="item-column flex-1 flex flex-nowrap flex-column justify-center item-titlesender"
						data-testid="message-list:message"
					>
						<div class="flex items-center flex-nowrap">
							<div class="flex-1">
								<div class="flex items-center item-firstline">
									<div class="item-senders flex-1 flex items-center flex-nowrap">
										<span class="max-w-full text-ellipsis" data-testid="message-column:sender-address"
											>{mail.sender}</span
										>
									</div>
									<span class="item-firstline-infos shrink-0 flex flex-nowrap items-center">
										<time class="item-senddate-col text-sm">{mail.time}</time>
									</span>
								</div>

								<div class="flex flex-nowrap items-center item-secondline max-w-full">
									<div class="item-subject flex-1 flex flex-nowrap items-center">
										<span class="flex shrink-0" data-testid="item-location-{mail.location}">
											<Icon name={mail.location === 'Archive' ? 'archive' : 'inbox'} />
											<span class="sr-only">{mail.location}</span>
										</span>
										{#if mail.count}
											<span class="mr-1 shrink-0" aria-hidden="true">[{mail.count}]</span>
											<span class="sr-only">{mail.count} messages in conversation</span>
										{/if}
										<span
											role="heading"
											aria-level="2"
											class="max-w-full text-ellipsis"
											data-testid="message-column:subject">{mail.subject}</span
										>
									</div>

									<div class="item-icons shrink-0 flex flex-nowrap">
										<span class="flex item-meta-infos gap-1">
											{#if density === 'compact'}
												{@render labelStack(
													mail.labels,
													'is-stacked flex-row ml-1 justify-end',
													true
												)}
											{/if}
											{#if mail.attachment}
												<span class="flex" data-testid="item-attachment-icon-paper-clip">
													<Icon name="clip" />
												</span>
											{/if}
										</span>
									</div>

									<div class="item-icons flex shrink-0 flex-nowrap">
										<button class="starbutton relative item-star flex" type="button">
											<Icon name="star" />
											<span class="sr-only">Star conversation</span>
										</button>
									</div>
								</div>
							</div>

							{@render hoverButtons(true)}
						</div>

						<!-- Comfortable moves the labels onto a line of their own, with every one of them
						     spelled out instead of a first chip and a counter -->
						{#if density === 'comfortable'}
							<div class="flex flex-nowrap items-center max-w-full overflow-hidden">
								<div class="item-icons flex shrink-0 flex-nowrap mt-1">
									{@render labelStack(mail.labels, 'flex-row ml-2', false)}
								</div>
							</div>
						{/if}

						<!-- And an attachment gets a named button on yet another line of its own -->
						{#if density === 'comfortable' && mail.attachment}
							<div class="flex flex-nowrap gap-2 attachment-thumbnail-grid mt-1">
								<button
									class="button button-medium button-outline-weak text-sm flex items-center flex-nowrap gap-2 attachment-thumbnail"
									type="button"
								>
									<Icon name="clip" class="shrink-0" />
									<span class="lh100 attachment-thumbnail-name">
										<span class="inline-flex flex-nowrap max-w-full">
											<!-- Proton splits the extension off so it survives the ellipsis -->
											<span class="text-ellipsis text-pre"
												>{mail.attachmentName?.replace(/\.[^.]+$/, '.')}</span
											>
											<span class="shrink-0 text-pre">{mail.attachmentName?.split('.').pop()}</span>
										</span>
									</span>
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex flex-nowrap flex-column w-full">
						<div
							class="flex items-center flex-nowrap item-titlesender w-full gap-3"
							data-testid="message-list:message"
						>
							<div class="flex shrink-0">
								<button class="starbutton relative item-star flex" type="button">
									<Icon name="star" />
									<span class="sr-only">Star conversation</span>
								</button>
							</div>

							<div class="item-senders flex flex-nowrap shrink-0 w-custom" style="--w-custom: 15rem;">
								<span class="max-w-full text-ellipsis" data-testid="message-row:sender-address"
									>{mail.sender}</span
								>
							</div>

							{@render labelStack(mail.labels, 'flex-row shrink-0', density === 'compact')}

							<!-- Tags sit tight against each other. This is an inline row, so a line break between
							     them would render as a space that Proton does not have. -->
							<div class="item-subject flex items-center flex-nowrap">
								<span
									role="heading"
									aria-level="2"
									class="max-w-full text-ellipsis"
									data-testid="message-row:subject"
									><span class="inline-flex shrink-0 mr-1" data-testid="item-location-{mail.location}"
										><Icon name={mail.location === 'Archive' ? 'archive' : 'inbox'} /><span class="sr-only"
											>{mail.location}</span
										></span
									>{#if mail.count}<span class="shrink-0 mr-1" aria-hidden="true">[{mail.count}]</span><span
										class="sr-only">{mail.count} messages in conversation</span
									>{/if}<span>{mail.subject}</span></span
								>
							</div>

							<span class="flex flex-nowrap items-center shrink-0 justify-end">
								{@render hoverButtons(false)}

								<span class="item-senddate-row flex flex-nowrap items-center">
									{#if mail.attachment}<Icon name="clip" />{/if}
									<time>{mail.time}</time>
								</span>
							</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

{#snippet labelStack(labels: string[], extra: string, stacked: boolean)}
	{#if labels.length}
		<ul
			class="label-stack unstyled m-0 inline-flex items-center rounded-sm {extra}"
			aria-label="Labels:"
		>
			{#each stacked ? labels.slice(0, 1) : labels as label (label)}
				<li
					class="label-stack-item flex flex-row items-stretch justify-start flex-nowrap"
					style="--label-bg: {colorOf(label)};"
				>
					<button
						class="label-stack-item-inner label-stack-item-button text-ellipsis"
						type="button"
						title={label}
					>
						<span class="label-stack-item-text">{label}</span>
					</button>
				</li>
			{/each}

			<!-- Compact never puts more than one chip in the page, the rest are a number -->
			{#if stacked && labels.length > 1}
				<li class="label-stack-overflow-count flex">
					<span data-testid="label-stack:labels-overflow">+{labels.length - 1}</span>
				</li>
			{/if}
		</ul>
	{/if}
{/snippet}

{#snippet hoverButtons(withStar: boolean)}
	<div class="hidden flex-nowrap justify-space-between relative item-hover-action-buttons gap-1">
		<button class="button button-for-icon button-small button-ghost-weak" type="button">
			<Icon name="allmail" />
			<span class="sr-only">Mark as unread</span>
		</button>
		<button class="button button-for-icon button-small button-ghost-weak" type="button">
			<Icon name="trash" />
			<span class="sr-only">Move to trash</span>
		</button>
		<button class="button button-for-icon button-small button-ghost-weak" type="button">
			<Icon name="archive" />
			<span class="sr-only">Move to archive</span>
		</button>
		{#if withStar}
			<button
				class="button button-for-icon button-small button-ghost-weak starbutton item-star"
				type="button"
			>
				<Icon name="star" />
				<span class="sr-only">Star conversation</span>
			</button>
		{/if}
	</div>
{/snippet}
