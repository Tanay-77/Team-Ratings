import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, Loader2, AlertCircle, Image } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Team, TeamEditRequest } from '../types/team';

interface EditTeamFormProps {
  team: Team;
  onEditTeam: (teamId: string, editRequest: TeamEditRequest) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const EditTeamForm: React.FC<EditTeamFormProps> = ({ team, onEditTeam, isOpen, onClose }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    teamName: '',
    projectName: '',
    logoUrl: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ teamName?: string; projectName?: string; general?: string }>({});

  // Initialize form with current team values
  useEffect(() => {
    if (team) {
      setFormData({
        teamName: team.teamName || '',
        projectName: team.projectName || '',
        logoUrl: team.logoUrl || ''
      });
    }
  }, [team]);

  const validateForm = () => {
    const newErrors: { teamName?: string; projectName?: string } = {};
    
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return formData.teamName.trim() !== team.teamName ||
           formData.projectName.trim() !== team.projectName ||
           formData.logoUrl.trim() !== (team.logoUrl || '');
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
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
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
    
    if (!validateForm() || !user || !hasChanges()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      
      const editRequest: TeamEditRequest = {
        teamName: formData.teamName.trim(),
        projectName: formData.projectName.trim(),
        logoUrl: formData.logoUrl.trim() || undefined
      };

      await onEditTeam(team.id, editRequest);
      onClose();
    } catch (error) {
      console.error('Failed to submit team edit:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to submit changes. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form to original values
    setFormData({
      teamName: team.teamName || '',
      projectName: team.projectName || '',
      logoUrl: team.logoUrl || ''
    });
    setErrors({});
    onClose();
  };

  if (!user || user.uid !== team.createdBy) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                >
                  <Edit3 className="w-8 h-8" />
                </motion.div>
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-2xl font-bold text-gray-900"
                  >
                    Edit Team
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-sm text-gray-600"
                  >
                    Changes will require admin approval
                  </motion.p>
                </div>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                onClick={handleClose}
                className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 flex items-start space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Team Logo Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-4"
              >
                <label className="block text-sm font-semibold text-gray-700">
                  Team Logo <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                
                {formData.logoUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative flex justify-center"
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                        <img 
                          src={formData.logoUrl} 
                          alt="Team logo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <motion.button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50/50' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <motion.div
                      animate={{ 
                        y: dragActive ? -5 : 0,
                        scale: dragActive ? 1.05 : 1 
                      }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Drop your logo here or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            browse files
                          </button>
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </motion.div>

              {/* Team Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-2"
              >
                <label htmlFor="edit-teamName" className="block text-sm font-semibold text-gray-700">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="edit-teamName"
                  value={formData.teamName}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                  className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border rounded-xl text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 ${
                    errors.teamName ? 'border-red-300/60' : 'border-gray-300/60'
                  }`}
                  placeholder="Enter your team name"
                />
                {errors.teamName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.teamName}
                  </p>
                )}
              </motion.div>

              {/* Project Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="space-y-2"
              >
                <label htmlFor="edit-projectName" className="block text-sm font-semibold text-gray-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="edit-projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                  className={`w-full px-4 py-4 bg-white/50 backdrop-blur-sm border rounded-xl text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 ${
                    errors.projectName ? 'border-red-300/60' : 'border-gray-300/60'
                  }`}
                  placeholder="Enter your project name"
                />
                {errors.projectName && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.projectName}
                  </p>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  whileHover={!isSubmitting && hasChanges() ? { scale: 1.02 } : undefined}
                  whileTap={!isSubmitting && hasChanges() ? { scale: 0.98 } : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5 mr-2" />
                      Update Team
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-initial px-8 py-4 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/60 rounded-xl hover:bg-gray-50/80 transition-all duration-200 font-semibold text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTeamForm;