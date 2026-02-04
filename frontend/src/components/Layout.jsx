import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackClick, trackPageView } from '../lib/analytics';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import ApiDiagnostics from './ApiDiagnostics';

// Google Form URL for volunteer signup
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScZbG2bCzNGf6AAaYzV9y8d9aVOJxct7El-m1MT92IlkDOy0w/viewform?usp=preview';

// Correct Socialist rose SVG - from attached file
const ROSE_SVG_URL = 'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/utxrrbqv_Red_Rose_%28Socialism%29.svg';

const navLinks = [
  { path: '/', label: 'HOME', external: false },
  { path: '/about', label: 'ABOUT', external: false },
  { path: '/films', label: 'FILMS', external: false },
  { path: '/music', label: 'MUSIC', external: false },
  { path: '/events', label: 'EVENTS', external: false },
  { path: '/action', label: 'ACTION', external: false },
  { path: 'https://paperboyprince.shop', label: 'SHOP', external: true },
];

const Layout = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleJoinUsClick = () => {
    trackClick('join_us_nav', location.pathname);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 mx-4 rounded-full border-2 border-black bg-white/95 backdrop-blur-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-pp-magenta">
              <img 
                src="https://customer-assets.emergentagent.com/job_prince-engage/artifacts/hk4rzvx8_PaperboyPrince_PrimaryLogo-06.png"
                alt="Paperboy Prince Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-campaign text-xl tracking-wider hidden sm:block">PAPERBOY PRINCE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.path}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link font-campaign text-lg tracking-widest transition-colors text-black hover:text-pp-magenta"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link font-campaign text-lg tracking-widest transition-colors ${
                    location.pathname === link.path ? 'text-pp-magenta' : 'text-black hover:text-pp-magenta'
                  }`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin-only menu (only shows if logged in as admin) */}
            {isAuthenticated && isAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-2 border-black gap-2"
                    data-testid="admin-menu-button"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-2 border-black">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="cursor-pointer" data-testid="admin-dashboard-link">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/analytics" className="cursor-pointer" data-testid="admin-analytics-link">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600" data-testid="logout-button">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* JOIN US button - opens Google Form (for non-authenticated users) */
              <a 
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleJoinUsClick}
                data-testid="join-us-button"
              >
                <Button className="rounded-full bg-pp-magenta text-white font-bold px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                  JOIN US
                </Button>
              </a>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] border-l-2 border-black">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    link.external ? (
                      <a
                        key={link.path}
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-campaign text-2xl tracking-wider text-black"
                        data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-campaign text-2xl tracking-wider ${
                          location.pathname === link.path ? 'text-pp-magenta' : 'text-black'
                        }`}
                        data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                  {/* Mobile JOIN US - opens Google Form */}
                  {!isAuthenticated && (
                    <a
                      href={GOOGLE_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        trackClick('join_us_mobile', location.pathname);
                      }}
                      className="font-campaign text-2xl tracking-wider text-pp-magenta"
                      data-testid="mobile-join-us-link"
                    >
                      JOIN US
                    </a>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      
      {/* API Diagnostics (Admin Only) */}
      <ApiDiagnostics />

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Tagline */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pp-magenta rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_prince-engage/artifacts/hk4rzvx8_PaperboyPrince_PrimaryLogo-06.png"
                    alt="Paperboy Prince Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="font-campaign text-2xl tracking-wider">PAPERBOY PRINCE</span>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-primary text-gray-400 max-w-md">
                  Spreading love, building community, and creating change. Join the movement.
                </p>
                {/* Socialist Rose - small circular icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center" title="Democratic Socialist">
                  <img 
                    src={ROSE_SVG_URL}
                    alt="Socialist Rose"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Hide if image fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-campaign text-lg tracking-wider mb-4 text-pp-pink">QUICK LINKS</h4>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.path}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-primary text-gray-400 hover:text-pp-pink transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="font-primary text-gray-400 hover:text-pp-pink transition-colors"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className="font-campaign text-lg tracking-wider mb-4 text-pp-pink">GET INVOLVED</h4>
              <div className="flex flex-col gap-2">
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('volunteer_footer', location.pathname)}
                  className="font-primary text-gray-400 hover:text-pp-pink transition-colors"
                >
                  VOLUNTEER
                </a>
                <a
                  href="https://secure.actblue.com/donate/paperboy-love-prince-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('donate_footer', location.pathname)}
                  className="font-primary text-gray-400 hover:text-pp-pink transition-colors"
                >
                  DONATE
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="love-beam mt-8 mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-primary text-sm text-gray-500">
              © 2025 Paperboy Prince. All rights reserved.
            </p>
            <p className="font-secondary text-pp-magenta text-lg">
              SPREAD LOVE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
