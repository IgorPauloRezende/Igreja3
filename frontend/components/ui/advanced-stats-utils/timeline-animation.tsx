import React from 'react';
import { motion, type Variants } from 'motion/react';

interface TimelineAnimationProps {
  children: React.ReactNode;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(custom * 0.06, 0.36),
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function TimelineAnimation({
  children,
  animationNum = 0,
  className,
}: TimelineAnimationProps) {
  return (
    <motion.div
      custom={animationNum}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
