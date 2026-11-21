// Almacén de contexto: archivos Markdown + index.json dentro de un repo git.
// Todas las escrituras pasan por una cola (una a la vez), hacen commit y se empujan a GitHub.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const SECCIONES = ['contexto', 'pendientes', 'decisiones', 'changelog'];
const LIMITE_CONTEXTO = 6000;   // caracteres: arriba de esto se pide compactar
const LIMITE_PRINCIPAL = 3000;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

export class Store {
  constructor({ dir, push = true, logger = console }) {
    this.dir = dir;
    this.push = push;
    this.log = logger;
    this.queue = Promise.resolve();
    this.pushTimer = null;
  }

  p(...parts) { return path.join(this.dir, ...parts); }
  async git(...args) { const { stdout } = await run('git', args, { cwd: this.dir, maxBuffer: 20e6 }); return stdout; }

  // Serializa escrituras para que dos IAs no se pisen.
  serial(fn) {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => {});
    return next;
  }

  async init() {
    await fs.mkdir(this.p('proyectos'), { recursive: true });
    if (!(await exists(this.p('index.json')))) {
      await writeJson(this.p('index.json'), { version: 1, proyectos: {} });
    }
    if (!(await exists(this.p('CONTEXTO.md')))) {
      await fs.writeFile(this.p('CONTEXTO.md'), CONTEXTO_INICIAL);
    }
    if (!(await exists(this.p('changelog.md')))) {
      await fs.writeFile(this.p('changelog.md'), '# Changelog global\n\n');
    }
    await this.commit('sistema', 'Inicializa estructura', true);
  }

  async index() { return JSON.parse(await fs.readFile(this.p('index.json'), 'utf8')); }

  // --- Lectura ---------------------------------------------------------------

  // Lo mínimo para arrancar una sesión: contexto principal + una línea por proyecto.
  async inicio() {
    const principal = await fs.readFile(this.p('CONTEXTO.md'), 'utf8');
    const idx = await this.index();
    const lineas = Object.entries(idx.proyectos)
      .sort((a, b) => (b[1].actualizado || '').localeCompare(a[1].actualizado || ''))
      .map(([id, p]) => `- ${id} [${p.estado}] ${p.resumen}${p.relacionados?.length ? ` → rel: ${p.relacionados.join(', ')}` : ''}`);
    const avisos = principal.length > LIMITE_PRINCIPAL ? [`CONTEXTO.md mide ${principal.length} caracteres (límite ${LIMITE_PRINCIPAL}). Compáctalo.`] : [];
    return { principal, proyectos: lineas.join('\n') || '(sin proyectos)', avisos };
  }

  async proyecto(id, seccion = 'contexto', { ultimas } = {}) {
    checkId(id);
    if (!SECCIONES.includes(seccion)) throw new Error(`Sección inválida. Usa: ${SECCIONES.join(', ')}`);
    const idx = await this.index();
    const meta = idx.proyectos[id];
    if (!meta) throw new Error(`No existe el proyecto "${id}". Proyectos: ${Object.keys(idx.proyectos).join(', ') || 'ninguno'}`);
    let texto = await readOr(this.p('proyectos', id, `${seccion}.md`), '');
    const version = hash(texto);
    if (seccion === 'changelog' && ultimas) {
      const ls = texto.split('\n').filter(l => l.startsWith('- '));
      texto = ls.slice(-ultimas).join('\n');
    }
    // Relacionados: solo nombre y resumen, nunca su contenido.
    const relacionados = (meta.relacionados || []).map(r => {
      const m = idx.proyectos[r];
      return m ? `${r}: ${m.resumen}` : `${r}: (no existe)`;
    });
    const avisos = [];
    if (seccion === 'contexto' && texto.length > LIMITE_CONTEXTO) avisos.push(`El contexto mide ${texto.length} caracteres (límite ${LIMITE_CONTEXTO}). Compáctalo: mueve lo viejo a decisiones/changelog.`);
    return { id, nombre: meta.nombre, estado: meta.estado, seccion, version, texto, relacionados, avisos };
  }

  async buscar(q, { proyecto, max = 12 } = {}) {
    if (!q || q.length < 2) throw new Error('Búsqueda muy corta');
    const args = ['grep', '-n', '-i', '-I', '--fixed-strings', q, '--'];
    args.push(proyecto ? `proyectos/${checkId(proyecto)}` : '.');
    let out = '';
    try { out = await this.git(...args); } catch (e) { if (e.code === 1) return []; throw e; }
    return out.split('\n').filter(Boolean).slice(0, max).map(l => {
      const [file, line, ...rest] = l.split(':');
      return { archivo: file, linea: Number(line), texto: rest.join(':').trim().slice(0, 240) };
    });
  }

  async historial({ proyecto, limite = 30 } = {}) {
    const args = ['log', `-n${limite}`, '--date=iso-strict', '--pretty=format:%h%x1f%an%x1f%ad%x1f%s'];
    if (proyecto) args.push('--', `proyectos/${checkId(proyecto)}`);
    const out = await this.git(...args).catch(() => '');
    return out.split('\n').filter(Boolean).map(l => {
      const [sha, autor, fecha, mensaje] = l.split('\x1f');
      return { sha, autor, fecha, mensaje };
    });
  }

  // --- Escritura ---------------------------------------------------------------

  crearProyecto({ id, nombre, resumen, relacionados = [], estado = 'activo', autor }) {
    return this.serial(async () => {
      checkId(id);
      const idx = await this.index();
      if (idx.proyectos[id]) throw new Error(`Ya existe "${id}"`);
      const ahora = now();
      idx.proyectos[id] = { nombre, resumen: oneLine(resumen), estado, relacionados: [], creado: ahora, actualizado: ahora };
      await fs.mkdir(this.p('proyectos', id), { recursive: true });
      await fs.writeFile(this.p('proyectos', id, 'contexto.md'), `# ${nombre}\n\n${resumen}\n`);
      await fs.writeFile(this.p('proyectos', id, 'pendientes.md'), `# Pendientes\n\n`);
      await fs.writeFile(this.p('proyectos', id, 'decisiones.md'), `# Decisiones\n\n`);
      await fs.writeFile(this.p('proyectos', id, 'changelog.md'), `# Changelog\n\n`);
      setRelaciones(idx, id, relacionados);
      await writeJson(this.p('index.json'), idx);
      await this.anotar(id, autor, `Proyecto creado: ${nombre}`);
      await this.commit(autor, `[${id}] crea proyecto`);
      return { ok: true, id };
    });
  }

  actualizar({ id, seccion, contenido, modo = 'reemplazar', version, autor, nota }) {
    return this.serial(async () => {
      checkId(id);
      if (!['contexto', 'pendientes', 'decisiones'].includes(seccion)) throw new Error('Solo se editan: contexto, pendientes, decisiones. El changelog se escribe con registrar.');
      if (!['reemplazar', 'agregar'].includes(modo)) throw new Error('modo: reemplazar | agregar');
      const idx = await this.index();
      if (!idx.proyectos[id]) throw new Error(`No existe "${id}"`);
      const file = this.p('proyectos', id, `${seccion}.md`);
      const actual = await readOr(file, '');
      if (modo === 'reemplazar' && version && version !== hash(actual)) {
        throw new Error(`CONFLICTO: alguien modificó ${id}/${seccion} desde que lo leíste (versión ${version} ≠ ${hash(actual)}). Vuelve a leerlo y fusiona.`);
      }
      const nuevo = modo === 'agregar' ? actual.replace(/\s*$/, '\n') + contenido.trim() + '\n' : contenido.trim() + '\n';
      await fs.writeFile(file, nuevo);
      idx.proyectos[id].actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar(id, autor, nota || `${modo === 'agregar' ? 'Agrega a' : 'Actualiza'} ${seccion}`);
      await this.commit(autor, `[${id}] ${seccion}: ${nota || modo}`);
      const avisos = seccion === 'contexto' && nuevo.length > LIMITE_CONTEXTO ? [`Contexto de ${nuevo.length} caracteres: compáctalo pronto.`] : [];
      return { ok: true, version: hash(nuevo), avisos };
    });
  }

  meta({ id, nombre, resumen, estado, relacionados, autor }) {
    return this.serial(async () => {
      checkId(id);
      const idx = await this.index();
      const m = idx.proyectos[id];
      if (!m) throw new Error(`No existe "${id}"`);
      if (nombre) m.nombre = nombre;
      if (resumen) m.resumen = oneLine(resumen);
      if (estado) m.estado = estado;
      if (relacionados) setRelaciones(idx, id, relacionados);
      m.actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar(id, autor, 'Actualiza ficha (nombre/resumen/estado/relaciones)');
      await this.commit(autor, `[${id}] ficha`);
      return { ok: true, ficha: idx.proyectos[id] };
    });
  }

  // Para automatizaciones: solo agrega una línea al changelog.
  registrar({ id, evento, autor }) {
    return this.serial(async () => {
      checkId(id);
      const idx = await this.index();
      if (!idx.proyectos[id]) throw new Error(`No existe "${id}"`);
      idx.proyectos[id].actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar(id, autor, evento);
      await this.commit(autor, `[${id}] ${oneLine(evento).slice(0, 72)}`);
      return { ok: true };
    });
  }

  actualizarPrincipal({ contenido, version, autor, nota }) {
    return this.serial(async () => {
      const file = this.p('CONTEXTO.md');
      const actual = await fs.readFile(file, 'utf8');
      if (version && version !== hash(actual)) throw new Error('CONFLICTO en CONTEXTO.md: vuelve a leerlo.');
      await fs.writeFile(file, contenido.trim() + '\n');
      await fs.appendFile(this.p('changelog.md'), `- ${now()} · ${autor} · CONTEXTO.md: ${oneLine(nota || 'actualizado')}\n`);
      await this.commit(autor, `[principal] ${nota || 'actualiza'}`);
      return { ok: true, version: hash(contenido.trim() + '\n') };
    });
  }

  async versionPrincipal() { return hash(await fs.readFile(this.p('CONTEXTO.md'), 'utf8')); }

  // --- Internos -------------------------------------------------------------

  async anotar(id, autor, texto) {
    const linea = `- ${now()} · ${autor} · ${oneLine(texto)}\n`;
    await fs.appendFile(this.p('proyectos', id, 'changelog.md'), linea);
    await fs.appendFile(this.p('changelog.md'), `- ${now()} · ${autor} · [${id}] ${oneLine(texto)}\n`);
  }

  async commit(autor = 'desconocido', mensaje, allowEmpty = false) {
    await this.git('add', '-A');
    const status = await this.git('status', '--porcelain');
    if (!status.trim() && !allowEmpty) return;
    if (!status.trim()) return;
    const quien = safeName(autor);
    await this.git('-c', `user.name=${quien}`, '-c', `user.email=${quien}@control.local`, 'commit', '-q', '-m', mensaje);
    this.schedulePush();
  }

  // Agrupa varios commits seguidos en un solo push.
  schedulePush() {
    if (!this.push) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.sync().catch(e => this.log.error('push falló:', e.message)), 3000);
  }

  async sync() {
    if (!this.push) return;
    return this.serial(async () => {
      try { await this.git('pull', '--rebase', '-q', 'origin', 'main'); } catch (e) { this.log.error('pull:', e.stderr || e.message); }
      await this.git('push', '-q', 'origin', 'HEAD:main');
    });
  }
}

