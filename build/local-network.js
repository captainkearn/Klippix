import net from "node:net";

function normalizeAddress(address) {
  const withoutZone = (address ?? "").split("%", 1)[0].toLowerCase();
  return withoutZone.startsWith("::ffff:")
    ? withoutZone.slice("::ffff:".length)
    : withoutZone;
}

function isPrivateIpv4(address) {
  const octets = address.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(address) {
  if (address === "::1") return true;

  const firstGroup = Number.parseInt(address.split(":", 1)[0], 16);
  if (!Number.isInteger(firstGroup)) return false;

  return (
    (firstGroup & 0xfe00) === 0xfc00 ||
    (firstGroup & 0xffc0) === 0xfe80
  );
}

export function isLocalNetworkAddress(rawAddress) {
  const address = normalizeAddress(rawAddress);
  const family = net.isIP(address);

  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) return isPrivateIpv6(address);
  return false;
}

function localNetworkMiddleware(request, response, next) {
  if (isLocalNetworkAddress(request.socket.remoteAddress)) {
    next();
    return;
  }

  response.statusCode = 403;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Klippix is available only from a local network.\n");
}

export function localNetworkOnly() {
  return {
    name: "klippix-local-network-only",
    configureServer(server) {
      server.middlewares.use(localNetworkMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(localNetworkMiddleware);
    }
  };
}
