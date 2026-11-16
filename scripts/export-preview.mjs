import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
let html=await readFile('dist/index.html','utf8');
const inlineFiles=async (pattern,replace)=>{
  const matches=[...html.matchAll(pattern)];
  for(const match of matches) {
    const content=await replace(match);
    // Preserve literal replacement tokens such as $& inside compiled JavaScript.
    html=html.replace(match[0],()=>content);
  }
};
await inlineFiles(/<link rel="stylesheet" href="(\/_astro\/[^\"]+)"[^>]*>/g,async m=>`<style>${await readFile('dist'+m[1],'utf8')}</style>`);
await inlineFiles(/<script type="module" src="(\/_astro\/[^\"]+)"[^>]*><\/script>/g,async m=>`<script type="module">${await readFile('dist'+m[1],'utf8')}</script>`);
const images=[...new Set([...html.matchAll(/(?:src|data-src|href)="(\/(?:images\/[^\"]+|favicon.svg))"/g)].map(m=>m[1]))];
for(const src of images){
  const type=src.endsWith('.svg')?'image/svg+xml':src.endsWith('.png')?'image/png':'image/webp';
  html=html.replaceAll(`"${src}"`,`"data:${type};base64,${(await readFile('dist'+src)).toString('base64')}"`);
}
for(const src of ['/images/glass-tooth.webp']) html=html.replaceAll(`url('${src}')`,`url('data:image/webp;base64,${(await readFile('dist'+src)).toString('base64')}')`);
assert.ok(!html.includes('src="/_astro/'));
assert.ok(!html.includes('href="/_astro/'));
await writeFile('preview.html',html);
console.log('Standalone preview exported with embedded styles, scripts and artwork.');
