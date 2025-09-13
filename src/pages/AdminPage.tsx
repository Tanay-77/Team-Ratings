import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, Shield, Eye, UserCheck, Calendar } from 'lucide-react';
import { Team } from '../types/team';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ADMIN_EMAILS = ['siddharthfarkade12@gmail.com', 'tanaymahajan7@gmail.com'];

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    if (isAdmin) {
      fetchAllTeams();
    }
  }, [isAdmin]);

  const fetchAllTeams = async () => {
    try {
      setLoading(true);
      const allTeams = await api.getAllTeamsForAdmin();
      setTeams(allTeams);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (teamId: string, newStatus: 'approved' | 'rejected') => {
    if (!user || !isAdmin) return;

    try {
      setActionLoading(teamId);
      await api.updateTeamStatus(teamId, newStatus, user.uid);
      
      // Update the team in local state
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, status: newStatus, reviewedBy: user.uid, reviewedAt: new Date() }
          : team
      ));
    } catch (err) {
      console.error('Failed to update team status:', err);
      setError('Failed to update team status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTeams = teams.filter(team => team.status === activeTab);

  const getTabCount = (status: 'pending' | 'approved' | 'rejected') => {
    return teams.filter(team => team.status === status).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to access admin panel</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage team submissions and approvals</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'pending'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Pending ({getTabCount('pending')})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved ({getTabCount('approved')})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'rejected'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejected ({getTabCount('rejected')})
              </button>
            </nav>
          </div>
        </div>

        {/* Teams List */}
        {filteredTeams.length > 0 ? (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={`${team.teamName} logo`}
                        className="w-16 h-16 rounded-lg border-2 border-gray-200 mr-4 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-4 flex-shrink-0">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{team.teamName}</h3>
                      <p className="text-gray-600 mb-2">{team.projectName}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          {team.createdByName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {team.createdAt.toLocaleDateString()}
                        </div>
                        {team.status !== 'pending' && team.reviewedAt && (
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            Reviewed {team.reviewedAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {team.totalRatings > 0 && (
                        <div className="mt-2 flex items-center text-sm">
                          <span className="text-yellow-500 font-medium">
                            ⭐ {team.averageRating}/10
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({team.totalRatings} rating{team.totalRatings !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                    {team.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(team.id, 'approved')}
                          disabled={actionLoading === team.id}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {actionLoading === team.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(team.id, 'rejected')}
                          disabled={actionLoading === team.id}
                          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {actionLoading === team.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    
                    {team.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(team.id, 'rejected')}
                        disabled={actionLoading === team.id}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    )}
                    
                    {team.status === 'rejected' && (
                      <button
                        onClick={() => handleStatusChange(team.id, 'approved')}
                        disabled={actionLoading === team.id}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            {activeTab === 'pending' && (
              <>
                <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending teams</p>
              </>
            )}
            {activeTab === 'approved' && (
              <>
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">No approved teams</p>
              </>
            )}
            {activeTab === 'rejected' && (
              <>
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-500">No rejected teams</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
