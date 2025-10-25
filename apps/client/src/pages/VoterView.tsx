import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SessionPhase,
  VotingOption
} from '@video-voting/shared';
import VideoPlayer from '../components/VideoPlayer';
import VotingInterface from '../components/VotingInterface';
import { config } from '../config';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export default function VoterView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('waiting');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [votingOptions, setVotingOptions] = useState<VotingOption[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [nodeTitle, setNodeTitle] = useState<string>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    // Connect to Socket.IO server
    const newSocket: TypedSocket = io(config.serverUrl);

    newSocket.on('connect', () => {
      console.log('[VoterView] Connected to server');

      // Join session
      newSocket.emit('joinSession', { sessionId });
    });

    newSocket.on('sessionJoined', (data) => {
      setConnected(true);
      setCurrentPhase(data.currentPhase);
      console.log('[VoterView] Joined session:', data.sessionId);
    });

    newSocket.on('userCountUpdate', (data) => {
      setTotalUsers(data.count);
    });

    newSocket.on('votingStarted', (data) => {
      setVotingOptions(data.options);
      setNodeTitle(data.nodeTitle);
      setCurrentPhase('voting');
      setHasVoted(false);
      console.log('[VoterView] Voting started with options:', data.options);
    });

    newSocket.on('voteRecorded', (data) => {
      setHasVoted(true);
      setVoteCount(data.voteCount);
      setTotalUsers(data.totalUsers);
      console.log('[VoterView] Vote recorded:', data);
    });

    newSocket.on('votingResults', (data) => {
      console.log('[VoterView] Voting results:', data);
      setCurrentPhase('playing');
    });

    newSocket.on('playVideo', (data) => {
      setVideoUrl(data.videoUrl);
      setCurrentPhase('playing');
      setVotingOptions([]);
      console.log('[VoterView] Playing video:', data.videoUrl);
    });

    newSocket.on('storyComplete', (data) => {
      setCurrentPhase('complete');
      console.log('[VoterView] Story complete:', data);
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      console.error('[VoterView] Error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  const handleVote = (optionId: string) => {
    if (socket && sessionId) {
      socket.emit('vote', { sessionId, optionId });
      console.log('[VoterView] Voting for option:', optionId);
    }
  };

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Error</h2>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <h2>Joining session...</h2>
          <p style={styles.loadingText}>Session ID: {sessionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Interactive Video</h1>
        <div style={styles.statusBadge}>
          {currentPhase === 'waiting' && 'Waiting for host...'}
          {currentPhase === 'voting' && hasVoted && `Voted! (${voteCount}/${totalUsers})`}
          {currentPhase === 'voting' && !hasVoted && 'Vote now!'}
          {currentPhase === 'playing' && 'Watching...'}
          {currentPhase === 'complete' && 'Story Complete!'}
        </div>
      </div>

      <div style={styles.content}>
        {videoUrl && (
          <VideoPlayer
            videoUrl={videoUrl}
            autoplay={true}
          />
        )}

        {currentPhase === 'voting' && votingOptions.length > 0 && (
          <VotingInterface
            options={votingOptions}
            onVote={handleVote}
            hasVoted={hasVoted}
            nodeTitle={nodeTitle}
          />
        )}

        {currentPhase === 'waiting' && (
          <div style={styles.waitingCard}>
            <h2 style={styles.waitingTitle}>Ready to Vote!</h2>
            <p style={styles.waitingText}>
              Waiting for the host to start the experience...
            </p>
            <p style={styles.usersText}>
              {totalUsers} {totalUsers === 1 ? 'user' : 'users'} connected
            </p>
          </div>
        )}

        {currentPhase === 'complete' && (
          <div style={styles.completeCard}>
            <h2 style={styles.completeTitle}>The End</h2>
            <p style={styles.completeText}>
              Thanks for participating in this interactive story!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '1.5rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: 'white'
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    color: '#333',
    fontSize: '1rem',
    fontWeight: '500'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  waitingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center'
  },
  waitingTitle: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '1rem'
  },
  waitingText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '1.5rem'
  },
  usersText: {
    fontSize: '1rem',
    color: '#667eea',
    fontWeight: '600'
  },
  completeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center'
  },
  completeTitle: {
    fontSize: '2.5rem',
    color: '#4CAF50',
    marginBottom: '1rem'
  },
  completeText: {
    fontSize: '1.2rem',
    color: '#666'
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    margin: '5rem auto',
    maxWidth: '400px'
  },
  loadingText: {
    color: '#666',
    marginTop: '1rem'
  },
  errorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center',
    margin: '5rem auto',
    maxWidth: '500px'
  },
  errorTitle: {
    fontSize: '2rem',
    color: '#f44336',
    marginBottom: '1rem'
  },
  errorText: {
    fontSize: '1.1rem',
    color: '#666'
  }
};
