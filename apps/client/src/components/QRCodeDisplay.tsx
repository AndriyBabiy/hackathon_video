interface QRCodeDisplayProps {
  qrCodeDataUrl: string;
  sessionId: string;
  userCount: number;
}

export default function QRCodeDisplay({ qrCodeDataUrl, sessionId, userCount }: QRCodeDisplayProps) {
  const joinUrl = `${window.location.origin}/session/${sessionId}`;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scan to Join</h2>

      <div style={styles.qrContainer}>
        <img
          src={qrCodeDataUrl}
          alt="QR Code to join session"
          style={styles.qrImage}
        />
      </div>

      <div style={styles.infoBox}>
        <p style={styles.sessionId}>
          <strong>Session ID:</strong> {sessionId}
        </p>
        <p style={styles.url}>
          <strong>Direct Link:</strong>
          <br />
          <a href={joinUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
            {joinUrl}
          </a>
        </p>
      </div>

      <div style={styles.userCountBadge}>
        <span style={styles.userCountNumber}>{userCount}</span>
        <span style={styles.userCountLabel}>
          {userCount === 1 ? 'user connected' : 'users connected'}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem'
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    display: 'inline-block',
    marginBottom: '1.5rem'
  },
  qrImage: {
    width: '250px',
    height: '250px',
    display: 'block'
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'left'
  },
  sessionId: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '0.5rem'
  },
  url: {
    fontSize: '0.9rem',
    color: '#666',
    wordBreak: 'break-all'
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500'
  },
  userCountBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '50px',
    fontSize: '1rem'
  },
  userCountNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  userCountLabel: {
    fontSize: '0.9rem'
  }
};
