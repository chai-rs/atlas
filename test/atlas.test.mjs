import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repo = dirname(dirname(fileURLToPath(import.meta.url)))
const plugin = join(repo, 'plugins/atlas')
const script = join(plugin, 'scripts/atlas.mjs')
const sample = join(repo, 'test/fixtures/sample/.workspace')
const journey = 'business/journeys/borrow-a-tool.md'
const today = new Date().toLocaleDateString('sv')

const atlas = (...args) => spawnSync('node', [script, ...args], { encoding: 'utf8' })
const temp = () => mkdtempSync(join(tmpdir(), 'atlas-'))

function broken(file, edit) {
	const bundle = join(temp(), '.workspace')
	cpSync(sample, bundle, { recursive: true })
	writeFileSync(join(bundle, file), edit(readFileSync(join(bundle, file), 'utf8')))
	return atlas('check', bundle)
}

test('check accepts the sample bundle', () => {
	const run = atlas('check', sample)
	assert.equal(run.stdout, '8 nodes, 0 problems\n')
	assert.equal(run.status, 0)
})

const defects = [
	['a journey without a sequence diagram', journey, text => text.replace('sequenceDiagram', 'stateDiagram'), 'needs a mermaid sequenceDiagram'],
	['a node without realization', journey, text => text.replace('realization: planned\n', ''), 'realization must be one of planned, built'],
	['a status outside the OKF set', journey, text => text.replace('status: draft', 'status: approved'), 'status "approved" must be one of'],
	['a node without generated', journey, text => text.replace(/generated: .*\n/, ''), 'missing key "generated"'],
	['a link to a missing node', journey, text => text.replace('lend-tools.md', 'lend-things.md'), 'broken link ../capabilities/lend-things.md'],
	['a link that okf does not follow', journey, text => text.replace('../capabilities/lend-tools.md', '/business/capabilities/lend-tools.md'), 'must be relative'],
	['a type at the wrong path', 'business/vision.md', text => text.replace('type: vision', 'type: capability'), 'type "capability" belongs at business/capabilities/*.md'],
	['a type outside the table', 'business/vision.md', text => text.replace('type: vision', 'type: plan'), 'unknown type "plan"'],
	['a container without a kind', 'c4/containers/api/container.md', text => text.replace('kind: service\n', ''), 'missing key "kind"'],
	['a file without frontmatter', 'business/vision.md', text => text.replace(/^---\n[\s\S]*?\n---\n/, ''), 'no frontmatter'],
]

for (const [name, file, edit, message] of defects) {
	test(`check reports ${name}`, () => {
		const run = broken(file, edit)
		assert.match(run.stdout, new RegExp(`^${file}: .*${message.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`, 'm'))
		assert.match(run.stdout, /^8 nodes, 1 problems$/m)
		assert.equal(run.status, 1)
	})
}

test('check requires sources on a built node that comes from code', () => {
	const bundle = join(temp(), '.workspace')
	cpSync(sample, bundle, { recursive: true })
	const node = join(bundle, 'c4/containers/api/components.md')
	const head = 'type: component-view\ntitle: Components\ndescription: The modules of the API.\nstatus: draft\ngenerated: { by: atlas/0.1.0, at: 2026-10-04T10:05:00Z }\n'
	writeFileSync(node, `---\n${head}realization: built\n---\n\n# Components\n`)
	assert.match(atlas('check', bundle).stdout, /components\.md: a built node needs "sources"/)

	writeFileSync(node, `---\n${head}realization: built\nsources:\n  - resource: https://example.com/blob/0a1b2c3/src\n---\n\n# Components\n`)
	assert.equal(atlas('check', bundle).stdout, '9 nodes, 0 problems\n')
})

