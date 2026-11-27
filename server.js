// control.purelinguistics.com — memoria compartida de proyectos para IAs y automatizaciones.
//   /mcp/<MCP_TOKEN>  servidor MCP (Claude, ChatGPT, Cursor, etc.)
//   /api/*            API REST con Bearer API_TOKEN (automatizaciones)
//   /t/<READ_TOKEN>/* texto plano de solo lectura (IAs que solo pueden abrir URLs)
//   /                 biblioteca visual (usuario "control" + WEB_PASSWORD)
import express from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { marked } from 'marked';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Store, SECCIONES, PROTOCOLO, outline } from './store.js';
import { renderBiblioteca } from './web.js';
import { createAuth } from './oauth.js';

const env = process.env;
const need = k => { if (!env[k]) { console.error(`Falta ${k}`); process.exit(1); } return env[k]; };
const CFG = {
  port: Number(env.PORT || 8787),
  dataDir: need('DATA_DIR'),
  mcpToken: need('MCP_TOKEN'),
  apiToken: need('API_TOKEN'),
  readToken: need('READ_TOKEN'),
  webPassword: need('WEB_PASSWORD'),
  publicUrl: env.PUBLIC_URL || 'https://control.purelinguistics.com',
  push: env.GIT_PUSH !== '0',
  authUrl: env.AUTH_URL || 'https://auth.interfaz.digital',
  allowed: (env.ALLOWED_EMAILS || 'contacto.interfazdigital@gmail.com,kyle.stark@purelinguistics.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
  admins: (env.ADMIN_EMAILS || 'contacto.interfazdigital@gmail.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
};

const store = new Store({ dir: CFG.dataDir, push: CFG.push });
await store.init();
const auth = createAuth({ publicUrl: CFG.publicUrl, authUrl: CFG.authUrl, allowed: CFG.allowed, admins: CFG.admins, estadoDir: store.estadoDir, legacyMcpToken: CFG.mcpToken, webPassword: CFG.webPassword });
await auth.load();

// ---------------------------------------------------------------- MCP

const txt = o => ({ content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o, null, 1) }] });
const autorZ = z.string().min(2).max(60).optional().describe('Quién escribe: claude, chatgpt, perplexity… (si entraste con Google se toma de tu cuenta)');
const lectorZ = z.string().min(2).max(60).describe('Identificador estable de esta IA/usuario, ej. "claude-omar". Guarda tu marcador de novedades.');

