import { useState, useEffect } from 'react';
import profileImage from '@/assets/ahmed-new-profile.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Profile image with glow effect */}
      <div className="relative animate-scale-in">
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-110 animate-pulse" />
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl">
          <img 
            src={profileImage} 
            alt="Ahmed Ali Mughal" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Name and title */}
      <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Ahmed Ali Mughal
        </h1>
        <p className="mt-2 text-muted-foreground">
          Full Stack Developer
        </p>
      </div>

      {/* Loading indicator */}
      <div className="mt-8 flex space-x-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default SplashScreen;
