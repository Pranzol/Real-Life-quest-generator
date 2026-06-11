import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Shield, LogOut, Trophy, Award, Sparkles, LayoutDashboard, Coins } from 'lucide-react';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1.5
    ${isActive(path) 
      ? 'text-rpg-purple-light text-glow-purple bg-rpg-purple/10 border border-rpg-purple/30' 
      : 'text-gray-300 hover:text-white hover:bg-rpg-purple/5 border border-transparent'}
  `;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-rpg-border/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-wider">
              <Shield className="w-7 h-7 text-rpg-purple animate-pulse" />
              <span className="bg-gradient-to-r from-rpg-purple-glow via-rpg-blue-glow to-rpg-gold-glow bg-clip-text text-transparent">
                RealLife Quest
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/shop" className={linkClass('/shop')}>
                  <Coins className="w-4 h-4 text-rpg-gold" />
                  Gold Shop
                </Link>
                <Link to="/boss" className={linkClass('/boss')}>
                  <Sparkles className="w-4 h-4" />
                  Boss Challenges
                </Link>
                <Link to="/leaderboard" className={linkClass('/leaderboard')}>
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </Link>
                {user?.email === 'admin@rpgquest.com' && (
                  <Link to="/admin" className={linkClass('/admin')}>
                    <Award className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                
                <div className="h-6 w-px bg-rpg-border/50 mx-2" />

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end text-xs">
                    <span className="font-semibold text-gray-200">{user?.name}</span>
                    <div className="flex items-center gap-1 leading-none mt-0.5">
                      <span className="text-rpg-gold font-bold">Lvl {user?.level || 1}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-0.5" title="Gold Coins">
                        <Coins className="w-3 h-3 text-rpg-gold fill-current" />
                        {user?.gold !== undefined ? user.gold : 100} GP
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-rpg-danger/10 hover:bg-rpg-danger/20 border border-rpg-danger/20 text-rpg-danger transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">How It Works</a>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Login</Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-rpg-purple to-rpg-blue hover:from-rpg-purple-light hover:to-rpg-blue-light text-white text-sm font-bold shadow-purple-glow hover:scale-105 transition-all duration-300 border border-rpg-purple/30"
                >
                  Start Your Journey
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-rpg-purple/10 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-rpg-border/20 px-2 pt-2 pb-3 space-y-1">
          {token ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                Dashboard
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10 flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4 text-rpg-gold" />
                Gold Shop ({user?.gold} GP)
              </Link>
              <Link
                to="/boss"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                Boss Challenges
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                Leaderboard
              </Link>
              {user?.email === 'admin@rpgquest.com' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-rpg-danger hover:bg-rpg-danger/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="#features"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                How It Works
              </a>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-rpg-purple/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-center bg-gradient-to-r from-rpg-purple to-rpg-blue text-white"
              >
                Start Your Journey
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
