// Biblioteca visual: una sola página, datos embebidos, navegación en el navegador.
export function renderBiblioteca(data, nonce) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Control · Biblioteca</title>
<style>
:root{--bg:#f6f5f1;--panel:#fff;--ink:#1d1d1b;--mut:#6b6a64;--line:#e4e2da;--acc:#2f5d50;--acc2:#e8efe9;--warn:#9a5b13}
@media(prefers-color-scheme:dark){:root{--bg:#141413;--panel:#1d1d1b;--ink:#ecebe6;--mut:#9c9a92;--line:#2e2d2a;--acc:#8cc2ad;--acc2:#22302b;--warn:#e0a85a}}
*{box-sizing:border-box}body{margin:0;font:15px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--ink)}
header{display:flex;gap:12px;align-items:center;padding:12px 18px;border-bottom:1px solid var(--line);background:var(--panel);position:sticky;top:0;z-index:5;flex-wrap:wrap}
header h1{font-size:16px;margin:0 12px 0 0;letter-spacing:.02em}
nav button{background:none;border:0;color:var(--mut);font:inherit;padding:6px 10px;border-radius:8px;cursor:pointer}
nav button.on{background:var(--acc2);color:var(--acc);font-weight:600}
main{display:grid;grid-template-columns:280px 1fr;min-height:calc(100vh - 56px)}
aside{border-right:1px solid var(--line);padding:14px;background:var(--panel);overflow:auto}
aside input,aside select{width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit;margin-bottom:8px}
.pj{display:block;width:100%;text-align:left;padding:9px 10px;border-radius:8px;border:0;background:none;color:inherit;font:inherit;cursor:pointer}
.pj:hover{background:var(--bg)}.pj.on{background:var(--acc2)}
.pj b{display:block;font-size:14px}.pj small{color:var(--mut);display:block;line-height:1.35}
.st{display:inline-block;font-size:11px;padding:1px 7px;border-radius:99px;border:1px solid var(--line);color:var(--mut);margin-left:6px;font-weight:500}
.st.activo{color:var(--acc);border-color:var(--acc)}
section{padding:22px 28px;max-width:900px;overflow:auto}
.tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--line);margin:14px 0 18px}
.tabs button{border:0;background:none;padding:8px 12px;font:inherit;color:var(--mut);cursor:pointer;border-bottom:2px solid transparent}
.tabs button.on{color:var(--ink);border-color:var(--acc)}
.chip{display:inline-block;padding:3px 10px;border-radius:99px;background:var(--acc2);color:var(--acc);margin:0 6px 6px 0;cursor:pointer;font-size:13px;border:0;font-family:inherit}
.md h1{font-size:22px}.md h2{font-size:17px;margin-top:22px}.md code{background:var(--bg);padding:1px 5px;border-radius:4px}
.md li{margin:2px 0}.mut{color:var(--mut)}
.tl{list-style:none;padding:0}.tl li{padding:8px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:150px 110px 1fr;gap:10px;font-size:14px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px}
.card h3{margin:0 0 6px;font-size:15px}
.copy{display:flex;gap:8px;margin:8px 0}.copy code{flex:1;padding:8px 10px;background:var(--bg);border-radius:8px;overflow:auto;white-space:nowrap;font-size:13px}
.copy button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:8px;padding:0 12px;cursor:pointer;font:inherit}
svg text{fill:var(--ink);font-size:12px}svg line{stroke:var(--line);stroke-width:1.5}svg circle{fill:var(--acc2);stroke:var(--acc);stroke-width:1.5;cursor:pointer}
@media(max-width:760px){main{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--line);max-height:38vh}section{padding:16px}.tl li{grid-template-columns:1fr}}
</style></head><body>
<header><h1>Control</h1><nav id="nav"></nav></header>
<main><aside id="side"></aside><section id="view"></section></main>
<script nonce="${nonce}">
const D=${json};
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fecha=s=>s?new Date(s).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}):'';
let S={vista:'proyecto',id:null,sec:'contexto',q:'',estado:''};
const ids=Object.keys(D.proyectos).sort((a,b)=>(D.proyectos[b].actualizado||'').localeCompare(D.proyectos[a].actualizado||''));
S.id=ids[0]||null;
const VISTAS=[['proyecto','Proyectos'],['mapa','Mapa'],['historial','Cambios'],['principal','Contexto principal'],['conectar','Conectar IA']];
function go(p){Object.assign(S,p);render();}
function render(){
  $('#nav').innerHTML=VISTAS.map(([k,l])=>'<button data-v="'+k+'" class="'+(S.vista===k?'on':'')+'">'+l+'</button>').join('');
  const lista=ids.filter(id=>{const p=D.proyectos[id];return(!S.estado||p.estado===S.estado)&&(!S.q||(id+p.nombre+p.resumen).toLowerCase().includes(S.q.toLowerCase()))});
  $('#side').innerHTML='<input id="q" placeholder="Buscar proyecto" value="'+esc(S.q)+'"><select id="est"><option value="">Todos los estados</option>'+['activo','pausado','cerrado'].map(e=>'<option '+(S.estado===e?'selected':'')+'>'+e+'</option>').join('')+'</select>'+
    (lista.map(id=>{const p=D.proyectos[id];return '<button class="pj '+(S.vista==='proyecto'&&S.id===id?'on':'')+'" data-p="'+id+'"><b>'+esc(p.nombre)+'<span class="st '+p.estado+'">'+p.estado+'</span></b><small>'+esc(p.resumen)+'</small></button>'}).join('')||'<p class="mut">Sin proyectos todavía.</p>');
  const v=$('#view');
  if(S.vista==='proyecto'){
    const p=D.proyectos[S.id]; if(!p){v.innerHTML='<p class="mut">Crea el primer proyecto desde cualquier IA conectada.</p>';return}
    v.innerHTML='<h2 style="margin:0">'+esc(p.nombre)+' <span class="st '+p.estado+'">'+p.estado+'</span></h2><p class="mut" style="margin:4px 0 10px">'+esc(p.resumen)+' · actualizado '+fecha(p.actualizado)+'</p>'+
      (p.relacionados?.length?'<div>'+p.relacionados.map(r=>'<button class="chip" data-p="'+r+'">↔ '+esc(D.proyectos[r]?.nombre||r)+'</button>').join('')+'</div>':'')+
      '<div class="tabs">'+['contexto','pendientes','decisiones','changelog'].map(s=>'<button data-s="'+s+'" class="'+(S.sec===s?'on':'')+'">'+s+'</button>').join('')+'</div><div class="md">'+p.secciones[S.sec]+'</div>';
  }else if(S.vista==='principal'){v.innerHTML='<div class="md">'+D.principal+'</div>';}
  else if(S.vista==='historial'){
    const h=D.historial.filter(c=>!S.q||(c.mensaje+c.autor).toLowerCase().includes(S.q.toLowerCase()));
    v.innerHTML='<h2 style="margin-top:0">Cambios recientes</h2><ul class="tl">'+h.map(c=>{const m=c.mensaje.match(/^\\[([^\\]]+)\\]/);return '<li><span class="mut">'+fecha(c.fecha)+'</span><b>'+esc(c.autor)+'</b><span>'+(m&&D.proyectos[m[1]]?'<button class="chip" data-p="'+m[1]+'">'+esc(m[1])+'</button>':'')+esc(c.mensaje.replace(/^\\[[^\\]]+\\]\\s*/,''))+'</span></li>'}).join('')+'</ul>';
  }else if(S.vista==='mapa'){
    const n=ids.length,W=760,H=Math.max(360,n*34),cx=W/2,cy=H/2,R=Math.min(cx,cy)-70,pos={};
    ids.forEach((id,i)=>{const a=2*Math.PI*i/Math.max(n,1)-Math.PI/2;pos[id]=[cx+R*Math.cos(a),cy+R*Math.sin(a)]});
    let e='';const vis=new Set();ids.forEach(id=>(D.proyectos[id].relacionados||[]).forEach(r=>{const k=[id,r].sort().join('|');if(pos[r]&&!vis.has(k)){vis.add(k);e+='<line x1="'+pos[id][0]+'" y1="'+pos[id][1]+'" x2="'+pos[r][0]+'" y2="'+pos[r][1]+'"/>'}}));
    const nodes=ids.map(id=>'<g data-p="'+id+'"><circle cx="'+pos[id][0]+'" cy="'+pos[id][1]+'" r="'+(10+Math.min(8,(D.proyectos[id].relacionados||[]).length*2))+'"/><text x="'+pos[id][0]+'" y="'+(pos[id][1]+28)+'" text-anchor="middle">'+esc(D.proyectos[id].nombre)+'</text></g>').join('');
    v.innerHTML='<h2 style="margin-top:0">Mapa de relaciones</h2><p class="mut">Toca un proyecto para abrirlo.</p><svg viewBox="0 0 '+W+' '+H+'" width="100%">'+e+nodes+'</svg>';
  }else if(S.vista==='conectar'){
    const C=D.conexion,row=(l,val)=>'<div class="mut" style="font-size:13px">'+l+'</div><div class="copy"><code>'+esc(val)+'</code><button data-copy="'+esc(val)+'">Copiar</button></div>';
    v.innerHTML='<h2 style="margin-top:0">Conectar una IA</h2><p class="mut">Estos enlaces dan acceso. No los compartas fuera del equipo.</p>'+
    '<div class="card"><h3>Claude (web, app, Claude Code)</h3>'+row('Configuración → Conectores → Agregar conector personalizado → URL:',C.mcp)+row('Claude Code (terminal):','claude mcp add --transport http control '+C.mcp)+'</div>'+
    '<div class="card"><h3>ChatGPT</h3><p class="mut">Configuración → Apps/Conectores → Modo desarrollador → Crear. Autenticación: ninguna.</p>'+row('URL del servidor MCP:',C.mcp)+'</div>'+
    '<div class="card"><h3>Cursor, Windsurf, VS Code y otros clientes MCP</h3>'+row('Agregar a mcp.json:',JSON.stringify({mcpServers:{control:{url:C.mcp}}}))+'</div>'+
    '<div class="card"><h3>Perplexity, Gemini y otras IAs sin MCP (solo lectura)</h3><p class="mut">Pega este enlace en el chat y pide que lo lea. Para un proyecto agrega /&lt;id&gt;/&lt;sección&gt;.</p>'+row('Enlace de lectura:',C.lectura)+'</div>'+
    '<div class="card"><h3>Automatizaciones (API REST)</h3>'+row('Base:',C.api)+row('Encabezado:','Authorization: Bearer '+C.apiToken)+row('Registrar un evento:','curl -X POST '+C.api+'/proyectos/ID/registro -H "Authorization: Bearer '+C.apiToken+'" -H "Content-Type: application/json" -d \\'{"evento":"Correo enviado a X","autor":"outreach"}\\'')+'</div>'+
    '<div class="card"><h3>Instrucción sugerida para cualquier IA</h3>'+row('Pégala en las instrucciones personalizadas:','Usa el conector "control" como memoria de proyectos. Al iniciar llama ctx_inicio una vez; lee solo el proyecto y la sección necesarios; registra cada cambio con tu nombre como autor; escribe resúmenes, no transcripciones.')+'</div>';
  }
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-v],[data-p],[data-s],[data-copy]');if(!t)return;
  if(t.dataset.copy){navigator.clipboard.writeText(t.dataset.copy);t.textContent='Copiado';setTimeout(()=>t.textContent='Copiar',1200);return}
  if(t.dataset.v)go({vista:t.dataset.v});else if(t.dataset.p)go({vista:'proyecto',id:t.dataset.p,sec:'contexto'});else if(t.dataset.s)go({sec:t.dataset.s});});
document.addEventListener('input',e=>{if(e.target.id==='q'){S.q=e.target.value;const pos=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(pos,pos)}});
document.addEventListener('change',e=>{if(e.target.id==='est')go({estado:e.target.value})});
render();
</script></body></html>`;
}
