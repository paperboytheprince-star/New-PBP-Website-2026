import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, User, LogOut, Settings, Heart } from 'lucide-react';
import ApiDiagnostics from './ApiDiagnostics';

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

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="rounded-full border-2 border-black gap-2"
                      data-testid="user-menu-button"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 border-2 border-black">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer" data-testid="profile-link">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="cursor-pointer" data-testid="admin-dashboard-link">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600" data-testid="logout-button">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login" data-testid="login-button">
                <Button className="rounded-full bg-pp-magenta text-white font-bold px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                  JOIN US
                </Button>
              </Link>
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
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-campaign text-2xl tracking-wider text-pp-magenta"
                      data-testid="mobile-login-link"
                    >
                      JOIN US
                    </Link>
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
              <p className="font-primary text-gray-400 max-w-md">
                Spreading love, building community, and creating change. Join the movement.
              </p>
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
