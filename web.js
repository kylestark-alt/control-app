// Biblioteca visual con el framework de Interfaz Digital (ix-saas-shell, ix-dash, ix-theme…).
// Las hojas y ix-theme.js se cargan de framework.interfaz.digital: si el framework mejora, control mejora.
export const FW = 'https://framework.interfaz.digital';
const FW_V = '1.21.1';

const I = {
  proyectos: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  grafo: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="9" cy="18" r="2.5"/><path d="M8.2 7 15.7 7.8M7 8.3l1.5 7.3M16.4 10 10.8 16.4"/>',
  pendientes: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
  bitacora: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  principal: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
  conectar: '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7Z"/><path d="M12 16v5"/>',
  doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  play: '<path d="M8 5.5v13l10-6.5z"/>',
};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

export function renderBiblioteca(data, nonce) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const css = ['ix-saas-shell', 'ix-theme', 'ix-motion', 'ix-data', 'ix-dash'].map(f => `<link rel="stylesheet" href="${FW}/assets/${f}.css?v=${FW_V}">`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f4f2ec">
<title>Control · Pure</title>${css}
<style>
:root{--ix-accent:#4e66ff;--c-der:#e0782f;--c-sub:#8b5cf6;--c-tag:#1f9d61}
.c-wrap{padding:6px 0 calc(var(--ix-content-bottom,40px) + 24px)}
.c-mnav{display:none;margin:0 0 12px;overflow-x:auto;max-width:100%}.c-mnav .ix-seg{flex-wrap:nowrap}.c-mnav button{white-space:nowrap}
.ix-side-nav button{width:100%}.ix-side-nav .c-pj span:first-of-type{flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ix-side-label{font-size:11px;font-weight:780;letter-spacing:.08em;color:var(--ix-muted);padding:6px 12px 2px;text-transform:uppercase}
.ix-seg button{cursor:pointer}.ix-seg button.is-active{background:var(--ix-accent);color:#fff}
.c-k{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--ix-line);border-radius:999px;background:var(--ix-surface,#fff);color:var(--ix-muted);font:inherit;font-size:13px;cursor:pointer}
.c-k svg{width:16px;height:16px}.c-k kbd{font:inherit;font-size:11px;border:1px solid var(--ix-line);border-radius:6px;padding:1px 5px}
.c-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.c-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ix-line);border-radius:999px;padding:5px 11px;background:var(--ix-surface,#fff);color:var(--ix-ink);font:inherit;font-size:12.5px;font-weight:650;cursor:pointer;text-align:left}
.c-chip i{width:8px;height:8px;border-radius:50%;background:var(--c,var(--ix-accent));flex:none}
.c-grid{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:12px;margin-top:12px;align-items:start}
.c-col{display:flex;flex-direction:column;gap:12px;min-width:0}
.ix-card h3{margin:0 0 10px;font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:var(--ix-muted)}
.c-toc a{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:9px;color:var(--ix-ink);text-decoration:none;font-size:14px;cursor:pointer}
.c-toc a span{flex:1}.c-toc a:hover{background:color-mix(in srgb,var(--ix-accent) 9%,transparent)}.c-toc a.sub{padding-left:22px;color:var(--ix-muted);font-size:13px}
.c-toc small{color:var(--ix-muted);font-variant-numeric:tabular-nums}.c-toc button{border:0;background:none;color:var(--ix-muted);padding:2px;cursor:pointer;display:flex}.c-toc button svg{width:15px;height:15px}.c-toc button:hover{color:var(--ix-accent)}
.c-md{font-size:15px;line-height:1.62;min-width:0}.c-md h1{font-size:22px;margin:0 0 6px}.c-md h2{font-size:18px;margin:26px 0 8px;padding-top:14px;border-top:1px solid var(--ix-line)}.c-md h3{font-size:15px;margin:18px 0 6px;color:var(--ix-accent)}
.c-md code{background:color-mix(in srgb,var(--ix-accent) 9%,transparent);padding:1px 6px;border-radius:6px}.c-md li{margin:3px 0}
.c-wl{color:var(--ix-accent);font-weight:650;text-decoration:none;border-bottom:1px dashed color-mix(in srgb,var(--ix-accent) 50%,transparent);cursor:pointer}.c-wl.roto{color:var(--c-der)}
.c-flash{animation:cflash 1.6s ease}@keyframes cflash{from{background:color-mix(in srgb,var(--ix-accent) 22%,transparent)}to{background:transparent}}
.c-list{list-style:none;margin:0;padding:0}.c-list li{padding:9px 2px;border-bottom:1px solid var(--ix-line);font-size:13.5px}.c-list li:last-child{border:0}.c-list .q{display:block;color:var(--ix-muted);font-size:12.5px;margin-top:3px}
.c-tl{list-style:none;margin:0;padding:0}.c-tl li{display:grid;grid-template-columns:70px 110px minmax(0,1fr);gap:12px;padding:10px 4px;border-bottom:1px solid var(--ix-line);font-size:14px;align-items:baseline}
.c-tl time{color:var(--ix-muted);font-size:12.5px;font-variant-numeric:tabular-nums}.c-tl b{font-weight:700}
.c-day{margin-top:12px}.c-day header{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px}.c-day h2{margin:0;font-size:17px}
.c-pend{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:10px;align-items:start;padding:11px 4px;border-bottom:1px solid var(--ix-line);font-size:14px}
.c-pend .bx{width:18px;height:18px;border:1.8px solid var(--ix-line);border-radius:6px;margin-top:2px}.c-pend.hecho .bx{background:var(--c-tag);border-color:var(--c-tag)}.c-pend.hecho .tx{text-decoration:line-through;color:var(--ix-muted)}
.c-pend .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px}.c-tag{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--c,var(--ix-accent)) 13%,transparent);color:var(--c,var(--ix-accent));border:0;font-family:inherit;cursor:pointer}
.c-tag.venc{--c:#d64545}
.c-copy{display:flex;gap:8px;margin:6px 0 12px}.c-copy code{flex:1;min-width:0;padding:10px 12px;border:1px solid var(--ix-line);border-radius:var(--ix-control-radius);background:var(--ix-bg);overflow:auto;white-space:nowrap;font-size:12.5px}
.c-note{color:var(--ix-muted);font-size:13px;margin:0 0 6px}
.c-graph{position:relative;height:calc(100svh - var(--ix-content-top,96px) - var(--ix-content-bottom,60px) - 120px);min-height:480px;padding:0;overflow:hidden}
.c-mini{position:relative;height:250px;padding:0;overflow:hidden}
canvas.c-cv{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.c-gbar{position:absolute;top:12px;left:12px;z-index:2;display:flex;flex-direction:column;gap:7px;padding:12px;border:1px solid var(--ix-line);border-radius:14px;background:color-mix(in srgb,var(--ix-surface,#fff) 88%,transparent);backdrop-filter:blur(10px);font-size:12.5px;width:236px}
.c-gbar label{display:flex;gap:8px;align-items:center;cursor:pointer}.c-gbar input[type=checkbox]{width:auto;margin:0;accent-color:var(--ix-accent)}
.c-ley{display:flex;align-items:center;gap:8px;color:var(--ix-muted)}.c-ley i{display:inline-block;width:22px;border-top:2px solid}
.c-time{position:absolute;left:12px;right:12px;bottom:12px;z-index:2;display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--ix-line);border-radius:14px;background:color-mix(in srgb,var(--ix-surface,#fff) 88%,transparent);backdrop-filter:blur(10px);font-size:12.5px}
.c-time input{flex:1;accent-color:var(--ix-accent)}.c-time button{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;border:0;background:var(--ix-accent);color:#fff;cursor:pointer}.c-time button svg{width:14px;height:14px;fill:#fff;stroke:none}
.c-time span{min-width:92px;text-align:right;color:var(--ix-muted);font-variant-numeric:tabular-nums}
.c-tip{position:absolute;pointer-events:none;z-index:3;display:none;max-width:280px;padding:8px 10px;border:1px solid var(--ix-line);border-radius:10px;background:var(--ix-surface,#fff);font-size:12.5px;box-shadow:var(--ix-shadow)}
.c-mobile-pj{display:none;margin-top:10px}.c-select{height:42px;padding:0 12px;border:1px solid var(--ix-line);border-radius:var(--ix-control-radius);background:var(--ix-surface,#fff);color:var(--ix-ink);font:inherit;min-width:170px}
.c-check{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 12px;border:1px solid var(--ix-line);border-radius:var(--ix-control-radius);background:var(--ix-surface,#fff);font-size:13.5px;cursor:pointer}.c-check input{accent-color:#d64545}
.c-user{font-size:12.5px;color:var(--ix-muted);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-empty{padding:30px 10px;text-align:center;color:var(--ix-muted)}
.c-ov{position:fixed;inset:0;z-index:50;display:none;align-items:flex-start;justify-content:center;padding:12vh 16px 16px;background:rgba(10,12,11,.32);backdrop-filter:blur(6px)}
.c-ov .ix-card{border-radius:20px;background:var(--ix-surface,#fff)}.c-ov.on{display:flex}.c-pal{width:min(640px,100%);max-height:70vh;display:flex;flex-direction:column;padding:0;overflow:hidden}
.c-pal input{border:0;border-bottom:1px solid var(--ix-line);padding:18px 20px;font:inherit;font-size:17px;background:transparent;color:var(--ix-ink);outline:none}
.c-res{overflow:auto;padding:6px}.c-res button{display:block;width:100%;text-align:left;border:0;background:none;color:var(--ix-ink);font:inherit;padding:10px 12px;border-radius:10px;cursor:pointer}
.c-res button.on,.c-res button:hover{background:color-mix(in srgb,var(--ix-accent) 11%,transparent)}.c-res b{font-size:14px}.c-res small{display:block;color:var(--ix-muted);font-size:12px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-res em{font-style:normal;font-size:11px;font-weight:780;letter-spacing:.06em;color:var(--ix-accent);text-transform:uppercase;margin-right:8px}
.c-hist{width:min(820px,100%);max-height:78vh;overflow:auto;padding:20px 22px}.c-hist .c-list li{cursor:pointer}.c-hist pre{white-space:pre-wrap;font:inherit;font-size:14px;background:var(--ix-bg);padding:14px;border-radius:12px;margin:10px 0 0}
@media(max-width:980px){.c-mnav{display:block}.c-grid{grid-template-columns:1fr}.c-mobile-pj{display:block}.c-tl li{grid-template-columns:1fr;gap:2px}.c-user,.c-k kbd{display:none}
  .c-gbar{width:auto;flex-direction:row;flex-wrap:wrap;padding:8px 10px}.c-gbar .c-ley,.c-gbar .c-note{display:none}.c-col-side{order:2}}
</style></head>
<body class="ix-shell" data-ix-surface="control">
<div class="ix-viewport" data-ix-viewport>
<header class="ix-topbar has-nav">
  <a class="ix-wordmark" href="/"><span class="ix-wordmark-main">pure<b>.</b></span><span class="ix-wordmark-product">control</span></a>
  <div class="ix-nav-actions">
    <button class="c-k" type="button" data-k>${icon('buscar')}<span>Buscar</span><kbd>⌘K</kbd></button>
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
<div class="c-ov" id="ovk"><div class="ix-card c-pal"><input id="kq" placeholder="Busca un proyecto, tema, etiqueta o texto…" autocomplete="off"><div class="c-res" id="kres"></div></div></div>
<div class="c-ov" id="ovh"><div class="ix-card c-hist" id="hist"></div></div>
<script src="${FW}/assets/ix-theme.js?v=${FW_V}"></script>
<script nonce="${nonce}">
const D=${json};
const ICON=${JSON.stringify(Object.fromEntries(Object.keys(I).map(k => [k, icon(k)])))};
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fecha=s=>s?new Date(s).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'—';
const hora=s=>s?new Date(s).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):'';
const corta=s=>s?new Date(s).toLocaleDateString('es-MX',{day:'numeric',month:'short'}):'—';
const diaLargo=d=>new Date(d+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'});
const ancla=r=>'t-'+encodeURIComponent(String(r).toLowerCase());
const hoy=new Date().toISOString().slice(0,10);
const ids=Object.keys(D.proyectos).sort((a,b)=>(D.proyectos[b].actualizado||'').localeCompare(D.proyectos[a].actualizado||''));
const nombre=id=>D.proyectos[id]?.nombre||id;
let S={vista:'proyecto',id:ids[0]||null,sec:'contexto',fp:'',fa:'',fr:'',fe:'',festado:'abiertos',fv:false,ir:null};
const VISTAS=[['proyecto','Proyectos','proyectos'],['grafo','Grafo','grafo'],['pendientes','Pendientes','pendientes'],['bitacora','Bitácora','bitacora'],['principal','Contexto principal','principal'],['conectar','Conectar IA','conectar']];
const go=p=>{Object.assign(S,p);render()};

function render(){
  $('#yo').textContent=D.usuario?.email||'';
  $('#mnav').innerHTML='<div class="ix-seg is-light">'+VISTAS.map(([k,l])=>'<button type="button" data-v="'+k+'" class="'+(S.vista===k?'is-active':'')+'">'+l+'</button>').join('')+'</div>';
  const abiertos=D.pendientes.filter(p=>!p.hecho).length, venc=D.pendientes.filter(p=>!p.hecho&&p.vence&&p.vence<hoy).length;
  const deHoy=D.eventos.filter(e=>e.ts.slice(0,10)===hoy).length;
  const badge={pendientes:venc?'<span class="ix-count" style="background:#d64545">'+venc+'</span>':abiertos?'<span class="ix-count">'+abiertos+'</span>':'',bitacora:deHoy?'<span class="ix-count">'+deHoy+'</span>':''};
  $('#side').innerHTML=VISTAS.map(([k,l,ic])=>'<button type="button" data-v="'+k+'"'+(S.vista===k?' aria-current="page"':'')+'>'+ICON[ic]+'<span>'+l+'</span>'+(badge[k]||'')+'</button>').join('')+
    '<span class="ix-side-sep" aria-hidden="true"></span><div class="ix-side-label">Proyectos</div>'+
    ids.map(id=>{const p=D.proyectos[id];return '<button type="button" class="c-pj" data-p="'+id+'"'+(S.vista==='proyecto'&&S.id===id?' aria-current="page"':'')+'>'+ICON.doc+'<span>'+esc(p.nombre)+'</span><span class="ix-count">'+p.indice.length+'</span></button>'}).join('');
  for(const g of GRAFOS)g.run=false;GRAFOS.length=0;
  ({proyecto:vProyecto,grafo:vGrafo,pendientes:vPendientes,bitacora:vBitacora,principal:vPrincipal,conectar:vConectar})[S.vista]($('#view'));
}
function head(t,sub,tools=''){return '<header class="ix-dash-head"><div><span class="ix-eyebrow">PURE · CONTROL</span><h1>'+t+'</h1><p>'+sub+'</p></div><div class="ix-dash-tools">'+tools+'</div></header>'}
function kpi(label,valor,tono,extra=''){return '<article class="ix-card ix-kpi ix-lift" style="--ix-tone:'+tono+'"><p class="ix-kpi-label">'+label+'</p><div class="ix-kpi-value"><span>'+valor+'</span>'+extra+'</div></article>'}
function opts(lista,sel,todos){return '<option value="">'+todos+'</option>'+lista.map(([v,l])=>'<option value="'+esc(v)+'"'+(v===sel?' selected':'')+'>'+esc(l)+'</option>').join('')}
const ref=(p,t)=>'<button class="c-chip" data-p="'+p+'"'+(t?' data-t="'+esc(t)+'"':'')+'><i></i>'+esc(nombre(p))+(t?' › '+esc(t):'')+'</button>';

// ---------------------------------------------------------------- Proyecto
function vProyecto(v){
  const p=D.proyectos[S.id];
  if(!p){v.innerHTML=head('Sin proyectos','Crea el primero desde cualquier IA conectada.');return}
  const temas=p.indice.filter(t=>t.nivel===2).length, subs=p.indice.length-temas;
  const ev=D.eventos.filter(e=>e.id===S.id), sem=ev.filter(e=>Date.now()-new Date(e.ts)<7*864e5).length;
  const pend=D.pendientes.filter(x=>x.proyecto===S.id&&!x.hecho), venc=pend.filter(x=>x.vence&&x.vence<hoy).length;
  const hijos=ids.filter(i=>D.proyectos[i].deriva_de===S.id);
  const tags=D.etiquetas.filter(e=>e.donde.some(d=>d===S.id||d.startsWith(S.id+' ›')));
  const seg='<div class="ix-seg is-light" role="tablist">'+[['contexto','Contexto'],['pendientes','Pendientes'],['decisiones','Decisiones'],['changelog','Cambios']].map(([k,l])=>'<button type="button" data-s="'+k+'" class="'+(S.sec===k?'is-active':'')+'">'+l+'</button>').join('')+'</div>';
  const chips=(p.deriva_de?'<button class="c-chip" style="--c:var(--c-der)" data-p="'+p.deriva_de+'"><i></i>Deriva de '+esc(nombre(p.deriva_de))+'</button>':'')+
    hijos.map(h=>'<button class="c-chip" style="--c:var(--c-der)" data-p="'+h+'"><i></i>Rama: '+esc(nombre(h))+'</button>').join('')+
    (p.relacionados||[]).map(r=>'<button class="c-chip" data-p="'+r+'"><i></i>'+esc(nombre(r))+'</button>').join('')+
    tags.map(t=>'<button class="c-tag" style="--c:var(--c-tag)" data-tag="'+esc(t.tag)+'">#'+esc(t.tag)+'</button>').join('');
  const toc='<article class="ix-card c-toc"><h3>Índice</h3>'+(p.indice.map(t=>'<a class="'+(t.nivel===3?'sub':'')+'" data-t="'+esc(t.ruta)+'"><span>'+esc(t.titulo)+'</span><small>'+t.chars+'</small><button type="button" title="Historial" data-h="'+esc(t.ruta)+'">'+ICON.reloj+'</button></a>').join('')||'<p class="c-note">Sin temas todavía.</p>')+'</article>';
  const men='<article class="ix-card"><h3>Mencionado en</h3>'+(p.mencionado.length?'<ul class="c-list">'+p.mencionado.map(m=>'<li>'+ref(m.desde,m.tema)+(m.hacia?' <span class="c-note">→ '+esc(m.hacia)+'</span>':'')+'</li>').join('')+'</ul>':'<p class="c-note">Nadie enlaza aquí todavía. Usa [['+S.id+'#Tema]] en otro proyecto.</p>')+'</article>';
  const sin=p.sinEnlazar.length?'<article class="ix-card"><h3>Menciones sin enlazar</h3><ul class="c-list">'+p.sinEnlazar.map(m=>'<li>'+ref(m.proyecto,m.tema)+'<span class="q">…'+esc(m.texto)+'…</span></li>').join('')+'</ul></article>':'';
  const mini='<article class="ix-card c-mini"><canvas class="c-cv" id="cvm"></canvas><div class="c-tip" id="tipm"></div></article>';
  v.innerHTML=head(esc(p.nombre),esc(p.resumen)+' · <span class="ix-delta">'+p.estado+'</span>',seg)+selProyecto()+(chips?'<div class="c-chips">'+chips+'</div>':'')+
    '<div class="ix-kpis ix-enter" style="margin-top:12px">'+kpi('Temas · subtemas',temas+' · '+subs,'var(--ix-accent)')+kpi('Pendientes abiertos',pend.length,venc?'#d64545':'var(--c-tag)',venc?'<span class="ix-delta" style="color:#d64545">'+venc+' vencidos</span>':'')+kpi('Cambios esta semana',sem,'var(--c-sub)')+kpi('Última edición',corta(p.actualizado),'var(--c-der)','<span class="ix-delta">'+esc(ev.at(-1)?.autor||'—')+'</span>')+'</div>'+
    '<div class="c-grid"><div class="c-col c-col-side">'+(S.sec==='contexto'?toc:'')+mini+men+sin+'</div><article class="ix-card c-md">'+p.secciones[S.sec]+'</article></div>';
  const vecinos=new Set([S.id]);
  for(const l of D.grafo.links){const a=l.source,b=l.target;const de=x=>x===S.id||x.startsWith(S.id+'#');if(de(a))vecinos.add(b);if(de(b))vecinos.add(a)}
  crearGrafo($('#cvm'),$('#tipm'),{mini:true,filtro:n=>vecinos.has(n.id)&&n.tipo!=='subtema'||(n.tipo==='subtema'&&n.proyecto===S.id)});
  if(S.ir){const r=S.ir;S.ir=null;setTimeout(()=>irA(r),40)}else $('#ix-main').scrollTop=0;
}
function selProyecto(){return '<div class="c-mobile-pj"><select class="c-select" id="selp">'+ids.map(i=>'<option value="'+i+'"'+(i===S.id?' selected':'')+'>'+esc(nombre(i))+'</option>').join('')+'</select></div>'}
function irA(ruta){const el=document.getElementById(ancla(ruta));if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('c-flash');void el.offsetWidth;el.classList.add('c-flash')}

// ---------------------------------------------------------------- Pendientes
function vPendientes(v){
  const resp=[...new Set(D.pendientes.map(p=>p.responsable).filter(Boolean))].sort();
  const lista=D.pendientes.filter(p=>(!S.fp||p.proyecto===S.fp)&&(!S.fr||p.responsable===S.fr)&&(!S.fe||p.tags.includes(S.fe))&&(S.festado==='todos'||(S.festado==='cerrados'?p.hecho:!p.hecho))&&(!S.fv||(p.vence&&p.vence<hoy&&!p.hecho)))
    .sort((a,b)=>(a.hecho-b.hecho)||((a.vence||'9')>(b.vence||'9')?1:-1));
  const ab=D.pendientes.filter(p=>!p.hecho), venc=ab.filter(p=>p.vence&&p.vence<hoy).length, sem=ab.filter(p=>p.vence&&p.vence>=hoy&&p.vence<=new Date(Date.now()+7*864e5).toISOString().slice(0,10)).length;
  const tools='<select class="c-select" id="fp">'+opts(ids.map(i=>[i,nombre(i)]),S.fp,'Todos los proyectos')+'</select><select class="c-select" id="fr">'+opts(resp.map(r=>[r,'@'+r]),S.fr,'Cualquier responsable')+'</select><select class="c-select" id="festado">'+[['abiertos','Abiertos'],['cerrados','Cerrados'],['todos','Todos']].map(([k,l])=>'<option value="'+k+'"'+(S.festado===k?' selected':'')+'>'+l+'</option>').join('')+'</select><label class="c-check"><input type="checkbox" id="fv"'+(S.fv?' checked':'')+'> Vencidos</label>';
  v.innerHTML=head('Pendientes','Todos los proyectos en una sola lista. Las IAs los consultan con ctx_consultar sin leer nada más.',tools)+
    '<div class="ix-kpis ix-enter" style="margin-top:12px">'+kpi('Abiertos',ab.length,'var(--ix-accent)')+kpi('Vencidos',venc,'#d64545')+kpi('Vencen en 7 días',sem,'var(--c-der)')+kpi('Cerrados',D.pendientes.length-ab.length,'var(--c-tag)')+'</div>'+
    (S.fe?'<div class="c-chips"><button class="c-tag" style="--c:var(--c-tag)" data-fe="">#'+esc(S.fe)+' ✕</button></div>':'')+
    '<article class="ix-card" style="margin-top:12px">'+(lista.map(p=>'<div class="c-pend'+(p.hecho?' hecho':'')+'"><span class="bx"></span><div><span class="tx">'+esc(p.texto)+'</span><div class="meta">'+ref(p.proyecto)+(p.responsable?'<span class="c-tag" style="--c:var(--c-sub)">@'+esc(p.responsable)+'</span>':'')+p.tags.map(t=>'<button class="c-tag" style="--c:var(--c-tag)" data-fe="'+esc(t)+'">#'+esc(t)+'</button>').join('')+'</div></div>'+
      (p.vence?'<span class="c-tag'+(!p.hecho&&p.vence<hoy?' venc':'')+'">'+(p.hecho&&p.cerrado?'hecho '+corta(p.cerrado):'vence '+corta(p.vence+'T12:00'))+'</span>':'<span></span>')+'</div>').join('')||'<div class="c-empty">Sin pendientes con estos filtros.</div>')+
    '<p class="c-note" style="margin-top:12px">Formato en pendientes.md: <code>- [ ] texto @responsable vence:2026-12-01 #etiqueta</code></p></article>';
}

// ---------------------------------------------------------------- Bitácora
function vBitacora(v){
  const autores=[...new Set(D.eventos.map(e=>e.autor))].sort();
  const ev=D.eventos.filter(e=>(!S.fp||e.id===S.fp)&&(!S.fa||e.autor===S.fa));
  const dias={};for(const e of ev)(dias[e.ts.slice(0,10)]||=[]).push(e);
  const tools='<select class="c-select" id="fp">'+opts(ids.map(i=>[i,nombre(i)]),S.fp,'Todos los proyectos')+'</select><select class="c-select" id="fa">'+opts(autores.map(a=>[a,a]),S.fa,'Todos los autores')+'</select>';
  v.innerHTML=head('Bitácora','Qué cambió cada día, quién lo hizo y en qué tema.',tools)+
    (Object.keys(dias).sort().reverse().map(d=>{const l=dias[d],pr=[...new Set(l.map(e=>e.id).filter(Boolean))],au=[...new Set(l.map(e=>e.autor))];
      return '<article class="ix-card c-day"><header><h2>'+esc(diaLargo(d))+'</h2><span class="c-note">'+l.length+' cambios · '+esc(au.join(', '))+'</span></header><div class="c-chips" style="margin:0 0 6px">'+pr.map(p=>ref(p)).join('')+'</div><ul class="c-tl">'+
      l.map(e=>'<li><time>'+hora(e.ts)+'</time><b>'+esc(e.autor)+'</b><span>'+(e.id&&D.proyectos[e.id]&&e.tema?ref(e.id,e.tema)+' ':'')+esc(e.nota)+'</span></li>').join('')+'</ul></article>'}).join('')||'<article class="ix-card c-empty">Sin cambios registrados.</article>');
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
  card('Instrucción sugerida para cualquier IA',row('Pégala en sus instrucciones personalizadas:','Usa el conector "control" como memoria de proyectos. Al iniciar llama ctx_inicio una vez; lee solo el índice y el tema necesario; guarda lo relevante con ctx_escribir, enlaza con [[proyecto#Tema]] y etiqueta con #palabra; si surge un proyecto nuevo, propónlo.'));
}

// ---------------------------------------------------------------- Grafo
const GRAFOS=[];
const G={temas:true,subs:true,tags:true,enl:true,q:'',t:null,pos:{},cam:null};
const tiempos=D.grafo.nodes.map(n=>n.t).filter(Boolean).map(t=>+new Date(t)).sort((a,b)=>a-b);
const T0=tiempos[0]||Date.now(), T1=Math.max(tiempos.at(-1)||Date.now(),T0+1);
function vGrafo(v){
  const tl=G.t??T1;
  v.innerHTML=head('Grafo','Proyectos, temas, enlaces y etiquetas: cómo se conectan, se unifican y se ramifican.','<label class="ix-search">'+ICON.buscar+'<input type="search" id="gq" placeholder="Resaltar…" value="'+esc(G.q)+'"></label>')+
  '<article class="ix-card c-graph" style="margin-top:12px"><canvas class="c-cv" id="cv"></canvas><div class="c-gbar">'+
  [['gt','Temas',G.temas],['gs','Subtemas',G.subs],['gg','Etiquetas',G.tags],['ge','Enlaces [[ ]]',G.enl]].map(([i,l,c])=>'<label><input type="checkbox" id="'+i+'"'+(c?' checked':'')+'> '+l+'</label>').join('')+
  '<div class="c-ley"><i style="border-color:var(--ix-accent)"></i>Relación</div><div class="c-ley"><i style="border-color:var(--c-der);border-top-width:3px"></i>Deriva (ramifica)</div><div class="c-ley"><i style="border-color:var(--c-sub);border-top-style:dashed"></i>Tema compartido</div><div class="c-ley"><i style="border-color:var(--ix-accent);border-top-style:dotted;border-top-width:3px"></i>Enlace [[ ]]</div><div class="c-ley"><i style="border-color:var(--c-tag)"></i>Etiqueta</div>'+
  '<span class="c-note" style="margin:0">Arrastra · rueda o pellizco para zoom · toca para abrir</span></div><div class="c-tip" id="tip"></div>'+
  '<div class="c-time"><button type="button" id="play" aria-label="Animar crecimiento">'+ICON.play+'</button><input type="range" id="tl" min="'+T0+'" max="'+T1+'" value="'+tl+'" step="'+Math.max(1,Math.round((T1-T0)/400))+'"><span id="tlv">'+fecha(tl)+'</span></div>'+
  (D.grafo.nodes.length?'':'<div class="c-empty" style="position:absolute;inset:40% 0 auto">El grafo aparece cuando existan proyectos.</div>')+'</article>';
  if(D.grafo.nodes.length)crearGrafo($('#cv'),$('#tip'),{principal:true});
}
function crearGrafo(cv,tip,{mini,principal,filtro}){
  if(!cv)return;
  const st={run:true};GRAFOS.push(st);
  const ctx=cv.getContext('2d'),col=k=>getComputedStyle(document.body).getPropertyValue(k).trim()||'#888';
  const vis=n=>(filtro?filtro(n):true)&&(mini||(n.tipo==='proyecto'||(n.tipo==='tema'&&G.temas)||(n.tipo==='subtema'&&G.subs&&G.temas)||(n.tipo==='etiqueta'&&G.tags)));
  const prev=principal?G.pos:{};
  const nodes=D.grafo.nodes.filter(vis).map((n,i)=>({...n,tm:n.t?+new Date(n.t):T0,x:prev[n.id]?.x??Math.cos(i*2.4)*(50+i*5),y:prev[n.id]?.y??Math.sin(i*2.4)*(50+i*5),vx:0,vy:0,r:n.tipo==='proyecto'?14:n.tipo==='tema'?7:n.tipo==='etiqueta'?6:4.5}));
  const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const links=D.grafo.links.filter(l=>mini||l.tipo!=='enlace'||G.enl).map(l=>({...l,s:byId[l.source],t:byId[l.target]})).filter(l=>l.s&&l.t);
  const vec={};links.forEach(l=>{(vec[l.s.id]||=new Set).add(l.t.id);(vec[l.t.id]||=new Set).add(l.s.id)});
  for(const n of nodes)if(n.tipo==='proyecto')n.r=(mini?10:13)+Math.min(10,(vec[n.id]?.size||0)*.8);
  const LEN={relacion:190,deriva:150,contiene:85,compartido:130,enlace:150,etiqueta:110},STR={relacion:.04,deriva:.06,contiene:.12,compartido:.02,enlace:.03,etiqueta:.03};
  let W,H,dpr,cam=principal&&G.cam?G.cam:{x:0,y:0,k:mini?.75:nodes.length<40?1.3:nodes.length<120?1:.7},alpha=Object.keys(prev).length?.3:1,drag=null,hover=null,moved=false;
  const size=()=>{dpr=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr};size();addEventListener('resize',size);
  const vivo=n=>!principal||n.tm<=(G.t??T1);
  function tick(){
    const act=nodes.filter(vivo);
    for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++){const a=act[i],b=act[j];let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy||.01;if(d2>250000)continue;const f=(a.tipo==='proyecto'&&b.tipo==='proyecto'?2600:1100)/d2*alpha,d=Math.sqrt(d2);dx/=d;dy/=d;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f}
    for(const l of links){if(!vivo(l.s)||!vivo(l.t))continue;const dx=l.t.x-l.s.x,dy=l.t.y-l.s.y,d=Math.hypot(dx,dy)||.01,f=(d-LEN[l.tipo]*(mini?.6:1))*STR[l.tipo]*alpha;l.s.vx+=dx/d*f;l.s.vy+=dy/d*f;l.t.vx-=dx/d*f;l.t.vy-=dy/d*f}
    for(const n of act){n.vx-=n.x*.004*alpha;n.vy-=n.y*.004*alpha;if(n===drag)continue;n.vx*=.82;n.vy*=.82;n.x+=n.vx;n.y+=n.vy}
    alpha=Math.max(alpha*.992,.02);
  }
  const S2W=(x,y)=>[(x-W/2-cam.x)/cam.k,(y-H/2-cam.y)/cam.k];
  function draw(){
    const acc=col('--ix-accent'),ink=col('--ix-ink'),mut=col('--ix-muted'),surf=col('--ix-surface'),der=col('--c-der'),sub=col('--c-sub'),tag=col('--c-tag');
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2+cam.x,H/2+cam.y);ctx.scale(cam.k,cam.k);
    const q=principal?G.q.toLowerCase():'',foco=hover?new Set([hover.id,...(vec[hover.id]||[])]):null;
    for(const l of links){if(!vivo(l.s)||!vivo(l.t))continue;const dim=foco&&!(foco.has(l.s.id)&&foco.has(l.t.id));ctx.globalAlpha=dim?.1:l.tipo==='contiene'?.35:.8;
      ctx.strokeStyle=l.tipo==='deriva'?der:l.tipo==='compartido'?sub:l.tipo==='etiqueta'?tag:l.tipo==='contiene'?mut:acc;
      ctx.lineWidth=(l.tipo==='deriva'?3:l.tipo==='contiene'?1:l.tipo==='enlace'?2.2:1.6)/Math.sqrt(cam.k);ctx.setLineDash(l.tipo==='compartido'?[6,5]:l.tipo==='enlace'?[2,4]:l.tipo==='etiqueta'?[1,3]:[]);
      ctx.beginPath();ctx.moveTo(l.s.x,l.s.y);ctx.lineTo(l.t.x,l.t.y);ctx.stroke();
      if(l.tipo==='deriva'||l.tipo==='enlace'){const a=Math.atan2(l.t.y-l.s.y,l.t.x-l.s.x),x=l.t.x-Math.cos(a)*(l.t.r+3),y=l.t.y-Math.sin(a)*(l.t.r+3);ctx.setLineDash([]);ctx.fillStyle=l.tipo==='deriva'?der:acc;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a-.4)*9,y-Math.sin(a-.4)*9);ctx.lineTo(x-Math.cos(a+.4)*9,y-Math.sin(a+.4)*9);ctx.fill()}}
    ctx.setLineDash([]);
    for(const n of nodes){if(!vivo(n))continue;const hit=q&&(n.nombre||'').toLowerCase().includes(q),dim=(foco&&!foco.has(n.id))||(q&&!hit),yo=mini&&(n.id===S.id);ctx.globalAlpha=dim?.18:1;
      if(n.tipo==='proyecto'){ctx.globalAlpha=dim?.06:.16;ctx.beginPath();ctx.arc(n.x,n.y,n.r+7,0,7);ctx.fillStyle=acc;ctx.fill();ctx.globalAlpha=dim?.18:1}
      ctx.beginPath();if(n.tipo==='etiqueta'){ctx.rect(n.x-n.r,n.y-n.r,n.r*2,n.r*2)}else ctx.arc(n.x,n.y,n.r,0,7);
      ctx.fillStyle=n.tipo==='proyecto'?(n.estado==='activo'?acc:mut):n.tipo==='etiqueta'?tag:surf;ctx.fill();
      if(n.tipo!=='proyecto'&&n.tipo!=='etiqueta'||hit||yo){ctx.lineWidth=(hit||yo?3:1.6)/cam.k;ctx.strokeStyle=hit?der:yo?ink:n.tipo==='tema'?acc:sub;ctx.stroke()}
      if(n.tipo!=='subtema'||cam.k>1.2||n===hover||hit){ctx.fillStyle=n.tipo==='etiqueta'?tag:ink;ctx.font=(n.tipo==='proyecto'?'780 13px':n.tipo==='tema'?'650 11.5px':'500 10.5px')+' system-ui,-apple-system,sans-serif';ctx.textAlign='center';ctx.fillText(n.nombre,n.x,n.y+n.r+(n.tipo==='proyecto'?18:13))}}
    ctx.restore();ctx.globalAlpha=1;
  }
  function loop(){if(!st.run||!document.body.contains(cv))return;tick();draw();if(principal){for(const n of nodes)G.pos[n.id]={x:n.x,y:n.y};G.cam=cam}requestAnimationFrame(loop)}
  loop();
  const pick=(mx,my)=>{const[x,y]=S2W(mx,my);let best=null,bd=1e9;for(const n of nodes){if(!vivo(n))continue;const d=Math.hypot(n.x-x,n.y-y);if(d<n.r+7/cam.k&&d<bd){bd=d;best=n}}return best};
  const pts=new Map();let pinch=null,pan=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();pts.set(e.pointerId,[e.clientX-r.left,e.clientY-r.top]);moved=false;
    if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),k:cam.k};drag=null;pan=null;return}
    const n=pick(e.clientX-r.left,e.clientY-r.top);if(n){drag=n;alpha=Math.max(alpha,.3)}else pan={x:e.clientX-cam.x,y:e.clientY-cam.y}});
  cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;if(pts.has(e.pointerId))pts.set(e.pointerId,[mx,my]);
    if(pinch&&pts.size===2){const[a,b]=[...pts.values()];cam.k=Math.min(4,Math.max(.25,pinch.k*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));moved=true;return}
    if(drag){const[x,y]=S2W(mx,my);if(Math.hypot(drag.x-x,drag.y-y)>2)moved=true;drag.x=x;drag.y=y;drag.vx=drag.vy=0;return}
    if(pan){cam.x=e.clientX-pan.x;cam.y=e.clientY-pan.y;moved=true;return}
    hover=pick(mx,my);cv.style.cursor=hover?'pointer':'grab';
    if(hover&&tip){tip.style.display='block';tip.style.left=Math.min(mx+14,W-290)+'px';tip.style.top=(my+12)+'px';tip.innerHTML='<b>'+esc(hover.nombre)+'</b><br><span class="c-note">'+(hover.tipo==='proyecto'?esc(hover.resumen):hover.tipo==='etiqueta'?(vec[hover.id]?.size||0)+' lugares':esc(nombre(hover.proyecto))+' › '+esc(hover.ruta)+' · '+hover.chars+' caracteres')+'</span>'}else if(tip)tip.style.display='none'});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;
    if(!moved&&drag){const n=drag;drag=null;
      if(n.tipo==='etiqueta'){go({vista:'pendientes',fe:n.nombre.slice(1),festado:'todos'});return}
      go(n.tipo==='proyecto'?{vista:'proyecto',id:n.id,sec:'contexto'}:{vista:'proyecto',id:n.proyecto,sec:'contexto',ir:n.ruta});return}
    drag=null;pan=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),mx=e.clientX-r.left-W/2,my=e.clientY-r.top-H/2,k=Math.min(4,Math.max(.25,cam.k*Math.exp(-e.deltaY*.0015)));cam.x=mx-(mx-cam.x)*k/cam.k;cam.y=my-(my-cam.y)*k/cam.k;cam.k=k},{passive:false});
}
let playing=null;
function animar(){
  if(playing){clearInterval(playing);playing=null;return}
  G.t=T0;let paso=(T1-T0)/180;
  playing=setInterval(()=>{G.t=Math.min(T1,G.t+paso);const r=$('#tl');if(!r){clearInterval(playing);playing=null;return}r.value=G.t;$('#tlv').textContent=fecha(G.t);if(G.t>=T1){clearInterval(playing);playing=null}},33);
}

// ---------------------------------------------------------------- Buscador rápido (Cmd+K)
const K={sel:0,res:[]};
function abrirK(){$('#ovk').classList.add('on');const q=$('#kq');q.value='';q.focus();buscarK('')}
function cerrarOv(){document.querySelectorAll('.c-ov').forEach(o=>o.classList.remove('on'))}
function buscarK(q){
  const t=q.trim().toLowerCase();
  const items=[...ids.map(i=>({tipo:'proyecto',p:i,n:nombre(i),x:D.proyectos[i].resumen})),...D.buscable.filter(b=>b.r).map(b=>({tipo:'tema',p:b.p,r:b.r,n:b.n,x:b.x})),...D.etiquetas.map(e=>({tipo:'etiqueta',n:'#'+e.tag,x:e.donde.slice(0,4).join(' · ')}))];
  const score=it=>{if(!t)return it.tipo==='proyecto'?2:it.tipo==='tema'?1:0;const n=(it.n||'').toLowerCase(),r=(it.r||'').toLowerCase(),x=(it.x||'').toLowerCase();return n.startsWith(t)?6:n.includes(t)?5:r.includes(t)?4:x.includes(t)?2:0};
  K.res=items.map(it=>[score(it),it]).filter(([s])=>s>0).sort((a,b)=>b[0]-a[0]).slice(0,30).map(([,it])=>it);K.sel=0;pintarK(t);
}
function pintarK(t){
  const res=$('#kres');
  res.innerHTML=K.res.map((it,i)=>{let snip=it.x||'';if(t&&snip.toLowerCase().includes(t)){const j=snip.toLowerCase().indexOf(t);snip=(j>40?'…':'')+snip.slice(Math.max(0,j-40),j+80)}
    return '<button type="button" data-ki="'+i+'" class="'+(i===K.sel?'on':'')+'"><b><em>'+it.tipo+'</em>'+esc(it.n)+'</b><small>'+(it.tipo==='tema'?esc(nombre(it.p))+' › '+esc(it.r)+' — ':'')+esc(snip)+'</small></button>'}).join('')||'<div class="c-empty">Sin resultados.</div>';
  res.querySelector('.on')?.scrollIntoView({block:'nearest'});
}
function elegirK(i){const it=K.res[i];if(!it)return;cerrarOv();
  if(it.tipo==='proyecto')go({vista:'proyecto',id:it.p,sec:'contexto'});else if(it.tipo==='tema')go({vista:'proyecto',id:it.p,sec:'contexto',ir:it.r});else{G.q=it.n;go({vista:'grafo'})}}

// ---------------------------------------------------------------- Historial de un tema
async function historial(ruta){
  const h=$('#hist');$('#ovh').classList.add('on');h.innerHTML='<h3>Historial · '+esc(ruta)+'</h3><p class="c-note">Cargando…</p>';
  try{const r=await fetch('/web/historial?id='+encodeURIComponent(S.id)+'&tema='+encodeURIComponent(ruta));const l=await r.json();if(!r.ok)throw new Error(l.error);
    h.innerHTML='<h3>Historial · '+esc(nombre(S.id))+' › '+esc(ruta)+'</h3>'+(l.length?'<ul class="c-list">'+l.map(c=>'<li data-sha="'+c.sha+'" data-ruta="'+esc(ruta)+'"><b>'+esc(c.autor)+'</b> · '+fecha(c.fecha)+'<span class="q">'+esc(c.mensaje.replace(/^\\[[^\\]]+\\]\\s*/,''))+'</span></li>').join('')+'</ul><div id="hv"></div>':'<p class="c-note">Sin versiones anteriores.</p>');
  }catch(e){h.innerHTML='<p class="c-note">No se pudo cargar: '+esc(e.message)+'</p>'}
}
async function version(sha,ruta){const r=await fetch('/web/historial?id='+encodeURIComponent(S.id)+'&tema='+encodeURIComponent(ruta)+'&sha='+sha);const j=await r.json();$('#hv').innerHTML='<pre>'+esc(j.texto||j.error)+'</pre>';$('#hv').scrollIntoView({behavior:'smooth',block:'nearest'})}

// ---------------------------------------------------------------- Eventos
document.addEventListener('click',e=>{
  if(e.target.classList.contains('c-ov')){cerrarOv();return}
  const t=e.target.closest('[data-v],[data-p],[data-s],[data-copy],[data-t],[data-h],[data-k],[data-ki],[data-tag],[data-fe],[data-sha],#play');if(!t)return;e.preventDefault();e.stopPropagation();
  if(t.id==='play')return animar();
  if(t.dataset.copy!==undefined){navigator.clipboard.writeText(t.dataset.copy);const o=t.textContent;t.textContent='Copiado';setTimeout(()=>t.textContent=o,1200);return}
  if(t.dataset.k!==undefined)return abrirK();
  if(t.dataset.ki!==undefined)return elegirK(+t.dataset.ki);
  if(t.dataset.h!==undefined)return historial(t.dataset.h);
  if(t.dataset.sha)return version(t.dataset.sha,t.dataset.ruta);
  if(t.dataset.tag!==undefined){G.q='#'+t.dataset.tag;return go({vista:'grafo'})}
  if(t.dataset.fe!==undefined)return go({vista:'pendientes',fe:t.dataset.fe});
  if(t.dataset.v)go({vista:t.dataset.v});
  else if(t.dataset.p)go({vista:'proyecto',id:t.dataset.p,sec:'contexto',ir:t.dataset.t||null});
  else if(t.dataset.s)go({sec:t.dataset.s});
  else if(t.dataset.t)irA(t.dataset.t)});
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();return abrirK()}
  if(e.key==='Escape')return cerrarOv();
  if(!$('#ovk').classList.contains('on'))return;
  if(e.key==='ArrowDown'){e.preventDefault();K.sel=Math.min(K.res.length-1,K.sel+1);pintarK($('#kq').value.trim().toLowerCase())}
  if(e.key==='ArrowUp'){e.preventDefault();K.sel=Math.max(0,K.sel-1);pintarK($('#kq').value.trim().toLowerCase())}
  if(e.key==='Enter'){e.preventDefault();elegirK(K.sel)}});
document.addEventListener('input',e=>{const id=e.target.id;if(id==='gq')G.q=e.target.value;if(id==='kq')buscarK(e.target.value);if(id==='tl'){G.t=+e.target.value;$('#tlv').textContent=fecha(G.t)}});
document.addEventListener('change',e=>{const id=e.target.id,v=e.target.value;
  if(id==='selp')go({id:v,sec:'contexto'});if(id==='fp')go({fp:v});if(id==='fa')go({fa:v});if(id==='fr')go({fr:v});if(id==='festado')go({festado:v});if(id==='fv')go({fv:e.target.checked});
  if(['gt','gs','gg','ge'].includes(id)){G.temas=$('#gt').checked;G.subs=$('#gs').checked;G.tags=$('#gg').checked;G.enl=$('#ge').checked;setTimeout(render,20)}});
const h=location.hash.slice(1);if(VISTAS.some(v=>v[0]===h))S.vista=h;
render();
</script></body></html>`;
}
