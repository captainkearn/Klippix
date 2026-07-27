# Klippix system architecture

Klippix is installed after a Debian-family operating system is running. It does
not install Klipper components automatically. It provides an authenticated,
LAN-only browser workspace where the user follows the guide and runs KIAUH
interactively.

## Network layout

Only Nginx accepts connections from another machine:

```text
LAN browser
    |
    | TCP 8020
    v
Nginx (static GUI, LAN address ACL, authentication)
    |-- /terminal/ --> ttyd on 127.0.0.1:8021 --> /bin/login
    |-- /api/      --> klippixd on 127.0.0.1:8022
    `-- /          --> /usr/share/klippix/web
```

Neither `ttyd` nor `klippixd` may bind to a non-loopback address. Nginx permits
only loopback, RFC 1918 IPv4, IPv4 link-local, IPv6 unique-local, and IPv6
link-local source addresses. The optional nftables table repeats that boundary
at the kernel level without changing the host's default policy.

The allowed ranges are:

- `127.0.0.0/8`, `::1/128`
- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `169.254.0.0/16`
- `fc00::/7`
- `fe80::/10`

Port forwarding, a reverse tunnel, VPN routing, or a proxy located inside one
of these ranges can bypass the intended boundary. Klippix must therefore still
require authentication and must not treat the LAN allowlist as authentication.

## Runtime components

### Nginx

`nginx-light` is the public entry point on TCP 8020. It serves the compiled
React assets, applies the IP allowlist and security headers, limits uploads,
and proxies WebSocket traffic to the terminal. No other Klippix process should
be reachable from the network.

### Browser terminal

`ttyd` supplies the browser-compatible PTY and WebSocket protocol. Debian 12
and Debian 13 do not currently ship it in their standard repositories, so
Klippix bundles the pinned upstream 1.7.7 static binary after verifying the
upstream SHA-256 checksum for the target architecture. It is:

- Bound to `127.0.0.1:8021`
- Writable only because KIAUH is interactive
- Restricted to same-origin WebSocket connections
- Mounted under `/terminal`
- Configured to run `/bin/login`, so Bash access requires a real local Linux
  account and PAM authentication

The initial service deliberately does not pass client-provided command
arguments and does not start a root shell. Before release, test the login flow
on each supported distribution because PAM and `login` integration can vary.

### Klippix backend

`klippixd` will be a small Go service bound to `127.0.0.1:8022`. Its planned
responsibilities are:

- Web session login and PAM verification
- CSRF-protected API sessions
- File listing, upload, download, edit, rename and deletion
- Strict path confinement to approved directories
- Service health and version detection
- Read-only system diagnostics

Privileged changes should be isolated into narrow commands or D-Bus/systemd
operations. The web process must not run as root and must never accept arbitrary
filesystem paths from the browser.

## Runtime packages

The target package list is maintained in
`packaging/runtime-packages.txt`.

Essential service packages:

| Package | Purpose |
| --- | --- |
| `nginx-light` | Static server, reverse proxy, CIDR access control |
| Bundled `ttyd` | Browser PTY used to run `/bin/login` and KIAUH |
| `nftables` | Optional kernel-level restriction for TCP 8020 |
| `login`, `libpam-runtime` | Local-account console authentication |
| `apache2-utils` | Initial `htpasswd` creation until unified PAM login exists |
| `avahi-daemon` | Makes the host discoverable as `<hostname>.local` |
| `git`, `curl`, `ca-certificates`, `sudo` | KIAUH bootstrap and normal administration |

KIAUH, Klipper, Moonraker, Mainsail, Fluidd, Crowsnest and KlipperScreen are
not package dependencies. The user chooses and installs them interactively.

## Build packages

The build host list is maintained in `packaging/build-packages.txt`.

- Node.js and npm compile the React frontend.
- Go builds the planned `klippixd` service.
- `debhelper`, `dpkg-dev`, `devscripts`, `fakeroot` and `lintian` build and
  validate the Debian package.
- `libpam0g-dev` is needed only while compiling the PAM-enabled backend.

The build should produce architecture-specific `.deb` files for `amd64`,
`arm64`, and, if retained, `armhf`. Frontend assets are architecture-independent
but are included with each binary package.

## Installation paths

| Path | Contents |
| --- | --- |
| `/usr/share/klippix/web` | Compiled React application |
| `/usr/libexec/klippix/ttyd` | Checksum-pinned browser terminal executable |
| `/etc/klippix/` | Administrator configuration and credentials |
| `/etc/nginx/sites-available/klippix.conf` | Nginx virtual host |
| `/usr/lib/systemd/system/klippix-terminal.service` | Terminal service |
| `/usr/lib/systemd/system/klippix-firewall.service` | Port 8020 firewall service |
| `/etc/klippix/klippix.nft` | Klippix-only firewall table |
| `/var/lib/klippix/` | Persistent application state |
| `/run/klippix/` | Runtime-only state |

The package removal scripts must preserve `/etc/klippix` and
`/var/lib/klippix` unless the administrator explicitly purges the package.

## Security gates before a release

1. Replace temporary Basic Auth with a unified PAM-backed web session.
2. Use TLS. A self-signed certificate is acceptable for initial LAN setup, but
   the user must be shown its fingerprint.
3. Constrain file operations to explicitly configured roots and reject symlink
   traversal.
4. Add CSRF protection, secure cookies, origin checks and login throttling.
5. Test the terminal service as an unprivileged user where the target PAM/login
   stack permits it.
6. Validate Nginx and nftables configuration during package installation
   before enabling either service.
7. Do not automatically replace an existing host firewall configuration.
