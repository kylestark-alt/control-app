# control-app

Memoria compartida de proyectos para IAs (Claude, ChatGPT, etc.) y automatizaciones.
Los datos viven en un repo privado aparte (`control-contexto`); este repo solo tiene el código, sin secretos.

- `server.js` — MCP v2 (`/mcp/<token>`): índice por temas/subtemas, novedades por lector, protocolo de captura; API REST (`/api`), lectura en texto (`/t/<token>`), biblioteca web con grafo (`/`).
- `store.js` — archivos Markdown + `index.json`, cada cambio es un commit que se empuja a GitHub.
- `web.js` — biblioteca visual.
- `oauth.js` — OAuth 2.1 para clientes MCP y sesión web; la identidad la da auth.interfaz.digital (Google, clientes pl-control y pl-control-web) y se filtra por ALLOWED_EMAILS.
- `install.sh` — instalador del droplet (Node, Caddy con HTTPS, systemd, llave de despliegue).

En el droplet: `control llaves`, `control actualizar`, `control rotar <TOKEN>`, `control logs`.

## Funciones tipo Obsidian
- Enlaces `[[proyecto]]`, `[[proyecto#Tema/Subtema]]` → grafo, «Mencionado en» y menciones sin enlazar.
- Etiquetas `#palabra` transversales (nodos verdes en el grafo).
- Pendientes con propiedades: `- [ ] texto @responsable vence:AAAA-MM-DD #etiqueta`; consulta global con `ctx_consultar`.
- Bitácora diaria, historial por tema (git), buscador rápido ⌘K, grafo local por proyecto y línea de tiempo animada.
