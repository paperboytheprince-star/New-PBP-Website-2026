import { useState, useEffect } from 'react';

// Original Paperboy logo URL (same as used in navigation)
const PAPERBOY_LOGO_URL = 'https://customer-assets.emergentagent.com/job_prince-engage/artifacts/hk4rzvx8_PaperboyPrince_PrimaryLogo-06.png';

/**
 * RotatingLogo - Animated navbar logo with smooth spin
 * - Full 360° rotation every ~2 seconds with smooth easing
 * - Respects prefers-reduced-motion (disables animation)
 */
const RotatingLogo = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <>
      <style>{`
        @keyframes logoSpin {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-pp-magenta">
        <img 
          src={PAPERBOY_LOGO_URL}
          alt="Paperboy Prince Logo"
          className="w-8 h-8 object-contain"
          style={{
            animation: prefersReducedMotion ? 'none' : 'logoSpin 2s ease-in-out infinite',
          }}
        />
      </div>
    </>
  );
};

export default RotatingLogo;