function buildMcp(ident = {}) {
  const quien = ident.email ? ident.email.split('@')[0] : null;
  const conAutor = a => ({ ...a, autor: a.autor || quien || 'desconocido' });
  const s = new McpServer({ name: 'control-contexto', version: '2.0.0' }, { instructions: PROTOCOLO });
  const tool = (name, description, inputSchema, fn) =>
    s.registerTool(name, { description, inputSchema }, async args => {
      try { return txt(await fn(args)); } catch (e) { return { ...txt(`ERROR: ${e.message}`), isError: true }; }
    });

  tool('ctx_inicio', 'Llamar UNA vez al iniciar: contexto principal (incluye el protocolo), proyectos en una línea y novedades desde tu última visita.', {
    lector: lectorZ.optional(),
  }, async a => {
    const r = await store.inicio({ lector: a.lector || ident.email });
    let out = `${r.principal}\n## Proyectos\n${r.proyectos}`;
    if (r.novedades) out += `\n\n## Novedades${r.novedades.desde ? ` desde ${r.novedades.desde.slice(0, 16)}` : ''}\n${r.novedades.texto}`;
    if (r.avisos.length) out += `\n\nAVISOS: ${r.avisos.join(' ')}`;
    return out;
  });

  tool('ctx_proyecto', 'Sin tema: ficha, índice de temas/subtemas (tamaño y última edición), relacionados y 5 cambios recientes. Con tema ("Tema" o "Tema/Subtema"): solo ese bloque y su version. seccion: pendientes | decisiones | changelog.', {
    id: z.string(), tema: z.string().optional(), seccion: z.enum(SECCIONES).optional(),
  }, a => store.proyecto(a.id, a));

  tool('ctx_buscar', 'Busca texto; cada resultado indica proyecto › tema/subtema para abrir solo eso.', {
    q: z.string().min(2), proyecto: z.string().optional(),
  }, a => store.buscar(a.q, { proyecto: a.proyecto }));

  tool('ctx_novedades', 'Qué cambió desde tu última consulta (o desde una fecha ISO). Agrupado por proyecto y tema.', {
    lector: lectorZ.optional(), desde: z.string().optional(),
  }, a => store.novedades({ ...a, lector: a.lector || ident.email || 'anonimo' }));

  tool('ctx_escribir', 'Escribe en un tema o subtema del contexto ("Tema" o "Tema/Subtema"); lo crea si no existe. modo=agregar (default) o reemplazar (pasa la version leída). Queda registrado.', {
    id: z.string(), tema: z.string(), contenido: z.string(),
    modo: z.enum(['agregar', 'reemplazar']).default('agregar'), version: z.string().optional(),
    nota: z.string().max(160).optional().describe('Resumen del cambio en una línea'), autor: autorZ,
  }, a => store.escribirTema(conAutor(a)));

  tool('ctx_crear_proyecto', 'Crea un proyecto. resumen = una línea. relacionados = ids existentes. deriva_de = id del proyecto del que nace (ramificación). temas = títulos iniciales.', {
    id: z.string().describe('minúsculas-con-guiones'), nombre: z.string(), resumen: z.string().max(200),
    relacionados: z.array(z.string()).default([]), deriva_de: z.string().optional(), temas: z.array(z.string()).default([]), autor: autorZ,
  }, a => store.crearProyecto(conAutor(a)));

  tool('ctx_actualizar', 'Edita pendientes o decisiones (o el contexto completo solo para reorganizarlo). modo=agregar o reemplazar con version.', {
    id: z.string(), seccion: z.enum(['pendientes', 'decisiones', 'contexto']), contenido: z.string(),
    modo: z.enum(['agregar', 'reemplazar']).default('agregar'), version: z.string().optional(), nota: z.string().max(160).optional(), autor: autorZ,
  }, a => store.actualizar(conAutor(a)));

  tool('ctx_ficha', 'Cambia nombre, resumen, estado, relaciones o deriva_de ("" para quitarlo) de un proyecto.', {
    id: z.string(), nombre: z.string().optional(), resumen: z.string().max(200).optional(),
    estado: z.enum(['activo', 'pausado', 'cerrado']).optional(), relacionados: z.array(z.string()).optional(), deriva_de: z.string().optional(), autor: autorZ,
  }, a => store.meta(conAutor(a)));

  tool('ctx_registrar', 'Agrega un evento de una línea al changelog (avances, envíos, cierre de sesión).', {
    id: z.string(), evento: z.string().max(300), tema: z.string().optional(), autor: autorZ,
  }, a => store.registrar(conAutor(a)));

  tool('ctx_principal', 'Lee o reemplaza el contexto principal (CONTEXTO.md). Para reemplazar pasa la version obtenida con modo=leer.', {
    modo: z.enum(['leer', 'reemplazar']), contenido: z.string().optional(), version: z.string().optional(),
    nota: z.string().max(160).optional(), autor: autorZ.optional(),
  }, async a => {
    if (a.modo === 'leer') return { version: await store.versionPrincipal(), texto: (await store.inicio()).principal };
    if (!a.contenido) throw new Error('contenido es obligatorio');
    return store.actualizarPrincipal(conAutor(a));
  });
  return s;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '1mb' }));

const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

