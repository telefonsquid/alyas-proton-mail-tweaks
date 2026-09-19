#!/usr/bin/env node

// Strips personal data out of the Proton Mail scrapes and drops Proton's vendor bundles.
// Placeholders come from a hash of the original value, so a scrape added later maps the
// same address or label to the same placeholder as the ones already in the repo.
//
// Run from the repo root: node tools/anonymize.mjs [scrapeDir]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(process.argv[2] ?? 'proton-mail-scrapes');

// Proton's own infrastructure addresses identify nobody and make the scrapes easier to read
const KEEP_HOST = /(^|\.)(proton\.me|protonmail\.com|pm\.me)$/i;

// Local parts that describe a role rather than a person
const ROLE_WORDS = new Set([
	'no', 'noreply', 'no-reply', 'reply', 'mail', 'email', 'em', 'info', 'service', 'services',
	'support', 'contact', 'admin', 'webmaster', 'master', 'team', 'news', 'newsletter', 'notify',
	'notification', 'notifications', 'invite', 'invites', 'request', 'requests', 'hello', 'help',
	'billing', 'account', 'accounts', 'alerts', 'auto', 'bot', 'sales', 'shop', 'store', 'post',
	'mailer', 'daemon', 'wordpress', 'root', 'null'
]);

const PERSON_NAMES = [
	'Mara Velt', 'Jonas Ekhart', 'Lina Brost', 'Timo Rask', 'Nora Quell', 'Bene Hald',
	'Ilka Storm', 'Ravi Denk', 'Suse Forst', 'Emil Trask', 'Yara Kolb', 'Piet Vogl',
	'Anja Werth', 'Milo Barth', 'Reni Falk', 'Gustav Oorn', 'Thea Munt', 'Kaspar Feld',
	'Orla Bink', 'Nils Rader', 'Hedi Sorn', 'Finn Larbe', 'Vera Klint', 'Osk Meyder',
	'Juna Prahl', 'Levi Storb', 'Maja Renk', 'Arne Tilk', 'Sina Dorn', 'Bruno Wist',
	'Elsa Grimm', 'Toni Velde', 'Rike Haas', 'Odo Brandt', 'Lotte Fenn', 'Kai Ulmen',
	'Nena Rott', 'Jorin Sade', 'Frida Loop', 'Hanno Kest', 'Alma Vogt', 'Eike Rhen',
	'Stina Wolk', 'Mats Perle', 'Ida Cronau', 'Vito Hemm', 'Runa Selk', 'Peer Lunde'
];

const FAKE_HOSTS = [
	'example.com', 'example.net', 'example.org', 'mail.example', 'post.example',
	'shop.example', 'bank.example', 'social.example', 'uni.example', 'dev.example'
];

const FILLER = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor '
	+ 'incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation '
	+ 'ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit '
	+ 'voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non '
	+ 'proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

// Proton folder and label names that ship with every account
const SYSTEM_LABELS = new Set([
	'Inbox', 'Drafts', 'Sent', 'Starred', 'Archive', 'Spam', 'Trash', 'All mail',
	'Almost all mail', 'Scheduled', 'Snoozed', 'Outbox', 'Mailing lists', 'Newsletters'
]);

// Display name of a list entry: the first text that follows the sender marker
const SENDER_NAME = /(data-testid="message-(?:column|row):sender-address">(?:<[^>]*>)*)([^<]+)/g;

// A sender that is a service rather than a person, kept so the list still reads as the real thing.
// Proton is here for a scrape edited by hand, the rest of its rows are caught by their address.
const KEEP_SENDERS = new Set(['GitHub', 'Proton']);

// Folders and labels are named in three places, and a collapsed sidebar carries none of them
const LABEL_SOURCES = [
	/data-testid="sidebar-label:([^"]*)"/g,
	/data-testid="folder-dropdown:folder-([^"]*)"/g,
	/data-testid="item-location-([^"]*)"/g
];

