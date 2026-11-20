import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const WHATSAPP_NUMBER = '923087628720';
const DEFAULT_WHATSAPP_MESSAGE = 'Hello Sameer, I would like to discuss a website project with you.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Smooth client-side submission handler
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 550);
  };

  const getCustomWhatsAppUrl = () => {
    const text = `Hello Sameer, my name is ${formData.name.trim()} (${formData.email.trim()}).\n\nProject details: ${formData.message.trim()}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`Website Project Inquiry from ${formData.name.trim()}`);
    const body = encodeURIComponent(
      `Hello Sameer,\n\nName: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nMessage:\n${formData.message.trim()}`
    );
    return `mailto:sameerahmadarain@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="scroll-mt-20 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative overflow-hidden"
      aria-label="Contact Sameer"
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/[0.04] via-sky-500/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div 
          className={`space-y-12 transition-all duration-700 ease-out ${
            prefersReducedMotion || isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
              <span>Get In Touch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Contact
            </h2>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              Have a project in mind or need a modern website built? Reach out directly via WhatsApp or send a message below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Direct WhatsApp & Info Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Highlight Box */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-[#1c140f] to-[#140e0b] border border-amber-400/30 shadow-2xl shadow-black/80 space-y-6 hover:border-amber-400/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Instant WhatsApp Chat
                    </h3>
                    <p className="text-xs text-stone-400">
                      Direct response for project inquiries
                    </p>
                  </div>
                </div>

                <p className="text-sm text-stone-300 leading-relaxed">
                  Start a direct conversation right now on WhatsApp. Click below to launch with a pre-filled message.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl btn-micro-fx shadow-lg shadow-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Me</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl btn-micro-fx shadow-lg shadow-amber-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Hire Me</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-stone-400">
                  <span className="font-mono">WhatsApp: 03087628720</span>
                  <span className="text-stone-500">·</span>
                  <span>PK (+92)</span>
                </div>
              </div>

              {/* Notice regarding response time */}
              <div className="p-5 rounded-xl bg-[#140e0b]/80 border border-white/[0.08] text-xs text-stone-400 leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  For fastest response regarding timelines, scope, and technical requirements, WhatsApp is recommended.
                </span>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-2xl bg-[#140e0b]/85 border border-white/[0.08] hover:border-sky-400/25 transition-colors shadow-2xl shadow-black/80">
                
                {isSubmitted ? (
                  /* Success Feedback State with Real Options */
                  <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Message Prepared Successfully!
                      </h3>
                      <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                        Thank you, <strong className="text-white">{formData.name}</strong>. Because this is a static client application, you can now transfer your message directly to Sameer via your preferred channel:
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={getCustomWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl btn-micro-fx shadow-md shadow-emerald-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send via WhatsApp</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>

                      <a
                        href={getMailtoUrl()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl btn-micro-fx shadow-md shadow-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email Client</span>
                      </a>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-stone-400 hover:text-white underline underline-offset-4 transition-colors"
                      >
                        Write another message
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Form State */
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                        Send a Message
                      </h3>
                      <p className="text-xs text-stone-400">
                        Fill in your details below to discuss your project requirements.
                      </p>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-name" 
                        className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
                      >
                        Your Name <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="contact-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: undefined });
                          }}
                          placeholder="Sameer Ahmad"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0907] border text-sm text-white placeholder-stone-600 focus:outline-none transition-all ${
                            errors.name 
                              ? 'border-red-500/70 focus:border-red-500 ring-2 ring-red-500/20' 
                              : 'border-white/[0.1] focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                          }`}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          required
                        />
                      </div>
                      {errors.name && (
                        <p id="contact-name-error" className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-email" 
                        className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
                      >
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="you@company.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0907] border text-sm text-white placeholder-stone-600 focus:outline-none transition-all ${
                            errors.email 
                              ? 'border-red-500/70 focus:border-red-500 ring-2 ring-red-500/20' 
                              : 'border-white/[0.1] focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                          }`}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          required
                        />
                      </div>
                      {errors.email && (
                        <p id="contact-email-error" className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className="space-y-1.5">
                      <label 
                        htmlFor="contact-message" 
                        className="block text-xs font-semibold text-stone-300 uppercase tracking-wider"
                      >
                        Message <span className="text-amber-400">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          if (errors.message) setErrors({ ...errors, message: undefined });
                        }}
                        placeholder="Tell me about your project, goals, or requirements..."
                        className={`w-full px-4 py-3 rounded-xl bg-[#0d0907] border text-sm text-white placeholder-stone-600 focus:outline-none transition-all resize-y ${
                          errors.message 
                            ? 'border-red-500/70 focus:border-red-500 ring-2 ring-red-500/20' 
                            : 'border-white/[0.1] focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                        }`}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        required
                      />
                      {errors.message && (
                        <p id="contact-message-error" className="text-xs text-red-400 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl btn-micro-fx shadow-lg shadow-amber-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
