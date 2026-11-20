import type { APIRoute } from 'astro';
import posts from '../content/blogs.json';
import { treatments } from '../content/treatments.js';
export const GET: APIRoute = ({ site }) => {
  const paths=['/',...treatments.map(t=>`/treatments/${t.slug}/`),...(posts.some(p=>p.published)?['/blog/']:[]),...posts.filter(p=>p.published).map(p=>`/blog/${p.slug}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${new URL(path,site)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
