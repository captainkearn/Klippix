#!/bin/sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TARGET_ARCH="${1:-}"

if [ -z "$TARGET_ARCH" ]; then
    case "$(uname -m)" in
        x86_64) TARGET_ARCH=amd64 ;;
        aarch64) TARGET_ARCH=arm64 ;;
        armv7l) TARGET_ARCH=armhf ;;
        *)
            echo "Cannot infer a supported architecture from $(uname -m)." >&2
            exit 2
            ;;
    esac
fi

case "$TARGET_ARCH" in
    amd64|arm64|armhf) ;;
    *)
        echo "Supported architectures: amd64, arm64, armhf" >&2
        exit 2
        ;;
esac

command -v podman >/dev/null 2>&1 || {
    echo "podman is required to create the clean Debian build environment." >&2
    exit 1
}

BUILDER_IMAGE=localhost/klippix-deb-builder:trixie
if ! podman image exists "$BUILDER_IMAGE"; then
    echo "Creating the reusable Debian package builder..."
    podman build \
        --file "$PROJECT_ROOT/packaging/Containerfile.builder" \
        --tag "$BUILDER_IMAGE" \
        "$PROJECT_ROOT"
fi

mkdir -p "$PROJECT_ROOT/artifacts"
find "$PROJECT_ROOT/artifacts" -maxdepth 1 -type f \
    -name "klippix_*_${TARGET_ARCH}.*" -delete
"$PROJECT_ROOT/scripts/fetch-ttyd.sh" \
    "$TARGET_ARCH" "$PROJECT_ROOT/vendor/ttyd/ttyd"

podman run --rm \
    --volume "$PROJECT_ROOT:/src:Z" \
    --workdir /src \
    "$BUILDER_IMAGE" \
    sh -ec "
        dpkg-buildpackage --build=binary --no-sign --host-arch=${TARGET_ARCH}
        lintian --fail-on error /klippix_0.1.0_${TARGET_ARCH}.changes
        cp /klippix_*_${TARGET_ARCH}.deb /src/artifacts/
        cp /klippix_*_${TARGET_ARCH}.buildinfo /src/artifacts/ 2>/dev/null || true
        cp /klippix_*_${TARGET_ARCH}.changes /src/artifacts/ 2>/dev/null || true
    "

echo "Package artifacts:"
find "$PROJECT_ROOT/artifacts" -maxdepth 1 -type f -name "klippix_*_${TARGET_ARCH}.*" -print
