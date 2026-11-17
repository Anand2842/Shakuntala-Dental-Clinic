import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const posts=JSON.parse(await readFile(new URL('../src/content/blogs.json',import.meta.url),'utf8'));
test('twenty distinct guides resolve to static pages with metadata, artwork and approved publication status',async()=>{
 assert.ok(posts.every(p=>p.reviewed),'All twenty articles are approved for publication');
 assert.equal(posts.length,20);assert.equal(new Set(posts.map(p=>p.slug)).size,20);assert.equal(new Set(posts.map(p=>p.title)).size,20);
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 for(const p of posts){
  assert.match(p.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const html=await readFile(`dist/blog/${p.slug}/index.html`,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.ok(canonical.endsWith(`/blog/${p.slug}/`));
  assert.ok(html.includes(p.intro));
  assert.ok(html.includes(p.source.url.replaceAll('&','&amp;'))||html.includes(p.source.url));
  assert.equal(html.includes('name="robots" content="noindex,follow"'),!p.reviewed);
  assert.equal(sitemap.includes(canonical),p.reviewed);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.ok(!html.includes('Editorial draft') && !html.includes('Clinical review pending'),'No pending-review notices on approved articles');
  assert.equal(schema.creativeWorkStatus,'Published');
  assert.equal(schema['@type'],'Article');assert.equal(schema.headline,p.title);
  assert.ok(!schema.reviewedBy && !schema.author,'No invented clinician review or byline');
  for(const [,src] of html.matchAll(/\bsrc="(\/[^\"]+)"/g))await access('dist'+src);
  for(const [,href] of html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)){
   const path=href.endsWith('/')?`${href}index.html`:href;
   await access('dist'+path);
  }
 }
});
test('blog library and homepage make all twenty guides discoverable',async()=>{
 const library=await readFile('dist/blog/index.html','utf8');
 const home=await readFile('dist/index.html','utf8');
 assert.ok(home.includes('href="/blog/"'));
 for(const p of posts)assert.ok(library.includes(`href="/blog/${p.slug}/"`));
 assert.ok(posts.some(p=>p.category==='Family care'));
});
