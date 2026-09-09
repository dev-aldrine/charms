import { motion } from 'framer-motion';
import React from 'react';

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const defaultItemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};

export function TextEffect({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  delay = 0,
}) {
  const Component = motion[as] || motion.p;
  const words = typeof children === 'string' ? children.split(' ') : [];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: per === 'word' ? 0.08 : 0.03,
        delayChildren: delay,
      },
    },
  };

  return (
    <Component
      variants={variants?.container || container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={variants?.item || defaultItemVariants}
          className="inline-block whitespace-pre"
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Component>
  );
}
