'use client';

/**
 * Last-resort boundary: it replaces the whole document, so it carries its own
 * <html>/<body> and cannot rely on the layout's fonts or tokens.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-PT">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#FBF6EE',
          color: '#201E1D',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '48ch' }}>
          <h1 style={{ color: '#1B3160', fontSize: 28, marginBottom: 12 }}>
            Alguma coisa correu mal.
          </h1>
          <p style={{ lineHeight: 1.7, color: 'rgba(32,30,29,.75)', marginBottom: 24 }}>
            Não conseguimos carregar a loja. Tenta outra vez ou escreve-nos para
            info@callmeophelia.com.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: 'pointer',
              border: 0,
              borderRadius: 999,
              padding: '15px 30px',
              background: '#1B3160',
              color: '#FBF6EE',
              fontSize: 14,
            }}
          >
            Tentar outra vez
          </button>
        </div>
      </body>
    </html>
  );
}
