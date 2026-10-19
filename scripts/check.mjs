import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
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
const code=fs.readFileSync('dist/app.js','utf8');
let rendered=0,links=0;
const fixtureMap=new Map();
function element(){return {innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},open:false,showModal(){this.open=true;},close(){this.open=false;}};}
for(const route of [...routes,'/projects?filter=funded','/nonexistent']){
  const url=new URL(route,'https://demo.example');const elements=new Map(['#main','#header','#footer','#dialog','#toast'].map(s=>[s,element()]));
  const document={querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},title:''};
  elements.get('#main').querySelector=()=>null;
  for(const s of ['meta[name=description]','meta[property="og:title"]','meta[property="og:description"]'])elements.set(s,element());
  const local=new Map();const ctx=vm.createContext({document,location:url,URL,URLSearchParams,Intl,Date,console,setInterval(){},setTimeout(){},clearTimeout(){},requestAnimationFrame(fn){fn();},fetch:async()=>({ok:true,json:async()=>D}),window:{addEventListener(){},scrollTo(){}},history:{pushState(){},replaceState(){}},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},Blob,FormData});
  await vm.runInContext(`(async()=>{${code}\n;globalThis.qa={esc,safeUrl,avatar,searchResults,projectPanel,readLocal,saveLocal,calendar,exportRecords,applyFilters,openRegistration,dialog,D};})()`,ctx);
  const html=elements.get('#main').innerHTML;assert(!html.includes('The lab is taking a moment.'),`Render failed: ${route}`);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`Expected one H1: ${route}`);assert(!html.includes('undefined'),`Undefined content: ${route}`);assert(html.length>500,`Empty page: ${route}`);
  for(const match of (html+elements.get('#header').innerHTML+elements.get('#footer').innerHTML).matchAll(/href="(\/[^"#]*)"/g)){const href=match[1].replace(/&amp;/g,'&').split('?')[0];assert(valid.has(href),`Broken internal link ${href} on ${route}`);links++;}
  assert(!ctx.qa.safeUrl('javascript:alert(1)'));assert(!ctx.qa.safeUrl('data:text/html,test'));assert.equal(ctx.qa.esc('<script>'),'&lt;script&gt;');
  if(route==='/team'){for(const m of D.members)assert(html.includes(`/team/${m.slug}`),`Portfolio missing: ${m.slug}`);assert.equal((html.match(/View portfolio/g)||[]).length,D.members.length);}
  if(route==='/projects?filter=funded'){assert(html.includes('Learning the rhythm of the grid'));assert(!html.includes('A quantum approach to energy'));}
  if(route==='/'){assert(ctx.qa.searchResults('quantum').includes('/labs/applied-qml'));assert(ctx.qa.searchResults('Nadia').includes('/team/nadia-islam'));assert(ctx.qa.searchResults('Interpretable forecasting').includes('/publications?q='));assert(ctx.qa.searchResults('no-such-thing-xyz').includes('No matches'));
    for(const p of D.projects)for(let tab=0;tab<6;tab++)assert(ctx.qa.projectPanel(p,tab).length>40);
    ctx.qa.openRegistration('event',D.events[0].slug);assert(elements.get('#dialog').open);assert(elements.get('#dialog').innerHTML.includes('this device only'));assert(elements.get('#dialog').innerHTML.includes('name="country"'));assert(ctx.qa.saveLocal({name:'QA',title:'Test interest',kind:'event'}));assert.equal(ctx.qa.readLocal().length,1);
    // Exercise independent filters with actual render helpers and deterministic inputs.
    const output=element();elements.set('#project-results',output);elements.set('[data-filter=project-search]',{value:'quantum'});elements.set('[data-filter-button="project-category"].active',{dataset:{value:'all'}});ctx.qa.applyFilters();assert(output.innerHTML.includes('A quantum approach to energy'));assert(!output.innerHTML.includes('Learning the rhythm of the grid'));elements.delete('#project-results');
    const teamOut=element();elements.set('#team-results',teamOut);elements.set('#team-search',{value:'Sara'});elements.set('[data-filter=team-year]',{value:'all'});ctx.qa.applyFilters();assert(teamOut.innerHTML.includes('Sara Ahmed'));assert(!teamOut.innerHTML.includes('Dr. Nadia Islam'));elements.delete('#team-results');
  }
  if(!route.includes('?')&&route!=='/nonexistent'){assert(fs.existsSync('dist'+(route==='/'?'':route)+'/index.html'),`Direct route missing: ${route}`);}
  rendered++;
}
console.log(`Passed: ${rendered} page renders, ${links} internal links, data references, all team portfolios, project tabs, filters, search, registration dialog, storage, and URL escaping.`);
