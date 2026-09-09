import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

export function TransitionPanel({
  activeIndex,
  children,
  className = '',
  transition = { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
}) {
  const items = React.Children.toArray(children);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
          transition={transition}
        >
          {items[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
