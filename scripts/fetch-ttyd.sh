#!/bin/sh
set -eu

VERSION=1.7.7
DESTINATION="${2:-vendor/ttyd/ttyd}"
ARCHITECTURE="${1:-}"

case "$ARCHITECTURE" in
    amd64)
        asset=ttyd.x86_64
        checksum=8a217c968aba172e0dbf3f34447218dc015bc4d5e59bf51db2f2cd12b7be4f55
        ;;
    arm64)
        asset=ttyd.aarch64
        checksum=b38acadd89d1d396a0f5649aa52c539edbad07f4bc7348b27b4f4b7219dd4165
        ;;
    armhf)
        asset=ttyd.armhf
        checksum=8240c8438b68d3b10b0e1a4e7c914d70fca6a7606b516f40bf40adfa1044d801
        ;;
    *)
        echo "Unsupported Debian architecture: $ARCHITECTURE" >&2
        echo "Supported architectures: amd64, arm64, armhf" >&2
        exit 2
        ;;
esac

destination_directory=$(dirname "$DESTINATION")
mkdir -p "$destination_directory"
temporary_file="${DESTINATION}.download"
url="https://github.com/tsl0922/ttyd/releases/download/${VERSION}/${asset}"

echo "Downloading ttyd ${VERSION} for ${ARCHITECTURE}..."
curl --fail --location --proto '=https' --tlsv1.2 \
    --retry 3 --output "$temporary_file" "$url"

printf '%s  %s\n' "$checksum" "$temporary_file" | sha256sum --check --status
mv "$temporary_file" "$DESTINATION"
chmod 0755 "$DESTINATION"
echo "Verified $asset ($checksum)"
