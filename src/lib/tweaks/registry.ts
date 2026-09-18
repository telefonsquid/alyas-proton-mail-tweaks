import type { Tweak } from './types';

// A sidebar section is its header row plus the siblings that follow it, with nothing
// wrapping the two together. Every section selector below starts from the header.
const header = (section: 'views' | 'folders' | 'labels') =>
	`.navigation-list > li:has([data-shortcut-target='toggle-${section}'])`;

export const TWEAKS: Tweak[] = [
	{
		id: 'removeStarred',
		title: 'Remove everything Starred',
		group: 'Starred',
		enabled: true,
		css: () => `
			[data-testid='sidebar-label:Starred'] { display: none !important; }

			.item-container .item-star { display: none !important; }

			/* Row mode puts the star in its own flex child, which would leave a gap behind */
			.item-container--row div:has(> .item-star) { display: none !important; }

			/* Open mail. Hiding the wrapper takes its right margin with it */
			.message-header-star { display: none !important; }
		`
	},

	{
		id: 'hideViews',
		title: 'Remove Views',
		group: 'Sidebar',
		enabled: true,
		css: () => `
			${header('views')},
			${header('views')} + div { display: none !important; }
		`
	},

	{
		id: 'hideFolders',
		title: 'Remove Folders',
		group: 'Sidebar',
		enabled: true,
		css: () => `
			${header('folders')},
			${header('folders')} + div { display: none !important; }

			/* Subfolders sit next to their parent rather than inside it, and carry the same class */
			.navigation-list > li.navigation-item--folder { display: none !important; }
		`
	},

	{
		id: 'hideFoldersEverywhere',
		title: 'Remove folders everywhere else',
		note: 'Takes the Archive and Sent markers on list rows with it, and the Move to button.',
		group: 'Sidebar',
		enabled: false,
		requires: 'hideFolders',
		css: () => `
			/* Only the list and the open mail carry this, so it needs no scope */
			[data-testid^='item-location-'] { display: none !important; }

			[data-testid='toolbar:moveto'],
			[data-testid='message-header-expanded:folder-dropdown'] { display: none !important; }
		`
	},

	{
		id: 'hideLabels',
		title: 'Remove Labels',
		group: 'Sidebar',
		enabled: false,
		css: () => `
			${header('labels')},
			${header('labels')} + div,
			.navigation-list > li.navigation-item--label { display: none !important; }
		`
	},

	{
		id: 'hideLabelsEverywhere',
		title: 'Remove labels everywhere else',
		note: 'Takes the label chips on list rows with it, and the Label as button.',
		group: 'Sidebar',
		enabled: false,
		requires: 'hideLabels',
		css: () => `
			.item-container .label-stack { display: none !important; }

			/* Open mail. Hiding the wrapper takes its bottom margin with it */
			.message-header-expanded-label-container { display: none !important; }

			[data-testid='toolbar:labelas'],
			[data-testid='message-header-expanded:label-dropdown'] { display: none !important; }
		`
	},

	{
		id: 'compactSidebar',
		title: 'Compact sidebar',
		group: 'Sidebar',
		enabled: true,
		knobs: [
			{ name: 'sidebarRowHeight', label: 'Row height', value: 1.75, min: 1.25, max: 2.25, step: 0.125, unit: 'rem' },
			{ name: 'sidebarRowGap', label: 'Gap between rows', value: 0, min: 0, max: 8, step: 1, unit: 'px' },
			{ name: 'sidebarGroupGap', label: 'Gap above a section', value: 8, min: 0, max: 24, step: 1, unit: 'px' }
		],
		css: (v) => `
			.navigation-link,
			.navigation-link-header-group { block-size: ${v('sidebarRowHeight')} !important; }

			/* A section header carries its own 2.25rem, so without this the hover background
			   stands taller than the row it sits in */
			.navigation-link-header-group-link { block-size: ${v('sidebarRowHeight')} !important; }

			/* The add and settings buttons size themselves from padding and overshoot the same way */
			.navigation-link-header-group-control {
				display: inline-flex !important;
				align-items: center;
				block-size: ${v('sidebarRowHeight')} !important;
				padding-block: 0 !important;
			}

			.navigation-list li.navigation-item { margin-block-end: ${v('sidebarRowGap')} !important; }

			.navigation-list > li.navigation-link-header-group {
				margin-block-start: ${v('sidebarGroupGap')} !important;
			}
		`
	},

	{
		id: 'removeMoreToggle',
		title: 'Remove the More and Less button',
		note: 'Proton remembers the open state per account, so the sidebar freezes in whichever state it is in now.',
		group: 'Sidebar',
		enabled: true,
		css: () => `
			.navigation-list > div:has([data-shortcut-target='toggle-more-items']) {
				display: none !important;
			}

			/* Undoes the class a collapsed sidebar puts on those folders. Proton also remembers
			   the open state, so this only matters if it ever comes back collapsed. */
			.navigation-list > div:has([data-shortcut-target='toggle-more-items']) ~ div[role='presentation'] {
				display: block !important;
			}
		`
	},

	{
		id: 'hideMoreFolders',
		title: 'Hide those folders instead',
		note: 'Archive, Spam, Trash and the three All entries go with the toggle.',
		group: 'Sidebar',
		enabled: false,
		requires: 'removeMoreToggle',
		css: () => `
			/* The row rather than its wrapper, so this never argues with the rule above */
			.navigation-list > div:has([data-shortcut-target='toggle-more-items']) ~ div[role='presentation'] > li {
				display: none !important;
			}
		`
	},

	{
		id: 'compactList',
		title: 'Compact mail list',
		group: 'Mail list',
		enabled: true,
		knobs: [
			{ name: 'listPadColumn', label: 'Row padding, column mode', value: 4, min: 0, max: 16, step: 1, unit: 'px' },
			{ name: 'listPadRow', label: 'Row padding, row mode', value: 3, min: 0, max: 16, step: 1, unit: 'px' },
			{ name: 'listPadInline', label: 'Padding left and right', value: 12, min: 0, max: 24, step: 1, unit: 'px' },
			{ name: 'checkboxSize', label: 'Selection box', value: 16, min: 12, max: 20, step: 1, unit: 'px' }
		],
		css: (v) => `
			.is-column .item-container { --item-container-padding-block: ${v('listPadColumn')} !important; }

			.is-row .item-container { --item-container-padding-block: ${v('listPadRow')} !important; }

			.item-container { --item-container-padding-inline: ${v('listPadInline')} !important; }

			/* The round hit area around the box is 2rem, and once the text is this tight it is
			   the tallest thing in the row. Let it hug the box instead of setting the height. */
			.item-container .item-icon-compact {
				inline-size: auto !important;
				block-size: auto !important;
				margin-block: 0 !important;
			}

			.item-container .checkbox-fakecheck {
				min-inline-size: ${v('checkboxSize')} !important;
				inline-size: ${v('checkboxSize')} !important;
				block-size: ${v('checkboxSize')} !important;
			}

			/* Comfortable puts a sender avatar where compact has the selection box, and at 28px
			   it is what sets the row height there. The knob caps out at the text line, so the
			   row can never grow past it. */
			.item-checkbox-label {
				display: flex !important;
				align-items: center !important;
			}

			/* The avatar is inline, so it stands on a text baseline and drags the descender
			   space below it into the row. A flex parent above drops the line box entirely. */
			.item-checkbox-label .item-icon {
				inline-size: ${v('checkboxSize')} !important;
				block-size: ${v('checkboxSize')} !important;

				/* Proton rounds it by 8px, which is a circle once it is this small */
				border-radius: 2px !important;

				/* The initials, readable and centred rather than a few pixels in a corner */
				align-items: center !important;
				justify-content: center !important;
				font-size: calc(${v('checkboxSize')} * 0.625) !important;
				line-height: 1 !important;
			}

			/* A sender picture fills the avatar, wrapper included, so the percentage below has a
			   definite box to land on. The initials are left out, or they stretch out of the
			   middle their auto margin puts them in. */
			.item-checkbox-label .item-icon > *:not(.item-abbr),
			.item-checkbox-label .item-icon > .item-abbr:has(.item-sender-image),
			.item-checkbox-label .item-sender-image {
				inline-size: 100% !important;
				block-size: 100% !important;
			}

			/* Proton's grey backs the initials, and a picture covers it. Hover and a tick swap
			   the picture for a checkmark that needs the grey back, or it goes white on white. */
			.item-checkbox:not(:hover):not(:checked) + .item-icon:not(:hover):has(.item-sender-image) {
				background: none !important;
			}

			/* That checkmark is a fixed 1rem, so it hangs out of a box the knob made smaller */
			.item-checkbox-label .item-icon-fakecheck svg {
				inline-size: 100% !important;
				block-size: 100% !important;
			}

			/* Both boxes around the picture round themselves by 8px, a circle at this size */
			.item-checkbox-label .item-icon .item-abbr,
			.item-checkbox-label .item-sender-image {
				border-radius: inherit !important;
			}
		`
	},

	{
		id: 'columnSingleLine',
		title: 'Column mode on one line',
		group: 'Mail list',
		enabled: true,
		requires: 'compactList',
		knobs: [
			{ name: 'senderWidth', label: 'Sender column width', value: 15, min: 8, max: 26, step: 0.5, unit: 'rem' }
		],
		css: (v) => `
			/* Column mode stacks the sender over the subject inside two wrappers, and comfortable
			   adds a third line below for the labels. Dissolving all of them hands every part to
			   one flex row, which is the only place an order can put them in line. */
			.item-container--column .item-column {
				flex-direction: row !important;
				align-items: center !important;
				gap: 0.75rem;
				min-inline-size: 0;
			}

			.item-container--column .item-firstline,
			.item-container--column .item-column > div:first-child,
			.item-container--column .item-titlesender > div > .flex-1 {
				display: contents !important;
			}

			.item-container--column .item-senders {
				flex: 0 0 ${v('senderWidth')} !important;
				min-inline-size: 0;
				padding-inline-end: 0 !important;
				order: 1;
			}

			.item-container--column .item-secondline {
				flex: 1 1 auto !important;
				min-inline-size: 0;
				order: 2;
			}

			.item-container--column .item-icons { flex: 0 0 auto; order: 3; }

			/* The labels line, which exists in comfortable only. Picked by the chips it holds,
			   because an attachment adds a line after it and a last-child would catch that one
			   instead. Its top margin was the gap to the subject above and is dead weight now. */
			.item-container--column .item-column > div:not(:first-child):has(> .item-icons),
			.item-container--column .item-column > div:not(:first-child) > .item-icons {
				order: 4;
				margin: 0 !important;
			}

			/* The attachment line, comfortable's third. It shares the order of the labels, so
			   the two land in the row in the sequence they have in the page. */
			.item-container--column .item-column > .attachment-thumbnail-grid {
				order: 4;
				margin: 0 !important;
			}

			.item-container--column .item-firstline-infos {
				margin-inline-start: auto;
				order: 5;
			}

			/* Dissolving the wrappers lifted these into the row as well, where the default order
			   would park them in front of the sender */
			.item-container--column .item-hover-action-buttons { order: 6; }
		`
	},

	{
		id: 'chipAttachments',
		title: 'Attachments as chips',
		note: 'Comfortable density only. Compact never draws the buttons.',
		group: 'Mail list',
		enabled: true,
		css: () => `
			.item-container .attachment-thumbnail-grid {
				gap: 0.25rem !important;
				margin: 0 !important;
			}

			/* Proton's own chip metrics, so an attachment reads as one more label. The height
			   is the line box a label chip gets from its font size and line height. */
			.item-container .attachment-thumbnail {
				min-inline-size: 0 !important;
				max-inline-size: 10em !important;
				block-size: 1.64em !important;
				padding-block: 0 !important;
				padding-inline: 0.375rem !important;
				gap: 0.25rem !important;
				font-size: 0.6875rem !important;
				border-radius: 2px !important;
			}

			/* The file type icon is a fixed 1rem and would set the height on its own */
			.item-container .attachment-thumbnail > svg {
				inline-size: 1em !important;
				block-size: 1em !important;
			}

			/* Padding meant for the taller button */
			.item-container .attachment-thumbnail-name span span { padding-block: 0 !important; }
		`
	},

	{
		id: 'boldSenders',
		title: 'Bold senders',
		group: 'Mail list',
		enabled: true,
		css: () => `
			.item-container--column .item-senders { font-weight: 600 !important; }
		`
	},

	{
		id: 'accentLocationIcons',
		title: 'Accent the folder icons',
		group: 'Mail list',
		enabled: true,
		knobs: [
			{ name: 'locationIconOpacity', label: 'Strength', value: 100, min: 40, max: 100, step: 5, unit: '%' }
		],
		css: (v) => `
			/* --primary is set per theme, so this follows whichever one is picked. Falling back
			   to the inherited colour leaves a theme that does not define it untouched. */
			[data-testid^='item-location-'] {
				color: var(--primary, currentColor) !important;
				opacity: ${v('locationIconOpacity')} !important;
			}

			/* A selected row is painted in the accent itself, so the icon would vanish into it */
			.item-is-selected [data-testid^='item-location-'] {
				color: inherit !important;
				opacity: 1 !important;
			}
		`
	},

	{
		id: 'conversationCount',
		title: 'Accented conversation count',
		group: 'Mail list',
		enabled: true,
		knobs: [
			{ name: 'countGap', label: 'Space around', value: 4, min: 0, max: 12, step: 1, unit: 'px' },
			{ name: 'countFontSize', label: 'Count size', value: 14, min: 10, max: 18, step: 1, unit: 'px' }
		],
		css: (v) => `
			/* The bracketed number, and the only aria-hidden span in a subject. Row mode nests
			   the pair one level deeper, inside the heading. */
			.item-subject span[aria-hidden='true']:has(+ .sr-only) {
				display: inline-block !important;
				font-size: ${v('countFontSize')} !important;
				font-weight: 700 !important;
				line-height: 1.4 !important;
				color: var(--primary, currentColor) !important;

				/* Number and brackets share one text node, so the brackets can only be cut off.
				   They sit at either end, one bracket wide, and the margins take that space back
				   and add the gap. The box keeps hugging the number, so 100 is wider than 4. */
				clip-path: inset(-0.5em 0.355em) !important;
				margin-inline: calc(${v('countGap')} - 0.355em) !important;
			}

			/* Row mode spaces the location icon itself, which would stack onto the gap */
			.item-subject :has(+ span[aria-hidden='true'] + .sr-only) {
				margin-inline-end: 0 !important;
			}

			/* A selected row is painted in the accent itself, so the number would vanish into it */
			.item-is-selected .item-subject span[aria-hidden='true']:has(+ .sr-only) {
				color: inherit !important;
			}
		`
	},

	{
		id: 'hoverActions',
		title: 'Steady hover buttons',
		group: 'Mail list',
		enabled: true,
		knobs: [
			{ name: 'hoverButtonSize', label: 'Button size', value: 22, min: 16, max: 32, step: 1, unit: 'px' }
		],
		css: (v) => `
			/* With no height of its own the row cannot grow when the buttons appear. They still
			   claim their width, so nothing ends up hidden underneath them. Proton offsets them
			   downwards from a relative position, which static drops along with the offset. */
			.item-hover-action-buttons {
				position: static !important;
				block-size: 0 !important;
				align-items: center !important;
				margin-block: 0 !important;
			}

			/* No !important on display, or this would also bring back a button that another
			   tweak has switched off, the star being the one that does */
			.item-hover-action-buttons .button {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				inline-size: ${v('hoverButtonSize')} !important;
				block-size: ${v('hoverButtonSize')} !important;
				padding: 0 !important;
			}

			/* The icon is a fixed 1rem, which looks lost once the button grows around it */
			.item-hover-action-buttons .button > svg {
				inline-size: 55% !important;
				block-size: 55% !important;
			}
		`
	},

	{
		id: 'labelDialogHeight',
		title: 'Taller Label as and Move to dialogs',
		note: 'Move to is the same dialog and grows with it.',
		group: 'Dialogs',
		enabled: true,
		knobs: [
			{ name: 'labelDialogSize', label: 'Dialog height', value: 70, min: 40, max: 95, step: 5, unit: 'vh' }
		],
		css: (v) => `
			/* Proton's script writes the height as an inline style, so specificity alone loses here.
			   Its companion --available-height is measured once on open and goes stale on resize,
			   so cap against the room below the dialog instead. */
			.label-dropdown .dropdown-content,
			.move-dropdown .dropdown-content {
				block-size: ${v('labelDialogSize')} !important;
				max-block-size: calc(100vh - var(--top, 0px) - 0.5rem) !important;
			}

			/* The real limit. Without this the dialog grows and the list keeps its few rows */
			.label-dropdown .label-dropdown-list,
			.move-dropdown .move-dropdown-list { max-block-size: none !important; }
		`
	},

	{
		id: 'labelDialogCompact',
		title: 'Compact dialog rows',
		group: 'Dialogs',
		enabled: true,
		requires: 'labelDialogHeight',
		knobs: [
			{ name: 'labelRowPad', label: 'Row padding', value: 2, min: 0, max: 8, step: 1, unit: 'px' },
			{ name: 'labelChromeGap', label: 'Space around the buttons', value: 6, min: 0, max: 16, step: 1, unit: 'px' }
		],
		css: (v) => `
			.label-dropdown .dropdown-item,
			.move-dropdown .dropdown-item { padding-block: ${v('labelRowPad')} !important; }

			/* The stack of 1rem margins around search, buttons and footer costs more rows
			   than the row padding does */
			.label-dropdown .dropdown-content form > *,
			.move-dropdown .dropdown-content form > * {
				margin-block: ${v('labelChromeGap')} !important;
			}
		`
	}
];

export const TWEAKS_BY_ID = new Map(TWEAKS.map((t) => [t.id, t]));
