#!/usr/bin/env bash
# Instalador de control.purelinguistics.com en un droplet Ubuntu 24.04 limpio.
# Uso (como root, en la consola web del droplet):
#   curl -fsSL https://raw.githubusercontent.com/kylestark-alt/control-app/main/install.sh | DATA_REPO=git@github.com:kylestark-alt/control-contexto.git bash
# Se puede correr varias veces: retoma donde se quedó.
set -euo pipefail

DOMAIN="${DOMAIN:-control.purelinguistics.com}"
APP_REPO="${APP_REPO:-https://github.com/kylestark-alt/control-app.git}"
DATA_REPO="${DATA_REPO:-git@github.com:kylestark-alt/control-contexto.git}"
APP_DIR=/opt/control/app
DATA_DIR=/var/lib/control/data
ENV_FILE=/etc/control.env
U=control

say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Corre como root"; exit 1; }

say "Swap de 1 GB (el droplet tiene 512 MB)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "Paquetes base, Node 22 y Caddy (HTTPS automático)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ufw debian-keyring debian-archive-keyring apt-transport-https gnupg unattended-upgrades >/dev/null
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
if ! command -v caddy >/dev/null; then
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq && apt-get install -y -qq caddy >/dev/null
fi

say "Firewall: solo SSH y web"
ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw --force enable >/dev/null

say "Usuario de servicio y llave para GitHub"
id $U >/dev/null 2>&1 || useradd --system --create-home --home-dir /home/$U --shell /usr/sbin/nologin $U
install -d -o $U -g $U -m 700 /home/$U/.ssh
[ -f /home/$U/.ssh/id_ed25519 ] || sudo -u $U ssh-keygen -q -t ed25519 -N '' -C "control@$DOMAIN" -f /home/$U/.ssh/id_ed25519
sudo -u $U sh -c 'ssh-keyscan -t ed25519 github.com > ~/.ssh/known_hosts 2>/dev/null'

if ! sudo -u $U git ls-remote "$DATA_REPO" >/dev/null 2>&1; then
  echo
  echo "────────────────────────────────────────────────────────────"
  echo " FALTA UN PASO: agrega esta llave como Deploy key CON escritura"
  echo " GitHub → repo control-contexto → Settings → Deploy keys → Add"
  echo " Marca 'Allow write access'."
  echo
  cat /home/$U/.ssh/id_ed25519.pub
  echo "────────────────────────────────────────────────────────────"
  echo " Luego vuelve a correr este mismo comando."
  exit 2
fi

say "Código de la aplicación"
install -d -o $U -g $U /opt/control /var/lib/control
if [ -d $APP_DIR/.git ]; then sudo -u $U git -C $APP_DIR pull -q --ff-only; else sudo -u $U git clone -q "$APP_REPO" $APP_DIR; fi
(cd $APP_DIR && sudo -u $U npm ci --omit=dev --no-audit --no-fund --silent)

say "Repositorio de contexto"
if [ ! -d $DATA_DIR/.git ]; then
  sudo -u $U git clone -q "$DATA_REPO" $DATA_DIR 2>/dev/null || true
  sudo -u $U git -C $DATA_DIR checkout -q -B main 2>/dev/null || true
fi

say "Tokens (se generan una sola vez)"
if [ ! -f $ENV_FILE ]; then
  tok() { head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40; }
  cat > $ENV_FILE <<EOF
DATA_DIR=$DATA_DIR
PUBLIC_URL=https://$DOMAIN
PORT=8787
MCP_TOKEN=$(tok)
API_TOKEN=$(tok)
READ_TOKEN=$(tok)
WEB_PASSWORD=$(tok | head -c 20)
EOF
fi
chown root:$U $ENV_FILE; chmod 640 $ENV_FILE

say "Servicio"
cat > /etc/systemd/system/control.service <<EOF
[Unit]
Description=control ($DOMAIN)
After=network-online.target
[Service]
User=$U
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node --max-old-space-size=200 server.js
Restart=always
RestartSec=3
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/control /home/$U
PrivateTmp=true
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
  encode gzip
  reverse_proxy 127.0.0.1:8787
  header -Server
}
EOF
systemctl daemon-reload
systemctl enable -q --now control
systemctl restart control
systemctl reload caddy || systemctl restart caddy

say "Comando de ayuda: control"
cat > /usr/local/bin/control <<'EOF'
#!/usr/bin/env bash
set -e
. /etc/control.env
case "${1:-}" in
  llaves)
    echo "Biblioteca:     $PUBLIC_URL   (usuario: control  contraseña: $WEB_PASSWORD)"
    echo "MCP (IAs):      $PUBLIC_URL/mcp/$MCP_TOKEN"
    echo "Solo lectura:   $PUBLIC_URL/t/$READ_TOKEN"
    echo "API:            $PUBLIC_URL/api   Authorization: Bearer $API_TOKEN" ;;
  actualizar)
    sudo -u control git -C /opt/control/app pull --ff-only
    (cd /opt/control/app && sudo -u control npm ci --omit=dev --no-audit --no-fund --silent)
    systemctl restart control && echo "Actualizado." ;;
  rotar)
    t=$(head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40)
    k=${2:?Uso: control rotar MCP_TOKEN|API_TOKEN|READ_TOKEN|WEB_PASSWORD}
    sed -i "s/^$k=.*/$k=$t/" /etc/control.env && systemctl restart control && echo "$k rotado." ;;
  logs) journalctl -u control -n 80 --no-pager ;;
  *) systemctl --no-pager status control | head -5; echo; echo "Uso: control llaves | actualizar | rotar <TOKEN> | logs" ;;
esac
EOF
chmod 755 /usr/local/bin/control

sleep 3
if curl -fsS http://127.0.0.1:8787/salud >/dev/null; then
  say "Listo. Datos de conexión:"
  control llaves
  echo
  echo "El certificado HTTPS se emite solo en cuanto el DNS de $DOMAIN apunte a este servidor."
else
  echo "El servicio no respondió. Revisa: control logs"; exit 1
fi
