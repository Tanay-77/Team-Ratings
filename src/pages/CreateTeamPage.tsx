import React, { useState, useRef } from 'react';
import { Upload, X, Image, Check, ArrowLeft, Loader2, Users, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTeams } from '../hooks/useTeams';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Team Created Successfully!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-600 mb-8"
            >
              Your team <span className="font-semibold text-gray-800">"{formData.teamName}"</span> is ready to get rated by the community.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-gray-500"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to My Team page...</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => navigate('/my-team')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:text-blue-600" />
            <span className="font-medium">Back to My Team</span>
          </motion.button>
        </motion.div>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-8 lg:p-12"
        >
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 shadow-lg"
            >
              <Users className="w-10 h-10" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-4"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/50 backdrop-blur-sm border border-blue-200/30 shadow-sm mb-4">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Create your team profile</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Create Your Team
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-lg text-gray-600 max-w-lg mx-auto"
            >
              Set up your team profile and get ready to showcase your amazing work to the community.
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4"
                >
                  <p className="text-sm text-red-700 font-medium">{errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Team Logo Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
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
                    <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src={formData.logoUrl} 
                        alt="Team logo preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50/50 backdrop-blur-sm' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Drop your team logo here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg text-sm text-gray-600">
                      <Image className="w-4 h-4 mr-2" />
                      PNG, JPG up to 5MB
                    </div>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Team Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="space-y-3"
            >
              <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700">
                Team Name <span className="text-red-500">*</span>
              </label>
              <motion.input
                type="text"
                id="teamName"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className={`w-full px-6 py-4 border-2 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                  errors.teamName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your team name"
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <AnimatePresence>
                {errors.teamName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-600 font-medium"
                  >
                    {errors.teamName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Project Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="space-y-3"
            >
              <label htmlFor="projectName" className="block text-sm font-semibold text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <motion.input
                type="text"
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className={`w-full px-6 py-4 border-2 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                  errors.projectName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your project name"
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <AnimatePresence>
                {errors.projectName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-600 font-medium"
                  >
                    {errors.projectName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-stripe text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
                whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Create Team
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => navigate('/my-team')}
                className="px-8 py-4 text-gray-600 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-semibold hover:bg-white hover:border-gray-300 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CreateTeamPage;