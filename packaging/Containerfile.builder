FROM docker.io/library/debian:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        debhelper \
        devscripts \
        dpkg-dev \
        fakeroot \
        lintian \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
