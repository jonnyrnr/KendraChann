import React from 'react';
import { motion } from 'framer-motion';
import type { Service } from '../types';
import { PaletteIcon, MoonIcon, WandSparklesIcon, UserIcon, VideoIcon, BrainCircuitIcon, StarIcon } from './Icons';
import AIPsychic from './AIPsychic';

interface ServicesPageProps {
  onNavigateToToolkit: () => void;
}

const services: Service[] = [
  {
    icon: <MoonIcon className="w-8 h-8 text-indigo-300" />,
    title: 'AI Psychic Advisor',
    description: 'Pose your questions to the digital ether. Our AI oracle offers quick, channeled insights for your spiritual journey. A modern twist on ancient divination, available anytime.',
    price: 'Interactive'
  },
  {
    icon: <UserIcon className="w-8 h-8 text-teal-300" />,
    title: 'In-Person Reading',
    description: 'Experience a deep, personal connection with a one-on-one psychic medium reading with Kendra. These sessions offer the most profound insights and direct channeling in a serene, private setting.',
    price: 'Starting at $250'
  },
  {
    icon: <VideoIcon className="w-8 h-8 text-sky-300" />,
    title: 'Virtual FaceTime Reading',
    description: 'Connect with Kendra from anywhere in the world through a live video session. Receive guidance and messages from the comfort of your home. *Disclaimer: Virtual readings may not be as in-depth as in-person sessions.*',
    price: 'Starting at $180'
  },
  {
    icon: <PaletteIcon className="w-8 h-8 text-pink-300" />,
    title: 'Spiritual Art Commissions',
    description: 'Commission a unique piece of spiritual art. Kendra channels visions and energies into beautiful digital paintings that resonate with your personal journey or specific intentions.',
    price: 'Starting at $150'
  },
  {
    icon: <WandSparklesIcon className="w-8 h-8 text-purple-300" />,
    title: 'Creator Toolkit Access',
    description: 'For fellow mystics and creators. Gain access to an exclusive AI-powered toolkit to generate comprehensive YouTube channel blueprints, content strategies, and automation workflows.',
    price: 'Admin Access'
  }
];

const futureServices: Service[] = [
  {
    icon: <BrainCircuitIcon className="w-8 h-8 text-cyan-300" />,
    title: 'AI Dream Interpreter',
    description: 'Upload your dream journal entries and receive AI-driven interpretations based on archetypal symbolism and psychological models. Uncover the hidden messages of your subconscious.'
  },
  {
    icon: <WandSparklesIcon className="w-8 h-8 text-amber-300" />,
    title: 'AI Sigil Generator',
    description: 'Describe your intention, and our AI will generate unique, potent sigils for your magical practice. Transform your desires into powerful symbols ready for activation.'
  },
  {
    icon: <StarIcon className="w-8 h-8 text-yellow-300" />,
    title: 'AI Astrological Narrator',
    description: 'Generate a personalized audio narration of your natal chart. Hear the story of your celestial blueprint, explaining planetary placements and their influence in an enchanting format.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigateToToolkit }) => {
  return (
    <motion.div
      key="services-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold font-fancy mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Where Mysticism Meets Modernity
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Welcome to The Enigma Channel. I'm Kendra, a psychic medium and artist dedicated to exploring the unseen. Here, ancient wisdom is woven with modern technology to guide and inspire your spiritual path.
        </p>
      </motion.section>
      
      {/* Bio Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="text-center bg-gray-800/50 p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/20"
      >
        <motion.div variants={itemVariants}>
          <h3 className="text-3xl font-fancy font-bold text-purple-300 mb-3">Meet Kendra Collier</h3>
          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
            As a natural-born psychic and medium, I've always been connected to the spiritual realm. My art is a direct extension of this connection, a way to make the intangible tangible. The Enigma Channel is my platform to share these gifts, offering readings, art, and innovative tools like the Creator Toolkit to empower others on their own mystical journeys.
          </p>
        </motion.div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="text-4xl font-fancy font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Offerings</h3>
        <div className="grid md:grid-cols-1 gap-8">
          {services.map((service, index) => {
            if (service.title === 'AI Psychic Advisor') {
              return <AIPsychic key={index} service={service} />;
            }

            const isToolkitCard = service.title === 'Creator Toolkit Access';
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-gray-800/50 p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/20 transform hover:-translate-y-2 transition-transform duration-300 ${isToolkitCard ? 'cursor-pointer' : ''}`}
                onClick={isToolkitCard ? onNavigateToToolkit : undefined}
              >
                <div className="flex items-center gap-4 mb-4">
                  {service.icon}
                  <h4 className="text-2xl font-bold font-fancy text-gray-100">{service.title}</h4>
                </div>
                <p className="text-gray-400 mb-4 whitespace-pre-wrap">{service.description}</p>
                <div className="text-right font-fancy text-lg text-pink-400">{service.price}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
      
       {/* Future Visions Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="text-4xl font-fancy font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Future Visions</h3>
        <div className="grid md:grid-cols-1 gap-8">
          {futureServices.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800/50 p-8 rounded-3xl border border-dashed border-white/10 shadow-xl shadow-black/20 opacity-75"
            >
              <div className="flex items-center gap-4 mb-4">
                {service.icon}
                <h4 className="text-2xl font-bold font-fancy text-gray-100">{service.title}</h4>
              </div>
              <p className="text-gray-400 mb-4 whitespace-pre-wrap">{service.description}</p>
              <div className="text-right font-fancy text-lg text-purple-400">Coming Soon</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </motion.div>
  );
};

export default ServicesPage;