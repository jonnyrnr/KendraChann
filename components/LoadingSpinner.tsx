
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-500"
    >
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g className="spinner_V8m1">
        <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="3" stroke="url(#spinner-gradient)"></circle>
      </g>
      <style>{`
        .spinner_V8m1 {
          transform-origin: center;
          animation: spinner_zKoa 2s linear infinite;
        }
        .spinner_V8m1 circle {
          stroke-linecap: round;
          animation: spinner_YpZS 1.5s ease-in-out infinite;
        }
        @keyframes spinner_zKoa {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes spinner_YpZS {
          0% {
            stroke-dasharray: 0.15, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -15;
          }
          100% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -125;
          }
        }
      `}</style>
    </svg>
  );
};

export const SkeletonLine: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = '100%', height = '1rem', className = '' }) => {
    return (
        <div
            className={`bg-gray-700/50 rounded animate-pulse ${className}`}
            style={{ width, height }}
        />
    );
};


export default LoadingSpinner;
