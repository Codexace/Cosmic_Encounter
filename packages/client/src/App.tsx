import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.js';
import LobbyPage from './pages/LobbyPage.js';
import GamePage from './pages/GamePage.js';

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/game/:roomCode" element={<GamePage />} />
      </Routes>
    </div>
  );
}
