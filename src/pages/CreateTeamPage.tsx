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
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col justify-between py-12 px-4 font-sans text-gray-900">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => navigate('/my-team')}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors duration-200 group text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Back to My Team</span>
          </motion.button>
        </motion.div>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-[2rem] shadow-sm p-8 sm:p-12 mb-12"
        >
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-[88px] h-[88px] rounded-[1.75rem] bg-brand-orange text-white mb-8 shadow-sm shadow-brand-orange/20"
            >
              <Users className="w-11 h-11 stroke-[1.5]" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
                <Sparkles className="w-[18px] h-[18px] text-brand-orange mr-2" />
                <span className="text-[15px] font-medium text-brand-orange">Create your team profile</span>
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-4xl sm:text-[2.75rem] font-extrabold text-[#0b1527] mb-4 tracking-tight"
            >
              Create Your Team
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-[1.05rem] text-[#6b7280] max-w-[420px] mx-auto leading-[1.6]"
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
              className="space-y-3"
            >
              <label className="block text-sm font-bold text-gray-700">
                Team Logo <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              
              {formData.logoUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex justify-center"
                >
                  <div className="relative">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <img 
                        src={formData.logoUrl} 
                        alt="Team logo preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className={`relative border border-dashed rounded-2xl p-10 text-center transition-colors duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-brand-orange bg-orange-50/50' 
                      : 'border-gray-300 hover:border-brand-orange hover:bg-orange-50/30'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="w-10 h-10 text-gray-400 stroke-[1.5] mx-auto mb-4" />
                    <p className="text-[15px] font-medium text-gray-700 mb-1">
                      Drop your team logo here
                    </p>
                    <p className="text-[13px] text-gray-400 mb-5">
                      or click to browse files
                    </p>
                    <div className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[12px] text-gray-500 shadow-sm">
                      <Image className="w-3.5 h-3.5 mr-2 text-gray-400" />
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
              className="space-y-2"
            >
              <label htmlFor="teamName" className="block text-sm font-bold text-gray-700">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="teamName"
                value={formData.teamName}
                onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                className={`w-full px-5 py-4 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-200 text-[15px] placeholder-gray-400 ${
                  errors.teamName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your team name"
              />
              <AnimatePresence>
                {errors.teamName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-600 font-medium mt-1"
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
              className="space-y-2"
            >
              <label htmlFor="projectName" className="block text-sm font-bold text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className={`w-full px-5 py-4 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all duration-200 text-[15px] placeholder-gray-400 ${
                  errors.projectName ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your project name"
              />
              <AnimatePresence>
                {errors.projectName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-600 font-medium mt-1"
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
              className="flex flex-col sm:flex-row gap-3 pt-6"
            >
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl py-3 px-6 font-semibold flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Create Team
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={() => navigate('/my-team')}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Footer component rendered below the container */}
      <Footer />
    </div>
  );
};

export default CreateTeamPage;