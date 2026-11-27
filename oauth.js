// OAuth 2.1 para clientes MCP + sesión web, delegando la identidad en auth.interfaz.digital (Google).
// Contrato de auth: /start (PKCE S256, client público) → callback?code&state → POST /exchange → {email, provider,...}.
// control emite sus propios tokens (access 1 h, refresh rotativo 30 d) y los guarda como hash.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';

const ACCESS_TTL = 60 * 60 * 1000;
const REFRESH_TTL = 30 * 24 * 60 * 60 * 1000;
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
const PENDING_TTL = 10 * 60 * 1000;
const CODE_TTL = 2 * 60 * 1000;

const rnd = (n = 32) => crypto.randomBytes(n).toString('base64url');
const sha = s => crypto.createHash('sha256').update(s).digest('base64url');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function createAuth({ publicUrl, authUrl, allowed, admins, estadoDir, legacyMcpToken, webPassword }) {
  const file = path.join(estadoDir, 'oauth.json');
  let db = { clients: {}, access: {}, refresh: {}, sessions: {} };
  const pending = new Map();   // state → solicitud en curso (MCP o web)
  const consents = new Map();  // token → solicitud autorizada esperando "Autorizar"
  const codes = new Map();     // hash(code) → código de control para el cliente MCP
  let saveTimer = null;

  const load = async () => { try { db = { ...db, ...JSON.parse(await fs.readFile(file, 'utf8')) }; } catch { /* primera vez */ } };
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => fs.writeFile(file, JSON.stringify(db), { mode: 0o600 }).catch(e => console.error('oauth save:', e.message)), 300); };
  const prune = () => {
    const now = Date.now();
    for (const m of [pending, consents, codes]) for (const [k, v] of m) if (v.exp < now) m.delete(k);
    for (const k of ['access', 'refresh', 'sessions']) for (const [h, v] of Object.entries(db[k])) if (v.exp < now) delete db[k][h];
  };
  setInterval(() => { prune(); save(); }, 10 * 60 * 1000).unref();

  const page = (res, status, title, body) => res.status(status).type('html').set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'").send(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>body{font-family:system-ui,sans-serif;max-width:30rem;margin:4rem auto;padding:0 1rem;color:#1d1d1b;background:#f6f5f1}a.b,button{display:inline-block;font:inherit;padding:.65rem 1.2rem;margin:.3rem .5rem 0 0;border-radius:.5rem;border:1px solid #2f5d50;background:#fff;color:#2f5d50;cursor:pointer;text-decoration:none}.p{background:#2f5d50;color:#fff}code{background:#e8efe9;padding:.1rem .35rem;border-radius:.25rem}small,.m{color:#6b6a64}</style></head><body><h1>${esc(title)}</h1>${body}</body></html>`);

  // Paso 1 común: mandar a auth.interfaz.digital con PKCE propio.
  function toAuth(res, client, redirectPath, extra) {
    prune();
    const state = rnd(24), verifier = rnd(48);
    pending.set(state, { ...extra, verifier, client, redirectPath, exp: Date.now() + PENDING_TTL });
    const u = new URL('/start', authUrl);
    u.searchParams.set('client', client);
    u.searchParams.set('redirect_uri', publicUrl + redirectPath);
    u.searchParams.set('code_challenge', sha(verifier));
    u.searchParams.set('state', state);
    res.redirect(302, u.toString());
  }

  // Paso 2 común: validar state, canjear y aplicar la lista de correos.
  async function fromAuth(req, redirectPath) {
    const state = String(req.query.state || '');
    const rec = pending.get(state);
    pending.delete(state);
    if (!rec || rec.exp < Date.now() || rec.redirectPath !== redirectPath) return { error: 'Sesión expirada. Vuelve a iniciar desde tu aplicación.' };
    if (!req.query.code) return { error: 'auth.interfaz.digital no confirmó el inicio de sesión.' };
    let ident;
    try {
      const r = await fetch(new URL('/exchange', authUrl), {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client: rec.client, code: String(req.query.code), code_verifier: rec.verifier }),
        signal: AbortSignal.timeout(25000),
      });
      if (!r.ok) return { error: 'No se pudo verificar el inicio de sesión. Inténtalo de nuevo.' };
      ident = await r.json();
    } catch { return { error: 'auth.interfaz.digital no respondió. Inténtalo en un momento.' }; }
    const email = String(ident.email || '').trim().toLowerCase();
    if (ident.provider !== 'google') return { error: 'Solo se permite entrar con Google.' };
    if (!allowed.includes(email)) { console.error(`[auth] rechazado: ${email}`); return { error: `La cuenta ${email} no está autorizada en control.` }; }
    return { rec, email, name: ident.name || email };
  }

  const router = express.Router();
  router.use(express.urlencoded({ extended: false, limit: '20kb' }));

  // ---- Metadatos (RFC 9728 / RFC 8414)
  const prm = (req, res) => res.json({ resource: `${publicUrl}/mcp`, authorization_servers: [publicUrl], scopes_supported: ['control'], bearer_methods_supported: ['header'], resource_name: 'Control · memoria de proyectos' });
  router.get('/.well-known/oauth-protected-resource', prm);
  router.get('/.well-known/oauth-protected-resource/mcp', prm);
  router.get('/.well-known/oauth-authorization-server', (req, res) => res.json({
    issuer: publicUrl, authorization_endpoint: `${publicUrl}/oauth/authorize`, token_endpoint: `${publicUrl}/oauth/token`,
    registration_endpoint: `${publicUrl}/oauth/register`, revocation_endpoint: `${publicUrl}/oauth/revoke`,
    response_types_supported: ['code'], grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'], token_endpoint_auth_methods_supported: ['none'], scopes_supported: ['control'],
  }));

  // ---- Registro dinámico de clientes (RFC 7591)
  router.post('/oauth/register', express.json({ limit: '20kb' }), (req, res) => {
    const uris = Array.isArray(req.body?.redirect_uris) ? req.body.redirect_uris.map(String) : [];
    const ok = uris.length && uris.length <= 10 && uris.every(u => { try { const x = new URL(u); return x.protocol === 'https:' || (x.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(x.hostname)) || /^[a-z][a-z0-9.+-]*:$/.test(x.protocol) && !['http:', 'javascript:', 'data:', 'file:'].includes(x.protocol); } catch { return false; } });
    if (!ok) return res.status(400).json({ error: 'invalid_redirect_uri' });
    if (Object.keys(db.clients).length > 500) return res.status(429).json({ error: 'too_many_clients' });
    const client_id = 'c_' + rnd(16);
    const client_name = String(req.body.client_name || 'Cliente MCP').slice(0, 80);
    db.clients[client_id] = { redirect_uris: uris, client_name, creado: new Date().toISOString() };
    save();
    res.status(201).json({ client_id, client_name, redirect_uris: uris, grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'none', client_id_issued_at: Math.floor(Date.now() / 1000) });
  });

  // ---- Autorización para clientes MCP
  router.get('/oauth/authorize', (req, res) => {
    const q = req.query;
    const client = db.clients[q.client_id];
    if (!client) return page(res, 400, 'Cliente desconocido', '<p>Vuelve a conectar el conector desde tu aplicación.</p>');
    if (!client.redirect_uris.includes(String(q.redirect_uri))) return page(res, 400, 'Redirección no válida', '<p>La aplicación no registró esa dirección de regreso.</p>');
    const back = (err) => { const u = new URL(String(q.redirect_uri)); u.searchParams.set('error', err); if (q.state) u.searchParams.set('state', String(q.state)); return res.redirect(302, u.toString()); };
    if (q.response_type !== 'code') return back('unsupported_response_type');
    if (q.code_challenge_method !== 'S256' || !/^[A-Za-z0-9_-]{43,128}$/.test(String(q.code_challenge || ''))) return back('invalid_request');
    toAuth(res, 'pl-control', '/oauth/interfaz/callback', { mcp: { client_id: String(q.client_id), redirect_uri: String(q.redirect_uri), state: q.state ? String(q.state) : null, challenge: String(q.code_challenge) } });
  });

  router.get('/oauth/interfaz/callback', async (req, res) => {
    const r = await fromAuth(req, '/oauth/interfaz/callback');
    if (r.error) return page(res, 403, 'Acceso denegado', `<p>${esc(r.error)}</p>`);
    const token = rnd(24);
    consents.set(token, { mcp: r.rec.mcp, email: r.email, exp: Date.now() + PENDING_TTL });
    const c = db.clients[r.rec.mcp.client_id];
    let host = ''; try { host = new URL(r.rec.mcp.redirect_uri).host; } catch { /* validado antes */ }
    page(res, 200, 'Autorizar acceso a Control', `<p><b>${esc(c?.client_name || 'Una aplicación')}</b> <small>(nombre declarado por la aplicación)</small> quiere leer y escribir en la memoria de proyectos como <b>${esc(r.email)}</b>.</p><p class="m">Volverá a <code>${esc(host)}</code></p><form method="post" action="/oauth/consent"><input type="hidden" name="token" value="${esc(token)}"><button class="p" name="d" value="si">Autorizar</button><button name="d" value="no">Cancelar</button></form>`);
  });

  router.post('/oauth/consent', (req, res) => {
    const rec = consents.get(String(req.body.token || ''));
    consents.delete(String(req.body.token || ''));
    if (!rec || rec.exp < Date.now()) return page(res, 400, 'Sesión expirada', '<p>Vuelve a conectar desde tu aplicación.</p>');
    const u = new URL(rec.mcp.redirect_uri);
    if (rec.mcp.state) u.searchParams.set('state', rec.mcp.state);
    if (req.body.d !== 'si') { u.searchParams.set('error', 'access_denied'); return res.redirect(302, u.toString()); }
    const code = rnd(32);
    codes.set(sha(code), { ...rec.mcp, email: rec.email, exp: Date.now() + CODE_TTL });
    u.searchParams.set('code', code);
    res.redirect(302, u.toString());
  });

  // ---- Tokens
  function emitir(client_id, email) {
    const access = 'ca_' + rnd(32), refresh = 'cr_' + rnd(32);
    db.access[sha(access)] = { client_id, email, exp: Date.now() + ACCESS_TTL };
    db.refresh[sha(refresh)] = { client_id, email, exp: Date.now() + REFRESH_TTL };
    save();
    return { access_token: access, token_type: 'Bearer', expires_in: ACCESS_TTL / 1000, refresh_token: refresh, scope: 'control' };
  }
  router.post('/oauth/token', express.json({ limit: '20kb' }), (req, res) => {
    const b = req.body || {};
    res.set('Cache-Control', 'no-store');
    const fail = (e, s = 400) => res.status(s).json({ error: e });
    if (b.grant_type === 'authorization_code') {
      const h = sha(String(b.code || ''));
      const c = codes.get(h);
      codes.delete(h);
      if (!c || c.exp < Date.now()) return fail('invalid_grant');
      if (c.client_id !== b.client_id || c.redirect_uri !== b.redirect_uri) return fail('invalid_grant');
      if (sha(String(b.code_verifier || '')) !== c.challenge) return fail('invalid_grant');
      return res.json(emitir(c.client_id, c.email));
    }
    if (b.grant_type === 'refresh_token') {
      const h = sha(String(b.refresh_token || ''));
      const r = db.refresh[h];
      if (!r || r.exp < Date.now() || (b.client_id && b.client_id !== r.client_id)) return fail('invalid_grant');
      if (!allowed.includes(r.email)) { delete db.refresh[h]; save(); return fail('invalid_grant'); }
      delete db.refresh[h]; // rotación: cada refresh se usa una sola vez
      return res.json(emitir(r.client_id, r.email));
    }
    fail('unsupported_grant_type');
  });
  router.post('/oauth/revoke', express.json({ limit: '20kb' }), (req, res) => {
    const h = sha(String(req.body?.token || ''));
    delete db.access[h]; delete db.refresh[h]; save();
    res.status(200).end();
  });

  // Identidad de una petición MCP: token OAuth de control o, como respaldo, el token fijo.
  function mcpIdentity(req, pathToken) {
    const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
    if (pathToken !== undefined) return safeEq(pathToken, legacyMcpToken) ? { email: null, via: 'token' } : null;
    const bearer = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!bearer) return null;
    if (safeEq(bearer, legacyMcpToken)) return { email: null, via: 'token' };
    const a = db.access[sha(bearer)];
    if (!a || a.exp < Date.now() || !allowed.includes(a.email)) return null;
    return { email: a.email, via: 'oauth', admin: admins.includes(a.email) };
  }
  const challenge = res => res.status(401).set('WWW-Authenticate', `Bearer resource_metadata="${publicUrl}/.well-known/oauth-protected-resource"`).json({ error: 'unauthorized' });

  // ---- Biblioteca web
  router.get('/login', (req, res) => {
    if (req.query.ir === 'google') return toAuth(res, 'pl-control-web', '/auth/callback', { web: true });
    page(res, 200, 'Control', '<p>Memoria de proyectos de Pure Linguistics.</p><a class="b p" href="/login?ir=google">Entrar con Google</a><p><small><a href="/respaldo">Acceso de respaldo con contraseña</a></small></p>');
  });
  router.get('/auth/callback', async (req, res) => {
    const r = await fromAuth(req, '/auth/callback');
    if (r.error) return page(res, 403, 'Acceso denegado', `<p>${esc(r.error)}</p><a class="b" href="/login">Volver</a>`);
    nuevaSesion(res, r.email, 'google');
    res.redirect(302, '/');
  });
  router.get('/respaldo', (req, res) => {
    const [type, val] = (req.get('authorization') || '').split(' ');
    if (type === 'Basic') {
      const [u, ...p] = Buffer.from(val || '', 'base64').toString().split(':');
      const x = Buffer.from(p.join(':')), y = Buffer.from(webPassword);
      if (u === 'control' && x.length === y.length && crypto.timingSafeEqual(x, y)) { nuevaSesion(res, 'respaldo', 'password'); return res.redirect(302, '/'); }
    }
    res.set('WWW-Authenticate', 'Basic realm="control", charset="UTF-8"').status(401).send('Acceso restringido');
  });
  router.get('/logout', (req, res) => {
    const sid = leerCookie(req);
    if (sid) { delete db.sessions[sha(sid)]; save(); }
    res.set('Set-Cookie', 'cs=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax').redirect(302, '/login');
  });
  function nuevaSesion(res, email, via) {
    const sid = rnd(32);
    db.sessions[sha(sid)] = { email, via, exp: Date.now() + SESSION_TTL };
    save();
    res.set('Set-Cookie', `cs=${sid}; Path=/; Max-Age=${SESSION_TTL / 1000}; HttpOnly; Secure; SameSite=Lax`);
  }
  const leerCookie = req => (req.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith('cs='))?.slice(3);
  function webIdentity(req) {
    const sid = leerCookie(req);
    const s = sid && db.sessions[sha(sid)];
    if (!s || s.exp < Date.now()) return null;
    if (s.via === 'google' && !allowed.includes(s.email)) return null;
    return { email: s.email, via: s.via };
  }

  return { load, router, mcpIdentity, challenge, webIdentity };
}
