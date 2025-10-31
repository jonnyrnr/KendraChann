import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getPsychicReading } from '../services/geminiService';
import { WandSparklesIcon } from './Icons';
import type { Service } from '../types';

interface AIPsychicProps {
  service: Service;
}

const AIPsychic: React.FC<AIPsychicProps> = ({ service }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setAnswer('');
    setError('');
    
    abortControllerRef.current = new AbortController();

    try {
      const stream = await getPsychicReading(question);
      let text = '';
      for await (const chunk of stream) {
         if (abortControllerRef.current.signal.aborted) {
            console.log("Stream aborted");
            break;
         }
         text += chunk.text;
         setAnswer(text);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const ThinkingAnimation = () => (
    <div className="flex items-center space-x-1">
      <motion.div
        className="w-2 h-2 bg-purple-300 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-purple-300 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-purple-300 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
      }}
      className="bg-gray-800/50 p-8 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-900/30 overflow-hidden"
    >
      <div className="flex items-center gap-4 mb-4">
        {service.icon}
        <h4 className="text-2xl font-bold font-fancy text-gray-100">{service.title}</h4>
      </div>
      <p className="text-gray-400 mb-6">{service.description}</p>
      
      <form onSubmit={handleQuestionSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question..."
            disabled={isLoading}
            className="flex-grow bg-gray-900/50 border border-purple-500/30 rounded-full p-3 px-5 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all duration-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="font-fancy font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <WandSparklesIcon className="w-5 h-5 mr-2" />
            Consult
          </button>
        </div>
      </form>
      
      {(isLoading || answer || error) && (
        <div className="mt-6 p-4 bg-gray-900/30 rounded-xl min-h-[6rem] border border-white/5">
          {isLoading && !answer && (
            <div className="flex items-center space-x-3 text-gray-400">
                <ThinkingAnimation />
                <span>The Oracle is contemplating...</span>
            </div>
          )}
          {error && <p className="text-red-400">{error}</p>}
          {answer && <p className="text-purple-200 font-fancy text-lg whitespace-pre-wrap">{answer}{!isLoading && <span className="inline-block w-0.5 h-5 bg-purple-200 ml-1 animate-pulse"></span>}</p>}
        </div>
      )}
    </motion.div>
  );
};

export default AIPsychic;
