import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostPanel from './pages/HostPanel';
import VoterView from './pages/VoterView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/host" element={<HostPanel />} />
      <Route path="/session/:sessionId" element={<VoterView />} />
    </Routes>
  );
}

export default App;
