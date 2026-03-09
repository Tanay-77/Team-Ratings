import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { 
  Star, 
  Users, 
  Award, 
  BarChart2, 
  Shield,
  ArrowRight,
  Globe,
  Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const handleGetStarted = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
        navigate('/leaderboard');
      } catch (error) {
        console.error('Error signing in:', error);
      }
    } else {
      navigate('/leaderboard');
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pt-16 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brand-gray">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between py-20 gap-12">
          
          {/* Left Content Column */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            />
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Discover and <br />
              <span className="text-brand-orange">rate amazing teams</span><br />
              based on their work
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl"
            >
              Browse through innovative teams, evaluate their projects, and help the best talent rise to the top through fair and transparent ratings.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <motion.button
                onClick={handleGetStarted}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-lg font-medium px-10 py-4 w-full sm:w-auto rounded-lg transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right Illustration/Dashboard Column */}
          <div className="flex-1 relative hidden lg:flex justify-center items-center">
             <motion.img
                src="/hero-section.png"
                alt="Team Performance Analytics"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full max-w-lg object-contain drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500"
             />
          </div>

        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          {/* Dashboard Preview Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                <div className="bg-brand-gray border border-gray-100 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Teams</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'TechStars', project: 'AI Vision Pro', rating: 4.9, trend: '+0.3' },
                        { name: 'GreenTech', project: 'EcoTrack App', rating: 4.7, trend: '+0.2' },
                        { name: 'Analytics Co', project: 'DataFlow Platform', rating: 4.6, trend: '+0.1' }
                      ].map((team, index) => (
                        <div
                          key={team.name}
                          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-brand-orange font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{team.name}</div>
                              <div className="text-sm text-gray-500">{team.project}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-brand-orange text-brand-orange" />
                              <span className="font-medium text-gray-900">{team.rating}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Experience the power of <br/>
              <span className="text-brand-orange">team discovery.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Explore talented teams, evaluate their work, and help outstanding talent get the recognition they deserve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Matches "About Us" / Mission & Vision */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-gray overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h3 className="text-brand-orange font-semibold tracking-wider text-sm mb-3">ABOUT US</h3>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Why choose <br/> Rate My Team? <br/>
              <span className="text-brand-orange">The most comprehensive platform available.</span>
            </h2>
            <p className="text-gray-600 text-lg">
              We've built the most comprehensive platform for discovering and evaluating exceptional teams.
            </p>
          </motion.div>

          <div className="flex-1 grid md:grid-cols-2 gap-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center border border-gray-100 flex flex-col items-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                 <Shield className="w-8 h-8 text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fair & Transparent</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Our one-user-one-vote policy ensures fairness and prevents rating manipulation. Every voice matters equally.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center border border-gray-100 flex flex-col items-center hover:-translate-y-1 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                 <BarChart2 className="w-8 h-8 text-brand-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Insights</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get comprehensive analytics about team performance, rating trends, and detailed feedback from the community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Matches "What Services We Offer" */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-brand-orange font-semibold tracking-wider text-sm mb-3">TEAM EVALUATION</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Built for team evaluation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to discover, evaluate, and rate outstanding teams in one powerful platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Browse Teams", desc: "Explore a diverse collection of talented teams. View their profiles, learn about their expertise, and discover what makes each team unique.", icon: Users },
              { title: "Rate & Review", desc: "Evaluate teams based on their work quality, innovation, and execution. Our fair rating system ensures every voice counts equally.", icon: Star },
              { title: "Discover Top Talent", desc: "Find the highest-rated teams and discover exceptional talent. Use our leaderboard to identify teams that consistently deliver outstanding work.", icon: Award }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border text-center p-8 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] rounded-2xl flex flex-col items-center transition-all duration-300"
              >
                <div className="w-full h-1 bg-brand-orange absolute top-0 left-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 mt-2">
                  {feature.title}
                </h3>
                 <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
                  {feature.desc}
                </p>
                <button
                  className="bg-brand-orange text-white px-6 py-2 rounded font-medium text-sm hover:bg-brand-orange-hover transition-colors shadow-md"
                >
                  Learn More
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-gray overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-brand-orange font-semibold tracking-wider text-sm mb-3">STATISTICS</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trusted by teams worldwide
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Join thousands of creators who are already using our platform to showcase their innovative projects.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "8.5K+", label: "Team Ratings", icon: Star },
              { number: "1.2K+", label: "Teams Listed", icon: Users },
              { number: "45+", label: "Countries", icon: Globe },
              { number: "4.8", label: "Avg Rating", icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-brand-orange" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <h3 className="text-sm font-semibold text-gray-500">
                  {stat.label}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-gray overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-brand-orange font-semibold tracking-wider text-sm mb-3">OUR BENEFITS</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why choose Rate My Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most comprehensive platform for discovering and evaluating exceptional teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Fair & Transparent",
                description: "Our one-user-one-vote policy ensures fairness and prevents rating manipulation. Every voice matters equally."
              },
              {
                icon: BarChart2,
                title: "Detailed Insights",
                description: "Get comprehensive analytics about team performance, rating trends, and detailed feedback from the community."
              },
              {
                icon: Users,
                title: "Quality Community",
                description: "Connect with professionals who value quality work. Build your network and discover teams that match your standards."
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)] p-10 text-center border border-gray-100 flex flex-col items-center group transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-brand-orange transition-colors duration-300">
                  <benefit.icon className="w-10 h-10 text-brand-orange group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-brand-orange text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                 <img src="/logo.png" alt="Rate My Team Logo" className="h-12 object-contain bg-white rounded-xl p-1 drop-shadow-md mr-3" />
                 <span className="text-2xl font-bold">Rate My Team</span>
              </div>
              <p className="text-orange-100 text-sm mb-6 leading-relaxed max-w-sm">
                The ultimate platform for discovering exceptional teams and rating outstanding work. Connect with talented professionals worldwide.
              </p>
              <div className="flex space-x-3">
                 <div className="w-8 h-8 rounded-full border border-orange-300 flex items-center justify-center hover:bg-white hover:text-brand-orange transition-colors cursor-pointer">
                    <Globe className="w-4 h-4" />
                 </div>
                 <div className="w-8 h-8 rounded-full border border-orange-300 flex items-center justify-center hover:bg-white hover:text-brand-orange transition-colors cursor-pointer">
                    <Users className="w-4 h-4" />
                 </div>
              </div>
            </div>

            {/* Links 1 */}
            <div>
              <h3 className="text-lg font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                {['Browse Teams', 'Rate Teams', 'Leaderboard', 'Top Rated'].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-orange-100 hover:text-white transition-colors text-sm flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-xs">›</span> {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                 {['Documentation', 'Help Center', 'Community', 'Blog'].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-orange-100 hover:text-white transition-colors text-sm flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-xs">›</span> {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-orange-400/50 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <p className="text-orange-100 text-sm">
              © {new Date().getFullYear()} Rate My Team. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-orange-100 text-sm">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </motion.div>
              <span>by</span>
              <a href="https://www.linkedin.com/in/tanay-mahajan-3b8729289/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-orange-200 transition-colors">Tanay</a>
              <span>&</span>
              <a href="https://www.linkedin.com/in/siddharth-farkade/" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-orange-200 transition-colors">Siddharth</a>
            </div>
            <div className="flex justify-center md:justify-end space-x-6 text-sm">
              <span className="text-orange-100 cursor-pointer hover:text-white">Privacy Policy</span>
              <span className="text-orange-100 cursor-pointer hover:text-white">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
