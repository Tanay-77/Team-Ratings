import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AddTeamFormProps {
  onAddTeam: (team: { teamName: string; projectName: string }, userId: string) => Promise<void>;
}

const AddTeamForm: React.FC<AddTeamFormProps> = ({ onAddTeam }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ teamName?: string; projectName?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: { teamName?: string; projectName?: string; general?: string } = {};
    
    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      setIsSubmitting(true);
      setErrors({}); // Clear previous errors
      await onAddTeam({ teamName: teamName.trim(), projectName: projectName.trim() }, user.uid);
      setTeamName('');
      setProjectName('');
      setIsOpen(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to add team:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to add team. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <div className="text-center mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Team
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Team</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name *
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.teamName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter team name"
          />
          {errors.teamName && (
            <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.projectName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Team'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTeamName('');
              setProjectName('');
              setErrors({});
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeamForm;