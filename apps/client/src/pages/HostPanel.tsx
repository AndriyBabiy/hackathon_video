import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SessionPhase,
  VotingOption
} from '@video-voting/shared';
import VideoPlayer from '../components/VideoPlayer';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { config } from '../config';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export default function HostPanel() {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [userCount, setUserCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('waiting');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [votingResults, setVotingResults] = useState<{
    winningOption: VotingOption;
    voteBreakdown: Array<{ optionId: string; votes: number }>;
  } | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket: TypedSocket = io(config.serverUrl);

    newSocket.on('connect', () => {
      console.log('[HostPanel] Connected to server');

      // Create session immediately on connect
      newSocket.emit('createSession', {});
    });

    newSocket.on('sessionCreated', (data) => {
      setSessionId(data.sessionId);
      setQrCodeDataUrl(data.qrCodeDataUrl);
      console.log('[HostPanel] Session created:', data.sessionId);
    });

    newSocket.on('userCountUpdate', (data) => {
      setUserCount(data.count);
      console.log('[HostPanel] User count:', data.count);
    });

    newSocket.on('votingResults', (data) => {
      setVotingResults(data);
      setCurrentPhase('playing');
      console.log('[HostPanel] Voting results:', data);
    });

    newSocket.on('playVideo', (data) => {
      setVideoUrl(data.videoUrl);
      setCurrentPhase('playing');
      setVotingResults(null);
      console.log('[HostPanel] Playing video:', data.videoUrl);
    });

    newSocket.on('storyComplete', (data) => {
      setCurrentPhase('complete');
      console.log('[HostPanel] Story complete:', data);
    });

    newSocket.on('error', (data) => {
      console.error('[HostPanel] Error:', data.message);
      alert(`Error: ${data.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleStartVoting = () => {
    if (socket && userCount > 0) {
      socket.emit('startVoting');
      setCurrentPhase('voting');
      console.log('[HostPanel] Starting voting');
    } else if (userCount === 0) {
      alert('Wait for users to join before starting voting!');
    }
  };

  const handleVideoEnd = () => {
    console.log('[HostPanel] Video ended');
    setCurrentPhase('waiting');
  };

  if (!sessionId) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <h2>Creating session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Host Panel</h1>
        <div style={styles.statusBadge}>
          Phase: <strong>{currentPhase}</strong>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          {videoUrl && (
            <VideoPlayer
              videoUrl={videoUrl}
              onVideoEnd={handleVideoEnd}
              autoplay={true}
            />
          )}

          {!videoUrl && (
            <div style={styles.placeholderVideo}>
              <p style={styles.placeholderText}>
                Video will appear here once voting starts
              </p>
            </div>
          )}

          {votingResults && (
            <div style={styles.resultsPanel}>
              <h3 style={styles.resultsTitle}>Voting Results</h3>
              <p style={styles.winnerText}>
                Winner: <strong>{votingResults.winningOption.text}</strong>
              </p>
              <div style={styles.breakdown}>
                {votingResults.voteBreakdown.map((item) => (
                  <div key={item.optionId} style={styles.breakdownItem}>
                    <span>{item.optionId}:</span>
                    <span style={styles.voteCount}>{item.votes} votes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.controls}>
            <button
              onClick={handleStartVoting}
              disabled={currentPhase === 'voting' || currentPhase === 'playing' || userCount === 0}
              style={{
                ...styles.controlButton,
                ...(currentPhase === 'voting' || currentPhase === 'playing' || userCount === 0
                  ? styles.disabledButton
                  : {})
              }}
            >
              {currentPhase === 'voting' ? 'Voting in Progress...' : 'Start Voting'}
            </button>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <QRCodeDisplay
            qrCodeDataUrl={qrCodeDataUrl}
            sessionId={sessionId}
            userCount={userCount}
          />

          <div style={styles.instructions}>
            <h3 style={styles.instructionsTitle}>Instructions:</h3>
            <ol style={styles.instructionsList}>
              <li>Share QR code with your audience</li>
              <li>Wait for users to join</li>
              <li>Click "Start Voting" to begin</li>
              <li>Users vote on their devices</li>
              <li>Watch the story unfold together!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white'
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    color: '#333',
    fontSize: '1rem'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    alignItems: 'start'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  placeholderVideo: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    aspectRatio: '16/9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: 'white',
    fontSize: '1.2rem',
    textAlign: 'center',
    padding: '2rem'
  },
  resultsPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '1.5rem',
    borderRadius: '12px'
  },
  resultsTitle: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    color: '#333'
  },
  winnerText: {
    fontSize: '1.1rem',
    color: '#4CAF50',
    marginBottom: '1rem'
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '0.95rem'
  },
  voteCount: {
    fontWeight: 'bold',
    color: '#667eea'
  },
  controls: {
    display: 'flex',
    gap: '1rem'
  },
  controlButton: {
    flex: 1,
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '1.5rem',
    borderRadius: '12px'
  },
  instructionsTitle: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    color: '#333'
  },
  instructionsList: {
    paddingLeft: '1.5rem',
    margin: 0,
    color: '#555',
    lineHeight: '1.8'
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    margin: '5rem auto',
    maxWidth: '400px'
  }
};
