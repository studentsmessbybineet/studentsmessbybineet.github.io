// src/LoadingScreen.js
import React from 'react';
import { motion } from 'framer-motion';

const loadingContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const LoadingScreen = () => (
  <motion.div
    className="flex flex-col gap-8 items-center justify-center h-screen bg-black text-center"
    variants={loadingContainerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    <h1 className="text-white text-4xl">Preferences for Students Mess</h1>
    <h2 className="text-gray-200 text-2xl">By Bineet</h2>
  </motion.div>
);

export default LoadingScreen;
