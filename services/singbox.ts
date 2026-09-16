// sing-box 1.14.1 outbound/config generation.
// Reuses Outbound.fromLink() (services/v2ray.ts) for protocols shared with Xray
// (vmess/vless/trojan/shadowsocks) and adds native parsing for sing-box-only
// share links (hysteria2, tuic).
import { Outbound, Protocols, StreamSettings } from './v2ray';

export const SingBoxOutboundType = {
    Direct: 'direct',
    Block: 'block',
    DNS: 'dns',
    VMess: 'vmess',
    VLESS: 'vless',
    Trojan: 'trojan',
    Shadowsocks: 'shadowsocks',
    Hysteria2: 'hysteria2',
    TUIC: 'tuic',
};

function parseRemark(hash: string, fallback: string): string {
    if (!hash) return fallback;
    try {
        const decoded = decodeURIComponent(hash);
        return decoded.length > 1 ? decoded.substring(1) : fallback;
    } catch {
        return fallback;
    }
}

function hasFingerprint(fingerprint: string | undefined): boolean {
    // Outbound.fromParamLink() defaults an absent `fp` param to the literal
    // string 'none', which is not a real uTLS fingerprint.
    return !!fingerprint && fingerprint !== 'none';
}

function buildTlsJson(stream: StreamSettings): any {
    if (stream.security === 'tls') {
        const tls = stream.tls;
        return {
            enabled: true,
            server_name: tls.serverName || undefined,
            insecure: tls.allowInsecure || undefined,
            alpn: tls.alpn && tls.alpn.length ? tls.alpn : undefined,
            utls: hasFingerprint(tls.fingerprint) ? { enabled: true, fingerprint: tls.fingerprint } : undefined,
        };
    }
    if (stream.security === 'reality') {
        const reality = stream.reality;
        return {
            enabled: true,
            server_name: reality.serverName || undefined,
            utls: hasFingerprint(reality.fingerprint) ? { enabled: true, fingerprint: reality.fingerprint } : undefined,
            reality: {
                enabled: true,
                public_key: reality.publicKey || '',
                short_id: reality.shortId || undefined,
            },
        };
    }
    return undefined;
}

function buildTransportJson(stream: StreamSettings): any {
    switch (stream.network) {
        case 'ws':
            return {
                type: 'ws',
                path: stream.ws.path || '/',
                headers: stream.ws.host ? { Host: stream.ws.host } : undefined,
            };
        case 'grpc':
            return {
                type: 'grpc',
                service_name: stream.grpc.serviceName || '',
            };
        case 'httpupgrade':
            return {
                type: 'httpupgrade',
                path: stream.httpupgrade.path || '/',
                host: stream.httpupgrade.host || undefined,
            };
        default:
            // sing-box has no equivalent for Xray-only transports (tcp header
            // obfuscation, kcp, xhttp) — fall back to plain tcp.
            return undefined;
    }
}

function fromV2RayOutbound(ob: Outbound): any {
    const settings: any = ob.settings;
    const stream = ob.stream;
    const base = {
        tag: ob.tag || 'proxy',
        server: settings.address,
        server_port: settings.port,
    };
    const tls = buildTlsJson(stream);
    const transport = buildTransportJson(stream);

    switch (ob.protocol) {
        case Protocols.VMess:
            return {
                type: SingBoxOutboundType.VMess,
                ...base,
                uuid: settings.id,
                security: settings.security || 'auto',
                alter_id: 0,
                packet_encoding: 'xudp',
                tls,
                transport,
            };
        case Protocols.VLESS:
            return {
                type: SingBoxOutboundType.VLESS,
                ...base,
                uuid: settings.id,
                flow: settings.flow || undefined,
                packet_encoding: 'xudp',
                tls,
                transport,
            };
        case Protocols.Trojan:
            return {
                type: SingBoxOutboundType.Trojan,
                ...base,
                password: settings.password,
                tls: tls || { enabled: true },
                transport,
            };
        case Protocols.Shadowsocks:
            return {
                type: SingBoxOutboundType.Shadowsocks,
                ...base,
                method: settings.method,
                password: settings.password,
            };
        default:
            return null;
    }
}

