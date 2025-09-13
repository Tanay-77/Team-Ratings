import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, ChevronRight, Award, BarChart2, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  const handleGetStarted = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        // After successful authentication, navigate to leaderboard
        navigate('/leaderboard');
      } catch (error) {
        console.error('Error signing in:', error);
      }
    } else {
      // If user is already authenticated, go to leaderboard
      navigate('/leaderboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Star className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Team Rating Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover and rate amazing projects from talented teams. 
            Showcase your work and get valuable feedback from the community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Team</h3>
            <p className="text-gray-600">
              Register your team and project details to get started. Share your innovative ideas with the community.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Rate Projects</h3>
            <p className="text-gray-600">
              Browse through projects and rate them based on creativity, execution, and impact. Each user can rate a project only once.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Climb the Leaderboard</h3>
            <p className="text-gray-600">
              Projects with the highest ratings make it to the top of the leaderboard. Gain recognition for your hard work.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Use Our Platform</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Rating System</h3>
            <p className="text-gray-600">
              Our one-user-one-vote policy ensures fairness and prevents rating manipulation.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <BarChart2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Insightful Analytics</h3>
            <p className="text-gray-600">
              Gain valuable insights about your project's reception and performance metrics.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Engagement</h3>
            <p className="text-gray-600">
              Connect with like-minded innovators and receive constructive feedback on your work.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Showcase Your Project?</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Join our growing community of innovators and creators today.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors"
        >
          Get Started Now
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Star className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">Team Rating Platform</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Team Rating Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
