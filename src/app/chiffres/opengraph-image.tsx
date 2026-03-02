import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Les chiffres des finances publiques françaises — C\'EST NICOLAS QUI PAYE';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#111318',
          color: '#F5F5F5',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#C62828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            N
          </div>
          <span style={{ fontSize: '20px', color: '#A3A3A3' }}>
            C&apos;EST NICOLAS QUI PAYE
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
          }}
        >
          Les chiffres des finances publiques
        </h1>

        {/* KPI row */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1A1D24',
              border: '1px solid #2E3340',
              borderRadius: '12px',
              padding: '20px 32px',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#C62828' }}>
              -135 Md€
            </span>
            <span style={{ fontSize: '14px', color: '#737373', marginTop: '4px' }}>
              Déficit budgétaire
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1A1D24',
              border: '1px solid #2E3340',
              borderRadius: '12px',
              padding: '20px 32px',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#C62828' }}>
              3 620 Md€
            </span>
            <span style={{ fontSize: '14px', color: '#737373', marginTop: '4px' }}>
              Dette publique
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#1A1D24',
              border: '1px solid #2E3340',
              borderRadius: '12px',
              padding: '20px 32px',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#E8A317' }}>
              52 950 €
            </span>
            <span style={{ fontSize: '14px', color: '#737373', marginTop: '4px' }}>
              Par habitant
            </span>
          </div>
        </div>

        {/* Footer */}
        <span style={{ fontSize: '16px', color: '#737373' }}>
          Budget 2026 • Dette • Protection sociale • Fraude • IR • Comparaison UE
        </span>
      </div>
    ),
    { ...size },
  );
}
