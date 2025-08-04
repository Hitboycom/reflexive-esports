import React, { useState, useEffect } from 'react';
import './IntroLogo.css';

const IntroLogo = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('pulse');
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2500);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`intro-logo-overlay ${animationPhase}`}>
      <div className="intro-logo-container">
        {/* Background effects */}
        <div className="intro-bg-effects">
          <div className="intro-circuit-lines"></div>
          <div className="intro-particles"></div>
          <div className="intro-glow-orb"></div>
        </div>

        {/* Text animation */}
        <div className="intro-text-container">
          <div className="intro-text-main">REFLEXIVE</div>
          <div className="intro-text-sub">ESPORTS</div>
        </div>

        {/* Loading bar */}
        <div className="intro-loading-container">
          <div className="intro-loading-bar">
            <div className="intro-loading-progress"></div>
          </div>
          <div className="intro-loading-text">INITIALIZING...</div>
        </div>
      </div>
    </div>
  );
};

export default IntroLogo;