// The leading guard keeps a percent encoded path from being read as one long local part
const EMAIL = /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// An address this script already wrote. Skipping it keeps the promise that a sender maps to the
// same placeholder months later, which a second run would otherwise break.
const PLACEHOLDERS = new Set(PERSON_NAMES.map((name) => name.toLowerCase().replace(' ', '.')));
const isPlaceholder = (local, host) =>
	FAKE_HOSTS.includes(host) && PLACEHOLDERS.has(local.replace(/\d+$/, ''));

const digest = (value) => crypto.createHash('sha1').update(value).digest();
const pick = (value, salt, list) => list[digest(salt + value).readUInt32BE(0) % list.length];
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Never touch a match that sits inside a class name, an identifier or a longer word
const isolated = (value) => new RegExp(`(?<![A-Za-z0-9_-])${escape(value)}(?![A-Za-z0-9_-])`, 'gi');

// Take a placeholder, or the next free variation of it when another value already claimed it
function claim(taken, candidate, vary) {
	let out = candidate;
	for (let n = 2; taken.has(out); n++) out = vary(n);
	taken.add(out);
	return out;
}

// Text of the requested length, so ellipsis and column widths still behave like the original
function fillerText(seed, length) {
	if (length <= 0) return '';
	let out = '';
	let step = 0;
	while (out.length < length) {
		out += (out ? ' ' : '') + pick(seed + step++, 'filler', FILLER);
	}
	out = out.slice(0, length).replace(/\s$/, 'x');
	return out[0].toUpperCase() + out.slice(1);
}

function walk(dir) {
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else out.push(full);
	}
	return out;
}

const pages = () => walk(ROOT).filter((f) => /\.htm$/i.test(f) && !path.dirname(f).includes('_files'));
const stylesheets = () => walk(ROOT).filter((f) => /\.css$/i.test(f));

// Proton's compiled app code and the saved mail body carry no styling information
function prune() {
	let removed = 0;
	let bytes = 0;

	for (const file of walk(ROOT)) {
		const inAssets = path.dirname(file).includes('_files');
		const keep = /\.(css|svg)$/i.test(file) || (!inAssets && /\.htm$/i.test(file));
		if (keep) continue;
		bytes += fs.statSync(file).size;
		fs.rmSync(file);
		removed++;
	}

	// Sweep the folders the removed files left behind
	for (let pass = 0; pass < 3; pass++) {
		for (const dir of walk(ROOT).map((f) => path.dirname(f))) {
			try {
				fs.rmdirSync(dir);
			} catch {
				// Still holds kept assets
			}
		}
	}

	return { removed, bytes };
}

