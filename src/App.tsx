/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Modes from './pages/Modes';
import Discover from './pages/Discover';
import Player from './pages/Player';
import Profile from './pages/Profile';
import LyricsDetail from './pages/LyricsDetail';
import { PlayerProvider } from './store/PlayerContext';

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Modes />} />
            <Route path="discover" element={<Discover />} />
            <Route path="player" element={<Player />} />
            <Route path="profile" element={<Profile />} />
            <Route path="lyrics" element={<LyricsDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}
