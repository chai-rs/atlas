#!/usr/bin/env node
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const plugin = dirname(dirname(fileURLToPath(import.meta.url)))
const read = file => readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
const table = JSON.parse(read(join(plugin, 'references/nodes.json')))
const version = JSON.parse(read(join(plugin, '.claude-plugin/plugin.json'))).version
const reserved = new Set(['index.md', 'log.md'])
const today = () => new Date().toLocaleDateString('sv')
const stamp = () => `generated: { by: atlas/${version}, at: ${new Date().toISOString()} }`
const open = '<!-- atlas:calls-in -->'
const close = '<!-- /atlas:calls-in -->'

// The plugin ships without dependencies, and every check reads top-level keys
// only, so this keeps the raw text of each top-level value instead of parsing YAML.
function frontmatter(text) {
	const match = /^---\n([\s\S]*?)\n---(?:\n([\s\S]*))?$/.exec(text)
	if (!match) return null
	const keys = {}
	let last
	for (const line of match[1].split('\n')) {
		const top = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
		if (top) keys[(last = top[1])] = top[2]
		else if (last && /^\s+\S/.test(line)) keys[last] += `\n${line}`
	}
	return { keys, body: match[2] ?? '' }
}

function scalar(value) {
	return (value ?? '')
		.replace(/\s+#.*$/, '')
		.trim()
		.replace(/^(["'])(.*)\1$/, '$2')
}

function glob(pattern) {
	const escaped = pattern.replace(/[.+^$()|\\{}]/g, '\\$&').replaceAll('*', '[^/]+')
	return new RegExp(`^${escaped}$`)
}

function nodes(bundle) {
	return readdirSync(bundle, { withFileTypes: true, recursive: true })
		.filter(entry => entry.isFile() && entry.name.endsWith('.md') && !reserved.has(entry.name))
		.map(entry => relative(bundle, join(entry.parentPath, entry.name)).split(sep).join('/'))
		.sort()
}

function links(body) {
	return [...body.matchAll(/\]\(([^)\s#]+\.md)(?:#[^)\s]*)?\)/g)]
		.map(match => match[1])
		.filter(target => !target.includes('://'))
}

function check(bundle) {
	if (!existsSync(bundle)) {
		console.error(`${bundle}: no such directory`)
		return 1
	}
	const problems = []
	const report = (file, message) => problems.push(`${file}: ${message}`)
	const files = nodes(bundle)
	if (!files.includes('atlas.md')) report('atlas.md', 'missing, run the setup skill')

	for (const file of files) {
		const doc = frontmatter(read(join(bundle, file)))
		if (!doc) {
			report(file, 'no frontmatter')
			continue
		}
		const type = scalar(doc.keys.type)
		const rule = table.types[type]
		if (!rule) {
			report(file, type ? `unknown type "${type}"` : 'missing key "type"')
			continue
		}
		if (!glob(rule.path).test(file)) report(file, `type "${type}" belongs at ${rule.path}`)

		for (const key of [...table.common, ...(rule.keys ?? [])]) {
			if (!scalar(doc.keys[key])) report(file, `missing key "${key}"`)
		}
		const status = scalar(doc.keys.status)
		if (status && !table.status.includes(status)) {
			report(file, `status "${status}" must be one of ${table.status.join(', ')}`)
		}
		const generated = doc.keys.generated ?? ''
		if (generated && !(/\bby:\s*\S/.test(generated) && /\bat:\s*\S/.test(generated))) {
			report(file, 'generated needs "by" and "at"')
		}

		if (rule.realization) {
			const realization = scalar(doc.keys.realization)
			if (!table.realization.includes(realization)) {
				report(file, `realization must be one of ${table.realization.join(', ')}`)
			} else if (realization === 'built' && rule.fromCode && !scalar(doc.keys.sources)) {
				report(file, 'a built node needs "sources"')
			}
		}

		if (rule.diagram) {
			const blocks = doc.body.match(/```mermaid\n[\s\S]*?```/g) ?? []
			const opens = new RegExp(`^\\s*${rule.diagram}\\b`, 'm')
			if (!blocks.some(block => opens.test(block))) report(file, `needs a mermaid ${rule.diagram}`)
		}

		for (const target of links(doc.body)) {
			if (target.startsWith('/')) report(file, `link ${target} must be relative`)
			else if (!existsSync(join(bundle, dirname(file), target))) report(file, `broken link ${target}`)
		}
	}

	for (const problem of problems) console.log(problem)
	console.log(`${files.length} nodes, ${problems.length} problems`)
	return problems.length ? 1 : 0
}

function init(root, { system, language, html }) {
	if (!system || !language) {
		console.error('init needs --system and --language')
		return 2
	}
	const files = {
		'.workspace/atlas.md': [
			'---',
			'type: atlas-config',
			`title: ${JSON.stringify(system)}`,
			`description: ${JSON.stringify(`Atlas settings of the ${system} workspace.`)}`,
			'status: stable',
			stamp(),
			'okf_version: "0.2"',
			`system: ${JSON.stringify(system)}`,
			`language: ${language}`,
			`html: ${html}`,
			'---',
			'',
			`# ${system}`,
			'',
			'The atlas skills read their settings from the frontmatter of this file.',
			'',
		].join('\n'),
		'.workspace/log.md': `# Directory Update Log\n\n## ${today()}\n* **Initialization**: Created the workspace of ${system}.\n`,
		'AGENTS.md': read(join(plugin, 'references/pointer.md')),
		'CLAUDE.md': '@AGENTS.md\n',
	}
	for (const [file, text] of Object.entries(files)) {
		const path = join(root, file)
		if (existsSync(path)) {
			console.log(`kept ${file}`)
			continue
		}
		mkdirSync(dirname(path), { recursive: true })
		writeFileSync(path, text)
		console.log(`created ${file}`)
	}

	const ignore = join(root, '.gitignore')
	const current = existsSync(ignore) ? read(ignore) : ''
	const missing = ['.atlas.local.json', 'viz.html'].filter(line => !current.split('\n').includes(line))
	if (missing.length) {
		const gap = current && !current.endsWith('\n') ? '\n' : ''
		appendFileSync(ignore, gap + missing.map(line => `${line}\n`).join(''))
		console.log('updated .gitignore')
	}
	return 0
}

function log(bundle, entry) {
	if (!entry) {
		console.error('log needs an entry')
		return 2
	}
	const file = join(bundle, 'log.md')
	const text = existsSync(file) ? read(file) : '# Directory Update Log\n'
	const heading = `## ${today()}\n`
	const line = `* ${entry}\n`
	const older = text.indexOf('\n## ')
	let next
	if (text.includes(heading)) next = text.replace(heading, heading + line)
	else if (older < 0) next = `${text.trimEnd()}\n\n${heading}${line}`
	else next = `${text.slice(0, older)}\n${heading}${line}${text.slice(older)}`
	writeFileSync(file, next)
	return 0
}

function orphans(bundle) {
	const files = nodes(bundle)
	const entry = new Set()
	const linked = new Set()
	for (const file of files) {
		const doc = frontmatter(read(join(bundle, file)))
		if (!doc) continue
		if (table.types[scalar(doc.keys.type)]?.entry) entry.add(file)
		for (const target of links(doc.body)) {
			const node = posix.join(posix.dirname(file), target)
			if (node !== file) linked.add(node)
		}
	}
	const found = files.filter(file => !entry.has(file) && !linked.has(file))
	for (const file of found) console.log(file)
	console.log(`${found.length} orphans`)
	return 0
}

function rows(lines) {
	return lines.map(line =>
		line
			.trim()
			.replace(/^\||\|$/g, '')
			.split('|')
			.map(cell => cell.trim()),
	)
}

const tableLines = text => text.split('\n').filter(line => line.trim().startsWith('|'))

function callsIn(bundle) {
	const files = nodes(bundle)
	const inbound = new Map()
	for (const file of files.filter(name => glob(table.types['outbound-calls'].path).test(name))) {
		const from = file.split('/')[2]
		const container = join(bundle, `c4/containers/${from}/container.md`)
		const title = (existsSync(container) && scalar(frontmatter(read(container))?.keys.title)) || from
		const body = frontmatter(read(join(bundle, file)))?.body ?? ''
		for (const [to = '', protocol = '', purpose = ''] of rows(tableLines(body).slice(2))) {
			const target = /\]\(\.\.\/\.\.\/([^/)]+)\/container\.md\)/.exec(to)?.[1]
			if (!target) continue
			const callers = inbound.get(target) ?? []
			callers.push(`| [${title}](../../${from}/container.md) | ${protocol} | ${purpose} |`)
			inbound.set(target, callers)
		}
	}

	let status = 0
	const written = new Set()
	for (const file of files.filter(name => glob(table.types['inbound-calls'].path).test(name))) {
		const name = file.split('/')[2]
		written.add(name)
		const text = read(join(bundle, file))
		const start = text.indexOf(open)
		const end = text.indexOf(close)
		if (start < 0 || end < start) {
			console.log(`${file}: missing the ${open} block`)
			status = 1
			continue
		}
		const inside = tableLines(text.slice(start + open.length, end))
		const head = inside.length >= 2 ? inside.slice(0, 2) : ['| From | Protocol | Purpose |', '| --- | --- | --- |']
		const block = [open, ...head, ...(inbound.get(name) ?? []).sort(), close].join('\n')
		const next = text.slice(0, start) + block + text.slice(end + close.length)
		if (next === text) continue
		writeFileSync(join(bundle, file), next.replace(/^generated:.*$/m, stamp()))
		console.log(`updated ${file}`)
	}
	for (const [name, callers] of inbound) {
		if (written.has(name)) continue
		console.log(`c4/containers/${name}/code/calls-in.md: missing, ${callers.length} callers not recorded`)
		status = 1
	}
	return status
}

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		dir: { type: 'string' },
		system: { type: 'string' },
		language: { type: 'string' },
		html: { type: 'boolean', default: false },
	},
})
const [command, argument] = positionals

if (command === 'init') process.exitCode = init(values.dir ?? '.', values)
else if (command === 'check') process.exitCode = check(argument ?? '.workspace')
else if (command === 'log') process.exitCode = log(values.dir ?? '.workspace', argument)
else if (command === 'orphans') process.exitCode = orphans(argument ?? '.workspace')
else if (command === 'calls-in') process.exitCode = callsIn(argument ?? '.workspace')
else {
	console.error(
		[
			'usage:',
			'  atlas.mjs init --system <name> --language <code> [--html] [--dir <repository root>]',
			'  atlas.mjs check [<bundle>]',
			'  atlas.mjs log [--dir <bundle>] "<entry>"',
			'  atlas.mjs orphans [<bundle>]',
			'  atlas.mjs calls-in [<bundle>]',
		].join('\n'),
	)
	process.exitCode = 2
}
