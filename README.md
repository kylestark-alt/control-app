# control-app

Memoria compartida de proyectos para IAs (Claude, ChatGPT, etc.) y automatizaciones.
Los datos viven en un repo privado aparte (`control-contexto`); este repo solo tiene el código, sin secretos.

- `server.js` — MCP v2 (`/mcp/<token>`): índice por temas/subtemas, novedades por lector, protocolo de captura; API REST (`/api`), lectura en texto (`/t/<token>`), biblioteca web con grafo (`/`).
- `store.js` — archivos Markdown + `index.json`, cada cambio es un commit que se empuja a GitHub.
- `web.js` — biblioteca visual.
- `install.sh` — instalador del droplet (Node, Caddy con HTTPS, systemd, llave de despliegue).

En el droplet: `control llaves`, `control actualizar`, `control rotar <TOKEN>`, `control logs`.