function buildMaps(text, styles) {
	const emails = new Map();
	const hosts = new Map();
	const nameTokens = new Map();
	const senders = new Map();
	const subjects = new Map();
	const labels = new Map();
	const ids = new Map();

	const takenEmail = new Set();
	const takenLabel = new Set();

	// A word Proton ships in its own stylesheet belongs to the markup, not to a person
	const isFrameworkWord = (word) => new RegExp(`[.#-]${escape(word)}[^A-Za-z0-9]`, 'i').test(styles);

	for (const raw of text.match(EMAIL) ?? []) {
		const address = raw.toLowerCase();
		if (emails.has(address)) continue;
		const [local, host] = address.split('@');
		if (KEEP_HOST.test(host) || isPlaceholder(local, host)) continue;

		const person = pick(address, 'person', PERSON_NAMES);
		const [first, last] = person.toLowerCase().split(' ');
		const fakeHost = hosts.get(host) ?? pick(host, 'host', FAKE_HOSTS);
		hosts.set(host, fakeHost);

		const base = `${first}.${last}@${fakeHost}`;
		emails.set(address, claim(takenEmail, base, (n) => `${first}.${last}${n}@${fakeHost}`));

		// A local part that looks like a person's name also shows up as display text elsewhere
		for (const token of local.split(/[._%+-]/)) {
			if (token.length < 4 || ROLE_WORDS.has(token) || nameTokens.has(token)) continue;
			if (isFrameworkWord(token)) continue;
			nameTokens.set(token, pick(token, 'token', PERSON_NAMES).split(' ')[0]);
		}
	}

	for (const match of text.matchAll(SENDER_NAME)) {
		const name = match[2].trim();
		if (!name || senders.has(name) || KEEP_SENDERS.has(name)) continue;
		senders.set(name, pick(name, 'sender', PERSON_NAMES));
	}

	for (const match of text.matchAll(/data-testid="message-item:([^"]*)"/g)) {
		const subject = match[1];
		if (!subject || subjects.has(subject)) continue;
		subjects.set(subject, fillerText(subject, subject.length));
	}

	for (const source of LABEL_SOURCES) {
		for (const match of text.matchAll(source)) {
			const label = match[1];
			if (!label || labels.has(label) || SYSTEM_LABELS.has(label)) continue;

			// Keep a leading emoji, it belongs to how the sidebar looks and says nothing about the owner
			const [, prefix, body] = label.match(/^([^\p{L}\p{N}]*)(.*)$/u);
			const replacement = body ? prefix + fillerText(label, body.length) : label;
			labels.set(label, claim(takenLabel, replacement, (n) => `${replacement.slice(0, -1)}${n}`));
		}
	}

	// Conversation and label identifiers, 86 base64url characters plus padding
	for (const raw of text.match(/[A-Za-z0-9_-]{86}={0,2}/g) ?? []) {
		const id = raw.replace(/=+$/, '');
		if (ids.has(id)) continue;
		const fake = crypto.createHash('sha256').update('id' + id).digest('base64url').toLowerCase();
		ids.set(id, fake.repeat(3).slice(0, id.length));
	}

	return { emails, hosts, nameTokens, senders, subjects, labels, ids };
}

