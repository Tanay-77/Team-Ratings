import React, { useState, useRef } from 'react';
import { Upload, X, Image, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { useNavigate } from 'react-router-dom';

const CreateTeamPage: React.FC = () => {
  const { user } = useAuth();
  const { addTeam } = useTeams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    teamName: '',
    projectName: '',
    logoUrl: ''
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    teamName?: string;
    projectName?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors({ general: 'Please select a valid image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ general: 'File size must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, logoUrl: result }));
      setErrors({});
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      
      await addTeam(
        { 
          teamName: formData.teamName.trim(), 
          projectName: formData.projectName.trim(),
          logoUrl: formData.logoUrl || undefined,
          createdByName: user.displayName || user.email || 'Anonymous'
        }, 
        user.uid
      );
      
      setIsSuccess(true);
      
      // Navigate to My Team page after success
      setTimeout(() => {
        navigate('/my-team');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create team:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to create team. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Created!</h2>
            <p className="text-gray-600 mb-6">
              Your team "{formData.teamName}" has been successfully created.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to My Team page...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-team')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Team
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Team</h1>
            <p className="text-gray-600">
              Add your team information and upload a logo to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Team Logo Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Team Logo (Optional)
              </label>
              
              {formData.logoUrl ? (
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={formData.logoUrl} 
                      alt="Team logo preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your team logo here, or
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                  >
                    browse files
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Team Name */}
            <div className="space-y-2">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                Team Name *
              </label>
              <input
                type="text"
                id="teamName"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.teamName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your team name"
              />
              {errors.teamName && (
                <p className="text-sm text-red-600">{errors.teamName}</p>
              )}
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.projectName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your project name"
              />
              {errors.projectName && (
                <p className="text-sm text-red-600">{errors.projectName}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  'Create Team'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/my-team')}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