test('init creates a bundle that check accepts, and a second run changes nothing', () => {
	const root = temp()
	const first = atlas('init', '--dir', root, '--system', 'Shop: "North"', '--language', 'th', '--html')
	assert.equal(first.status, 0)
	const config = readFileSync(join(root, '.workspace/atlas.md'), 'utf8')
	assert.match(config, /^system: "Shop: \\"North\\""$/m)
	assert.match(config, /^language: th$/m)
	assert.match(config, /^html: true$/m)
	assert.equal(atlas('check', join(root, '.workspace')).stdout, '1 nodes, 0 problems\n')

	const second = atlas('init', '--dir', root, '--system', 'Other', '--language', 'en')
	assert.equal(second.stdout, 'kept .workspace/atlas.md\nkept .workspace/log.md\nkept AGENTS.md\nkept CLAUDE.md\n')
	assert.equal(readFileSync(join(root, '.workspace/atlas.md'), 'utf8'), config)
	assert.equal(readFileSync(join(root, '.gitignore'), 'utf8'), '.atlas.local.json\nviz.html\n')
})

test('init keeps the lines of an existing .gitignore', () => {
	const root = temp()
	writeFileSync(join(root, '.gitignore'), 'node_modules')
	atlas('init', '--dir', root, '--system', 'Shop', '--language', 'en')
	assert.equal(readFileSync(join(root, '.gitignore'), 'utf8'), 'node_modules\n.atlas.local.json\nviz.html\n')
})

test('log puts a new day above an older day and a new entry under its day', () => {
	const bundle = temp()
	writeFileSync(join(bundle, 'log.md'), '# Directory Update Log\n\n## 2020-01-01\n* **Initialization**: Old.\n')
	atlas('log', '--dir', bundle, '**Creation**: First.')
	atlas('log', '--dir', bundle, '**Update**: Second.')
	assert.equal(
		readFileSync(join(bundle, 'log.md'), 'utf8'),
		`# Directory Update Log\n\n## ${today}\n* **Update**: Second.\n* **Creation**: First.\n\n## 2020-01-01\n* **Initialization**: Old.\n`,
	)
})

function system() {
	const bundle = join(temp(), '.workspace')
	cpSync(sample, bundle, { recursive: true })
	const stamp = 'generated: { by: atlas/0.1.0, at: 2026-10-04T10:05:00Z }'
	const node = (file, type, extra, body) => {
		mkdirSync(dirname(join(bundle, file)), { recursive: true })
		writeFileSync(
			join(bundle, file),
			`---\ntype: ${type}\ntitle: ${type}\ndescription: A ${type} node.\nstatus: draft\nrealization: planned\n${extra}${stamp}\n---\n\n${body}\n`,
		)
	}
	node('c4/containers/database/container.md', 'container', 'kind: datastore\n', '# Database')
	node(
		'c4/containers/api/code/calls-out.md',
		'outbound-calls',
		'',
		'| To | Protocol | Purpose |\n| --- | --- | --- |\n| [Database](../../database/container.md) | SQL | Store loans |\n| Message service | HTTPS | Send the return date |',
	)
	return { bundle, node }
}

const block = rows => `<!-- atlas:calls-in -->\n| From | Protocol | Purpose |\n| --- | --- | --- |\n${rows}<!-- /atlas:calls-in -->`

test('calls-in fills the callers of a container from each calls-out node, and a second run changes nothing', () => {
	const { bundle, node } = system()
	const file = join(bundle, 'c4/containers/database/code/calls-in.md')
	node('c4/containers/database/code/calls-in.md', 'inbound-calls', '', `# Who calls us\n\n${block('| stale | row | here |\n')}\n\nNo caller from outside the system.`)

	const first = atlas('calls-in', bundle)
	assert.equal(first.stdout, 'updated c4/containers/database/code/calls-in.md\n')
	assert.equal(first.status, 0)
	const text = readFileSync(file, 'utf8')
	assert.ok(text.includes(block('| [API](../../api/container.md) | SQL | Store loans |\n')), text)
	assert.ok(text.includes('No caller from outside the system.'))
	assert.doesNotMatch(text, /2026-10-04T10:05:00Z/)

	const second = atlas('calls-in', bundle)
	assert.equal(second.stdout, '')
	assert.equal(readFileSync(file, 'utf8'), text)
	assert.match(atlas('check', bundle).stdout, /^11 nodes, 0 problems$/m)
})

