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
    className="flex items-center justify-center h-screen bg-blue-500"
    variants={loadingContainerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    <h1 className="text-white text-4xl">Loading...</h1>
  </motion.div>
);

export default LoadingScreen;
