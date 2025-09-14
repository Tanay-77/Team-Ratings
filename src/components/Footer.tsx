import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-16 py-8 border-t border-gray-200/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <span className="text-sm font-medium">Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-red-500"
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.div>
            <span className="text-sm font-medium">by</span>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            {/* Tanay's Profile */}
            <motion.a
              href="https://www.linkedin.com/in/tanay-mahajan-3b8729289/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200/30 hover:bg-blue-50/70 hover:border-blue-200/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                Tanay
              </span>
            </motion.a>

            {/* Siddharth's Profile */}
            <motion.a
              href="https://www.linkedin.com/in/siddharth-farkade/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200/30 hover:bg-blue-50/70 hover:border-blue-200/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                Siddharth
              </span>
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-xs text-gray-500"
          >
            Team Ratings Platform • {new Date().getFullYear()}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;