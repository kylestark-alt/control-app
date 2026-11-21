# control-app

Memoria compartida de proyectos para IAs (Claude, ChatGPT, etc.) y automatizaciones.
Los datos viven en un repo privado aparte (`control-contexto`); este repo solo tiene el código, sin secretos.

- `server.js` — MCP (`/mcp/<token>`), API REST (`/api`), lectura en texto (`/t/<token>`), biblioteca web (`/`).
- `store.js` — archivos Markdown + `index.json`, cada cambio es un commit que se empuja a GitHub.
- `web.js` — biblioteca visual.
- `install.sh` — instalador del droplet (Node, Caddy con HTTPS, systemd, llave de despliegue).

En el droplet: `control llaves`, `control actualizar`, `control rotar <TOKEN>`, `control logs`.
