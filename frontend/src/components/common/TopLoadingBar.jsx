import React, { useEffect, useState } from 'react';
import '../../styles/TopLoadingBar.css';

const TopLoadingBar = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval;
    
    if (isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      
      // Professional increment logic
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + Math.random() * 10;
          if (prev < 70) return prev + Math.random() * 5;
          if (prev < 90) return prev + Math.random() * 1;
          return prev;
        });
      }, 400);
    } else {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timer);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  if (!visible && progress === 0) return null;

  return (
    <div className={`top-loading-bar-container ${visible ? 'visible' : 'fade-out'}`}>
      <div 
        className="top-loading-bar-progress" 
        style={{ '--loading-progress': `${progress}%` }}
      />
      <div className="top-loading-bar-glow" />
    </div>
  );
};

export default TopLoadingBar;