async function handleMcp(req, res, ident) {
  const server = buildMcp(ident);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
app.use(auth.router);
app.all('/mcp/:token', (req, res, next) => { const id = auth.mcpIdentity(req, req.params.token); return id ? handleMcp(req, res, id).catch(next) : res.status(404).end(); });
app.all('/mcp', (req, res, next) => { const id = auth.mcpIdentity(req); return id ? handleMcp(req, res, id).catch(next) : auth.challenge(res); });

// ---------------------------------------------------------------- API REST

const api = express.Router();
api.use((req, res, next) => safeEq((req.get('authorization') || '').replace(/^Bearer /, ''), CFG.apiToken) ? next() : res.status(401).json({ error: 'token inválido' }));
const h = fn => (req, res) => Promise.resolve(fn(req)).then(r => res.json(r), e => res.status(/CONFLICTO/.test(e.message) ? 409 : 400).json({ error: e.message }));
const autor = req => req.body?.autor || req.get('x-autor') || 'api';
api.get('/inicio', h(r => store.inicio({ lector: r.query.lector })));
api.get('/proyectos', h(async () => (await store.index()).proyectos));
api.get('/proyectos/:id', h(r => store.proyecto(r.params.id, { tema: r.query.tema, seccion: r.query.seccion })));
api.put('/proyectos/:id/temas', h(r => store.escribirTema({ ...r.body, id: r.params.id, autor: autor(r) })));
api.post('/proyectos', h(r => store.crearProyecto({ ...r.body, autor: autor(r) })));
api.put('/proyectos/:id/:seccion', h(r => store.actualizar({ ...r.body, id: r.params.id, seccion: r.params.seccion, autor: autor(r) })));
api.patch('/proyectos/:id', h(r => store.meta({ ...r.body, id: r.params.id, autor: autor(r) })));
api.post('/proyectos/:id/registro', h(r => store.registrar({ id: r.params.id, evento: r.body.evento, tema: r.body.tema, autor: autor(r) })));
api.get('/novedades', h(r => store.novedades({ lector: r.query.lector || 'api', desde: r.query.desde })));
api.get('/grafo', h(() => store.grafo()));
api.get('/buscar', h(r => store.buscar(r.query.q, { proyecto: r.query.proyecto })));
api.get('/historial', h(r => store.historial({ proyecto: r.query.proyecto, limite: Number(r.query.limite) || 30 })));
app.use('/api', api);

// ---------------------------------------------------------------- Texto plano (solo lectura)

app.get('/t/:token{/:id}{/*seccion}', async (req, res) => {
  if (!safeEq(req.params.token, CFG.readToken)) return res.status(404).end();
  res.type('text/plain; charset=utf-8');
  try {
    if (!req.params.id) { const r = await store.inicio(); return res.send(`${r.principal}\n## Proyectos\n${r.proyectos}\n\nPara un proyecto: ${CFG.publicUrl}/t/<token>/<id>/<seccion>\n`); }
    const sec = [].concat(req.params.seccion || []).join('/');
    const p = await store.proyecto(req.params.id, SECCIONES.includes(sec) ? { seccion: sec } : sec ? { tema: decodeURIComponent(sec) } : {});
    const cuerpo = p.texto ?? `${p.intro}\n\nTemas (abre uno con /<id>/<Tema>):\n${p.indice}\n\nRecientes:\n${p.recientes.join('\n')}`;
    res.send(`${cuerpo}\n\n---\nRelacionados:\n${p.relacionados.map(x => '- ' + x).join('\n') || '(ninguno)'}\n`);
  } catch (e) { res.status(400).send(e.message); }
});

// ---------------------------------------------------------------- Biblioteca web

app.get('/salud', (req, res) => res.json({ ok: true }));
app.use((req, res, next) => {
  const u = auth.webIdentity(req);
  if (u) { req.usuario = u; return next(); }
  const [type, val] = (req.get('authorization') || '').split(' ');
  if (type === 'Basic') {
    const [n, ...p] = Buffer.from(val || '', 'base64').toString().split(':');
    if (n === 'control' && safeEq(p.join(':'), CFG.webPassword)) { req.usuario = { email: 'respaldo', via: 'password' }; return next(); }
  }
  res.redirect(302, '/login');
});
app.get('/', async (req, res, next) => {
  try {
    const idx = await store.index();
    const proyectos = {};
    for (const [id, m] of Object.entries(idx.proyectos)) {
      const ctx = await fs.readFile(path.join(CFG.dataDir, 'proyectos', id, 'contexto.md'), 'utf8').catch(() => '');
      const secciones = { contexto: marked.parse(conAnclas(ctx)) };
      for (const s of ['pendientes', 'decisiones', 'changelog']) secciones[s] = marked.parse((await store.proyecto(id, { seccion: s })).texto);
      proyectos[id] = { ...m, temas: undefined, indice: outline(ctx), secciones };
    }
    const nonce = crypto.randomBytes(16).toString('base64');
    res.set('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}' https://framework.interfaz.digital; style-src 'unsafe-inline' https://framework.interfaz.digital; font-src https://framework.interfaz.digital data:; img-src 'self' data: https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`);
    res.set('Cache-Control', 'no-store');
    res.type('html').send(renderBiblioteca({
      principal: marked.parse((await store.inicio()).principal), proyectos,
      eventos: (await store.eventos({ max: 400 })).reverse(), grafo: await store.grafo(),
      usuario: req.usuario, conexion: { url: CFG.publicUrl, mcpOauth: `${CFG.publicUrl}/mcp`, mcp: `${CFG.publicUrl}/mcp/${CFG.mcpToken}`, lectura: `${CFG.publicUrl}/t/${CFG.readToken}`, api: `${CFG.publicUrl}/api`, apiToken: CFG.apiToken },
    }, nonce));
  } catch (e) { next(e); }
});

// Encabezados ##/### con id estable para que el índice y el grafo salten al tema.
function conAnclas(md) {
  let tema = '', fence = false;
  return md.split('\n').map(l => {
    if (/^\s*```/.test(l)) fence = !fence;
    const m = !fence && l.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) return l;
    const ruta = m[1].length === 2 ? (tema = m[2]) : `${tema}/${m[2]}`;
    return `<h${m[1].length} id="t-${encodeURIComponent(ruta.toLowerCase())}">${m[2].replace(/[<>&]/g, '')}</h${m[1].length}>`;
  }).join('\n');
}

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'interno' }); });
setInterval(() => store.sync().catch(e => console.error('sync:', e.message)), 10 * 60 * 1000);
app.listen(CFG.port, '127.0.0.1', () => console.log(`control escuchando en 127.0.0.1:${CFG.port}`));