// Proton spells the sender out in the saved page, so a row's initials are a real person's, and
// its picture is pruned along with the other assets and leaves an empty box behind. The address
// decides who the row is instead, which keeps two senders from collapsing into one name, and the
// initials follow it. A service name, a kept Proton address and a surviving logo are left alone.
function rewriteSenders(text) {
	const shown = /(data-testid="message-(?:column|row):sender-address">(?:<[^>]*>)*)([^<]+)/;
	const from = /title="([^"]*@[^"]*)"\s+data-testid="message-(?:column|row):sender-address"/;
	const picture = /<img class="[^"]*item-sender-image[^"]*"[^>]*src="[^"]*\.(?:png|jpe?g|webp|gif|avif)"[^>]*>/i;
	const abbr = /<span data-testid="contact-initials">[^<]*<\/span>/;

	const rows = text.split(/(?=<label class="item-checkbox-label)/);

	return rows
		.map((row, index) => {
			const current = index ? row.match(shown)?.[2].trim() : null;
			if (!current) return row;

			const address = row.match(from)?.[1].split(',')[0].trim() ?? '';
			const host = address.split('@')[1] ?? '';

			// A kept address is Proton's own, so the account is named after it rather than a person
			let person = current;
			if (address && !KEEP_SENDERS.has(current)) {
				person = KEEP_HOST.test(host) ? 'Proton' : pick(address, 'display', PERSON_NAMES);
			}

			const letters = person.split(/\s+/).slice(0, 2).map((word) => word[0].toUpperCase());
			const span = `<span data-testid="contact-initials">${letters.join('')}</span>`;

			return row
				.replace(shown, (whole, head) => head + person)
				.replace(abbr, span)
				.replace(picture, span);
		})
		.join('');
}

function applyMaps(text, maps) {
	const { emails, hosts, nameTokens, senders, subjects, labels, ids } = maps;
	const byLength = (map) => [...map].sort((a, b) => b[0].length - a[0].length);

	// Only at the one spot the list renders it, a brand like Proton is a class name elsewhere.
	// A replaced name or address is parked behind a marker until every other pass is through,
	// or the token pass below swaps a first name inside one of them and two senders end up
	// sharing one identity.
	const parked = [];
	const park = (value) => `\0${parked.push(value) - 1}\0`;
	text = text.replace(SENDER_NAME, (whole, head, name) => head + park(senders.get(name.trim()) ?? name));

	// Proton's own verified sender badge. It names nobody, and a replacement meant for a label
	// that happens to carry the same word would otherwise eat it.
	const badge = /(class="label-proton-badge-text[^"]*">)([^<]*)/g;
	text = text.replace(badge, (whole, head, word) => head + park(word));

	// Longest first, so a subject that contains another subject is not broken up
	for (const [from, to] of byLength(subjects)) text = text.replaceAll(from, to);
	for (const [from, to] of byLength(labels)) text = text.replaceAll(from, to);
	for (const [from, to] of byLength(emails)) {
		text = text.replace(new RegExp(escape(from), 'gi'), () => park(to));
	}

	// Bare domains left over in titles, file names and link text
	for (const [from, to] of byLength(hosts)) text = text.replace(isolated(from), to);
	for (const [from, to] of byLength(nameTokens)) text = text.replace(isolated(from), to);

	// Identifiers appear both as written and lowercased, and the placeholder is lowercase already
	for (const [from, to] of ids) {
		text = text.replace(new RegExp(escape(from), 'gi'), to);
	}

	text = text.replace(/\0(\d+)\0/g, (whole, index) => parked[index]);

	// Last, so a row is named after the address it ends up carrying
	return rewriteSenders(text);
}

// Drop the mailbox address out of the saved file and asset folder names
function renameScrapes() {
	const renamed = [];

	for (const dir of fs.readdirSync(ROOT, { withFileTypes: true })) {
		if (!dir.isDirectory()) continue;
		const base = path.join(ROOT, dir.name);

		for (const entry of fs.readdirSync(base)) {
			if (!entry.endsWith('.htm')) continue;
			const stem = entry.slice(0, -4);
			const assets = path.join(base, `${stem}_files`);
			if (!fs.existsSync(assets)) continue;

			const target = stem
				.replace(/\s*_\s*[^_]*@[^_]*\s*_\s*/g, ' ')
				.replace(/proton\s*mail/i, '')
				.trim()
				.replace(/\s+/g, '-')
				.toLowerCase() || 'page';

			// Windows refuses a rename onto the same name, and a second run hits every scrape again
			const page = path.join(base, `${target}.htm`);
			if (target !== stem) {
				fs.renameSync(path.join(base, entry), page);
				fs.renameSync(assets, path.join(base, `${target}_files`));
			}

			renamed.push([page, target]);
		}
	}

	return renamed;
}

// Point every asset link at the renamed folder. Runs before anything rewrites the text,
// because the old folder name holds the mailbox address and would be scrubbed out from
// under this.
function rewriteAssetLinks(renamed) {
	for (const [page, target] of renamed) {
		const text = fs.readFileSync(page, 'utf8').replace(/[^"'=\s>]*_files\//g, `${target}_files/`);
		fs.writeFileSync(page, text);
	}
}

const pruned = prune();

const renamed = renameScrapes();
rewriteAssetLinks(renamed);

const maps = buildMaps(
	pages().map((f) => fs.readFileSync(f, 'utf8')).join('\n'),
	stylesheets().map((f) => fs.readFileSync(f, 'utf8')).join('\n')
);

for (const file of pages()) {
	fs.writeFileSync(file, applyMaps(fs.readFileSync(file, 'utf8'), maps));
}

console.log(`pruned   ${pruned.removed} files, ${(pruned.bytes / 1e6).toFixed(1)} MB`);
console.log(`emails   ${maps.emails.size}`);
console.log(`hosts    ${maps.hosts.size}`);
console.log(`names    ${maps.nameTokens.size}`);
console.log(`senders  ${maps.senders.size}`);
console.log(`subjects ${maps.subjects.size}`);
console.log(`labels   ${maps.labels.size}`);
console.log(`ids      ${maps.ids.size}`);
console.log(`renamed  ${renamed.length} pages`);
