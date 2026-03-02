import { describe, it, expect } from 'vitest';
import { hashIp, getClientIp, getHashedIp } from './ip-hash';

// ─── hashIp ─────────────────────────────────────────────────────────

describe('hashIp', () => {
  it('retourne un hash SHA-256 hexadecimal de 64 caracteres', () => {
    const hash = hashIp('192.168.1.1');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('retourne un hash deterministe pour la meme IP', () => {
    const hash1 = hashIp('10.0.0.1');
    const hash2 = hashIp('10.0.0.1');
    expect(hash1).toBe(hash2);
  });

  it('retourne des hash differents pour des IPs differentes', () => {
    const hash1 = hashIp('192.168.1.1');
    const hash2 = hashIp('192.168.1.2');
    expect(hash1).not.toBe(hash2);
  });

  it('gere une adresse IPv6', () => {
    const hash = hashIp('::1');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('gere une chaine vide', () => {
    const hash = hashIp('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ne retourne jamais l\'IP en clair dans le hash', () => {
    const ip = '192.168.1.1';
    const hash = hashIp(ip);
    expect(hash).not.toContain(ip);
  });
});

// ─── getClientIp ────────────────────────────────────────────────────

describe('getClientIp', () => {
  it('extrait l\'IP du header X-Forwarded-For', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18, 150.172.238.178' },
    });
    expect(getClientIp(request)).toBe('203.0.113.1');
  });

  it('extrait l\'IP du header X-Forwarded-For avec une seule IP', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.1' },
    });
    expect(getClientIp(request)).toBe('203.0.113.1');
  });

  it('trim les espaces dans X-Forwarded-For', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  203.0.113.1  , 70.41.3.18' },
    });
    expect(getClientIp(request)).toBe('203.0.113.1');
  });

  it('utilise X-Real-IP si X-Forwarded-For est absent', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '198.51.100.1' },
    });
    expect(getClientIp(request)).toBe('198.51.100.1');
  });

  it('retourne 127.0.0.1 si aucun header n\'est present', () => {
    const request = new Request('http://localhost');
    expect(getClientIp(request)).toBe('127.0.0.1');
  });

  it('prefere X-Forwarded-For a X-Real-IP', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '203.0.113.1',
        'x-real-ip': '198.51.100.1',
      },
    });
    expect(getClientIp(request)).toBe('203.0.113.1');
  });
});

// ─── getHashedIp ────────────────────────────────────────────────────

describe('getHashedIp', () => {
  it('combine getClientIp et hashIp', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '203.0.113.1' },
    });
    const expected = hashIp('203.0.113.1');
    expect(getHashedIp(request)).toBe(expected);
  });

  it('retourne un hash pour une requete sans header', () => {
    const request = new Request('http://localhost');
    const expected = hashIp('127.0.0.1');
    expect(getHashedIp(request)).toBe(expected);
  });

  it('retourne un hash SHA-256 valide', () => {
    const request = new Request('http://localhost');
    const hash = getHashedIp(request);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
