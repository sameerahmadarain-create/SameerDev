import React from 'react';
import { NAV_ITEMS } from '../../data/navigation';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface FooterProps {
  onNavigate?: (href: string) => void;
}

const WHATSAPP_NUMBER = '923087628720';
const DEFAULT_WHATSAPP_MESSAGE = 'Hello Sameer, I would like to discuss a website project with you.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const prefersReducedMotion = useReducedMotion();

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
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
    <footer className="border-t border-white/[0.08] bg-[#0a0705] py-16 px-4 sm:px-6 lg:px-8 text-stone-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="#home"
              onClick={(e) => handleLinkClick('#home', e)}
              className="inline-flex items-center gap-1.5 text-xl font-bold tracking-tight text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md transition-transform duration-200 hover:scale-[1.02]"
            >
              <span className="font-extrabold tracking-tight">
                Sameer<span className="text-sky-400">Dev</span>
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]" aria-hidden="true" />
            </a>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Professional web developer creating modern, responsive, and performance-focused websites and web applications.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleLinkClick(item.href, e)}
                  className="text-stone-300 hover:text-white hover:translate-x-0.5 transition-all py-1"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp CTA */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Direct Inquiry
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Available for modern web development collaborations.
            </p>
            <div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/30 hover:border-emerald-400/60 text-emerald-300 hover:bg-emerald-400/20 text-xs font-semibold btn-micro-fx shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp: 03087628720</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SameerDev. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="text-stone-600">Built with React, TypeScript &amp; Tailwind</p>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/admin');
              }}
              className="text-stone-400 hover:text-sky-400 transition-colors font-mono"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
