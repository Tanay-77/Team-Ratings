import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Leaderboard from './components/Leaderboard';
import MyTeamPage from './pages/MyTeamPage';
import CreateTeamPage from './pages/CreateTeamPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Landing page */}
        <Route path="/" element={
          <div className="min-h-screen">
            <Navigation />
            <LandingPage />
          </div>
        } />
        
        {/* Protected routes - require authentication */}
        <Route path="/my-team" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-20">
                <MyTeamPage />
              </div>
            </div>
          </AuthGuard>
        } />
        
        <Route path="/create-team" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-20">
                <CreateTeamPage />
              </div>
            </div>
          </AuthGuard>
        } />
        
        <Route path="/leaderboard" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-20">
                <Leaderboard />
              </div>
            </div>
          </AuthGuard>
        } />
        
        <Route path="/admin" element={
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="pt-20">
                <AdminPage />
              </div>
            </div>
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;