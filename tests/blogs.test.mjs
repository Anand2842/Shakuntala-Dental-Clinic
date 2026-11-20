import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const posts=JSON.parse(await readFile(new URL('../src/content/blogs.json',import.meta.url),'utf8'));
test('published distinct guides resolve to static pages with metadata, artwork and approved publication status',async()=>{
 assert.ok(posts.every(p=>p.published),'All published articles are approved for publication');
 assert.equal(posts.length,24);assert.equal(new Set(posts.map(p=>p.slug)).size,posts.length);assert.equal(new Set(posts.map(p=>p.title)).size,posts.length);
 assert.equal(new Set(posts.map(p=>p.description)).size,posts.length,'Unique article descriptions');
 const sections=posts.flatMap(p=>p.sections.map(s=>s.text));
 assert.equal(new Set(sections).size,sections.length,'No duplicate article sections');
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 for(const p of posts){
  assert.match(p.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const html=await readFile(`dist/blog/${p.slug}/index.html`,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.equal(new URL(canonical).origin,'https://shakuntala-dental-clinic.vercel.app');
  assert.ok(canonical.endsWith(`/blog/${p.slug}/`));
  assert.ok(html.includes(p.intro));
  assert.ok(html.includes(p.source.url.replaceAll('&','&amp;'))||html.includes(p.source.url));
  assert.equal(html.includes('name="robots" content="noindex,follow"'),!p.published);
  assert.equal(sitemap.includes(canonical),p.published);
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
test('blog library and homepage make all published guides discoverable',async()=>{
 const library=await readFile('dist/blog/index.html','utf8');
 const home=await readFile('dist/index.html','utf8');
 assert.ok(home.includes('href="/blog/"'));
 for(const p of posts)assert.ok(library.includes(`href="/blog/${p.slug}/"`));
 assert.ok(posts.some(p=>p.category==='Family care'));
});
test('every guide has its own cover and a descriptive image alternative',async()=>{
 assert.equal(new Set(posts.map(p=>p.image)).size,posts.length,'Do not reuse generic covers across topics');
 const {createHash}=await import('node:crypto');
 const hashes=[];
 for(const post of posts){
  assert.ok(post.imageAlt?.length>20,`Missing description: ${post.slug}`);
  const bytes=await readFile(`public/images/blog/${post.image}.webp`);
  assert.ok(bytes.length<250000,`Oversized cover: ${post.slug}`);
  hashes.push(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(new Set(hashes).size,posts.length,'Cover files must also be distinct');
});
