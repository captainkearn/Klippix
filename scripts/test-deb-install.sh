#!/bin/sh
set -eu

PACKAGE_PATH=${1:-/packages/klippix_0.1.0_amd64.deb}

if [ "$(id -u)" -ne 0 ]; then
    echo "This test must run as root inside a disposable Debian environment." >&2
    exit 1
fi

if [ ! -f "$PACKAGE_PATH" ]; then
    echo "Package not found: $PACKAGE_PATH" >&2
    exit 1
fi

# Containers do not run systemd. Prevent dependency packages from trying to
# launch daemons during installation; services are launched explicitly below.
printf '#!/bin/sh\nexit 101\n' >/usr/sbin/policy-rc.d
chmod 0755 /usr/sbin/policy-rc.d

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y --no-install-recommends "$PACKAGE_PATH"

dpkg --audit
apt-get check
dpkg-query -W -f='${db:Status-Status}\n' klippix | grep -qx installed

for package in \
    apache2-utils avahi-daemon ca-certificates curl git iproute2 \
    libpam-modules libpam-runtime login nftables nginx openssl sudo systemd
do
    dpkg-query -W -f='${db:Status-Status}\n' "$package" | grep -qx installed
done

test -x /usr/libexec/klippix/ttyd
test -s /usr/share/klippix/web/index.html
test -s /etc/klippix/htpasswd
test -s /etc/klippix/initial-password
test "$(stat -c %a /etc/klippix/initial-password)" = 600
test -L /etc/nginx/sites-enabled/klippix.conf

/usr/libexec/klippix/ttyd --version
nginx -t
systemd-analyze verify --man=no \
    /usr/lib/systemd/system/klippix-firewall.service \
    /usr/lib/systemd/system/klippix-terminal.service

/usr/libexec/klippix/ttyd \
    --interface 127.0.0.1 \
    --port 8021 \
    --writable \
    --base-path /terminal \
    /bin/login >/tmp/klippix-ttyd.log 2>&1 &
ttyd_pid=$!

nginx
cleanup() {
    nginx -s quit >/dev/null 2>&1 || true
    kill "$ttyd_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

password=$(cat /etc/klippix/initial-password)
test "$(curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8020/)" = 401
test "$(curl -sS -u "klippix:$password" -o /dev/null -w '%{http_code}' \
    http://127.0.0.1:8020/)" = 200
test "$(curl -sS -u "klippix:$password" -o /dev/null -w '%{http_code}' \
    http://127.0.0.1:8020/terminal/)" = 200

echo "Clean package installation and runtime checks passed."
