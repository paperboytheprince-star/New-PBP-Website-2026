import { useState, useEffect } from 'react';

// Fist logo URL (uploaded asset)
const FIST_LOGO_URL = 'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/0zxb528i_3365B29C-5E02-4828-9D32-4AE42AE27C80.png';

// Original Paperboy logo URL
const PAPERBOY_LOGO_URL = 'https://customer-assets.emergentagent.com/job_prince-engage/artifacts/hk4rzvx8_PaperboyPrince_PrimaryLogo-06.png';

/**
 * RotatingLogo - Periodically flips between two logos with a 3D animation
 * Shows the original logo for 12 seconds, then flips to fist logo for 1.8 seconds
 * Supports prefers-reduced-motion (disables animation)
 */
const RotatingLogo = () => {
  const [isFlipped, setIsFlipped] = useState(false);
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

    // Timer logic: show original for 12s, flip for 1.8s
    const SHOW_ORIGINAL_MS = 12000;
    const SHOW_FIST_MS = 1800;

    let timeout;

    const startCycle = () => {
      // Show original logo
      setIsFlipped(false);
      timeout = setTimeout(() => {
        // Flip to fist logo
        setIsFlipped(true);
        timeout = setTimeout(() => {
          // Start cycle again
          startCycle();
        }, SHOW_FIST_MS);
      }, SHOW_ORIGINAL_MS);
    };

    startCycle();

    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  // If reduced motion is preferred, just show original logo
  if (prefersReducedMotion) {
    return (
      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-pp-magenta">
        <img 
          src={PAPERBOY_LOGO_URL}
          alt="Paperboy Prince Logo"
          className="w-8 h-8 object-contain"
        />
      </div>
    );
  }

  return (
    <div 
      className="w-10 h-10 rounded-full overflow-hidden bg-pp-magenta"
      style={{ 
        perspective: '600px',
        position: 'relative',
      }}
    >
      {/* Inner container that flips */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 650ms ease-in-out',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front - Original Paperboy Logo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <img 
            src={PAPERBOY_LOGO_URL}
            alt="Paperboy Prince Logo"
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Back - Fist Logo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <img 
            src={FIST_LOGO_URL}
            alt="Solidarity Fist"
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default RotatingLogo;