function setRelaciones(idx, id, relacionados) {
  const limpios = [...new Set(relacionados.map(String).filter(r => r !== id))];
  for (const r of limpios) if (!idx.proyectos[r]) throw new Error(`Relación con proyecto inexistente: ${r}`);
  const antes = idx.proyectos[id].relacionados || [];
  // Relaciones bidireccionales.
  for (const r of antes) if (!limpios.includes(r)) idx.proyectos[r].relacionados = (idx.proyectos[r].relacionados || []).filter(x => x !== id);
  for (const r of limpios) { const rel = idx.proyectos[r].relacionados ||= []; if (!rel.includes(id)) rel.push(id); }
  idx.proyectos[id].relacionados = limpios;
}

const checkId = id => { if (!ID_RE.test(id || '')) throw new Error(`id inválido "${id}": usa minúsculas, números y guiones`); return id; };
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const oneLine = s => String(s || '').replace(/\s+/g, ' ').trim();
const safeName = s => oneLine(s).replace(/[^\w.-]/g, '-').slice(0, 40) || 'desconocido';
const exists = f => fs.access(f).then(() => true, () => false);
const readOr = (f, d) => fs.readFile(f, 'utf8').catch(() => d);
const writeJson = (f, o) => fs.writeFile(f, JSON.stringify(o, null, 2) + '\n');

const CONTEXTO_INICIAL = `# Contexto principal

## Quiénes
- Omar: operación y automatizaciones.
- Kyle: Pure Linguistics / Pure Solutions.

## Regla de eficiencia (obligatoria para toda IA)
1. Al iniciar: llama \`ctx_inicio\` una sola vez. No leas proyectos que no te pidieron.
2. Lee solo el proyecto y la sección que necesitas. Los relacionados vienen como una línea; ábrelos solo si la tarea lo exige.
3. Escribe resúmenes, no transcripciones. Lo vigente va en "contexto"; lo histórico en "decisiones" o "changelog".
4. Si una respuesta trae avisos de tamaño, compacta antes de terminar.
5. Registra cada cambio relevante con tu nombre como autor (claude, chatgpt, perplexity, automatizacion-x).
6. Si hay CONFLICTO, vuelve a leer, fusiona y reintenta. Nunca sobrescribas a ciegas.
7. Cuando una sesión se alargue, guarda el avance y sugiere abrir una sesión nueva.
`;
