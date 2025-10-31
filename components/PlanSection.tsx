
import React, { useState } from 'react';
import { ChevronDownIcon } from './Icons';

interface PlanSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const PlanSection: React.FC<PlanSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-purple-500/30 bg-gray-800/50 rounded-2xl overflow-hidden shadow-xl shadow-purple-900/10">
      <button
        className="w-full px-6 py-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-4">
          <span className="text-purple-400">{icon}</span>
          <h2 className="text-xl font-bold font-fancy text-gray-100">{title}</h2>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PlanSection;
