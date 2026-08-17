import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

const app = read('app.js');
const leaderboard = read('leaderboard.js');
const datasets = read('datasets.js');
const framework = read('framework.html');
const css = read('vitality-blue.css');

assert.match(app, /var activeKey = views\[key\] \? key : 'overview';/);
assert.match(app, /var nextImage = new Image\(\);/);
assert.match(app, /wrap\._setRadarView = focusView;/);

assert.match(leaderboard, /head\.innerHTML = '';/);
assert.match(leaderboard, /body\.innerHTML = '';/);

assert.doesNotMatch(datasets, /ds-tag-modality/);
assert.doesNotMatch(datasets, /accessClass\(e\.access\)/);
assert.match(datasets, /所属方向：/);
assert.match(datasets, /细分任务：/);
assert.match(datasets, /sections\['摘要'\]/);
assert.match(css, /\.entry-summary/);

assert.match(framework, /<th>图表分析<\/th>/);

console.log('PASS: all four UI fixes are present');
