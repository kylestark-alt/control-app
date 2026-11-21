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
import { Store, SECCIONES } from './store.js';
import { renderBiblioteca } from './web.js';

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
};

const store = new Store({ dir: CFG.dataDir, push: CFG.push });
await store.init();

// ---------------------------------------------------------------- MCP

const txt = o => ({ content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o, null, 1) }] });
const autorZ = z.string().min(2).max(40).describe('Quién escribe: claude, chatgpt, perplexity, omar, kyle…');

function buildMcp() {
  const s = new McpServer({ name: 'control-contexto', version: '1.0.0' }, {
    instructions: 'Memoria compartida de proyectos. Llama ctx_inicio UNA vez al empezar; luego lee solo el proyecto/sección necesario. Escribe resúmenes, registra cambios con tu nombre como autor y compacta si recibes avisos.',
  });
  const tool = (name, description, inputSchema, fn) =>
    s.registerTool(name, { description, inputSchema }, async args => {
      try { return txt(await fn(args)); } catch (e) { return { ...txt(`ERROR: ${e.message}`), isError: true }; }
    });

  tool('ctx_inicio', 'Contexto principal + lista de proyectos en una línea cada uno. Llamar una vez por sesión.', {},
    async () => {
      const r = await store.inicio();
      return `${r.principal}\n## Proyectos\n${r.proyectos}${r.avisos.length ? `\n\nAVISOS: ${r.avisos.join(' ')}` : ''}`;
    });

  tool('ctx_proyecto', 'Lee UNA sección de un proyecto. Devuelve version (para editar sin conflictos) y relacionados en una línea.', {
    id: z.string(), seccion: z.enum(SECCIONES).default('contexto'),
    ultimas: z.number().int().min(1).max(100).optional().describe('Solo changelog: últimas N líneas'),
  }, a => store.proyecto(a.id, a.seccion, { ultimas: a.ultimas }));

  tool('ctx_buscar', 'Busca texto en todos los proyectos (o en uno). Devuelve fragmentos cortos.', {
    q: z.string().min(2), proyecto: z.string().optional(),
  }, a => store.buscar(a.q, { proyecto: a.proyecto }));

  tool('ctx_historial', 'Últimos cambios (commits) globales o de un proyecto.', {
    proyecto: z.string().optional(), limite: z.number().int().min(1).max(100).default(20),
  }, a => store.historial(a));

  tool('ctx_crear_proyecto', 'Crea un proyecto. resumen = una línea. relacionados = ids existentes.', {
    id: z.string().describe('minúsculas-con-guiones'), nombre: z.string(), resumen: z.string().max(200),
    relacionados: z.array(z.string()).default([]), autor: autorZ,
  }, a => store.crearProyecto(a));

  tool('ctx_actualizar', 'Edita contexto, pendientes o decisiones. Con modo=reemplazar pasa la version que leíste. Registra el cambio automáticamente.', {
    id: z.string(), seccion: z.enum(['contexto', 'pendientes', 'decisiones']),
    contenido: z.string(), modo: z.enum(['reemplazar', 'agregar']).default('agregar'),
    version: z.string().optional(), nota: z.string().max(160).optional().describe('Resumen del cambio para el changelog'),
    autor: autorZ,
  }, a => store.actualizar(a));

  tool('ctx_ficha', 'Cambia nombre, resumen, estado (activo/pausado/cerrado) o relaciones de un proyecto.', {
    id: z.string(), nombre: z.string().optional(), resumen: z.string().max(200).optional(),
    estado: z.enum(['activo', 'pausado', 'cerrado']).optional(), relacionados: z.array(z.string()).optional(), autor: autorZ,
  }, a => store.meta(a));

  tool('ctx_registrar', 'Agrega una línea al changelog de un proyecto (eventos, avances, envíos).', {
    id: z.string(), evento: z.string().max(300), autor: autorZ,
  }, a => store.registrar(a));

  tool('ctx_principal', 'Reemplaza el contexto principal (CONTEXTO.md). Pasa la version; obténla con modo=leer.', {
    modo: z.enum(['leer', 'reemplazar']), contenido: z.string().optional(), version: z.string().optional(),
    nota: z.string().max(160).optional(), autor: autorZ.optional(),
  }, async a => {
    if (a.modo === 'leer') return { version: await store.versionPrincipal(), texto: (await store.inicio()).principal };
    if (!a.contenido || !a.autor) throw new Error('contenido y autor son obligatorios');
    return store.actualizarPrincipal(a);
  });
  return s;
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '1mb' }));

const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