test('calls-in reports a called container that has no calls-in node', () => {
	const { bundle } = system()
	const run = atlas('calls-in', bundle)
	assert.equal(run.stdout, 'c4/containers/database/code/calls-in.md: missing, 1 callers not recorded\n')
	assert.equal(run.status, 1)
})

test('orphans lists a node that no other node links to, and skips entry nodes', () => {
	assert.equal(atlas('orphans', sample).stdout, '0 orphans\n')
	const { bundle, node } = system()
	node('c4/containers/api/code/api/reserve-a-tool.md', 'operation', '', '# Reserve a tool')
	assert.equal(atlas('orphans', bundle).stdout, 'c4/containers/api/code/api/reserve-a-tool.md\n1 orphans\n')
})

test('check requires the diagram of each code-level type', () => {
	const { bundle, node } = system()
	node('c4/containers/api/code/domain.md', 'domain-model', '', '# Domain\n\n```mermaid\nerDiagram\n\tLOAN\n```')
	node('c4/containers/api/code/data.md', 'data-model', '', '# Data\n\n```mermaid\nerDiagram\n\tLOAN\n```')
	const run = atlas('check', bundle)
	assert.match(run.stdout, /^c4\/containers\/api\/code\/domain\.md: needs a mermaid classDiagram$/m)
	assert.match(run.stdout, /^12 nodes, 1 problems$/m)
})

const markdown = dir => readdirSync(dir).filter(name => name.endsWith('.md'))

function assertLinks(dir, file) {
	const prose = readFileSync(join(dir, file), 'utf8')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`[^`\n]*`/g, '')
	for (const [, target] of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
		assert.ok(existsSync(join(dir, target)), `${dir}/${file}: ${target}`)
	}
}

test('each skill has only the frontmatter keys that both harnesses read, and its links resolve', () => {
	const skills = readdirSync(join(plugin, 'skills'))
	assert.deepEqual(skills, ['atlas', 'bug', 'feature', 'question', 'render', 'review', 'setup', 'workspace'])
	for (const name of skills) {
		const dir = join(plugin, 'skills', name)
		const text = readFileSync(join(dir, 'SKILL.md'), 'utf8')
		const keys = [...text.split('\n---\n')[0].matchAll(/^([\w-]+):/gm)].map(match => match[1])
		assert.deepEqual(keys, ['name', 'description'], name)
		assert.match(text, new RegExp(`^name: ${name}$`, 'm'))
		assert.ok(text.split('\n').length <= 100, `${name}: SKILL.md is longer than 100 lines`)
		for (const file of markdown(dir)) assertLinks(dir, file)
	}
})

test('each link in the reference files resolves', () => {
	const dir = join(plugin, 'references')
	for (const file of markdown(dir)) assertLinks(dir, file)
})

test('each upstream skill that a flow names is in harness.md', () => {
	const harness = readFileSync(join(plugin, 'references/harness.md'), 'utf8')
	const upstream = ['grilling', 'domain-modeling', 'setup-matt-pocock-skills', 'to-spec', 'to-tickets', 'diagnosing-bugs', 'poteto-mode', 'how', 'why', 'ponytail-review']
	for (const name of upstream) assert.match(harness, new RegExp(`\\| ${name} \\|`), name)
	for (const skill of readdirSync(join(plugin, 'skills'))) {
		for (const file of markdown(join(plugin, 'skills', skill))) {
			const text = readFileSync(join(plugin, 'skills', skill, file), 'utf8')
			for (const [, name] of text.matchAll(/the `([\w-]+)` skill(?! of this plugin)/g)) {
				assert.ok(upstream.includes(name), `${skill}/${file} names the skill ${name}`)
			}
		}
	}
})

test('the manifests give one version', () => {
	const json = file => JSON.parse(readFileSync(join(repo, file), 'utf8'))
	const version = json('plugins/atlas/.claude-plugin/plugin.json').version
	assert.equal(json('plugins/atlas/.codex-plugin/plugin.json').version, version)
	assert.equal(json('.claude-plugin/marketplace.json').plugins[0].version, version)
})
