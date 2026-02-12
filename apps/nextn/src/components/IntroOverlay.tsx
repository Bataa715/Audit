'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const IntroOverlay = () => {
  const pathname = usePathname();
  // Key state to force re-render and re-trigger animation
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Increment key on pathname change to restart the animation
    setAnimationKey(prevKey => prevKey + 1);
  }, [pathname]);

  return (
    <div key={animationKey}>
      <motion.div
        className="fixed top-0 left-0 w-full h-full bg-primary z-[101]"
        initial={{ y: '0%' }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-full h-full bg-black z-[100]"
        initial={{ y: '0%' }}
        animate={{ y: '-100%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
    </div>
  );
};

export default IntroOverlay;
