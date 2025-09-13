import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Navigation from './components/Navigation';
import TeamsPage from './pages/TeamsPage';
import LandingPage from './pages/LandingPage';
import Leaderboard from './components/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/teams" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-4">
                <TeamsPage />
              </div>
            </div>
          </AuthGuard>
        } />
        
        <Route path="/leaderboard" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-4">
                <Leaderboard />
              </div>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;