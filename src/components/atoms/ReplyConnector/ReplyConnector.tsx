'use client';

import { useEffect, useRef, useState } from 'react';

interface ReplyConnectorProps {
  className?: string;
  variant?: 'default' | 'terminal';
}

export function ReplyConnector({ className, variant = 'default' }: ReplyConnectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineY, setLineY] = useState(50);

  useEffect(() => {
    const updateLinePosition = () => {
      if (containerRef.current) {
        const container = containerRef.current.parentElement;
        if (container) {
          const postElement = container.querySelector('[data-testid="card"]');
          if (postElement) {
            const containerRect = container.getBoundingClientRect();
            const postRect = postElement.getBoundingClientRect();
            const postCenter = postRect.top + postRect.height / 2 - containerRect.top;
            const lineYPercent = (postCenter / containerRect.height) * 100;
            setLineY(lineYPercent);
          }
        }
      }
    };

    const observer = new ResizeObserver(updateLinePosition);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    updateLinePosition();

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <svg
        width="calc(32px + 1rem)"
        height="100%"
        viewBox="0 0 48 100"
        preserveAspectRatio="none"
        className={className}
        style={{ height: 'calc(100% + 16px)', transform: 'translateY(-16px)' }}
      >
        <defs>
          <style>{`
            .reply-line {
              stroke: currentColor;
              stroke-width: 0.5;
              fill: none;
              vector-effect: non-scaling-stroke;
            }
          `}</style>
        </defs>
        <path
          d={`M 16 0 L 16 ${lineY} L 48 ${lineY}`}
          stroke="#fff"
          strokeWidth="0.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {variant !== 'terminal' && (
          <path
            d={`M 16 ${lineY} L 16 100`}
            stroke="#fff"
            strokeWidth="0.5"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
