import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { XIcon, UserIcon } from './Icons';
import type { User } from '../types';
import { ADMIN_USER } from '../constants';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } },
  };

  const getUsers = (): User[] => {
    const users = localStorage.getItem('enigmaUsers');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('enigmaUsers', JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Admin login check
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        onAuthSuccess(ADMIN_USER);
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      onAuthSuccess(user);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email === ADMIN_USER.email) {
      setError('This email address is reserved. Please use another.');
      return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      setError('An account with this email already exists.');
      return;
    }
    
    const newUser: User = { email, password, role: 'user' };
    saveUsers([...users, newUser]);
    onAuthSuccess(newUser);
  };
  
  const switchMode = () => {
    setError(null);
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm bg-gray-900/90 border border-purple-500/30 shadow-2xl shadow-purple-900/20 rounded-2xl p-8"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex justify-center mb-6">
            <UserIcon className="w-16 h-16 text-purple-400 p-3 bg-gray-800/50 rounded-full border border-purple-500/30" />
        </div>

        <h2 className="text-3xl font-fancy text-center text-purple-300 mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800/70 border border-purple-500/30 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/70 border border-purple-500/30 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-colors"
              required
            />
          </div>
          
          {error && <p className="text-center text-sm text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>}
          
          <button
            type="submit"
            className="font-fancy font-bold w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button onClick={switchMode} className="font-semibold text-purple-400 hover:text-pink-400 ml-1">
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;