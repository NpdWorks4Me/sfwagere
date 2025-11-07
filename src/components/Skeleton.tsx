'use client';

import React from 'react';

type SkeletonProps = {
  width: number;
  height: number;
  radius?: number;
  className?: string;
};

export default function Skeleton({ width, height, radius = 4, className = '' }: SkeletonProps) {
  return (
    <span className={`sk ${className}`}>
      <style jsx>{`
        .sk {
          display: inline-block;
          border-radius: ${radius}px;
          background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%);
          background-size: 400% 100%;
          animation: sk-shimmer 1.2s ease-in-out infinite;
          width: ${width}px;
          height: ${height}px;
        }
        @keyframes sk-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </span>
  );
}
