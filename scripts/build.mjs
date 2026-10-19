import fs from 'node:fs';
import path from 'node:path';
const D=JSON.parse(fs.readFileSync('dist/content.json','utf8'));
const base=fs.readFileSync('dist/index.html','utf8')
  .replace(/\s*<link rel="canonical"[^>]*>/g,'')
  .replace(/\s*<meta property="og:url"[^>]*>/g,'');
// Optional: set SITE_URL to your own domain when you are ready to publish.
// Local builds work without an account, domain, or deployment service.
let origin='';
if(process.env.SITE_URL?.trim()){
  const url=new URL(process.env.SITE_URL.trim());
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=='/'){
    throw new Error('SITE_URL must be an HTTP(S) origin, for example https://example.org');
  }
  origin=url.origin;
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=[{url:'/',title:D.organization.name+' | Virtual Research Lab',description:D.organization.description},...['about','team','labs','courses','projects','events','publications','contact','registrations'].map(s=>({url:'/'+s,title:s[0].toUpperCase()+s.slice(1)+' | '+D.organization.name,description:D.organization.description})),...Object.entries({team:D.members,labs:D.labs,courses:D.courses,projects:D.projects,events:D.events}).flatMap(([type,items])=>items.map(x=>({url:`/${type}/${x.slug}`,title:(x.name||x.title)+' | '+D.organization.name,description:x.bio||x.summary})))];
for(const r of routes){let html=base.replace(/<title>.*?<\/title>/,`<title>${esc(r.title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(r.description)}">`).replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${esc(r.title)}">`).replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${esc(r.description)}">`);if(origin)html=html.replace('</head>',`  <link rel="canonical" href="${origin+r.url}">\n  <meta property="og:url" content="${origin+r.url}">\n</head>`);if(r.url==='/registrations')html=html.replace('</head>','  <meta name="robots" content="noindex">\n</head>');const dest=path.join('dist',r.url,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);}
fs.writeFileSync('dist/404.html',base);
if(origin){
  fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.filter(r=>r.url!=='/registrations').map(r=>`\n<url><loc>${origin+r.url}</loc></url>`).join('')}\n</urlset>\n`);
}else{
  fs.rmSync('dist/sitemap.xml',{force:true});
}
fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /registrations\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
fs.writeFileSync('scripts/routes.json',JSON.stringify(routes.map(r=>r.url),null,2)+'\n');
console.log(`Built ${routes.length} directly accessible pages and metadata.${origin?' Sitemap generated for '+origin+'.':' Local mode: no domain configured.'}`);
