import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { renderHome, renderSiteFooter } from '../dist/home.js';
const D=JSON.parse(fs.readFileSync('dist/content.json','utf8'));
const routes=JSON.parse(fs.readFileSync('scripts/routes.json','utf8'));
const valid=new Set(routes);
for(const [group,items] of Object.entries({team:D.members,labs:D.labs,courses:D.courses,projects:D.projects,events:D.events})){
  const slugs=items.map(x=>x.slug);assert.equal(new Set(slugs).size,slugs.length,`Duplicate ${group} slug`);for(const slug of slugs)assert.match(slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
}
const has=(items,id)=>assert(items.some(x=>(x.slug||x.id)===id),`Missing reference: ${id}`);
for(const m of D.members){assert(D.teamGroups.includes(m.group));m.projects.forEach(id=>has(D.projects,id));m.publications.forEach(id=>has(D.publications,id));}
for(const p of D.projects){has(D.members,p.leader);has(D.labs,p.lab);p.members.forEach(id=>has(D.members,id));p.papers.forEach(id=>has(D.publications,id));}
for(const l of D.labs){l.members.forEach(id=>has(D.members,id));l.projects.forEach(id=>has(D.projects,id));l.courses.forEach(id=>has(D.courses,id));}
for(const c of D.courses)has(D.members,c.instructor);
for(const e of D.events){has(D.members,e.speaker);assert(new Date(e.date)<new Date(e.end));new Intl.DateTimeFormat('en',{timeZone:e.timezone}).format(new Date());}
const code=fs.readFileSync('dist/app.js','utf8').replace(/^import .*from '\.\/home\.js';\r?\n/m,'');
let rendered=0,links=0;
const fixtureMap=new Map();
function element(){const classes=new Set();return {innerHTML:'',textContent:'',value:'',dataset:{},style:{},attributes:{},classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},contains(n){return classes.has(n);},toggle(n,force){const on=force??!classes.has(n);on?classes.add(n):classes.delete(n);return on;}},setAttribute(n,v){this.attributes[n]=String(v);},addEventListener(){},focus(){},open:false,showModal(){this.open=true;},close(){this.open=false;}};}
for(const route of [...routes,'/projects?filter=funded','/nonexistent']){
  const url=new URL(route,'https://demo.example');const elements=new Map(['#main','#header','#footer','#dialog','#toast'].map(s=>[s,element()]));
  const document={documentElement:element(),querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},title:''};
  elements.set('meta[name="theme-color"]',element());
  elements.get('#main').querySelector=()=>null;
  for(const s of ['meta[name=description]','meta[property="og:title"]','meta[property="og:description"]'])elements.set(s,element());
  const local=new Map([['ofl-theme','dark'],['qa-unrelated','keep']]);const ctx=vm.createContext({renderHome,renderSiteFooter,document,location:url,URL,URLSearchParams,Intl,Date,console,setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(fn){fn();},fetch:async()=>({ok:true,json:async()=>D}),window:{addEventListener(){},scrollTo(){}},history:{pushState(){},replaceState(){}},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},Blob,FormData});
  await vm.runInContext(`(async()=>{${code}\n;globalThis.qa={esc,safeUrl,avatar,searchResults,projectPanel,readLocal,saveLocal,calendar,exportRecords,applyFilters,openRegistration,dialog,D,registrationUrl,registrationButton,openRegistrationNotice,render,initializeAppearance,enhancePage};})()`,ctx);
  // Old dark preferences must never change the light-only site or other storage.
  assert.equal(document.documentElement.dataset.theme,'light',`Light appearance lost on ${route}`);
  assert.equal(local.has('ofl-theme'),false,`Old preference not removed on ${route}`);
  assert.equal(local.get('qa-unrelated'),'keep');
  assert.equal(elements.get('meta[name="theme-color"]').attributes.content,'#ffffff');
  if(url.pathname!=='/')assert(elements.get('#main').innerHTML.includes('class="page-hero"'),`Shared page hero missing: ${route}`);
  const html=elements.get('#main').innerHTML;assert(!html.includes('The lab is taking a moment.'),`Render failed: ${route}`);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Expected one H1: ${route}`);assert(!html.includes('undefined'),`Undefined content: ${route}`);assert(html.length>500,`Empty page: ${route}`);
  const header=elements.get('#header').innerHTML;assert(header.includes('data-action="search"'),`Search missing: ${route}`);assert(!header.includes('data-action="theme"'),`Unexpected theme switch: ${route}`);assert(header.includes('header-register'),`Register missing: ${route}`);assert(header.indexOf('header-register')>header.indexOf('data-action="menu"'),`Register should be on the right: ${route}`);assert(elements.get('#footer').innerHTML.includes('home-footer-grid'),`Shared footer missing: ${route}`);
  for(const match of (html+elements.get('#header').innerHTML+elements.get('#footer').innerHTML).matchAll(/href="(\/[^"#]*)"/g)){const href=match[1].replace(/&amp;/g,'&').split('?')[0];assert(valid.has(href),`Broken internal link ${href} on ${route}`);links++;}
  assert(!ctx.qa.safeUrl('javascript:alert(1)'));assert(!ctx.qa.safeUrl('data:text/html,test'));assert.equal(ctx.qa.esc('<script>'),'&lt;script&gt;');
  if(route==='/team'){for(const m of D.members)assert(html.includes(`/team/${m.slug}`),`Portfolio missing: ${m.slug}`);assert.equal((html.match(/View portfolio/g)||[]).length,D.members.length);}
  if(route==='/projects?filter=funded'){assert(html.includes('Learning the rhythm of the grid'));assert(!html.includes('A quantum approach to energy'));}
  if(route==='/'){assert(ctx.qa.searchResults('quantum').includes('/labs/applied-qml'));assert(ctx.qa.searchResults('Nadia').includes('/team/nadia-islam'));assert(ctx.qa.searchResults('Interpretable forecasting').includes('/publications?q='));assert(ctx.qa.searchResults('no-such-thing-xyz').includes('No matches'));
    // Light appearance and preference cleanup survive navigation and unavailable storage.
    local.set('ofl-theme','dark');ctx.qa.initializeAppearance();
    ctx.location.pathname='/team';ctx.qa.render();assert.equal(document.documentElement.dataset.theme,'light');assert.equal(document.documentElement.dataset.page,'inner');
    ctx.location.pathname='/';ctx.qa.render();assert.equal(document.documentElement.dataset.theme,'light');assert.equal(document.documentElement.dataset.page,'home');assert(!local.has('ofl-theme'));
    const availableStorage=ctx.localStorage;ctx.localStorage={removeItem(){throw Error('Storage unavailable');}};ctx.qa.initializeAppearance();assert.equal(document.documentElement.dataset.theme,'light');ctx.localStorage=availableStorage;
    // A later Google Form URL becomes the header destination without code edits.
    assert(ctx.qa.registrationButton().includes('data-action="registration-info"'));D.organization.registrationUrl='https://forms.gle/example-registration';assert(ctx.qa.registrationButton().includes('href="https://forms.gle/example-registration"'));for(const value of ['javascript:alert(1)','data:text/html,test','http://example.org','/registrations','https://user:pass@example.org'])assert.equal(ctx.qa.registrationUrl(value),'');D.organization.registrationUrl=null;ctx.qa.openRegistrationNotice();assert(elements.get('#dialog').innerHTML.includes('Registration opens soon'));
    // Reduced-motion users should never get hidden content or animated counters.
    ctx.IntersectionObserver=class{constructor(){throw Error('Unexpected observer for reduced motion');}};ctx.window.matchMedia=()=>({matches:true});ctx.qa.enhancePage();delete ctx.IntersectionObserver;
    assert(!html.includes('dual-lab-hero'));for(const lab of D.labs)assert(html.includes(`/labs/${lab.slug}`));
    const sections=['home-hero','research-statistics','lab-introduction','research-areas','featured-event','research-initiatives','recent-publications','research-collaboration'];let previous=-1;for(const id of sections){const position=html.indexOf(`id="${id}"`);assert(position>previous,`Homepage section order: ${id}`);previous=position;}
    assert(!html.includes('Two labs. Endless possibilities.'));assert(html.includes(D.home.heroTitle));assert.equal((html.match(/class="home-focus"/g)||[]).length,4);assert.equal((html.match(/class="home-project"/g)||[]).length,D.projects.length);assert(html.includes(D.publications[0].title));assert.equal(document.documentElement.dataset.page,'home');
    for(const p of D.projects)for(let tab=0;tab<6;tab++)assert(ctx.qa.projectPanel(p,tab).length>40);
    ctx.qa.openRegistration('event',D.events[0].slug);assert(elements.get('#dialog').open);assert(elements.get('#dialog').innerHTML.includes('this device only'));assert(elements.get('#dialog').innerHTML.includes('name="country"'));assert(ctx.qa.saveLocal({name:'QA',title:'Test interest',kind:'event'}));assert.equal(ctx.qa.readLocal().length,1);
    // Exercise independent filters with actual render helpers and deterministic inputs.
    const output=element();elements.set('#project-results',output);elements.set('[data-filter=project-search]',{value:'quantum'});elements.set('[data-filter-button="project-category"].active',{dataset:{value:'all'}});ctx.qa.applyFilters();assert(output.innerHTML.includes('A quantum approach to energy'));assert(!output.innerHTML.includes('Learning the rhythm of the grid'));elements.delete('#project-results');
    const teamOut=element();elements.set('#team-results',teamOut);elements.set('#team-search',{value:'Sara'});elements.set('[data-filter=team-year]',{value:'all'});ctx.qa.applyFilters();assert(teamOut.innerHTML.includes('Sara Ahmed'));assert(!teamOut.innerHTML.includes('Dr. Nadia Islam'));elements.delete('#team-results');
  }
  if(!route.includes('?')&&route!=='/nonexistent'){assert(fs.existsSync('dist'+(route==='/'?'':route)+'/index.html'),`Direct route missing: ${route}`);}
  rendered++;
}
console.log(`Passed: ${rendered} light-only page renders, ${links} internal links, data references, all team portfolios, project tabs, filters, search, registration dialog, storage, and URL escaping.`);
