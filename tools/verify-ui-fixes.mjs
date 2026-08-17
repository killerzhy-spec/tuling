import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

const app = read('app.js');
const leaderboard = read('leaderboard.js');
const datasets = read('datasets.js');
const datasetsHtml = read('datasets.html');
const framework = read('framework.html');
const css = read('vitality-blue.css');

assert.match(app, /var activeKey = views\[key\] \? key : 'overview';/);
assert.match(app, /var nextImage = new Image\(\);/);
assert.match(app, /wrap\._setRadarView = focusView;/);

assert.match(leaderboard, /head\.innerHTML = '';/);
assert.match(leaderboard, /body\.innerHTML = '';/);
assert.match(css, /--lb-sticky-rank-width:\s*66px;/);
assert.match(css, /\.lb-table th:first-child,[\s\S]*?width:\s*var\(--lb-sticky-rank-width\);/);
assert.match(css, /\.lb-table th:nth-child\(2\),[\s\S]*?left:\s*var\(--lb-sticky-rank-width\);/);

assert.doesNotMatch(datasets, /ds-tag-modality/);
assert.doesNotMatch(datasets, /accessClass\(e\.access\)/);
assert.match(datasets, /String\(idx \+ 1\)\.padStart\(3, '0'\)/);
assert.match(datasets, /ds-tag-task[^\n]*e\._subtask/);
assert.match(datasets, /sections\['摘要'\]/);
assert.match(css, /\.entry-summary/);
assert.match(datasetsHtml, /id="dataset-direction"/);
assert.match(datasetsHtml, /id="dataset-subtask"/);
assert.match(datasetsHtml, /id="dataset-sort"/);
assert.match(datasetsHtml, /id="dataset-clear"/);
assert.match(datasets, /sort:\s*'document'/);
assert.match(datasets, /function renderToolbar\(\)/);
assert.match(datasets, /function sortEntries\(entries\)/);
assert.match(css, /\.dataset-toolbar/);
assert.match(css, /\.dataset-page-light \.entry-summary/);
assert.match(css, /\.dataset-page-light \.ds-tag-task/);

assert.match(framework, /<th>图表分析<\/th>/);
assert.match(framework, /href="datasets\.html\?dimension=affective"/);
assert.match(framework, /href="datasets\.html\?dimension=cognitive"/);
assert.match(framework, /href="datasets\.html\?dimension=concern"/);
assert.match(framework, /href="datasets\.html\?dimension=safety"/);

console.log('PASS: all four UI fixes are present');