function fromHysteria2Link(link: string): any | null {
    let url: URL;
    try {
        url = new URL(link.replace(/^hy2:\/\//i, 'hysteria2://'));
    } catch {
        return null;
    }
    if (!url.hostname) return null;

    const password = url.password
        ? `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
        : decodeURIComponent(url.username);
    const port = Number(url.port) || 443;
    const insecure = url.searchParams.get('insecure') === '1';
    const sni = url.searchParams.get('sni') || url.searchParams.get('peer') || url.hostname;
    const alpn = url.searchParams.get('alpn');
    const obfsType = url.searchParams.get('obfs');
    const obfsPassword = url.searchParams.get('obfs-password') || '';
    const remark = parseRemark(url.hash, `hy2-${url.hostname}-${port}`);

    return {
        type: SingBoxOutboundType.Hysteria2,
        tag: remark,
        server: url.hostname,
        server_port: port,
        password,
        obfs: obfsType ? { type: obfsType, password: obfsPassword } : undefined,
        tls: {
            enabled: true,
            server_name: sni,
            insecure: insecure || undefined,
            alpn: alpn ? alpn.split(',') : undefined,
        },
    };
}

function fromTuicLink(link: string): any | null {
    let url: URL;
    try {
        url = new URL(link);
    } catch {
        return null;
    }
    if (!url.hostname) return null;

    const uuid = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const port = Number(url.port) || 443;
    const congestionControl = url.searchParams.get('congestion_control') || 'bbr';
    const udpRelayMode = url.searchParams.get('udp_relay_mode') || 'native';
    const alpn = url.searchParams.get('alpn');
    const sni = url.searchParams.get('sni') || url.hostname;
    const allowInsecure = url.searchParams.get('allow_insecure') === '1';
    const remark = parseRemark(url.hash, `tuic-${url.hostname}-${port}`);

    return {
        type: SingBoxOutboundType.TUIC,
        tag: remark,
        server: url.hostname,
        server_port: port,
        uuid,
        password,
        congestion_control: congestionControl,
        udp_relay_mode: udpRelayMode,
        tls: {
            enabled: true,
            server_name: sni,
            insecure: allowInsecure || undefined,
            alpn: alpn ? alpn.split(',') : ['h3'],
        },
    };
}

export class SingBoxOutbound {
    static fromLink(link: string): any | null {
        const l = link.trim();
        const lower = l.toLowerCase();

        if (lower.startsWith('hysteria2://') || lower.startsWith('hy2://')) {
            return fromHysteria2Link(l);
        }
        if (lower.startsWith('tuic://')) {
            return fromTuicLink(l);
        }

        const ob = Outbound.fromLink(l);
        if (!ob) return null;
        return fromV2RayOutbound(ob);
    }
}

export class SingBoxConfig {
    static parse(link: string, options: any = {}): any {
        const outbound = SingBoxOutbound.fromLink(link);
        if (!outbound) throw new Error('Unsupported protocol or invalid link');

        const proxyOutbound = { ...outbound, tag: 'proxy' };

        if (options.multiplex?.enabled) {
            proxyOutbound.multiplex = {
                enabled: true,
                protocol: options.multiplex.protocol || 'smux',
                max_connections: Number(options.multiplex.maxConnections) || 4,
            };
        }

        const dnsAddresses: string[] = options.dns
            ? options.dns.split(',').map((s: string) => s.trim()).filter(Boolean)
            : ['1.1.1.1', '8.8.8.8'];

        return {
            log: { level: 'info', timestamp: true },
            dns: {
                servers: dnsAddresses.map((address, idx) => ({
                    type: 'udp',
                    tag: `dns-${idx}`,
                    server: address,
                })),
            },
            inbounds: [
                { type: 'mixed', tag: 'mixed-in', listen: '127.0.0.1', listen_port: 2080 },
            ],
            outbounds: [
                proxyOutbound,
                { type: SingBoxOutboundType.Direct, tag: 'direct' },
                { type: SingBoxOutboundType.Block, tag: 'block' },
                { type: SingBoxOutboundType.DNS, tag: 'dns-out' },
            ],
            route: {
                rules: [
                    { protocol: 'dns', action: 'hijack-dns' },
                ],
                final: 'proxy',
                auto_detect_interface: true,
            },
        };
    }
}
