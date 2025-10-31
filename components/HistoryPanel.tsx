import React from 'react';
import { motion, Variants } from 'framer-motion';
import type { SavedPlan } from '../types';
import { Trash2Icon, XIcon } from './Icons';

interface HistoryPanelProps {
  plans: SavedPlan[];
  onLoad: (plan: SavedPlan) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ plans, onLoad, onDelete, onClose }) => {
  // FIX: Explicitly type the variant objects with `Variants` from framer-motion.
  // This helps TypeScript correctly infer properties like `transition.type` as a specific
  // literal type (e.g., 'spring') instead of a generic `string`, resolving the type error.
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const panelVariants: Variants = {
    hidden: { x: '100%' },
    visible: { x: '0%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: '100%', transition: { duration: 0.2 } },
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md h-full bg-gray-900/95 backdrop-blur-sm border-l border-purple-500/30 shadow-2xl shadow-purple-900/20 flex flex-col"
        variants={panelVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-purple-500/20">
          <h2 className="text-2xl font-fancy text-purple-300">Saved Blueprints</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {plans.length === 0 ? (
            <div className="text-center text-gray-500 pt-10">
              <p>No blueprints saved yet.</p>
              <p className="text-sm">Generate a plan and save it to see it here.</p>
            </div>
          ) : (
            plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/60 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition-colors group cursor-pointer"
                onClick={() => onLoad(plan)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-200 truncate pr-2">
                      {plan.request}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(plan.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(plan.id);
                    }}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-red-900/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete plan"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoryPanel;