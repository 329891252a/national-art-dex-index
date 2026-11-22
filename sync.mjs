import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const origin = 'https://national-art-dex.decentdeer6.chatgpt.site';
const destination = process.argv[2] || '.';
async function download(file) {
  const response = await fetch(origin + '/' + file, {
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(60000)
  });
  assert.equal(response.status, 200, file);
  assert.match(response.headers.get('content-type') || '', /application\/json/i);
  return response.text();
}
const [manifestText, indexText] = await Promise.all(
  ['cards-index-summary.json', 'cards-index.json'].map(download)
);
const summary = JSON.parse(manifestText), index = JSON.parse(indexText);
for (const field of ['schemaVersion','updatedAt','dataSha256','cardCount','columns'])
  assert.deepEqual(summary[field], index[field], field);
assert.equal(index.schemaVersion, 1);
const {columns, expansions, cards} = index;
const key = columns.indexOf('printingId');
assert(key >= 0 && cards.length > 0 && cards.every(row => row.length === columns.length && typeof row[key] === 'string'));
assert.equal(new Set(cards.map(row=>row[key])).size, index.cardCount);
assert.equal(cards.length, index.cardCount);
assert.equal(createHash('sha256').update(JSON.stringify({columns, expansions, cards})).digest('hex'), index.dataSha256);
assert.deepEqual(indexText.split('\n').slice(summary.firstCardLine-1,summary.lastCardLine)
  .map(line=>JSON.parse(line.trim().replace(/,$/,''))),cards);
await mkdir(destination,{recursive:true});
for (const [name,text] of [['cards-index.json',indexText],['cards-index-summary.json',manifestText],
  ['mirror-status.json',JSON.stringify({lastSuccessfulCheckUtc:new Date().toISOString(),
    upstreamUpdatedAt:index.updatedAt,cardCount:index.cardCount,dataSha256:index.dataSha256,
    summaryFile:'cards-index-summary.json',indexFile:'cards-index.json'},null,2)+'\n']])
  await writeFile(join(destination,name),text);
console.log('Verified',cards.length,'printings;',index.dataSha256);
