/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Modes from './pages/Modes';
import Discover from './pages/Discover';
import Player from './pages/Player';
import Profile from './pages/Profile';
import { PlayerProvider } from './store/PlayerContext';

export default function App() {
  return (
    <PlayerProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Modes />} />
            <Route path="discover" element={<Discover />} />
            <Route path="player" element={<Player />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </HashRouter>
    </PlayerProvider>
  );
}
