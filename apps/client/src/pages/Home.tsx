import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Interactive Video Voting</h1>
        <p style={styles.subtitle}>
          Create an interactive video experience where your audience votes on what happens next
        </p>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/host')}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            Start as Host
          </button>
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.infoTitle}>How it works:</h3>
          <ol style={styles.list}>
            <li style={styles.listItem}>Host creates a session and shares QR code</li>
            <li style={styles.listItem}>Audience scans QR code to join</li>
            <li style={styles.listItem}>Everyone watches the video together</li>
            <li style={styles.listItem}>Audience votes on what happens next</li>
            <li style={styles.listItem}>Story unfolds based on collective decisions</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '3rem',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    width: '100%'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem',
    textAlign: 'center',
    lineHeight: '1.6'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  },
  button: {
    flex: 1,
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  primaryButton: {
    backgroundColor: '#667eea',
    color: 'white'
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px'
  },
  infoTitle: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '1rem'
  },
  list: {
    paddingLeft: '1.5rem',
    margin: 0
  },
  listItem: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '0.5rem',
    lineHeight: '1.5'
  }
};