async function handleMcp(req, res) {
  const server = buildMcp();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
app.all('/mcp/:token', (req, res, next) => safeEq(req.params.token, CFG.mcpToken) ? handleMcp(req, res).catch(next) : res.status(404).end());
app.all('/mcp', (req, res, next) => safeEq((req.get('authorization') || '').replace(/^Bearer /, ''), CFG.mcpToken) ? handleMcp(req, res).catch(next) : res.status(401).json({ error: 'token' }));

// ---------------------------------------------------------------- API REST

const api = express.Router();
api.use((req, res, next) => safeEq((req.get('authorization') || '').replace(/^Bearer /, ''), CFG.apiToken) ? next() : res.status(401).json({ error: 'token inválido' }));
const h = fn => (req, res) => Promise.resolve(fn(req)).then(r => res.json(r), e => res.status(/CONFLICTO/.test(e.message) ? 409 : 400).json({ error: e.message }));
const autor = req => req.body?.autor || req.get('x-autor') || 'api';
api.get('/inicio', h(() => store.inicio()));
api.get('/proyectos', h(async () => (await store.index()).proyectos));
api.get('/proyectos/:id', h(r => store.proyecto(r.params.id, r.query.seccion || 'contexto', { ultimas: Number(r.query.ultimas) || undefined })));
api.post('/proyectos', h(r => store.crearProyecto({ ...r.body, autor: autor(r) })));
api.put('/proyectos/:id/:seccion', h(r => store.actualizar({ ...r.body, id: r.params.id, seccion: r.params.seccion, autor: autor(r) })));
api.patch('/proyectos/:id', h(r => store.meta({ ...r.body, id: r.params.id, autor: autor(r) })));
api.post('/proyectos/:id/registro', h(r => store.registrar({ id: r.params.id, evento: r.body.evento, autor: autor(r) })));
api.get('/buscar', h(r => store.buscar(r.query.q, { proyecto: r.query.proyecto })));
api.get('/historial', h(r => store.historial({ proyecto: r.query.proyecto, limite: Number(r.query.limite) || 30 })));
app.use('/api', api);

// ---------------------------------------------------------------- Texto plano (solo lectura)

app.get('/t/:token{/:id}{/:seccion}', async (req, res) => {
  if (!safeEq(req.params.token, CFG.readToken)) return res.status(404).end();
  res.type('text/plain; charset=utf-8');
  try {
    if (!req.params.id) { const r = await store.inicio(); return res.send(`${r.principal}\n## Proyectos\n${r.proyectos}\n\nPara un proyecto: ${CFG.publicUrl}/t/<token>/<id>/<seccion>\n`); }
    const p = await store.proyecto(req.params.id, req.params.seccion || 'contexto', { ultimas: 30 });
    res.send(`${p.texto}\n\n---\nRelacionados:\n${p.relacionados.map(x => '- ' + x).join('\n') || '(ninguno)'}\n`);
  } catch (e) { res.status(400).send(e.message); }
});

// ---------------------------------------------------------------- Biblioteca web

app.get('/salud', (req, res) => res.json({ ok: true }));
app.use((req, res, next) => {
  const [type, val] = (req.get('authorization') || '').split(' ');
  if (type === 'Basic') {
    const [u, ...p] = Buffer.from(val || '', 'base64').toString().split(':');
    if (u === 'control' && safeEq(p.join(':'), CFG.webPassword)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="control", charset="UTF-8"').status(401).send('Acceso restringido');
});
app.get('/', async (req, res, next) => {
  try {
    const idx = await store.index();
    const principal = (await store.inicio()).principal;
    const proyectos = {};
    for (const [id, m] of Object.entries(idx.proyectos)) {
      proyectos[id] = { ...m, secciones: {} };
      for (const s of SECCIONES) proyectos[id].secciones[s] = marked.parse((await store.proyecto(id, s)).texto);
    }
    const historial = await store.historial({ limite: 200 });
    // CSP con nonce: el Markdown escrito por IAs no puede ejecutar scripts ni handlers inline.
    const nonce = crypto.randomBytes(16).toString('base64');
    res.set('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src 'self' data: https:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`);
    res.set('Cache-Control', 'no-store');
    res.type('html').send(renderBiblioteca({
      principal: marked.parse(principal), proyectos, historial,
      conexion: { url: CFG.publicUrl, mcp: `${CFG.publicUrl}/mcp/${CFG.mcpToken}`, lectura: `${CFG.publicUrl}/t/${CFG.readToken}`, api: `${CFG.publicUrl}/api`, apiToken: CFG.apiToken },
    }, nonce));
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'interno' }); });
setInterval(() => store.sync().catch(e => console.error('sync:', e.message)), 10 * 60 * 1000);
app.listen(CFG.port, '127.0.0.1', () => console.log(`control escuchando en 127.0.0.1:${CFG.port}`));
