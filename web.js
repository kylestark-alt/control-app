// Biblioteca visual con el framework de Interfaz Digital (ix-saas-shell, ix-dash, ix-theme…).
// Las hojas y ix-theme.js se cargan de framework.interfaz.digital: si el framework mejora, control mejora.
export const FW = 'https://framework.interfaz.digital';
const FW_V = '1.21.1';

const I = {
  proyectos: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  grafo: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.2 7 15.7 7.8M7 8.3l1.5 7.3M16.4 10 10.8 16.4"/>',
  novedades: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  principal: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
  conectar: '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7Z"/><path d="M12 16v5"/>',
  doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>',
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

export function renderBiblioteca(data, nonce) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const css = ['ix-saas-shell', 'ix-theme', 'ix-motion', 'ix-data', 'ix-dash'].map(f => `<link rel="stylesheet" href="${FW}/assets/${f}.css?v=${FW_V}">`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f2ec">
<title>Control · Pure Linguistics</title>${css}
<style>
:root{--ix-accent:#4e66ff}
.c-wrap{padding:6px 0 calc(var(--ix-content-bottom,40px) + 24px)}
.c-mnav{display:none;margin:0 0 12px;overflow-x:auto;max-width:100%}.c-mnav .ix-seg{flex-wrap:nowrap}.c-mnav button{white-space:nowrap}
.ix-side-nav button{width:100%}.ix-side-nav .c-pj span:first-of-type{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ix-side-label{font-size:11px;font-weight:780;letter-spacing:.08em;color:var(--ix-muted);padding:6px 12px 2px;text-transform:uppercase}
.ix-seg button{cursor:pointer}.ix-seg button.is-active{background:var(--ix-accent);color:#fff}
.c-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.c-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ix-line);border-radius:999px;padding:5px 11px;background:var(--ix-surface,#fff);color:var(--ix-ink);font:inherit;font-size:12.5px;font-weight:650;cursor:pointer}
.c-chip i{width:8px;height:8px;border-radius:50%;background:var(--c,var(--ix-accent))}
.c-grid{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:12px;margin-top:12px;align-items:start}
.c-toc{position:sticky;top:0}.c-toc h3,.ix-card h3{margin:0 0 10px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ix-muted)}
.c-toc a{display:flex;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:9px;color:var(--ix-ink);text-decoration:none;font-size:14px;cursor:pointer}
.c-toc a:hover{background:color-mix(in srgb,var(--ix-accent) 9%,transparent)}.c-toc a.sub{padding-left:22px;color:var(--ix-muted);font-size:13px}.c-toc small{color:var(--ix-muted);font-variant-numeric:tabular-nums}
.c-md{font-size:15px;line-height:1.62}.c-md h1{font-size:22px;margin:0 0 6px}.c-md h2{font-size:18px;margin:26px 0 8px;padding-top:14px;border-top:1px solid var(--ix-line)}.c-md h3{font-size:15px;margin:18px 0 6px;color:var(--ix-accent)}
.c-md code{background:color-mix(in srgb,var(--ix-accent) 9%,transparent);padding:1px 6px;border-radius:6px}.c-md li{margin:3px 0}
.c-flash{animation:cflash 1.6s ease}@keyframes cflash{from{background:color-mix(in srgb,var(--ix-accent) 22%,transparent)}to{background:transparent}}
.c-tl{list-style:none;margin:0;padding:0}.c-tl li{display:grid;grid-template-columns:120px 110px minmax(0,1fr);gap:12px;padding:11px 4px;border-bottom:1px solid var(--ix-line);font-size:14px;align-items:baseline}
.c-tl time{color:var(--ix-muted);font-size:12.5px;font-variant-numeric:tabular-nums}.c-tl b{font-weight:700}
.c-copy{display:flex;gap:8px;margin:6px 0 12px}.c-copy code{flex:1;min-width:0;padding:10px 12px;border:1px solid var(--ix-line);border-radius:var(--ix-control-radius);background:var(--ix-bg);overflow:auto;white-space:nowrap;font-size:12.5px}
.c-note{color:var(--ix-muted);font-size:13px;margin:0 0 6px}
.c-graph{position:relative;height:calc(100svh - var(--ix-content-top,96px) - var(--ix-content-bottom,60px) - 120px);min-height:460px;padding:0;overflow:hidden}
#cv{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.c-gbar{position:absolute;top:12px;left:12px;z-index:2;display:flex;flex-direction:column;gap:8px;padding:12px;border:1px solid var(--ix-line);border-radius:14px;background:color-mix(in srgb,var(--ix-surface,#fff) 88%,transparent);backdrop-filter:blur(10px);font-size:12.5px;width:240px}
.c-gbar label{display:flex;gap:8px;align-items:center;cursor:pointer}.c-gbar input[type=checkbox]{width:auto;margin:0;accent-color:var(--ix-accent)}
.c-ley{display:flex;align-items:center;gap:8px;color:var(--ix-muted)}.c-ley i{display:inline-block;width:22px;border-top:2px solid}
.c-tip{position:absolute;pointer-events:none;z-index:3;display:none;max-width:280px;padding:8px 10px;border:1px solid var(--ix-line);border-radius:10px;background:var(--ix-surface,#fff);font-size:12.5px;box-shadow:var(--ix-shadow)}
.c-mobile-pj{display:none;margin-top:10px}.c-select{height:42px;padding:0 12px;border:1px solid var(--ix-line);border-radius:var(--ix-control-radius);background:var(--ix-surface,#fff);color:var(--ix-ink);font:inherit;min-width:200px}
.c-user{font-size:12.5px;color:var(--ix-muted);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-empty{padding:40px 10px;text-align:center;color:var(--ix-muted)}
@media(max-width:980px){.c-mnav{display:block}.c-grid{grid-template-columns:1fr}.c-toc{position:static}.c-mobile-pj{display:block}.c-tl li{grid-template-columns:1fr;gap:2px}.c-user{display:none}.c-gbar{width:auto;right:auto;flex-direction:row;flex-wrap:wrap;padding:8px 10px}.c-gbar .c-ley,.c-gbar .c-note{display:none}}
</style></head>
<body class="ix-shell" data-ix-surface="control">
<div class="ix-viewport" data-ix-viewport>
<header class="ix-topbar has-nav">
  <a class="ix-wordmark" href="/"><span class="ix-wordmark-main">pure linguistics<b>.</b></span><span class="ix-wordmark-product">control</span></a>
  <div class="ix-nav-actions">
    <button class="ix-theme-toggle" type="button" data-ix-theme-toggle aria-pressed="false" aria-label="Cambiar tema"><svg viewBox="0 0 24 24" aria-hidden="true"><mask id="ctt"><rect width="24" height="24" fill="#fff"/><circle class="ix-tt-cut" cx="30" cy="0" r="7" fill="#000"/></mask><circle class="ix-tt-disc" cx="12" cy="12" r="5" fill="currentColor" mask="url(#ctt)"/><g class="ix-tt-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><path d="M12 1.8v2.1M12 20.1v2.1M1.8 12h2.1M20.1 12h2.1M4.8 4.8l1.5 1.5M17.7 17.7l1.5 1.5M4.8 19.2l1.5-1.5M17.7 6.3l1.5-1.5"/></g></svg></button>
    <span class="c-user" id="yo"></span><a class="ix-nav-login" href="/logout">Salir</a>
  </div>
</header>
<main class="ix-scroller" id="ix-main" data-ix-scroller tabindex="-1"><div class="ix-site c-wrap">
  <div class="ix-dash">
    <aside class="ix-dash-side" aria-label="Navegación"><nav class="ix-side-nav" id="side"></nav>
      <div class="ix-side-foot"><div class="ix-theme-set" role="group" aria-label="Tema"><button type="button" data-ix-theme-set="system">Sistema</button><button type="button" data-ix-theme-set="light">Claro</button><button type="button" data-ix-theme-set="dark">Oscuro</button></div></div>
    </aside>
    <section class="ix-dash-main"><div class="c-mnav" id="mnav"></div><div id="view"></div></section>
  </div>
</div></main>
</div>
<script src="${FW}/assets/ix-theme.js?v=${FW_V}"></script>
<script nonce="${nonce}">
const D=${json};
const ICON=${JSON.stringify(Object.fromEntries(Object.keys(I).map(k => [k, icon(k)])))};
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fecha=s=>s?new Date(s).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'—';
const corta=s=>s?new Date(s).toLocaleDateString('es-MX',{day:'numeric',month:'short'}):'—';
const ancla=r=>'t-'+encodeURIComponent(String(r).toLowerCase());
const ids=Object.keys(D.proyectos).sort((a,b)=>(D.proyectos[b].actualizado||'').localeCompare(D.proyectos[a].actualizado||''));
let S={vista:'proyecto',id:ids[0]||null,sec:'contexto',fp:'',fa:'',ir:null};
const VISTAS=[['proyecto','Proyectos','proyectos'],['grafo','Grafo','grafo'],['novedades','Novedades','novedades'],['principal','Contexto principal','principal'],['conectar','Conectar IA','conectar']];
const go=p=>{Object.assign(S,p);render()};
const scroller=()=>$('#ix-main');

function render(){
  $('#yo').textContent=D.usuario?.email||'';
  $('#mnav').innerHTML='<div class="ix-seg is-light">'+VISTAS.map(([k,l])=>'<button type="button" data-v="'+k+'" class="'+(S.vista===k?'is-active':'')+'">'+l+'</button>').join('')+'</div>';
  const nuevas=D.eventos.filter(e=>Date.now()-new Date(e.ts)<7*864e5).length;
  $('#side').innerHTML=VISTAS.map(([k,l,ic])=>'<button type="button" data-v="'+k+'"'+(S.vista===k?' aria-current="page"':'')+'>'+ICON[ic]+'<span>'+l+'</span>'+(k==='novedades'&&nuevas?'<span class="ix-count">'+nuevas+'</span>':'')+'</button>').join('')+
    '<span class="ix-side-sep" aria-hidden="true"></span><div class="ix-side-label">Proyectos</div>'+
    ids.map(id=>{const p=D.proyectos[id];return '<button type="button" class="c-pj" data-p="'+id+'"'+(S.vista==='proyecto'&&S.id===id?' aria-current="page"':'')+'>'+ICON.doc+'<span>'+esc(p.nombre)+'</span><span class="ix-count">'+p.indice.length+'</span></button>'}).join('');
  if(S.vista!=='grafo')G.stop();
  ({proyecto:vProyecto,grafo:vGrafo,novedades:vNovedades,principal:vPrincipal,conectar:vConectar})[S.vista]($('#view'));
}
function head(t,sub,tools=''){return '<header class="ix-dash-head"><div><span class="ix-eyebrow">CONTROL · MEMORIA DE PROYECTOS</span><h1>'+t+'</h1><p>'+sub+'</p></div><div class="ix-dash-tools">'+tools+'</div></header>'}
function kpi(label,valor,tono,extra=''){return '<article class="ix-card ix-kpi ix-lift" style="--ix-tone:'+tono+'"><p class="ix-kpi-label">'+label+'</p><div class="ix-kpi-value"><span>'+valor+'</span>'+extra+'</div></article>'}
function selProyecto(){return '<div class="c-mobile-pj"><select class="c-select" id="selp">'+ids.map(i=>'<option value="'+i+'"'+(i===S.id?' selected':'')+'>'+esc(D.proyectos[i].nombre)+'</option>').join('')+'</select></div>'}

function vProyecto(v){
  const p=D.proyectos[S.id];
  if(!p){v.innerHTML=head('Sin proyectos','Crea el primero desde cualquier IA conectada.');return}
  const temas=p.indice.filter(t=>t.nivel===2).length, subs=p.indice.length-temas;
  const ev=D.eventos.filter(e=>e.id===S.id), sem=ev.filter(e=>Date.now()-new Date(e.ts)<7*864e5).length;
  const autores=[...new Set(ev.map(e=>e.autor))];
  const hijos=ids.filter(i=>D.proyectos[i].deriva_de===S.id);
  const seg='<div class="ix-seg is-light" role="tablist" aria-label="Sección">'+[['contexto','Contexto'],['pendientes','Pendientes'],['decisiones','Decisiones'],['changelog','Cambios']].map(([k,l])=>'<button type="button" data-s="'+k+'" class="'+(S.sec===k?'is-active':'')+'">'+l+'</button>').join('')+'</div>';
  const chips=(p.deriva_de?'<button class="c-chip" style="--c:#e0782f" data-p="'+p.deriva_de+'"><i></i>Deriva de '+esc(D.proyectos[p.deriva_de]?.nombre||p.deriva_de)+'</button>':'')+
    hijos.map(h=>'<button class="c-chip" style="--c:#e0782f" data-p="'+h+'"><i></i>Rama: '+esc(D.proyectos[h].nombre)+'</button>').join('')+
    (p.relacionados||[]).map(r=>'<button class="c-chip" data-p="'+r+'"><i></i>'+esc(D.proyectos[r]?.nombre||r)+'</button>').join('');
  const toc='<aside class="ix-card c-toc"><h3>Índice</h3>'+(p.indice.map(t=>'<a class="'+(t.nivel===3?'sub':'')+'" data-t="'+esc(t.ruta)+'"><span>'+esc(t.titulo)+'</span><small>'+t.chars+'</small></a>').join('')||'<p class="c-note">Sin temas todavía.</p>')+'</aside>';
  v.innerHTML=head(esc(p.nombre),esc(p.resumen)+' · <span class="ix-delta">'+p.estado+'</span>',seg)+selProyecto()+(chips?'<div class="c-chips">'+chips+'</div>':'')+
    '<div class="ix-kpis ix-enter" style="margin-top:12px">'+kpi('Temas',temas,'var(--ix-accent)')+kpi('Subtemas',subs,'#8b5cf6')+kpi('Cambios esta semana',sem,'#1f9d61')+kpi('Última edición',corta(p.actualizado),'#e0782f','<span class="ix-delta">'+esc(autores.slice(-2).join(', ')||'—')+'</span>')+'</div>'+
    '<div class="c-grid">'+(S.sec==='contexto'?toc:'')+'<article class="ix-card c-md"'+(S.sec!=='contexto'?' style="grid-column:1/-1"':'')+'>'+p.secciones[S.sec]+'</article></div>';
  if(S.ir){const r=S.ir;S.ir=null;setTimeout(()=>irA(r),40)}else scroller().scrollTop=0;
}
function irA(ruta){const el=document.getElementById(ancla(ruta));if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('c-flash');void el.offsetWidth;el.classList.add('c-flash')}

function vNovedades(v){
  const autores=[...new Set(D.eventos.map(e=>e.autor))].sort();
  const ev=D.eventos.filter(e=>(!S.fp||e.id===S.fp)&&(!S.fa||e.autor===S.fa));
  const tools='<select class="c-select" id="fp"><option value="">Todos los proyectos</option>'+ids.map(i=>'<option value="'+i+'"'+(S.fp===i?' selected':'')+'>'+esc(D.proyectos[i].nombre)+'</option>').join('')+'</select><select class="c-select" id="fa"><option value="">Todos los autores</option>'+autores.map(a=>'<option'+(S.fa===a?' selected':'')+'>'+esc(a)+'</option>').join('')+'</select>';
  v.innerHTML=head('Novedades','Cada cambio, quién lo hizo y en qué tema.',tools)+'<article class="ix-card" style="margin-top:12px"><ul class="c-tl">'+
    (ev.map(e=>'<li><time>'+fecha(e.ts)+'</time><b>'+esc(e.autor)+'</b><span>'+(e.id&&D.proyectos[e.id]?'<button class="c-chip" data-p="'+e.id+'"'+(e.tema?' data-t="'+esc(e.tema)+'"':'')+'><i></i>'+esc(D.proyectos[e.id].nombre)+(e.tema?' › '+esc(e.tema):'')+'</button> ':'')+esc(e.nota)+'</span></li>').join('')||'<div class="c-empty">Sin cambios registrados.</div>')+'</ul></article>';
}
function vPrincipal(v){v.innerHTML=head('Contexto principal','Lo que toda IA lee al iniciar: quiénes somos, cómo se organiza y el protocolo.')+'<article class="ix-card c-md" style="margin-top:12px">'+D.principal+'</article>'}
function vConectar(v){
  const C=D.conexion,row=(l,val)=>'<p class="c-note">'+l+'</p><div class="c-copy"><code>'+esc(val)+'</code><button class="ix-btn ix-btn-ghost ix-press" data-copy="'+esc(val)+'">Copiar</button></div>';
  const card=(t,b)=>'<article class="ix-card" style="margin-top:12px"><h3>'+t+'</h3>'+b+'</article>';
  v.innerHTML=head('Conectar una IA','Con Google para el equipo; enlaces con token solo como respaldo.')+
  card('Claude (web, app y Claude Code)',row('Configuración → Conectores → Agregar conector personalizado. Al conectar te pide entrar con Google.',C.mcpOauth)+row('Claude Code (terminal):','claude mcp add --transport http control '+C.mcpOauth))+
  card('ChatGPT',row('Configuración → Apps y conectores → Modo desarrollador → Crear. Autenticación: OAuth.',C.mcpOauth))+
  card('Cursor, Windsurf, VS Code y otros clientes MCP',row('Agregar a mcp.json:',JSON.stringify({mcpServers:{control:{url:C.mcpOauth}}})))+
  card('Perplexity, Gemini y otras IAs sin MCP (solo lectura)',row('Pega el enlace y pide que lo lea. Para un proyecto agrega /<id>; para un tema, /<id>/<Tema>.',C.lectura))+
  card('Automatizaciones (API REST)',row('Base:',C.api)+row('Encabezado:','Authorization: Bearer '+C.apiToken)+row('Registrar un evento:','curl -X POST '+C.api+'/proyectos/ID/registro -H "Authorization: Bearer '+C.apiToken+'" -H "Content-Type: application/json" -d \\'{"evento":"Correo enviado a X","autor":"outreach"}\\''))+
  card('Respaldo sin Google',row('Para clientes sin OAuth. Da acceso completo: no lo compartas.',C.mcp))+
  card('Instrucción sugerida para cualquier IA',row('Pégala en sus instrucciones personalizadas:','Usa el conector "control" como memoria de proyectos. Al iniciar llama ctx_inicio una vez; lee solo el índice y el tema necesario; guarda lo relevante con ctx_escribir en su tema; si surge un proyecto nuevo, propónlo.'));
}

// ---------------------------------------------------------------- Grafo
const G={run:false,temas:true,subs:true,q:'',stop(){this.run=false}};
function vGrafo(v){
  v.innerHTML=head('Grafo','Proyectos, temas y subtemas: cómo se conectan, se unifican y se ramifican.','<label class="ix-search"><input type="search" id="gq" placeholder="Resaltar tema o proyecto…" value="'+esc(G.q)+'"></label>')+
  '<article class="ix-card c-graph" style="margin-top:12px"><canvas id="cv"></canvas><div class="c-gbar"><label><input type="checkbox" id="gt"'+(G.temas?' checked':'')+'> Temas</label><label><input type="checkbox" id="gs"'+(G.subs?' checked':'')+'> Subtemas</label>'+
  '<div class="c-ley"><i style="border-color:var(--ix-accent)"></i>Relación</div><div class="c-ley"><i style="border-color:#e0782f;border-top-width:3px"></i>Deriva (ramifica)</div><div class="c-ley"><i style="border-color:#8b5cf6;border-top-style:dashed"></i>Tema compartido (unifica)</div>'+
  '<span class="c-note" style="margin:0">Arrastra · rueda o pellizco para zoom · toca para abrir</span></div><div class="c-tip" id="tip"></div>'+(D.grafo.nodes.length?'':'<div class="c-empty" style="position:absolute;inset:40% 0 auto">El grafo aparece cuando existan proyectos.</div>')+'</article>';
  if(D.grafo.nodes.length)iniciarGrafo();
}
function iniciarGrafo(){
  const cv=$('#cv'),ctx=cv.getContext('2d');
  const col=k=>getComputedStyle(document.body).getPropertyValue(k).trim()||'#888';
  const vis=n=>n.tipo==='proyecto'||(n.tipo==='tema'&&G.temas)||(n.tipo==='subtema'&&G.subs&&G.temas);
  const prev=G.pos||{};
  const nodes=D.grafo.nodes.filter(vis).map((n,i)=>({...n,x:prev[n.id]?.x??Math.cos(i*2.4)*(60+i*6),y:prev[n.id]?.y??Math.sin(i*2.4)*(60+i*6),vx:0,vy:0,r:n.tipo==='proyecto'?14:n.tipo==='tema'?7:4.5}));
  const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const links=D.grafo.links.map(l=>({...l,s:byId[l.source],t:byId[l.target]})).filter(l=>l.s&&l.t);
  const vec={};links.forEach(l=>{(vec[l.s.id]||=new Set).add(l.t.id);(vec[l.t.id]||=new Set).add(l.s.id)});
  for(const n of nodes)if(n.tipo==='proyecto')n.r=13+Math.min(10,(vec[n.id]?.size||0));
  const LEN={relacion:190,deriva:150,contiene:85,compartido:130},STR={relacion:.04,deriva:.06,contiene:.12,compartido:.02};
  let W,H,dpr,cam=G.cam||{x:0,y:0,k:nodes.length<40?1.35:nodes.length<120?1:.7},alpha=Object.keys(prev).length?.3:1,drag=null,hover=null,moved=false;
  const size=()=>{dpr=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr};size();addEventListener('resize',size);
  function tick(){
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy||.01;if(d2>250000)continue;const f=(a.tipo==='proyecto'&&b.tipo==='proyecto'?2600:1100)/d2*alpha,d=Math.sqrt(d2);dx/=d;dy/=d;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f}
    for(const l of links){const dx=l.t.x-l.s.x,dy=l.t.y-l.s.y,d=Math.hypot(dx,dy)||.01,f=(d-LEN[l.tipo])*STR[l.tipo]*alpha;l.s.vx+=dx/d*f;l.s.vy+=dy/d*f;l.t.vx-=dx/d*f;l.t.vy-=dy/d*f}
    for(const n of nodes){n.vx-=n.x*.004*alpha;n.vy-=n.y*.004*alpha;if(n===drag)continue;n.vx*=.82;n.vy*=.82;n.x+=n.vx;n.y+=n.vy}
    alpha=Math.max(alpha*.992,.02);
  }
  const S2W=(x,y)=>[(x-W/2-cam.x)/cam.k,(y-H/2-cam.y)/cam.k];
  function draw(){
    const acc=col('--ix-accent'),ink=col('--ix-ink'),mut=col('--ix-muted'),surf=col('--ix-surface');
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2+cam.x,H/2+cam.y);ctx.scale(cam.k,cam.k);
    const q=G.q.toLowerCase(),foco=hover?new Set([hover.id,...(vec[hover.id]||[])]):null;
    for(const l of links){const dim=foco&&!(foco.has(l.s.id)&&foco.has(l.t.id));ctx.globalAlpha=dim?.1:l.tipo==='contiene'?.35:.85;
      ctx.strokeStyle=l.tipo==='deriva'?'#e0782f':l.tipo==='compartido'?'#8b5cf6':l.tipo==='relacion'?acc:mut;
      ctx.lineWidth=(l.tipo==='deriva'?3:l.tipo==='contiene'?1:2)/Math.sqrt(cam.k);ctx.setLineDash(l.tipo==='compartido'?[6,5]:[]);
      ctx.beginPath();ctx.moveTo(l.s.x,l.s.y);ctx.lineTo(l.t.x,l.t.y);ctx.stroke();
      if(l.tipo==='deriva'){const a=Math.atan2(l.t.y-l.s.y,l.t.x-l.s.x),x=l.t.x-Math.cos(a)*(l.t.r+3),y=l.t.y-Math.sin(a)*(l.t.r+3);ctx.setLineDash([]);ctx.fillStyle='#e0782f';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a-.4)*10,y-Math.sin(a-.4)*10);ctx.lineTo(x-Math.cos(a+.4)*10,y-Math.sin(a+.4)*10);ctx.fill()}}
    ctx.setLineDash([]);
    for(const n of nodes){const hit=q&&(n.nombre||'').toLowerCase().includes(q),dim=(foco&&!foco.has(n.id))||(q&&!hit);ctx.globalAlpha=dim?.18:1;
      if(n.tipo==='proyecto'){ctx.globalAlpha=dim?.06:.16;ctx.beginPath();ctx.arc(n.x,n.y,n.r+7,0,7);ctx.fillStyle=acc;ctx.fill();ctx.globalAlpha=dim?.18:1}
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.fillStyle=n.tipo==='proyecto'?(n.estado==='activo'?acc:mut):surf;ctx.fill();
      if(n.tipo!=='proyecto'||hit){ctx.lineWidth=(hit?3:1.6)/cam.k;ctx.strokeStyle=hit?'#e0782f':n.tipo==='tema'?acc:'#8b5cf6';ctx.stroke()}
      if(n.tipo!=='subtema'||cam.k>1.2||n===hover||hit){ctx.fillStyle=ink;ctx.font=(n.tipo==='proyecto'?'780 13px':n.tipo==='tema'?'650 11.5px':'500 10.5px')+' system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillText(n.nombre,n.x,n.y+n.r+(n.tipo==='proyecto'?18:13))}}
    ctx.restore();ctx.globalAlpha=1;
  }
  function loop(){if(!G.run||!document.body.contains(cv))return;tick();draw();G.pos=Object.fromEntries(nodes.map(n=>[n.id,{x:n.x,y:n.y}]));G.cam=cam;requestAnimationFrame(loop)}
  G.run=true;loop();
  const pick=(mx,my)=>{const[x,y]=S2W(mx,my);let best=null,bd=1e9;for(const n of nodes){const d=Math.hypot(n.x-x,n.y-y);if(d<n.r+7/cam.k&&d<bd){bd=d;best=n}}return best};
  const pts=new Map();let pinch=null,pan=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();pts.set(e.pointerId,[e.clientX-r.left,e.clientY-r.top]);moved=false;
    if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),k:cam.k};drag=null;pan=null;return}
    const n=pick(e.clientX-r.left,e.clientY-r.top);if(n){drag=n;alpha=Math.max(alpha,.3)}else pan={x:e.clientX-cam.x,y:e.clientY-cam.y}});
  cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;if(pts.has(e.pointerId))pts.set(e.pointerId,[mx,my]);
    if(pinch&&pts.size===2){const[a,b]=[...pts.values()];cam.k=Math.min(4,Math.max(.25,pinch.k*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));moved=true;return}
    if(drag){const[x,y]=S2W(mx,my);if(Math.hypot(drag.x-x,drag.y-y)>2)moved=true;drag.x=x;drag.y=y;drag.vx=drag.vy=0;return}
    if(pan){cam.x=e.clientX-pan.x;cam.y=e.clientY-pan.y;moved=true;return}
    hover=pick(mx,my);cv.style.cursor=hover?'pointer':'grab';const tip=$('#tip');
    if(hover){tip.style.display='block';tip.style.left=Math.min(mx+14,W-290)+'px';tip.style.top=(my+12)+'px';tip.innerHTML='<b>'+esc(hover.nombre)+'</b><br><span class="c-note">'+(hover.tipo==='proyecto'?esc(hover.resumen):esc(D.proyectos[hover.proyecto]?.nombre)+' › '+esc(hover.ruta)+' · '+hover.chars+' caracteres')+'</span>'}else tip.style.display='none'});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;
    if(!moved&&drag){const n=drag;drag=null;G.stop();go(n.tipo==='proyecto'?{vista:'proyecto',id:n.id,sec:'contexto'}:{vista:'proyecto',id:n.proyecto,sec:'contexto',ir:n.ruta});return}
    drag=null;pan=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),mx=e.clientX-r.left-W/2,my=e.clientY-r.top-H/2,k=Math.min(4,Math.max(.25,cam.k*Math.exp(-e.deltaY*.0015)));cam.x=mx-(mx-cam.x)*k/cam.k;cam.y=my-(my-cam.y)*k/cam.k;cam.k=k},{passive:false});
}

document.addEventListener('click',e=>{const t=e.target.closest('[data-v],[data-p],[data-s],[data-copy],[data-t]');if(!t)return;e.preventDefault();
  if(t.dataset.copy){navigator.clipboard.writeText(t.dataset.copy);const o=t.textContent;t.textContent='Copiado';setTimeout(()=>t.textContent=o,1200);return}
  if(t.dataset.v)go({vista:t.dataset.v});
  else if(t.dataset.p)go({vista:'proyecto',id:t.dataset.p,sec:'contexto',ir:t.dataset.t||null});
  else if(t.dataset.s)go({sec:t.dataset.s});
  else if(t.dataset.t)irA(t.dataset.t)});
document.addEventListener('input',e=>{if(e.target.id==='gq')G.q=e.target.value});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='selp')go({id:e.target.value,sec:'contexto'});if(id==='fp')go({fp:e.target.value});if(id==='fa')go({fa:e.target.value});
  if(id==='gt'||id==='gs'){G.temas=$('#gt').checked;G.subs=$('#gs').checked;G.stop();setTimeout(render,20)}});
const h=location.hash.slice(1);if(VISTAS.some(v=>v[0]===h))S.vista=h;
render();
</script></body></html>`;
}
