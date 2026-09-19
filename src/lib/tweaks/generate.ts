import { TWEAKS, TWEAKS_BY_ID } from './registry';
import type { Knob, Resolve, Tweak } from './types';

export const STYLE_NAME = "Alya's Proton Mail Tweaks";
export const STYLE_NAMESPACE = 'proton-mail-css-tweaks';
export const STYLE_VERSION = '1.0.0';
export const TARGET_DOMAIN = 'mail.proton.me';
export const REPO_URL = 'https://github.com/telefonsquid/alyas-proton-mail-tweaks';
export const PICKER_URL = 'https://proton-mail-tweaks.henkys.dev';

export type Selection = {
	enabled: Record<string, boolean>;
	knobs: Record<string, number>;
};

export function defaultSelection(): Selection {
	const enabled: Record<string, boolean> = {};
	const knobs: Record<string, number> = {};

	for (const tweak of TWEAKS) {
		enabled[tweak.id] = tweak.enabled;
		for (const knob of tweak.knobs ?? []) knobs[knob.name] = knob.value;
	}

	return { enabled, knobs };
}

export const allKnobs = (): Knob[] => TWEAKS.flatMap((t) => t.knobs ?? []);

// A picked config travels in a query string, which is how the install link hands it to
// Stylus. Only what differs from the defaults goes along, so the URL stays readable.
export function selectionToQuery(selection: Selection): string {
	const params = new URLSearchParams();
	const base = defaultSelection();

	for (const tweak of TWEAKS) {
		const on = selection.enabled[tweak.id];
		if (on !== base.enabled[tweak.id]) params.append(on ? 'on' : 'off', tweak.id);
	}

	for (const knob of allKnobs()) {
		const value = selection.knobs[knob.name];
		if (value !== base.knobs[knob.name]) params.set(knob.name, String(value));
	}

	return params.toString();
}

// An unknown name is skipped rather than fatal, because this comes off a URL anyone can type
export function selectionFromQuery(
	params: URLSearchParams,
	selection = defaultSelection()
): Selection {
	for (const id of params.getAll('on')) {
		if (id in selection.enabled) selection.enabled[id] = true;
	}

	for (const id of params.getAll('off')) {
		if (id in selection.enabled) selection.enabled[id] = false;
	}

	for (const [key, value] of params) {
		if (key in selection.knobs && Number.isFinite(Number(value))) {
			selection.knobs[key] = Number(value);
		}
	}

	return selection;
}

// A tweak only counts as on once the tweak it hangs off is on as well
export function isActive(tweak: Tweak, selection: Selection): boolean {
	if (!selection.enabled[tweak.id]) return false;
	if (!tweak.requires) return true;

	const parent = TWEAKS_BY_ID.get(tweak.requires);
	return parent ? isActive(parent, selection) : false;
}

// Tweak ids and knob names share one namespace, because Stylus turns both into LESS variables
export function validate(): string[] {
	const problems: string[] = [];
	const seen = new Map<string, string>();

	const take = (name: string, owner: string) => {
		const other = seen.get(name);
		if (other) problems.push(`"${name}" is used by both ${other} and ${owner}`);
		else seen.set(name, owner);
	};

	for (const tweak of TWEAKS) {
		take(tweak.id, `tweak ${tweak.id}`);
		for (const knob of tweak.knobs ?? []) take(knob.name, `knob of ${tweak.id}`);

		if (tweak.requires && !TWEAKS_BY_ID.has(tweak.requires)) {
			problems.push(`${tweak.id} requires "${tweak.requires}", which does not exist`);
		}
	}

	return problems;
}

function dedent(css: string): string {
	const lines = css.replace(/^\n/, '').trimEnd().split('\n');
	const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\t*/)![0].length);
	const shortest = Math.min(...indents);

	return lines.map((l) => l.slice(shortest)).join('\n');
}

const indent = (css: string, by: string) =>
	css.split('\n').map((l) => (l.trim() ? by + l : l)).join('\n');

// What the preview injects: literal lengths, no wrapper, only what is switched on
export function previewCss(selection: Selection): string {
	const resolve: Resolve = (name) => {
		const knob = allKnobs().find((k) => k.name === name)!;
		return `${selection.knobs[name] ?? knob.value}${knob.unit}`;
	};

	return TWEAKS.filter((t) => isActive(t, selection))
		.map((t) => `/* ${t.title} */\n${dedent(t.css(resolve))}`)
		.join('\n\n');
}

function metadata(selection: Selection): string {
	const lines = [
		`@name           ${STYLE_NAME}`,
		`@namespace      ${STYLE_NAMESPACE}`,
		`@version        ${STYLE_VERSION}`,
		`@description    Makes Proton Mail's web UI denser and drops the parts you do not use.`,
		`@author         TelefonSquid`,
		`@homepageURL    ${PICKER_URL}`,
		`@supportURL     ${REPO_URL}/issues`,
		`@license        MIT`,
		`@preprocessor   less`,
		''
	];

	for (const tweak of TWEAKS) {
		const on = selection.enabled[tweak.id] ? 1 : 0;
		lines.push(`@var checkbox ${tweak.id} "${tweak.title}" ${on}`);

		for (const knob of tweak.knobs ?? []) {
			const value = selection.knobs[knob.name] ?? knob.value;
			const spec = `[${value}, ${knob.min}, ${knob.max}, ${knob.step}, "${knob.unit}"]`;
			lines.push(`@var range ${knob.name} "${tweak.group}: ${knob.label}" ${spec}`);
		}
	}

	return lines.join('\n');
}

// The README in short, for anyone who reads the installed file rather than the page
function banner(): string {
	return [
		'/*',
		` * ${STYLE_NAME}`,
		' *',
		" * A set of CSS tweaks that make Proton Mail's web UI denser, prettier and drop the",
		' * parts you never use.',
		' *',
		` * Configure and install   ${PICKER_URL}`,
		` * Source and issues       ${REPO_URL}`,
		' *',
		' * Every tweak below is an independent switch and most carry a slider. Both stay',
		" * adjustable in Stylus' own settings panel, so you never have to come back to the page.",
		' *',
		' * Built for Proton Mail 5.0.132.2 and newer, column and row mode, compact and',
		' * comfortable density, every theme. Older versions are untested. If something does not',
		' * work, open an issue with a screenshot and your Proton Mail version.',
		' *',
		' * The first of these tweaks were hand written. Upkeep is handled by Claude, because a',
		' * selector that moves on every Proton update is more hassle than a CSS tweak is worth',
		' * to chase by hand.',
		' *',
		' * Not affiliated with Proton. Proton and Proton Mail are trademarks of Proton AG.',
		' * MIT licensed.',
		' */'
	].join('\n');
}

// What you install: every tweak ships, each behind its own switch in Stylus' settings panel
export function userCss(selection: Selection): string {
	const resolve: Resolve = (name) => `@${name}`;

	const blocks = TWEAKS.map((tweak) => {
		const conditions = [tweak.requires, tweak.id]
			.filter(Boolean)
			.map((id) => `(@${id} = 1)`)
			.join(' and ');

		const body = indent(dedent(tweak.css(resolve)), '\t\t');
		return `\t/* ${tweak.title} */\n\t& when ${conditions} {\n${body}\n\t}`;
	});

	return [
		'/* ==UserStyle==',
		metadata(selection),
		'==/UserStyle== */',
		'',
		banner(),
		'',
		`@-moz-document domain("${TARGET_DOMAIN}") {`,
		blocks.join('\n\n'),
		'}',
		''
	].join('\n');
}
