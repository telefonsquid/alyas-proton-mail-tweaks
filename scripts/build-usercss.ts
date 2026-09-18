// Writes the installable stylesheet and checks that Stylus' preprocessor can read it.
//
//   bun scripts/build-usercss.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { TWEAKS } from '../src/lib/tweaks/registry.ts';
import { defaultSelection, userCss, validate } from '../src/lib/tweaks/generate.ts';

const OUT = resolve(import.meta.dirname, '../static/proton-mail-tweaks.user.css');

const problems = validate();
if (problems.length) {
	for (const problem of problems) console.error(problem);
	process.exit(1);
}

const selection = defaultSelection();
const style = userCss(selection);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, style);

// Stylus hands LESS one variable per @var, so feed it the same thing before compiling
async function check(): Promise<string | null> {
	let less;
	try {
		less = (await import('less')).default;
	} catch {
		return 'less is not installed, skipped the syntax check';
	}

	const vars = TWEAKS.flatMap((tweak) => [
		`@${tweak.id}: ${selection.enabled[tweak.id] ? 1 : 0};`,
		...(tweak.knobs ?? []).map((k) => `@${k.name}: ${selection.knobs[k.name]}${k.unit};`)
	]);

	const source = vars.join('\n') + '\n' + style.replace(/\/\* ==UserStyle==[\s\S]*?==\/UserStyle== \*\//, '');

	try {
		await less.render(source);
		return null;
	} catch (error) {
		return `less failed: ${(error as Error).message}`;
	}
}

const problem = await check();

console.log(`wrote ${OUT}`);
console.log(`${TWEAKS.length} tweaks, ${style.split('\n').length} lines`);
if (problem) console.log(problem);
