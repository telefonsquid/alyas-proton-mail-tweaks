export type Unit = 'rem' | 'px' | 'vh' | '%' | '';

export type Knob = {
	name: string;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	unit: Unit;
};

// Resolves a knob to a length. The preview needs the number, the UserCSS build needs the
// LESS variable, and every tweak is written once against this instead of twice.
export type Resolve = (knob: string) => string;

export type Tweak = {
	id: string;
	title: string;

	// Only where a tweak reaches further than its title says
	note?: string;
	group: Group;
	enabled: boolean;

	// Only takes effect while the named tweak is on, and the picker indents it below that one
	requires?: string;

	knobs?: Knob[];
	css: (v: Resolve) => string;
};

export const GROUPS = ['Starred', 'Sidebar', 'Mail list', 'Dialogs'] as const;

export type Group = (typeof GROUPS)[number];
