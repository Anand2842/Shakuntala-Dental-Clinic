import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {treatments} from '../src/content/treatments.js';
import {services} from '../src/data.js';
test('all ten homepage treatments lead to distinct indexable pages with working enquiry and internal links',async()=>{
 const home=await readFile('dist/index.html','utf8');
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 assert.equal(treatments.length,10);
 assert.equal(new Set(treatments.map(t=>t.slug)).size,services.length);
 assert.deepEqual(treatments.map(t=>t.title),services.map(s=>s.title));
 assert.equal(new Set(treatments.map(t=>t.text)).size,10);
 for(const t of treatments){
  const path=`/treatments/${t.slug}/`;
  assert.ok(home.includes(`href="${path}"`),`Homepage link: ${t.slug}`);
  const html=await readFile(`dist${path}index.html`,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes(t.text));assert.ok(html.includes(t.textHindi));
  assert.ok(!html.includes('noindex'));
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.ok(canonical.endsWith(path));assert.ok(sitemap.includes(canonical));
  const wa=html.match(/href="(https:\/\/wa.me\/916201049711\?text=[^"]+)"/)[1];
  assert.ok(new URL(wa).searchParams.get('text').includes(t.title.toLowerCase()));
  for(const [,src] of html.matchAll(/src="(\/[^\"]+)"/g))await access('dist'+src);
  for(const [,href] of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g))await access('dist'+(href.endsWith('/')?href+'index.html':href));
 }
});
