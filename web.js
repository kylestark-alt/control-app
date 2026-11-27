// Biblioteca visual: una sola página con los datos embebidos. Vistas: proyectos, grafo, novedades, principal, conectar.
export function renderBiblioteca(data, nonce) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Control · Biblioteca</title>
<style>
:root{--bg:#f6f5f1;--panel:#fff;--ink:#1d1d1b;--mut:#6b6a64;--line:#e4e2da;--acc:#2f5d50;--acc2:#e8efe9;--der:#b4612a;--sh:#6b5bb5}
@media(prefers-color-scheme:dark){:root{--bg:#141413;--panel:#1d1d1b;--ink:#ecebe6;--mut:#9c9a92;--line:#2e2d2a;--acc:#8cc2ad;--acc2:#22302b;--der:#e39a62;--sh:#a99ae8}}
*{box-sizing:border-box}body{margin:0;font:15px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--ink)}
header{display:flex;gap:12px;align-items:center;padding:10px 18px;border-bottom:1px solid var(--line);background:var(--panel);position:sticky;top:0;z-index:5;flex-wrap:wrap}
header h1{font-size:16px;margin:0 10px 0 0}
nav{display:flex;flex-wrap:wrap;gap:2px}
nav button{background:none;border:0;color:var(--mut);font:inherit;padding:6px 10px;border-radius:8px;cursor:pointer}
nav button.on{background:var(--acc2);color:var(--acc);font-weight:600}
main{display:grid;grid-template-columns:290px 1fr;height:calc(100vh - 52px)}
main.full{grid-template-columns:1fr}main.full aside{display:none}
aside{border-right:1px solid var(--line);padding:14px;background:var(--panel);overflow:auto}
aside input,aside select,.bar input,.filtros select{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit;margin-bottom:8px}
.pj{display:block;width:100%;text-align:left;padding:9px 10px;border-radius:8px;border:0;background:none;color:inherit;font:inherit;cursor:pointer}
.pj:hover{background:var(--bg)}.pj.on{background:var(--acc2)}
.pj b{display:block;font-size:14px}.pj small{color:var(--mut);display:block;line-height:1.35}
.st{display:inline-block;font-size:11px;padding:1px 7px;border-radius:99px;border:1px solid var(--line);color:var(--mut);margin-left:6px;font-weight:500}
.st.activo{color:var(--acc);border-color:var(--acc)}
section{padding:22px 28px;overflow:auto;position:relative}
.wrap{max-width:900px}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:14px 0 18px;overflow-x:auto}
.tabs button{border:0;background:none;padding:8px 12px;font:inherit;color:var(--mut);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.tabs button.on{color:var(--ink);border-color:var(--acc)}
.chip{display:inline-block;padding:3px 10px;border-radius:99px;background:var(--acc2);color:var(--acc);margin:0 6px 6px 0;cursor:pointer;font-size:13px;border:0;font-family:inherit}
.chip.der{background:transparent;border:1px solid var(--der);color:var(--der)}
.toc{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:18px;font-size:14px}
.toc a{color:var(--ink);text-decoration:none;cursor:pointer}.toc a:hover{color:var(--acc)}
.toc .sub{padding-left:16px;color:var(--mut)}.toc small{color:var(--mut);margin-left:6px}
.md h1{font-size:22px}.md h2{font-size:18px;margin-top:26px;padding-top:6px;border-top:1px solid var(--line)}.md h3{font-size:15px;margin-top:18px}
.md code{background:var(--bg);padding:1px 5px;border-radius:4px}.md li{margin:2px 0}.mut{color:var(--mut)}
.tl{list-style:none;padding:0;margin:0}.tl li{padding:9px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:130px 120px 1fr;gap:10px;font-size:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px}.card h3{margin:0 0 6px;font-size:15px}
.copy{display:flex;gap:8px;margin:8px 0}.copy code{flex:1;padding:8px 10px;background:var(--bg);border-radius:8px;overflow:auto;white-space:nowrap;font-size:13px}
.copy button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:8px;padding:0 12px;cursor:pointer;font:inherit}
#cv{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
.bar{position:absolute;top:12px;left:12px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;width:250px;font-size:13px;z-index:2}
.bar input[type=checkbox]{width:auto;margin:0}.bar label{display:flex;gap:6px;align-items:center;margin:3px 0;cursor:pointer}
.ley{display:flex;align-items:center;gap:8px;margin:2px 0;color:var(--mut)}.ley i{display:inline-block;width:22px;height:0;border-top:2px solid}
.tip{position:absolute;pointer-events:none;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:13px;max-width:260px;display:none;z-index:3}
.filtros{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}.filtros select{width:auto;min-width:170px;margin:0}
@media(max-width:760px){main{grid-template-columns:1fr;height:auto;min-height:calc(100vh - 90px)}aside{border-right:0;border-bottom:1px solid var(--line);max-height:36vh}section{padding:16px;min-height:75vh}.tl li{grid-template-columns:1fr}.bar{width:auto;right:12px}}
</style></head><body>
<header><h1>Control</h1><nav id="nav"></nav><span id="yo" style="margin-left:auto;font-size:13px;color:var(--mut)"></span></header>
<main id="main"><aside id="side"></aside><section id="view"></section></main>
<script nonce="${nonce}">
const D=${json};
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fecha=s=>s?new Date(s).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'';
const ancla=r=>'t-'+encodeURIComponent(String(r).toLowerCase());
const ids=Object.keys(D.proyectos).sort((a,b)=>(D.proyectos[b].actualizado||'').localeCompare(D.proyectos[a].actualizado||''));
let S={vista:'proyecto',id:ids[0]||null,sec:'contexto',q:'',estado:'',fp:'',fa:'',ir:null};
const VISTAS=[['proyecto','Proyectos'],['grafo','Grafo'],['novedades','Novedades'],['principal','Contexto principal'],['conectar','Conectar IA']];
function go(p){Object.assign(S,p);render();}
function render(){
  $('#yo').innerHTML=esc(D.usuario?.email||'')+' · <a href="/logout" style="color:var(--acc)">Salir</a>';
  $('#nav').innerHTML=VISTAS.map(([k,l])=>'<button data-v="'+k+'" class="'+(S.vista===k?'on':'')+'">'+l+'</button>').join('');
  $('#main').className=S.vista==='proyecto'?'':'full';
  if(S.vista!=='grafo')G.stop();
  side();
  const v=$('#view');v.style.padding='';
  if(S.vista==='proyecto')vistaProyecto(v);
  else if(S.vista==='principal')v.innerHTML='<div class="wrap md">'+D.principal+'</div>';
  else if(S.vista==='novedades')vistaNovedades(v);
  else if(S.vista==='grafo')vistaGrafo(v);
  else if(S.vista==='conectar')vistaConectar(v);
}
function side(){
  const lista=ids.filter(id=>{const p=D.proyectos[id];return(!S.estado||p.estado===S.estado)&&(!S.q||(id+p.nombre+p.resumen).toLowerCase().includes(S.q.toLowerCase()))});
  $('#side').innerHTML='<input id="q" placeholder="Buscar proyecto" value="'+esc(S.q)+'"><select id="est"><option value="">Todos los estados</option>'+['activo','pausado','cerrado'].map(e=>'<option '+(S.estado===e?'selected':'')+'>'+e+'</option>').join('')+'</select>'+
    (lista.map(id=>{const p=D.proyectos[id];return '<button class="pj '+(S.id===id?'on':'')+'" data-p="'+id+'"><b>'+esc(p.nombre)+'<span class="st '+p.estado+'">'+p.estado+'</span></b><small>'+esc(p.resumen)+'</small></button>'}).join('')||'<p class="mut">Sin proyectos todavía.</p>');
}
function vistaProyecto(v){
  const p=D.proyectos[S.id];if(!p){v.innerHTML='<p class="mut">Crea el primer proyecto desde cualquier IA conectada.</p>';return}
  const hijos=ids.filter(i=>D.proyectos[i].deriva_de===S.id);
  const toc=p.indice.length?'<div class="toc"><b>Índice</b>'+p.indice.map(t=>'<div class="'+(t.nivel===3?'sub':'')+'"><a data-t="'+esc(t.ruta)+'">'+esc(t.titulo)+'</a><small>'+t.chars+' c</small></div>').join('')+'</div>':'';
  v.innerHTML='<div class="wrap"><h2 style="margin:0">'+esc(p.nombre)+' <span class="st '+p.estado+'">'+p.estado+'</span></h2><p class="mut" style="margin:4px 0 10px">'+esc(p.resumen)+' · actualizado '+fecha(p.actualizado)+'</p><div>'+
    (p.deriva_de?'<button class="chip der" data-p="'+p.deriva_de+'">⟵ deriva de '+esc(D.proyectos[p.deriva_de]?.nombre||p.deriva_de)+'</button>':'')+
    hijos.map(h=>'<button class="chip der" data-p="'+h+'">⟶ '+esc(D.proyectos[h].nombre)+'</button>').join('')+
    (p.relacionados||[]).map(r=>'<button class="chip" data-p="'+r+'">↔ '+esc(D.proyectos[r]?.nombre||r)+'</button>').join('')+'</div>'+
    '<div class="tabs">'+['contexto','pendientes','decisiones','changelog'].map(s=>'<button data-s="'+s+'" class="'+(S.sec===s?'on':'')+'">'+s+'</button>').join('')+'</div>'+
    (S.sec==='contexto'?toc:'')+'<div class="md">'+p.secciones[S.sec]+'</div></div>';
  if(S.ir){const el=document.getElementById(ancla(S.ir));S.ir=null;if(el)setTimeout(()=>el.scrollIntoView({behavior:'smooth'}),30)}else v.scrollTop=0;
}
function vistaNovedades(v){
  const autores=[...new Set(D.eventos.map(e=>e.autor))].sort();
  const ev=D.eventos.filter(e=>(!S.fp||e.id===S.fp)&&(!S.fa||e.autor===S.fa));
  v.innerHTML='<div class="wrap"><h2 style="margin-top:0">Novedades</h2><div class="filtros"><select id="fp"><option value="">Todos los proyectos</option>'+ids.map(i=>'<option value="'+i+'" '+(S.fp===i?'selected':'')+'>'+esc(D.proyectos[i].nombre)+'</option>').join('')+'</select><select id="fa"><option value="">Todos los autores</option>'+autores.map(a=>'<option '+(S.fa===a?'selected':'')+'>'+esc(a)+'</option>').join('')+'</select></div><ul class="tl">'+
    (ev.map(e=>'<li><span class="mut">'+fecha(e.ts)+'</span><b>'+esc(e.autor)+'</b><span>'+(e.id&&D.proyectos[e.id]?'<button class="chip" data-p="'+e.id+'"'+(e.tema?' data-t="'+esc(e.tema)+'"':'')+'>'+esc(D.proyectos[e.id].nombre)+(e.tema?' › '+esc(e.tema):'')+'</button>':'')+esc(e.nota)+'</span></li>').join('')||'<p class="mut">Sin cambios registrados.</p>')+'</ul></div>';
}
function vistaConectar(v){
  const C=D.conexion,row=(l,val)=>'<div class="mut" style="font-size:13px">'+l+'</div><div class="copy"><code>'+esc(val)+'</code><button data-copy="'+esc(val)+'">Copiar</button></div>';
  v.innerHTML='<div class="wrap"><h2 style="margin-top:0">Conectar una IA</h2><p class="mut">Estos enlaces dan acceso. No los compartas fuera del equipo.</p>'+
  '<div class="card"><h3>Claude (web, app, Claude Code)</h3><p class="mut">Configuración → Conectores → Agregar conector personalizado. Al conectar te pedirá entrar con Google.</p>'+row('URL:',C.mcpOauth)+row('Claude Code (terminal):','claude mcp add --transport http control '+C.mcpOauth)+'</div>'+
  '<div class="card"><h3>ChatGPT</h3><p class="mut">Configuración → Apps/Conectores → Modo desarrollador → Crear. Autenticación: OAuth (entrar con Google).</p>'+row('URL del servidor MCP:',C.mcpOauth)+'</div>'+
  '<div class="card"><h3>Respaldo sin Google</h3><p class="mut">Para clientes que no soportan OAuth. Este enlace da acceso completo: no lo compartas.</p>'+row('URL con token:',C.mcp)+'</div>'+
  '<div class="card"><h3>Cursor, Windsurf, VS Code y otros clientes MCP</h3>'+row('Agregar a mcp.json:',JSON.stringify({mcpServers:{control:{url:C.mcpOauth}}}))+'</div>'+
  '<div class="card"><h3>Perplexity, Gemini y otras IAs sin MCP (solo lectura)</h3><p class="mut">Pega el enlace y pide que lo lea. Para un proyecto: /&lt;id&gt;; para un tema: /&lt;id&gt;/&lt;Tema&gt;.</p>'+row('Enlace de lectura:',C.lectura)+'</div>'+
  '<div class="card"><h3>Automatizaciones (API REST)</h3>'+row('Base:',C.api)+row('Encabezado:','Authorization: Bearer '+C.apiToken)+row('Registrar un evento:','curl -X POST '+C.api+'/proyectos/ID/registro -H "Authorization: Bearer '+C.apiToken+'" -H "Content-Type: application/json" -d \\'{"evento":"Correo enviado a X","autor":"outreach"}\\'')+'</div>'+
  '<div class="card"><h3>Instrucción sugerida para cualquier IA</h3>'+row('Pégala en las instrucciones personalizadas:','Usa el conector "control" como memoria de proyectos. Al iniciar llama ctx_inicio una vez; lee solo el índice y el tema necesario; guarda lo relevante con ctx_escribir en su tema; si surge un proyecto nuevo, propónlo.')+'</div></div>';
}

// ---------------------------------------------------------------- Grafo (simulación de fuerzas en canvas)
const G={run:false,temas:true,subs:false,q:'',stop(){this.run=false}};
function vistaGrafo(v){
  v.style.padding='0';v.innerHTML='<div style="position:absolute;inset:0"><canvas id="cv"></canvas><div class="bar"><input id="gq" placeholder="Resaltar…" value="'+esc(G.q)+'">'+
  '<label><input type="checkbox" id="gt" '+(G.temas?'checked':'')+'> Temas</label><label><input type="checkbox" id="gs" '+(G.subs?'checked':'')+'> Subtemas</label>'+
  '<div class="ley"><i style="border-color:var(--acc)"></i>Relación</div><div class="ley"><i style="border-color:var(--der);border-top-width:3px"></i>Deriva (ramifica)</div><div class="ley"><i style="border-color:var(--sh);border-top-style:dashed"></i>Tema compartido (unifica)</div>'+
  '<div class="mut" style="margin-top:6px">Arrastra · rueda o pellizco para zoom · toca para abrir</div></div><div class="tip" id="tip"></div></div>';
  if(!D.grafo.nodes.length){v.insertAdjacentHTML('beforeend','<p class="mut" style="position:absolute;top:45%;width:100%;text-align:center">El grafo aparece cuando existan proyectos.</p>');return}
  iniciarGrafo();
}
function iniciarGrafo(){
  const cv=$('#cv'),ctx=cv.getContext('2d'),css=getComputedStyle(document.documentElement),col=k=>css.getPropertyValue(k).trim();
  const vis=n=>n.tipo==='proyecto'||(n.tipo==='tema'&&G.temas)||(n.tipo==='subtema'&&G.subs);
  const prev=G.pos||{};
  const nodes=D.grafo.nodes.filter(vis).map((n,i)=>({...n,x:prev[n.id]?.x??Math.cos(i)*200*Math.random(),y:prev[n.id]?.y??Math.sin(i)*200*Math.random(),vx:0,vy:0,r:n.tipo==='proyecto'?13:n.tipo==='tema'?6:4}));
  const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
  const links=D.grafo.links.map(l=>({...l,s:byId[l.source],t:byId[l.target]})).filter(l=>l.s&&l.t);
  const vec={};links.forEach(l=>{(vec[l.s.id]||=new Set).add(l.t.id);(vec[l.t.id]||=new Set).add(l.s.id)});
  for(const n of nodes)if(n.tipo==='proyecto')n.r=11+Math.min(10,(vec[n.id]?.size||0)*1.5);
  const LEN={relacion:160,deriva:130,contiene:55,compartido:110},STR={relacion:.04,deriva:.06,contiene:.12,compartido:.02};
  let W,H,dpr,cam=G.cam||{x:0,y:0,k:nodes.length<40?1.5:nodes.length<120?1:.7},alpha=Object.keys(prev).length?.3:1,drag=null,hover=null,moved=false;
  function size(){dpr=devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
  size();addEventListener('resize',size);
  function tick(){
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy||.01;if(d2>250000)continue;const f=(a.tipo==='proyecto'&&b.tipo==='proyecto'?2600:700)/d2*alpha,d=Math.sqrt(d2);dx/=d;dy/=d;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f}
    for(const l of links){const dx=l.t.x-l.s.x,dy=l.t.y-l.s.y,d=Math.hypot(dx,dy)||.01,f=(d-LEN[l.tipo])*STR[l.tipo]*alpha;l.s.vx+=dx/d*f;l.s.vy+=dy/d*f;l.t.vx-=dx/d*f;l.t.vy-=dy/d*f}
    for(const n of nodes){n.vx-=n.x*.004*alpha;n.vy-=n.y*.004*alpha;if(n===drag)continue;n.vx*=.82;n.vy*=.82;n.x+=n.vx;n.y+=n.vy}
    alpha=Math.max(alpha*.992,.02);
  }
  const S2W=(x,y)=>[(x-W/2-cam.x)/cam.k,(y-H/2-cam.y)/cam.k];
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2+cam.x,H/2+cam.y);ctx.scale(cam.k,cam.k);
    const q=G.q.toLowerCase(),foco=hover?new Set([hover.id,...(vec[hover.id]||[])]):null;
    for(const l of links){const dim=foco&&!(foco.has(l.s.id)&&foco.has(l.t.id));ctx.globalAlpha=dim?.12:l.tipo==='contiene'?.45:.85;
      ctx.strokeStyle=l.tipo==='deriva'?col('--der'):l.tipo==='compartido'?col('--sh'):l.tipo==='relacion'?col('--acc'):col('--mut');
      ctx.lineWidth=(l.tipo==='deriva'?3:l.tipo==='contiene'?.8:1.8)/Math.sqrt(cam.k);ctx.setLineDash(l.tipo==='compartido'?[6,5]:[]);
      ctx.beginPath();ctx.moveTo(l.s.x,l.s.y);ctx.lineTo(l.t.x,l.t.y);ctx.stroke();
      if(l.tipo==='deriva'){const a=Math.atan2(l.t.y-l.s.y,l.t.x-l.s.x),x=l.t.x-Math.cos(a)*(l.t.r+3),y=l.t.y-Math.sin(a)*(l.t.r+3);ctx.setLineDash([]);ctx.fillStyle=col('--der');ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a-.4)*10,y-Math.sin(a-.4)*10);ctx.lineTo(x-Math.cos(a+.4)*10,y-Math.sin(a+.4)*10);ctx.fill()}}
    ctx.setLineDash([]);
    for(const n of nodes){const hit=q&&(n.nombre||'').toLowerCase().includes(q),dim=(foco&&!foco.has(n.id))||(q&&!hit);ctx.globalAlpha=dim?.2:1;
      ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.fillStyle=n.tipo==='proyecto'?(n.estado==='activo'?col('--acc'):col('--mut')):col('--acc2');ctx.fill();
      ctx.lineWidth=(hit?3:1.2)/cam.k;ctx.strokeStyle=hit?col('--der'):col('--acc');ctx.stroke();
      if(n.tipo==='proyecto'||cam.k>1.3||n===hover||hit){ctx.fillStyle=col('--ink');ctx.font=(n.tipo==='proyecto'?'600 13px':'11px')+' system-ui';ctx.textAlign='center';ctx.fillText(n.nombre,n.x,n.y+n.r+13)}}
    ctx.restore();ctx.globalAlpha=1;
  }
  function loop(){if(!G.run||!document.body.contains(cv))return;tick();draw();G.pos=Object.fromEntries(nodes.map(n=>[n.id,{x:n.x,y:n.y}]));G.cam=cam;requestAnimationFrame(loop)}
  G.run=true;loop();
  const pick=(mx,my)=>{const[x,y]=S2W(mx,my);let best=null,bd=1e9;for(const n of nodes){const d=Math.hypot(n.x-x,n.y-y);if(d<n.r+6/cam.k&&d<bd){bd=d;best=n}}return best};
  const pts=new Map();let pinch=null,pan=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const r=cv.getBoundingClientRect();pts.set(e.pointerId,[e.clientX-r.left,e.clientY-r.top]);moved=false;
    if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),k:cam.k};drag=null;pan=null;return}
    const n=pick(e.clientX-r.left,e.clientY-r.top);if(n){drag=n;alpha=Math.max(alpha,.3)}else pan={x:e.clientX-cam.x,y:e.clientY-cam.y}});
  cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;if(pts.has(e.pointerId))pts.set(e.pointerId,[mx,my]);
    if(pinch&&pts.size===2){const[a,b]=[...pts.values()];cam.k=Math.min(4,Math.max(.25,pinch.k*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d));moved=true;return}
    if(drag){const[x,y]=S2W(mx,my);if(Math.hypot(drag.x-x,drag.y-y)>2)moved=true;drag.x=x;drag.y=y;drag.vx=drag.vy=0;return}
    if(pan){cam.x=e.clientX-pan.x;cam.y=e.clientY-pan.y;moved=true;return}
    hover=pick(mx,my);cv.style.cursor=hover?'pointer':'grab';const tip=$('#tip');
    if(hover){tip.style.display='block';tip.style.left=(mx+14)+'px';tip.style.top=(my+10)+'px';tip.innerHTML='<b>'+esc(hover.nombre)+'</b><br><span class="mut">'+(hover.tipo==='proyecto'?esc(hover.resumen):esc(D.proyectos[hover.proyecto]?.nombre)+' › '+esc(hover.ruta)+' · '+hover.chars+' c')+'</span>'}else tip.style.display='none'});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;
    if(!moved&&drag){const n=drag;drag=null;G.stop();if(n.tipo==='proyecto')go({vista:'proyecto',id:n.id,sec:'contexto'});else go({vista:'proyecto',id:n.proyecto,sec:'contexto',ir:n.ruta});return}
    drag=null;pan=null};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),mx=e.clientX-r.left-W/2,my=e.clientY-r.top-H/2,k=Math.min(4,Math.max(.25,cam.k*Math.exp(-e.deltaY*.0015)));cam.x=mx-(mx-cam.x)*k/cam.k;cam.y=my-(my-cam.y)*k/cam.k;cam.k=k},{passive:false});
}

