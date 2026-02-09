import { useState, useEffect } from 'react';

// Original Paperboy logo URL (same as used in navigation)
const PAPERBOY_LOGO_URL = 'https://customer-assets.emergentagent.com/job_prince-engage/artifacts/hk4rzvx8_PaperboyPrince_PrimaryLogo-06.png';

/**
 * RotatingLogo - Periodically animates the main site logo
 * Now only uses the main Paperboy logo with a subtle pulse/glow animation
 * Toggles between normal and glowing states every 3 seconds
 * Supports prefers-reduced-motion (disables animation)
 */
const RotatingLogo = () => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Toggle glow state every 3 seconds
    const interval = setInterval(() => {
      setIsGlowing((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div 
      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-pp-magenta"
      style={{ 
        transition: 'box-shadow 500ms ease-in-out, transform 500ms ease-in-out',
        boxShadow: isGlowing && !prefersReducedMotion
          ? '0 0 20px 4px rgba(255, 153, 204, 0.8), 0 0 40px 8px rgba(255, 153, 204, 0.4)'
          : '0 0 0 0 transparent',
        transform: isGlowing && !prefersReducedMotion ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <img 
        src={PAPERBOY_LOGO_URL}
        alt="Paperboy Prince Logo"
        className="w-8 h-8 object-contain"
        style={{
          transition: 'filter 500ms ease-in-out',
          filter: isGlowing && !prefersReducedMotion
            ? 'brightness(1.2) drop-shadow(0 0 4px rgba(255,255,255,0.6))'
            : 'brightness(1)',
        }}
      />
    </div>
  );
};

export default RotatingLogo;
