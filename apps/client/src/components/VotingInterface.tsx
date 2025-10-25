import { useState } from 'react';
import type { VotingOption } from '@video-voting/shared';

interface VotingInterfaceProps {
  options: VotingOption[];
  onVote: (optionId: string) => void;
  disabled?: boolean;
  hasVoted?: boolean;
  nodeTitle?: string;
}

export default function VotingInterface({
  options,
  onVote,
  disabled = false,
  hasVoted = false,
  nodeTitle
}: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (disabled || hasVoted) return;

    setSelectedOption(optionId);
    onVote(optionId);
  };

  return (
    <div style={styles.container}>
      {nodeTitle && <h2 style={styles.title}>{nodeTitle}</h2>}

      <h3 style={styles.subtitle}>
        {hasVoted ? '✓ Vote Recorded' : 'Choose What Happens Next'}
      </h3>

      <div style={styles.optionsGrid}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={disabled || hasVoted}
            style={{
              ...styles.optionButton,
              ...(selectedOption === option.id ? styles.selectedButton : {}),
              ...(disabled || hasVoted ? styles.disabledButton : {})
            }}
          >
            {selectedOption === option.id && <span style={styles.checkmark}>✓</span>}
            <span style={styles.optionText}>{option.text}</span>
          </button>
        ))}
      </div>

      {hasVoted && (
        <p style={styles.waitingText}>
          Waiting for other voters...
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  optionButton: {
    padding: '1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
    transform: 'scale(1.05)'
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none'
  },
  checkmark: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '1.5rem'
  },
  optionText: {
    lineHeight: '1.4'
  },
  waitingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1rem',
    fontStyle: 'italic',
    marginTop: '1rem'
  }
};
