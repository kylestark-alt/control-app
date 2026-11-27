// Almacén de contexto: Markdown + index.json + eventos.jsonl dentro de un repo git.
// Cada proyecto organiza su contexto en temas (## Tema) y subtemas (### Subtema), como capítulos y versículos.
// Las IAs leen el índice primero y solo abren el tema que necesitan.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const SECCIONES = ['contexto', 'pendientes', 'decisiones', 'changelog'];
const LIMITE_TEMA = 2500;        // caracteres por tema/subtema antes de pedir compactar
const LIMITE_CONTEXTO = 12000;   // contexto completo de un proyecto
const LIMITE_PRINCIPAL = 3000;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

export class Store {
  constructor({ dir, estadoDir, push = true, logger = console }) {
    this.dir = dir;
    this.estadoDir = estadoDir || path.join(path.dirname(dir), 'estado');
    this.push = push;
    this.log = logger;
    this.queue = Promise.resolve();
    this.pushTimer = null;
  }

  p(...parts) { return path.join(this.dir, ...parts); }
  async git(...args) { const { stdout } = await run('git', args, { cwd: this.dir, maxBuffer: 20e6 }); return stdout; }

  serial(fn) {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => {});
    return next;
  }

  async init() {
    await fs.mkdir(this.p('proyectos'), { recursive: true });
    await fs.mkdir(this.estadoDir, { recursive: true });
    if (!(await exists(this.p('index.json')))) await writeJson(this.p('index.json'), { version: 2, proyectos: {} });
    if (!(await exists(this.p('CONTEXTO.md')))) await fs.writeFile(this.p('CONTEXTO.md'), CONTEXTO_INICIAL);
    if (!(await exists(this.p('changelog.md')))) await fs.writeFile(this.p('changelog.md'), '# Changelog global\n\n');
    if (!(await exists(this.p('eventos.jsonl')))) await fs.writeFile(this.p('eventos.jsonl'), '');
    // Migración v1 → v2: el contexto principal trae el protocolo nuevo si no fue editado a mano.
    const principal = await fs.readFile(this.p('CONTEXTO.md'), 'utf8');
    if ((principal.includes('## Regla de eficiencia (obligatoria para toda IA)') || principal.includes('## Protocolo v2')) && !principal.includes('Protocolo v3')) {
      await fs.writeFile(this.p('CONTEXTO.md'), CONTEXTO_INICIAL);
    }
    await this.commit('sistema', 'Inicializa o migra estructura');
  }

  async index() { return JSON.parse(await fs.readFile(this.p('index.json'), 'utf8')); }

  // --- Lectura ---------------------------------------------------------------

  async inicio({ lector } = {}) {
    const principal = await fs.readFile(this.p('CONTEXTO.md'), 'utf8');
    const idx = await this.index();
    const lineas = Object.entries(idx.proyectos)
      .sort((a, b) => (b[1].actualizado || '').localeCompare(a[1].actualizado || ''))
      .map(([id, p]) => `- ${id} [${p.estado}] ${p.resumen}${p.deriva_de ? ` ⟵ de ${p.deriva_de}` : ''}${p.relacionados?.length ? ` ↔ ${p.relacionados.join(', ')}` : ''}`);
    const avisos = principal.length > LIMITE_PRINCIPAL ? [`CONTEXTO.md mide ${principal.length} caracteres (límite ${LIMITE_PRINCIPAL}). Compáctalo.`] : [];
    const novedades = lector ? await this.novedades({ lector, max: 12 }) : null;
    return { principal, proyectos: lineas.join('\n') || '(sin proyectos)', novedades, avisos };
  }

  // Sin tema: ficha + índice de temas + relacionados + últimos cambios. Con tema: solo ese bloque.
  async proyecto(id, { tema, seccion } = {}) {
    const idx = await this.index();
    const meta = getMeta(idx, id);
    const relacionados = (meta.relacionados || []).map(r => `${r}: ${idx.proyectos[r]?.resumen || '(no existe)'}`);
    const hijos = Object.entries(idx.proyectos).filter(([, m]) => m.deriva_de === id).map(([k]) => k);
    const base = { id, nombre: meta.nombre, estado: meta.estado, resumen: meta.resumen, deriva_de: meta.deriva_de || null, derivados: hijos, relacionados };

    if (seccion && seccion !== 'contexto') {
      if (!SECCIONES.includes(seccion)) throw new Error(`Sección inválida. Usa: ${SECCIONES.join(', ')}`);
      let texto = await readOr(this.p('proyectos', id, `${seccion}.md`), '');
      const version = hash(texto);
      if (seccion === 'changelog') texto = texto.split('\n').filter(l => l.startsWith('- ')).slice(-30).join('\n');
      return { ...base, seccion, version, texto };
    }

    const contexto = await readOr(this.p('proyectos', id, 'contexto.md'), '');
    if (tema) {
      const b = findBlock(contexto, tema);
      if (!b) throw new Error(`No existe el tema "${tema}". Temas: ${outline(contexto).map(t => t.ruta).join(' | ') || 'ninguno'}`);
      const texto = contexto.slice(b.start, b.end).trim();
      const avisos = texto.length > LIMITE_TEMA * 2 ? [`El tema mide ${texto.length} caracteres: divídelo en subtemas o compáctalo.`] : [];
      const mencionado_en = (await this.enlacesA(id, b.ruta)).map(x => `${x.desde}${x.tema ? ' › ' + x.tema : ''}`);
      return { ...base, tema: b.ruta, version: hash(b.body), texto, enlaces: parseLinks(b.body).map(l => l.proyecto + (l.ruta ? ' › ' + l.ruta : '')), mencionado_en, avisos };
    }

    const temasMeta = meta.temas || {};
    const indice = outline(contexto).map(t => {
      const m = temasMeta[norm(t.ruta)] || {};
      return `${'  '.repeat(t.nivel - 2)}- ${t.ruta} (${t.chars} c${m.actualizado ? ` · ${m.actualizado.slice(0, 10)} ${m.autor}` : ''})`;
    });
    const intro = contexto.split(/\n##\s/)[0].replace(/^#\s.*\n/, '').trim().slice(0, 600);
    const recientes = (await this.eventos({ proyecto: id, max: 5 })).map(fmtEvento);
    const avisos = contexto.length > LIMITE_CONTEXTO ? [`El contexto completo mide ${contexto.length} caracteres: compacta los temas más largos.`] : [];
    const mencionado_en = [...new Set((await this.enlacesA(id)).map(x => `${x.desde}${x.tema ? ' › ' + x.tema : ''} → ${x.hacia || id}`))];
    const sin_enlazar = (await this.sinEnlazar(id, 5)).map(x => `${x.proyecto}${x.tema ? ' › ' + x.tema : ''}: «${x.texto}»`);
    const etiquetas = [...new Set((await this.analisis()).temas.filter(t => t.proyecto === id).flatMap(t => t.tags))].map(t => '#' + t);
    const abiertos = (await this.listaPendientes({ proyecto: id })).length;
    return { ...base, intro, indice: indice.join('\n') || '(sin temas todavía: créalos con ctx_escribir)', etiquetas, pendientes_abiertos: abiertos, mencionado_en, sin_enlazar, recientes, avisos };
  }

  // Búsqueda que ubica cada resultado en su proyecto › tema › subtema.
  async buscar(q, { proyecto, max = 12 } = {}) {
    if (!q || q.length < 2) throw new Error('Búsqueda muy corta');
    const args = ['grep', '-n', '-i', '-I', '--fixed-strings', q, '--'];
    args.push(proyecto ? `proyectos/${checkId(proyecto)}` : 'proyectos', ...(proyecto ? [] : ['CONTEXTO.md']));
    let out = '';
    try { out = await this.git(...args); } catch (e) { if (e.code === 1) return []; throw e; }
    const cache = {};
    const res = [];
    for (const l of out.split('\n').filter(Boolean)) {
      if (res.length >= max) break;
      const [file, line, ...rest] = l.split(':');
      const m = file.match(/^proyectos\/([^/]+)\/(\w+)\.md$/);
      let ruta = null;
      if (m && m[2] === 'contexto') {
        cache[file] ??= await readOr(this.p(file), '');
        ruta = rutaEnLinea(cache[file], Number(line));
      }
      res.push({ proyecto: m?.[1] || null, seccion: m?.[2] || file, tema: ruta, texto: rest.join(':').trim().slice(0, 200) });
    }
    return res;
  }

  async eventos({ proyecto, desde, max = 50, excluirAutor } = {}) {
    const raw = await readOr(this.p('eventos.jsonl'), '');
    let evs = raw.split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    if (proyecto) evs = evs.filter(e => e.id === proyecto);
    if (desde) evs = evs.filter(e => e.ts > desde);
    if (excluirAutor) evs = evs.filter(e => e.autor !== excluirAutor);
    return evs.slice(-max);
  }

  // Lo que cambió desde la última vez que este lector preguntó. Avanza su marcador.
  async novedades({ lector, desde, max = 30 }) {
    const nombre = safeName(lector);
    const file = path.join(this.estadoDir, 'cursores.json');
    const cursores = JSON.parse(await readOr(file, '{}'));
    const inicio = desde || cursores[nombre] || null;
    const evs = await this.eventos({ desde: inicio, max: 500 });
    cursores[nombre] = new Date().toISOString();
    await writeJson(file, cursores);
    if (!inicio) return { primera_vez: true, texto: 'Primera visita: no hay marcador previo. Usa el índice de proyectos.', total: 0 };
    const porProyecto = {};
    for (const e of evs) (porProyecto[e.id || 'principal'] ||= []).push(e);
    const lineas = [];
    for (const [id, lista] of Object.entries(porProyecto)) {
      lineas.push(`${id}: ${lista.length} cambio(s)`);
      for (const e of lista.slice(-4)) lineas.push(`  - ${fmtEvento(e)}`);
    }
    return { desde: inicio, total: evs.length, texto: lineas.slice(0, max).join('\n') || 'Sin cambios.' };
  }

  async historial({ proyecto, limite = 30 } = {}) {
    const args = ['log', `-n${limite}`, '--date=iso-strict', '--pretty=format:%h%x1f%an%x1f%ad%x1f%s'];
    if (proyecto) args.push('--', `proyectos/${checkId(proyecto)}`);
    const out = await this.git(...args).catch(() => '');
    return out.split('\n').filter(Boolean).map(l => { const [sha, autor, fecha, mensaje] = l.split('\x1f'); return { sha, autor, fecha, mensaje }; });
  }

  // Datos para el grafo: proyectos, temas, relaciones, derivaciones y temas compartidos.
  async grafo() {
    const { idx, temas } = await this.analisis();
    const nodes = [], links = [], porTitulo = {}, ids = new Set();
    const t0 = id => idx.proyectos[id]?.creado;
    for (const [id, m] of Object.entries(idx.proyectos)) {
      nodes.push({ id, tipo: 'proyecto', nombre: m.nombre, estado: m.estado, resumen: m.resumen, t: m.creado });
      ids.add(id);
      if (m.deriva_de && idx.proyectos[m.deriva_de]) links.push({ source: m.deriva_de, target: id, tipo: 'deriva' });
      for (const r of m.relacionados || []) if (id < r) links.push({ source: id, target: r, tipo: 'relacion' });
    }
    for (const t of temas) {
      if (!t.ruta) continue;
      const nid = `${t.proyecto}#${t.ruta}`;
      const parent = t.nivel === 2 ? t.proyecto : `${t.proyecto}#${t.ruta.split('/')[0]}`;
      nodes.push({ id: nid, tipo: t.nivel === 2 ? 'tema' : 'subtema', nombre: t.titulo, proyecto: t.proyecto, ruta: t.ruta, chars: t.texto.length, t: t.creado || t0(t.proyecto) });
      ids.add(nid);
      links.push({ source: parent, target: nid, tipo: 'contiene' });
      (porTitulo[norm(t.titulo)] ||= []).push(nid);
    }
    const resolver = l => {
      if (!l.ruta) return ids.has(l.proyecto) ? l.proyecto : null;
      const exacto = [...ids].find(x => x.includes('#') && x.split('#')[0] === l.proyecto && norm(x.split('#')[1]) === norm(l.ruta));
      return exacto || (ids.has(l.proyecto) ? l.proyecto : null);
    };
    const etiquetas = {};
    for (const t of temas) {
      const origen = t.ruta ? `${t.proyecto}#${t.ruta}` : t.proyecto;
      for (const l of t.links) { const dest = resolver(l); if (dest && dest !== origen) links.push({ source: origen, target: dest, tipo: 'enlace' }); }
      for (const tag of t.tags) { (etiquetas[tag] ||= new Set()).add(origen); }
    }
    for (const [tag, set] of Object.entries(etiquetas)) {
      nodes.push({ id: `tag:${tag}`, tipo: 'etiqueta', nombre: `#${tag}` });
      for (const o of set) links.push({ source: o, target: `tag:${tag}`, tipo: 'etiqueta' });
    }
    for (const lista of Object.values(porTitulo)) {
      const distintos = lista.filter((v, i, a) => a.findIndex(x => x.split('#')[0] === v.split('#')[0]) === i);
      for (let i = 1; i < distintos.length; i++) links.push({ source: distintos[0], target: distintos[i], tipo: 'compartido' });
    }
    // Las etiquetas nacen con el primer nodo que las usa.
    const tiempo = Object.fromEntries(nodes.map(n => [n.id, n.t]));
    for (const n of nodes) if (n.tipo === 'etiqueta') n.t = links.filter(l => l.target === n.id).map(l => tiempo[l.source]).filter(Boolean).sort()[0];
    return { nodes, links };
  }

  // --- Análisis (estilo Obsidian): enlaces [[...]], etiquetas #..., pendientes con propiedades ---------------

  async analisis() {
    if (this._analisis) return this._analisis;
    const idx = await this.index();
    const evs = await this.eventos({ max: 100000 });
    const nacio = {};
    for (const e of evs) if (e.id && e.tema) { const k = `${e.id}#${norm(e.tema)}`; nacio[k] ||= e.ts; const raiz = `${e.id}#${norm(e.tema.split('/')[0])}`; nacio[raiz] ||= e.ts; }
    const temas = [], pendientes = [];
    for (const [id, m] of Object.entries(idx.proyectos)) {
      const ctx = await readOr(this.p('proyectos', id, 'contexto.md'), '');
      const heads = headings(ctx);
      const intro = heads.length ? ctx.slice(0, heads[0].start) : ctx;
      temas.push({ proyecto: id, ruta: null, titulo: m.nombre, nivel: 1, texto: intro, links: parseLinks(intro), tags: parseTags(intro) });
      heads.forEach((h, i) => {
        // Texto propio del bloque (sin sus subtemas) para no duplicar enlaces y etiquetas.
        let end = ctx.length;
        for (let j = i + 1; j < heads.length; j++) { end = heads[j].start; break; }
        const texto = ctx.slice(h.bodyStart, end);
        temas.push({ proyecto: id, ruta: h.ruta, titulo: h.titulo, nivel: h.nivel, texto, links: parseLinks(texto), tags: parseTags(texto), creado: nacio[`${id}#${norm(h.ruta)}`] || m.creado });
      });
      for (const sec of ['pendientes', 'decisiones']) {
        const t = await readOr(this.p('proyectos', id, `${sec}.md`), '');
        temas.push({ proyecto: id, ruta: null, seccion: sec, titulo: sec, nivel: 1, texto: t, links: parseLinks(t), tags: parseTags(t) });
      }
      const pend = await readOr(this.p('proyectos', id, 'pendientes.md'), '');
      pend.split('\n').forEach((l, n) => { const p = parsePendiente(l); if (p) pendientes.push({ proyecto: id, linea: n + 1, ...p }); });
    }
    this._analisis = { idx, temas, pendientes };
    return this._analisis;
  }

  // Quién enlaza a este proyecto (o a uno de sus temas).
  async enlacesA(id, ruta) {
    const { temas } = await this.analisis();
    const out = [];
    for (const t of temas) for (const l of t.links) {
      if (l.proyecto !== id) continue;
      if (ruta && !(l.ruta && (norm(l.ruta) === norm(ruta) || norm(l.ruta).startsWith(norm(ruta) + '/')))) continue;
      if (t.proyecto === id && !ruta) continue;
      out.push({ desde: t.proyecto, tema: t.ruta || t.seccion || null, hacia: l.ruta || null });
    }
    return out;
  }

  // Textos de otros proyectos que nombran a este sin enlazarlo.
  async sinEnlazar(id, max = 8) {
    const { idx, temas } = await this.analisis();
    const m = idx.proyectos[id];
    if (!m) return [];
    const nombres = [...new Set([m.nombre, id].filter(x => x && x.length >= 4))];
    const out = [];
    for (const t of temas) {
      if (t.proyecto === id || t.links.some(l => l.proyecto === id)) continue;
      const limpio = t.texto.replace(/\[\[[^\]]*\]\]/g, '');
      for (const n of nombres) {
        const i = limpio.toLowerCase().indexOf(n.toLowerCase());
        if (i < 0) continue;
        out.push({ proyecto: t.proyecto, tema: t.ruta || t.seccion || null, menciona: n, texto: oneLine(limpio.slice(Math.max(0, i - 60), i + n.length + 60)) });
        break;
      }
      if (out.length >= max) break;
    }
    return out;
  }

  async etiquetas() {
    const { temas } = await this.analisis();
    const mapa = {};
    for (const t of temas) for (const tag of t.tags) (mapa[tag] ||= []).push(`${t.proyecto}${t.ruta ? ' › ' + t.ruta : t.seccion ? ' › ' + t.seccion : ''}`);
    return Object.entries(mapa).sort((a, b) => b[1].length - a[1].length).map(([tag, donde]) => ({ tag, total: donde.length, donde: [...new Set(donde)] }));
  }

  async listaPendientes({ proyecto, responsable, estado = 'abiertos', vencidos, etiqueta } = {}) {
    const { pendientes } = await this.analisis();
    const hoy = new Date().toISOString().slice(0, 10);
    return pendientes.filter(p =>
      (!proyecto || p.proyecto === proyecto) &&
      (!responsable || p.responsable === safeName(responsable).toLowerCase()) &&
      (estado === 'todos' || (estado === 'cerrados' ? p.hecho : !p.hecho)) &&
      (!vencidos || (p.vence && p.vence < hoy && !p.hecho)) &&
      (!etiqueta || p.tags.includes(etiqueta.replace(/^#/, '').toLowerCase())));
  }

  pendiente({ id, accion, texto, responsable, vence, etiquetas = [], autor }) {
    return this.serial(async () => {
      const idx = await this.index();
      getMeta(idx, id);
      const file = this.p('proyectos', id, 'pendientes.md');
      let doc = await readOr(file, '# Pendientes\n\n');
      let nota;
      if (accion === 'agregar') {
        if (vence && !/^\d{4}-\d{2}-\d{2}$/.test(vence)) throw new Error('vence debe ser AAAA-MM-DD');
        const linea = `- [ ] ${oneLine(texto)}${responsable ? ` @${safeName(responsable).toLowerCase()}` : ''}${vence ? ` vence:${vence}` : ''}${etiquetas.map(t => ' #' + t.replace(/^#/, '')).join('')}`;
        doc = doc.replace(/\s*$/, '\n') + linea + '\n';
        nota = `Pendiente: ${oneLine(texto)}`;
      } else {
        const lineas = doc.split('\n');
        const objetivo = norm(texto);
        const i = lineas.findIndex(l => /^\s*- \[[ xX]\]/.test(l) && norm(l).includes(objetivo));
        if (i < 0) throw new Error(`No encontré un pendiente que contenga "${texto}"`);
        lineas[i] = accion === 'completar'
          ? lineas[i].replace(/- \[ \]/, '- [x]') + (/ hecho:\d/.test(lineas[i]) ? '' : ` hecho:${new Date().toISOString().slice(0, 10)}`)
          : lineas[i].replace(/- \[[xX]\]/, '- [ ]').replace(/ hecho:\S+/, '');
        doc = lineas.join('\n');
        nota = `${accion === 'completar' ? 'Completa' : 'Reabre'}: ${oneLine(lineas[i].replace(/^\s*- \[.\]\s*/, '')).slice(0, 80)}`;
      }
      await fs.writeFile(file, doc);
      idx.proyectos[id].actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar({ id, seccion: 'pendientes', autor, nota });
      await this.commit(autor, `[${id}] pendientes: ${nota.slice(0, 60)}`);
      return { ok: true, nota };
    });
  }

  // Bitácora: resumen por día de lo que cambió, quién y dónde.
  async bitacora({ dias = 7, dia } = {}) {
    const evs = await this.eventos({ max: 100000 });
    const porDia = {};
    for (const e of evs) { const d = e.ts.slice(0, 10); if (dia && d !== dia) continue; (porDia[d] ||= []).push(e); }
    return Object.keys(porDia).sort().reverse().slice(0, dia ? 1 : dias).map(d => {
      const lista = porDia[d];
      const proyectos = {};
      for (const e of lista) (proyectos[e.id || 'principal'] ||= []).push(e);
      return { dia: d, total: lista.length, autores: [...new Set(lista.map(e => e.autor))], proyectos: Object.fromEntries(Object.entries(proyectos).map(([k, v]) => [k, { total: v.length, temas: [...new Set(v.map(e => e.tema).filter(Boolean))], notas: v.slice(-5).map(e => `${e.autor}: ${e.nota}`) }])) };
    });
  }

  // Versiones anteriores de un tema a partir del historial de git.
  async historialTema(id, ruta, { sha } = {}) {
    checkId(id);
    const file = `proyectos/${id}/contexto.md`;
    if (sha) {
      if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new Error('sha inválido');
      const doc = await this.git('show', `${sha}:${file}`).catch(() => '');
      const b = findBlock(doc, ruta);
      return { sha, texto: b ? doc.slice(b.start, b.end).trim() : '(el tema no existía en esa versión)' };
    }
    const out = await this.git('log', '-n200', '--format=%h%x1f%an%x1f%aI%x1f%s', '--', file).catch(() => '');
    const objetivo = norm(ruta);
    return out.split('\n').filter(Boolean).map(l => { const [h, autor, fecha, msg] = l.split('\x1f'); return { sha: h, autor, fecha, mensaje: msg }; })
      .filter(c => { const m = c.mensaje.match(/^\[[^\]]+\]\s+(.+?):\s/); return m && (norm(m[1]) === objetivo || norm(m[1]).startsWith(objetivo + '/') || objetivo.startsWith(norm(m[1]) + '/')); })
      .slice(0, 20);
  }

  // Lista plana para el buscador rápido (Cmd+K).
  async buscable() {
    const { idx, temas } = await this.analisis();
    return temas.filter(t => !t.seccion).map(t => ({ p: t.proyecto, r: t.ruta, n: t.ruta ? t.titulo : idx.proyectos[t.proyecto]?.nombre, x: oneLine(t.texto.replace(/[#*`>\[\]]/g, ' ')).slice(0, 240) }));
  }

  // --- Escritura ---------------------------------------------------------------

  crearProyecto({ id, nombre, resumen, relacionados = [], deriva_de, temas = [], estado = 'activo', autor }) {
    return this.serial(async () => {
      checkId(id);
      const idx = await this.index();
      if (idx.proyectos[id]) throw new Error(`Ya existe "${id}"`);
      if (deriva_de && !idx.proyectos[deriva_de]) throw new Error(`deriva_de: no existe "${deriva_de}"`);
      const ahora = now();
      idx.proyectos[id] = { nombre, resumen: oneLine(resumen), estado, relacionados: [], deriva_de: deriva_de || undefined, temas: {}, creado: ahora, actualizado: ahora };
      await fs.mkdir(this.p('proyectos', id), { recursive: true });
      const cuerpoTemas = temas.map(t => `## ${oneLine(t)}\n\n`).join('');
      await fs.writeFile(this.p('proyectos', id, 'contexto.md'), `# ${nombre}\n\n${resumen}\n\n${cuerpoTemas}`);
      await fs.writeFile(this.p('proyectos', id, 'pendientes.md'), `# Pendientes\n\n`);
      await fs.writeFile(this.p('proyectos', id, 'decisiones.md'), `# Decisiones\n\n`);
      await fs.writeFile(this.p('proyectos', id, 'changelog.md'), `# Changelog\n\n`);
      setRelaciones(idx, id, relacionados);
      await writeJson(this.p('index.json'), idx);
      await this.anotar({ id, autor, nota: `Proyecto creado: ${nombre}${deriva_de ? ` (deriva de ${deriva_de})` : ''}` });
      await this.commit(autor, `[${id}] crea proyecto`);
      return { ok: true, id };
    });
  }

  // Escribe un tema o subtema ("Tema" o "Tema/Subtema"). Lo crea si no existe.
  escribirTema({ id, tema, contenido, modo = 'agregar', version, nota, autor }) {
    return this.serial(async () => {
      const idx = await this.index();
      const meta = getMeta(idx, id);
      const partes = tema.split('/').map(oneLine).filter(Boolean);
      if (!partes.length || partes.length > 2) throw new Error('tema debe ser "Tema" o "Tema/Subtema"');
      const file = this.p('proyectos', id, 'contexto.md');
      let doc = await readOr(file, `# ${meta.nombre}\n\n`);
      const cuerpo = contenido.trim();

      let b = findBlock(doc, partes.join('/'));
      if (!b) {
        // Crear tema padre si falta, luego el subtema al final del padre.
        let padre = findBlock(doc, partes[0]);
        if (!padre) {
          doc = doc.replace(/\s*$/, '\n\n') + `## ${partes[0]}\n\n` + (partes.length === 1 ? `${cuerpo}\n` : '');
          if (partes.length === 1) return this._guardarTema({ idx, id, file, doc, ruta: partes[0], nota: nota || `Crea tema ${partes[0]}`, autor });
          padre = findBlock(doc, partes[0]);
        }
        const ins = doc.slice(0, padre.end).replace(/\s*$/, '\n\n') + `### ${partes[1]}\n\n${cuerpo}\n\n` + doc.slice(padre.end).replace(/^\s*/, '');
        return this._guardarTema({ idx, id, file, doc: ins, ruta: partes.join('/'), nota: nota || `Crea subtema ${partes.join('/')}`, autor });
      }
      if (modo === 'reemplazar' && version && version !== hash(b.body)) {
        throw new Error(`CONFLICTO: "${b.ruta}" cambió desde que lo leíste (versión ${version} ≠ ${hash(b.body)}). Vuelve a leerlo y fusiona.`);
      }
      // En un tema con subtemas, "reemplazar" solo toca la introducción, nunca borra los subtemas.
      const limite = b.nivel === 2 && b.introEnd ? b.introEnd : b.end;
      const actual = doc.slice(b.bodyStart, limite);
      const nuevo = modo === 'agregar' ? actual.replace(/\s*$/, '\n\n') + cuerpo + '\n\n' : '\n' + cuerpo + '\n\n';
      const out = doc.slice(0, b.bodyStart) + nuevo + doc.slice(limite).replace(/^\s*/, '');
      return this._guardarTema({ idx, id, file, doc: out, ruta: b.ruta, nota: nota || `${modo === 'agregar' ? 'Agrega a' : 'Reescribe'} ${b.ruta}`, autor });
    });
  }

  async _guardarTema({ idx, id, file, doc, ruta, nota, autor }) {
    doc = doc.replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
    await fs.writeFile(file, doc);
    const ahora = now();
    const m = idx.proyectos[id];
    m.temas ||= {};
    m.temas[norm(ruta)] = { actualizado: ahora, autor: safeName(autor) };
    m.actualizado = ahora;
    await writeJson(this.p('index.json'), idx);
    await this.anotar({ id, tema: ruta, autor, nota });
    await this.commit(autor, `[${id}] ${ruta}: ${oneLine(nota).slice(0, 60)}`);
    const b = findBlock(doc, ruta);
    const avisos = b && b.body.length > LIMITE_TEMA ? [`"${ruta}" mide ${b.body.length} caracteres: compáctalo o divídelo en subtemas.`] : [];
    return { ok: true, tema: ruta, version: b ? hash(b.body) : null, avisos };
  }

  actualizar({ id, seccion, contenido, modo = 'agregar', version, autor, nota }) {
    return this.serial(async () => {
      if (!['pendientes', 'decisiones', 'contexto'].includes(seccion)) throw new Error('Secciones editables: pendientes, decisiones (y contexto completo solo para reorganizarlo). Para temas usa ctx_escribir.');
      const idx = await this.index();
      getMeta(idx, id);
      const file = this.p('proyectos', id, `${seccion}.md`);
      const actual = await readOr(file, '');
      if (modo === 'reemplazar' && version && version !== hash(actual)) throw new Error(`CONFLICTO: ${id}/${seccion} cambió desde que lo leíste. Vuelve a leerlo.`);
      const nuevo = modo === 'agregar' ? actual.replace(/\s*$/, '\n') + contenido.trim() + '\n' : contenido.trim() + '\n';
      await fs.writeFile(file, nuevo);
      idx.proyectos[id].actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar({ id, seccion, autor, nota: nota || `${modo === 'agregar' ? 'Agrega a' : 'Actualiza'} ${seccion}` });
      await this.commit(autor, `[${id}] ${seccion}: ${oneLine(nota || modo).slice(0, 60)}`);
      return { ok: true, version: hash(nuevo) };
    });
  }

  meta({ id, nombre, resumen, estado, relacionados, deriva_de, autor }) {
    return this.serial(async () => {
      const idx = await this.index();
      const m = getMeta(idx, id);
      if (nombre) m.nombre = nombre;
      if (resumen) m.resumen = oneLine(resumen);
      if (estado) m.estado = estado;
      if (deriva_de !== undefined) {
        if (deriva_de && (!idx.proyectos[deriva_de] || deriva_de === id)) throw new Error(`deriva_de inválido: ${deriva_de}`);
        m.deriva_de = deriva_de || undefined;
      }
      if (relacionados) setRelaciones(idx, id, relacionados);
      m.actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar({ id, autor, nota: 'Actualiza ficha' });
      await this.commit(autor, `[${id}] ficha`);
      return { ok: true, ficha: m };
    });
  }

  registrar({ id, evento, tema, autor }) {
    return this.serial(async () => {
      const idx = await this.index();
      getMeta(idx, id);
      idx.proyectos[id].actualizado = now();
      await writeJson(this.p('index.json'), idx);
      await this.anotar({ id, tema, autor, nota: evento });
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
      await this.anotar({ autor, nota: `CONTEXTO.md: ${nota || 'actualizado'}` });
      await this.commit(autor, `[principal] ${oneLine(nota || 'actualiza').slice(0, 60)}`);
      return { ok: true, version: hash(contenido.trim() + '\n') };
    });
  }

  async versionPrincipal() { return hash(await fs.readFile(this.p('CONTEXTO.md'), 'utf8')); }

  // --- Internos -------------------------------------------------------------

  async anotar({ id, tema, seccion, autor, nota }) {
    const ts = new Date().toISOString();
    const quien = safeName(autor);
    const texto = oneLine(nota);
    const ev = { ts, autor: quien, id: id || null, tema: tema || null, seccion: seccion || (tema ? 'contexto' : null), nota: texto };
    await fs.appendFile(this.p('eventos.jsonl'), JSON.stringify(ev) + '\n');
    if (id) await fs.appendFile(this.p('proyectos', id, 'changelog.md'), `- ${ts} · ${quien} · ${tema ? `[${tema}] ` : ''}${texto}\n`);
    await fs.appendFile(this.p('changelog.md'), `- ${ts} · ${quien} · ${id ? `[${id}${tema ? ' › ' + tema : ''}] ` : ''}${texto}\n`);
  }

  async commit(autor = 'desconocido', mensaje) {
    this._analisis = null;
    await this.git('add', '-A');
    const status = await this.git('status', '--porcelain');
    if (!status.trim()) return;
    const quien = safeName(autor);
    await this.git('-c', `user.name=${quien}`, '-c', `user.email=${quien}@control.local`, 'commit', '-q', '-m', mensaje);
    this.schedulePush();
  }

  schedulePush() {
    if (!this.push) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.sync().catch(e => this.log.error('push falló:', e.message)), 3000);
  }

  async sync() {
    if (!this.push) return;
    return this.serial(async () => {
      try { await this.git('pull', '--rebase', '-q', 'origin', 'main'); } catch (e) { this.log.error('pull:', (e.stderr || e.message).slice(0, 200)); }
      await this.git('push', '-q', 'origin', 'HEAD:main');
    });
  }
}

// --- Enlaces, etiquetas y pendientes ---------------------------------------------------

// [[proyecto]], [[proyecto#Tema]], [[proyecto#Tema/Subtema]] (también acepta › como separador).
export function parseLinks(texto) {
  const out = [];
  for (const m of String(texto).matchAll(/\[\[([a-z0-9][a-z0-9-]{1,40})(?:\s*(?:#|›)\s*([^\]|]+?))?(?:\|[^\]]*)?\]\]/g)) out.push({ proyecto: m[1], ruta: m[2] ? m[2].trim() : null });
  return out;
}
export function parseTags(texto) {
  const limpio = String(texto).replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '').replace(/\[\[[^\]]*\]\]/g, '').replace(/https?:\/\/\S+/g, '');
  const out = new Set();
  for (const m of limpio.matchAll(/(?:^|[\s(])#([a-záéíóúñü][\wáéíóúñü-]{2,30})/gim)) out.add(m[1].toLowerCase());
  return [...out];
}
// - [ ] texto @responsable vence:AAAA-MM-DD #etiqueta   (- [x] ... hecho:AAAA-MM-DD)
export function parsePendiente(linea) {
  const m = linea.match(/^\s*- \[([ xX])\]\s+(.+)$/);
  if (!m) return null;
  const cuerpo = m[2];
  return {
    hecho: m[1] !== ' ',
    texto: oneLine(cuerpo.replace(/\s@[\w.-]+/g, '').replace(/\svence:\S+/g, '').replace(/\shecho:\S+/g, '').replace(/\s#[\wáéíóúñü-]+/gi, '')),
    responsable: (cuerpo.match(/(?:^|\s)@([\w.-]+)/) || [])[1]?.toLowerCase() || null,
    vence: (cuerpo.match(/vence:(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
    cerrado: (cuerpo.match(/hecho:(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
    tags: parseTags(cuerpo),
  };
}

// --- Markdown: temas y subtemas ---------------------------------------------------

// Devuelve los encabezados ## y ### (fuera de bloques de código) con su ruta y tamaño.
export function outline(doc) {
  const heads = headings(doc);
  return heads.map((h, i) => {
    const end = nextEnd(heads, i, doc.length);
    return { ruta: h.ruta, titulo: h.titulo, nivel: h.nivel, chars: end - h.bodyStart };
  });
}

export function headings(doc) {
  const out = [];
  let pos = 0, fence = false, tema = null;
  for (const line of doc.split('\n')) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence && line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (m) {
      const nivel = m[1].length, titulo = m[2].trim();
      if (nivel === 2) tema = titulo;
      const ruta = nivel === 2 ? titulo : `${tema || '(sin tema)'}/${titulo}`;
      out.push({ nivel, titulo, ruta, start: pos, bodyStart: pos + line.length + 1 });
    }
    pos += line.length + 1;
  }
  return out;
}

function nextEnd(heads, i, len) {
  for (let j = i + 1; j < heads.length; j++) if (heads[j].nivel <= heads[i].nivel) return heads[j].start;
  return len;
}

export function findBlock(doc, ruta) {
  const heads = headings(doc);
  const objetivo = norm(ruta);
  const i = heads.findIndex(h => norm(h.ruta) === objetivo);
  if (i < 0) return null;
  const h = heads[i];
  const end = Math.min(nextEnd(heads, i, doc.length), doc.length);
  const firstChild = heads.slice(i + 1).find(x => x.start < end && x.nivel > h.nivel);
  return { ...h, end, introEnd: firstChild ? firstChild.start : null, body: doc.slice(h.bodyStart, end) };
}

function rutaEnLinea(doc, linea) {
  let ruta = null, n = 0, tema = null, fence = false;
  for (const line of doc.split('\n')) {
    n++;
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence && line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (m) { if (m[1].length === 2) { tema = m[2].trim(); ruta = tema; } else ruta = `${tema}/${m[2].trim()}`; }
    if (n === linea) return ruta;
  }
  return ruta;
}

function setRelaciones(idx, id, relacionados) {
  const limpios = [...new Set(relacionados.map(String).filter(r => r !== id))];
  for (const r of limpios) if (!idx.proyectos[r]) throw new Error(`Relación con proyecto inexistente: ${r}`);
  const antes = idx.proyectos[id].relacionados || [];
  for (const r of antes) if (!limpios.includes(r) && idx.proyectos[r]) idx.proyectos[r].relacionados = (idx.proyectos[r].relacionados || []).filter(x => x !== id);
  for (const r of limpios) { const rel = idx.proyectos[r].relacionados ||= []; if (!rel.includes(id)) rel.push(id); }
  idx.proyectos[id].relacionados = limpios;
}

function getMeta(idx, id) {
  checkId(id);
  const m = idx.proyectos[id];
  if (!m) throw new Error(`No existe el proyecto "${id}". Proyectos: ${Object.keys(idx.proyectos).join(', ') || 'ninguno'}`);
  return m;
}

const fmtEvento = e => `${e.ts.slice(0, 16).replace('T', ' ')} ${e.autor}${e.tema ? ` [${e.tema}]` : e.seccion ? ` [${e.seccion}]` : ''}: ${e.nota}`;
const checkId = id => { if (!ID_RE.test(id || '')) throw new Error(`id inválido "${id}": usa minúsculas, números y guiones`); return id; };
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const now = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const oneLine = s => String(s || '').replace(/\s+/g, ' ').trim();
const norm = s => oneLine(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*\/\s*/g, '/');
const safeName = s => oneLine(s).replace(/[^\w.@-]/g, '-').slice(0, 60) || 'desconocido';
const exists = f => fs.access(f).then(() => true, () => false);
const readOr = (f, d) => fs.readFile(f, 'utf8').catch(() => d);
const writeJson = (f, o) => fs.writeFile(f, JSON.stringify(o, null, 2) + '\n');

export const PROTOCOLO = `Protocolo v3 (toda IA conectada):
1. Inicio: ctx_inicio con tu lector (ej. "claude-omar") una vez. Trae el contexto principal, los proyectos en una línea y las novedades desde tu última visita. No releas lo que no cambió.
2. Lectura mínima: ctx_proyecto(id) da el índice de temas; abre solo el tema o subtema necesario con ctx_proyecto(id, tema). Los relacionados vienen en una línea; ábrelos solo si la tarea lo exige.
3. Captura: si la conversación produce algo relevante (decisión, dato, avance, problema) sobre un proyecto, escríbelo con ctx_escribir en el tema/subtema que corresponda. Si no existe el tema, créalo. Una idea por subtema, en resumen.
4. Proyecto nuevo: si surge algo sustancial que no encaja en ningún proyecto, propón al usuario crear uno (id, nombre, resumen, relaciones, deriva_de si nace de otro) y créalo con ctx_crear_proyecto al confirmar.
5. Conecta: enlaza con [[proyecto]] o [[proyecto#Tema/Subtema]] y etiqueta con #palabra. Si ctx_proyecto muestra sin_enlazar, convierte esas menciones en enlaces.
6. Pendientes con ctx_pendiente (@responsable, vence:AAAA-MM-DD, #etiqueta); decisiones con ctx_actualizar. Para preguntas transversales (pendientes vencidos, etiquetas, bitácora, historial de un tema) usa ctx_consultar en vez de leer proyectos. Eventos breves: ctx_registrar.
7. Eficiencia: resúmenes, no transcripciones. Lo vigente en el tema; lo histórico en decisiones. Si recibes avisos de tamaño, compacta antes de terminar.
8. Conflictos: si una escritura dice CONFLICTO, vuelve a leer, fusiona y reintenta. Nunca sobrescribas a ciegas.
9. Cierre: antes de terminar una sesión con cambios, registra un resumen de una línea con ctx_registrar. Si la sesión se alargó, sugiere abrir una nueva.`;

const CONTEXTO_INICIAL = `# Contexto principal

## Quiénes
- Omar: operación y automatizaciones (admin).
- Kyle: Pure Linguistics / Pure Solutions.

## Cómo se organiza
Cada proyecto tiene: contexto (temas ## y subtemas ###), pendientes, decisiones y changelog. Los proyectos se relacionan (↔) o derivan uno de otro (⟵).

## ${PROTOCOLO.split('\n')[0]}
${PROTOCOLO.split('\n').slice(1).join('\n')}
`;