document.addEventListener('click',e=>{const t=e.target.closest('[data-v],[data-p],[data-s],[data-copy],[data-t]');if(!t)return;
  if(t.dataset.copy){navigator.clipboard.writeText(t.dataset.copy);t.textContent='Copiado';setTimeout(()=>t.textContent='Copiar',1200);return}
  if(t.dataset.v)go({vista:t.dataset.v});
  else if(t.dataset.p)go({vista:'proyecto',id:t.dataset.p,sec:'contexto',ir:t.dataset.t||null});
  else if(t.dataset.s)go({sec:t.dataset.s});
  else if(t.dataset.t){const el=document.getElementById(ancla(t.dataset.t));if(el)el.scrollIntoView({behavior:'smooth'})}});
document.addEventListener('input',e=>{if(e.target.id==='q'){S.q=e.target.value;const pos=e.target.selectionStart;side();const q=$('#q');q.focus();q.setSelectionRange(pos,pos)}
  if(e.target.id==='gq')G.q=e.target.value});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='est')go({estado:e.target.value});if(id==='fp')go({fp:e.target.value});if(id==='fa')go({fa:e.target.value});
  if(id==='gt'||id==='gs'){G.temas=$('#gt').checked;G.subs=$('#gs').checked;G.stop();setTimeout(render,20)}});
render();
</script></body></html>`;
}
