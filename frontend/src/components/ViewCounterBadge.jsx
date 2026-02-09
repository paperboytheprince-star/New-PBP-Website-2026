import { useState, useEffect, useCallback } from 'react';

// Pink flower asset URL (transparent)
const FLOWER_URL = 'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/utxrrbqv_Red_Rose_%28Socialism%29.svg';

// Storage key for localStorage
const STORAGE_KEY = 'pp_view_counter';

// Initial counter value
const INITIAL_COUNT = 129602;

/**
 * ViewCounterBadge - A floating badge that displays a view counter
 * - Initializes at 129,602 if no stored value
 * - Persists in localStorage
 * - Increments +1 on page load
 * - Increments +1 at random intervals (20-60s) while tab is open
 */
const ViewCounterBadge = () => {
  const [count, setCount] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Format number with commas
  const formatNumber = useCallback((num) => {
    return num.toLocaleString('en-US');
  }, []);

  // Initialize counter from localStorage
  useEffect(() => {
    setIsClient(true);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let currentCount;
      
      if (stored) {
        currentCount = parseInt(stored, 10);
        if (isNaN(currentCount)) currentCount = INITIAL_COUNT;
      } else {
        currentCount = INITIAL_COUNT;
      }
      
      // Increment by 1 on page load
      currentCount += 1;
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, currentCount.toString());
      setCount(currentCount);
    } catch (e) {
      // localStorage may be unavailable
      setCount(INITIAL_COUNT + 1);
    }
  }, []);

  // Random increment while tab is open
  useEffect(() => {
    if (!isClient || count === null) return;

    const getRandomInterval = () => {
      // Random between 20-60 seconds (20000-60000ms)
      return Math.floor(Math.random() * 40000) + 20000;
    };

    let timeout;

    const scheduleIncrement = () => {
      timeout = setTimeout(() => {
        setCount((prev) => {
          const newCount = prev + 1;
          try {
            localStorage.setItem(STORAGE_KEY, newCount.toString());
          } catch (e) {
            // Ignore localStorage errors
          }
          return newCount;
        });
        scheduleIncrement();
      }, getRandomInterval());
    };

    scheduleIncrement();

    return () => clearTimeout(timeout);
  }, [isClient, count !== null]);

  // Don't render on server
  if (!isClient || count === null) {
    return null;
  }

  return (
    <>
      {/* Desktop: Lower-left position, thinner/smaller */}
      <div className="hidden md:flex fixed bottom-6 left-6 z-40">
        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/20 px-3 py-1.5 shadow-lg flex items-center gap-2">
          {/* Flower image (smaller) */}
          <img 
            src={FLOWER_URL}
            alt=""
            className="w-5 h-5 object-contain flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }}
          />
          {/* Text content - single line */}
          <span className="text-white/70 text-xs font-primary uppercase tracking-wider">
            Views
          </span>
          <span className="text-white font-bold text-sm font-primary tabular-nums">
            {formatNumber(count)}
          </span>
        </div>
      </div>

      {/* Mobile: Lower-left position, smaller */}
      <div className="md:hidden fixed bottom-20 left-4 z-40">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border border-white/20 px-2 py-1 shadow-lg flex items-center gap-1.5">
          {/* Flower image (smaller on mobile) */}
          <img 
            src={FLOWER_URL}
            alt=""
            className="w-4 h-4 object-contain flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }}
          />
          {/* Text content - single line */}
          <span className="text-white/70 text-[10px] font-primary uppercase tracking-wider">
            Views
          </span>
          <span className="text-white font-bold text-xs font-primary tabular-nums">
            {formatNumber(count)}
          </span>
        </div>
      </div>
    </>
  );
};

export default ViewCounterBadge;
