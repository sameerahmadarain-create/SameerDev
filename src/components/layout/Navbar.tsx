import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, PRIMARY_CTA } from '../../data/navigation';
import { Menu, X, ArrowUpRight, Lock } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface NavbarProps {
  onNavigate?: (href: string) => void;
  currentHash?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentHash = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0d0907]/92 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/50 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick('#home', e)}
            className="group flex items-center gap-1.5 text-xl font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md transition-transform duration-200 hover:scale-[1.02]"
            aria-label="SameerDev Home"
          >
            <span className="font-extrabold tracking-tight">
              Sameer<span className="text-sky-400 transition-colors duration-200 group-hover:text-sky-300">Dev</span>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" aria-hidden="true" />
          </a>

          {/* Zone 2: Desktop Navigation Links (Unboxed clean typography with animated indicator) */}
          <nav
            className="hidden md:flex items-center gap-8 text-sm font-medium"
            aria-label="Primary Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentHash === item.href || (item.href === '#home' && !currentHash);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(item.href, e)}
                  className={`relative py-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm group ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Subtle hover underline */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)] scale-x-100'
                        : 'bg-stone-500 scale-x-0 group-hover:scale-x-75 group-hover:bg-sky-400/60'
                    }`}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Admin & Primary Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/admin"
              onClick={(e) => handleLinkClick('/admin', e)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-200 hover:text-sky-300 bg-white/[0.04] hover:bg-sky-500/10 border border-white/[0.1] hover:border-sky-400/40 rounded-lg btn-micro-fx focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin</span>
            </a>

            <a
              href={PRIMARY_CTA.href}
              onClick={(e) => handleLinkClick(PRIMARY_CTA.href, e)}
              className="group relative inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg btn-micro-fx shadow-md shadow-amber-400/25 hover:shadow-amber-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0907] whitespace-nowrap"
            >
              <span>{PRIMARY_CTA.label}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/[0.05] active:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#0d0907]/98 backdrop-blur-xl border-t border-white/[0.08] z-40 px-6 py-8 flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col space-y-3">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = currentHash === item.href || (item.href === '#home' && !currentHash);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(item.href, e)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={`text-lg font-medium py-3 px-3.5 rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'text-sky-300 bg-sky-500/10 font-semibold border border-sky-400/25'
                      : 'text-stone-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/[0.08] mt-6 space-y-3">
            <a
              href="/admin"
              onClick={(e) => handleLinkClick('/admin', e)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 rounded-xl btn-micro-fx focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Panel</span>
            </a>

            <a
              href={PRIMARY_CTA.href}
              onClick={(e) => handleLinkClick(PRIMARY_CTA.href, e)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl btn-micro-fx shadow-lg shadow-amber-400/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span>{PRIMARY_CTA.label}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
