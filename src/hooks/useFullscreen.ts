import { useState, useEffect, useCallback } from 'react';
import {
  isFullscreenActive,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen
} from '../utils/fullscreen';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => isFullscreenActive());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggle = useCallback(() => {
    toggleFullscreen();
  }, []);

  const handleEnter = useCallback(() => {
    enterFullscreen();
  }, []);

  const handleExit = useCallback(() => {
    exitFullscreen();
  }, []);

  return {
    isFullscreen,
    toggleFullscreen: handleToggle,
    enterFullscreen: handleEnter,
    exitFullscreen: handleExit
  };
}
