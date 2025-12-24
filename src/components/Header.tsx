import { Link, useLocation } from 'react-router-dom';
import { WalletButton, NetworkBanner } from './WalletButton';
import { motion } from 'framer-motion';
import { Gamepad2, Map, Scroll, BookOpen } from 'lucide-react';

export function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Quests', icon: Scroll },
    { path: '/journey', label: 'My Journey', icon: Map },
  ];

  return (
    <>
      <NetworkBanner />
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center"
              >
                <Gamepad2 className="w-6 h-6 text-background" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg font-bold text-foreground">YIELD QUEST</h1>
                <p className="text-xs text-foreground/50 -mt-0.5">RPG ON MANTLE</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive 
                        ? 'text-foreground bg-foreground/10' 
                        : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="https://docs.mantle.xyz/network"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-foreground/50 hover:text-foreground hover:bg-foreground/5"
              >
                <BookOpen className="w-4 h-4" />
                Learn
              </a>
            </nav>

            {/* Wallet */}
            <WalletButton />
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center justify-center gap-2 pb-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive 
                      ? 'text-foreground bg-foreground/10 border border-foreground/20' 
                      : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.header>
    </>
  );
}
