#!/bin/sh
set -eu

PACKAGE_PATH=
PACKAGE_URL="${KLIPPIX_DEB_URL:-}"
PACKAGE_SHA256="${KLIPPIX_DEB_SHA256:-}"
KEEP_DOWNLOAD=0
TEMP_DIRECTORY=

usage() {
    cat <<'EOF'
Usage: sudo ./installer/install.sh [options]

Options:
  --deb PATH       Install a local Klippix .deb package.
  --url URL        Download and install a Klippix .deb package.
  --sha256 HASH    Require this SHA-256 hash for a downloaded package.
  --keep-download  Keep the downloaded package after installation.
  -h, --help       Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --deb)
            [ "$#" -ge 2 ] || { echo "--deb requires a path" >&2; exit 2; }
            PACKAGE_PATH=$2
            shift 2
            ;;
        --url)
            [ "$#" -ge 2 ] || { echo "--url requires a URL" >&2; exit 2; }
            PACKAGE_URL=$2
            shift 2
            ;;
        --sha256)
            [ "$#" -ge 2 ] || { echo "--sha256 requires a hash" >&2; exit 2; }
            PACKAGE_SHA256=$2
            shift 2
            ;;
        --keep-download)
            KEEP_DOWNLOAD=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage >&2
            exit 2
            ;;
    esac
done

if [ "$(id -u)" -ne 0 ]; then
    echo "Run the installer as root: sudo ./installer/install.sh" >&2
    exit 1
fi

if [ ! -r /etc/os-release ]; then
    echo "Cannot identify this operating system." >&2
    exit 1
fi

. /etc/os-release
case "${ID:-}:${ID_LIKE:-}" in
    debian:*|raspbian:*|ubuntu:*|armbian:*|*:debian*|*:ubuntu*) ;;
    *)
        echo "Unsupported operating system: ${PRETTY_NAME:-unknown}" >&2
        echo "Klippix requires Debian, Ubuntu, Raspberry Pi OS, or Armbian." >&2
        exit 1
        ;;
esac

command -v apt-get >/dev/null 2>&1 || {
    echo "apt-get is required." >&2
    exit 1
}
command -v dpkg >/dev/null 2>&1 || {
    echo "dpkg is required." >&2
    exit 1
}

architecture=$(dpkg --print-architecture)
case "$architecture" in
    amd64|arm64|armhf) ;;
    *)
        echo "Unsupported architecture: $architecture" >&2
        echo "Supported architectures: amd64, arm64, armhf" >&2
        exit 1
        ;;
esac

if [ -z "$PACKAGE_PATH" ] && [ -z "$PACKAGE_URL" ]; then
    script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
    for candidate in \
        "$script_directory/../artifacts/klippix_"*"_${architecture}.deb" \
        "$script_directory/klippix_"*"_${architecture}.deb"
    do
        if [ -f "$candidate" ]; then
            PACKAGE_PATH=$candidate
            break
        fi
    done
fi

if [ -n "$PACKAGE_URL" ]; then
    case "$PACKAGE_URL" in
        https://*) ;;
        *)
            echo "The package URL must use HTTPS." >&2
            exit 1
            ;;
    esac

    apt-get update
    apt-get install -y --no-install-recommends ca-certificates curl
    TEMP_DIRECTORY=$(mktemp -d)
    PACKAGE_PATH="$TEMP_DIRECTORY/klippix.deb"
    curl --fail --location --proto '=https' --tlsv1.2 \
        --retry 3 --output "$PACKAGE_PATH" "$PACKAGE_URL"

    if [ -z "$PACKAGE_SHA256" ]; then
        echo "A downloaded installer requires --sha256 or KLIPPIX_DEB_SHA256." >&2
        exit 1
    fi
    printf '%s  %s\n' "$PACKAGE_SHA256" "$PACKAGE_PATH" |
        sha256sum --check --status
fi

if [ -z "$PACKAGE_PATH" ] || [ ! -f "$PACKAGE_PATH" ]; then
    echo "No Klippix package was found." >&2
    echo "Build one with scripts/build-deb.sh or pass --deb PATH." >&2
    exit 1
fi

package_architecture=$(dpkg-deb --field "$PACKAGE_PATH" Architecture)
if [ "$package_architecture" != "$architecture" ]; then
    echo "Package architecture $package_architecture does not match $architecture." >&2
    exit 1
fi

echo "Installing Klippix and all declared dependencies..."
apt-get update
apt-get install -y "$PACKAGE_PATH"

required_packages="
nginx
nftables
login
libpam-runtime
libpam-modules
ca-certificates
git
sudo
curl
avahi-daemon
apache2-utils
openssl
iproute2
"

missing_packages=
for package in $required_packages; do
    if ! dpkg-query -W -f='${db:Status-Status}' "$package" 2>/dev/null |
        grep -qx installed
    then
        missing_packages="$missing_packages $package"
    fi
done

if [ -n "$missing_packages" ]; then
    echo "Missing runtime packages:$missing_packages" >&2
    exit 1
fi

test -x /usr/libexec/klippix/ttyd
nginx -t
systemctl is-enabled --quiet klippix-firewall.service
systemctl is-enabled --quiet klippix-terminal.service
systemctl is-active --quiet klippix-firewall.service
systemctl is-active --quiet klippix-terminal.service
systemctl is-active --quiet nginx.service
nft list table inet klippix >/dev/null
ss -H -ltn 'sport = :8020' | grep -q ':8020'

hostname_value=$(hostname)
echo
echo "Klippix installation verified."
echo "Open: http://${hostname_value}.local:8020"
echo "Web username: klippix"
echo "Initial password: /etc/klippix/initial-password"
echo "Show it with: sudo cat /etc/klippix/initial-password"
echo "Reset it with: sudo klippix-reset-password"

if [ -n "$TEMP_DIRECTORY" ] && [ "$KEEP_DOWNLOAD" -eq 0 ]; then
    find "$TEMP_DIRECTORY" -type f -delete
    rmdir "$TEMP_DIRECTORY"
fi
