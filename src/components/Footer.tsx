import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertCircle, Sparkles, Mail, Globe } from 'lucide-react';
import { LegalModal, LegalDocType } from './LegalModal';
import { APP_VERSION } from '../version';

interface FooterProps {
  compact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  const [modalDoc, setModalDoc] = useState<LegalDocType | null>(null);

  return (
    <>
      <footer className="border-t-2 border-[#FFD93D] bg-white py-4 px-4 sm:px-6 text-center text-xs text-[#4A4A4A]">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Main Footer Note */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 font-bold text-slate-600">
            <span>Reading Buddy {APP_VERSION}</span>
            <span>•</span>
            <span>Early Childhood Fluency</span>
            <span>•</span>
            <span className="text-[#4D96FF] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 inline" /> Local & Private
            </span>
          </div>

          {/* Short Disclaimer on screen */}
          {!compact && (
            <p className="text-[11px] text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Reading Buddy is an educational practice aid and not a substitute for professional classroom instruction. All profiles, stars, and reading progress are stored locally on your device—clearing your browser data will reset your saved history.
            </p>
          )}

          {/* Links that open Modal Dialogs */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-1 text-xs font-bold">
            <button
              type="button"
              id="footer-terms-btn"
              onClick={() => setModalDoc('terms')}
              className="text-slate-600 hover:text-[#4D96FF] hover:underline transition cursor-pointer inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[#4D96FF]" />
              <span>Terms of Service</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => setModalDoc('privacy')}
              className="text-slate-600 hover:text-[#6BCB77] hover:underline transition cursor-pointer inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#6BCB77]" />
              <span>Privacy Policy</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              id="footer-disclaimer-btn"
              onClick={() => setModalDoc('disclaimer')}
              className="text-slate-600 hover:text-[#D4A017] hover:underline transition cursor-pointer inline-flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>Disclaimer</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              id="footer-email-btn"
              onClick={() => setModalDoc('contact')}
              className="text-slate-600 hover:text-[#4D96FF] hover:underline transition cursor-pointer inline-flex items-center gap-1"
              title="Email: thomas@solinap.io"
            >
              <Mail className="w-3.5 h-3.5 text-[#4D96FF]" />
              <span>Email: thomas@solinap.io</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              id="footer-website-btn"
              onClick={() => setModalDoc('website')}
              className="text-slate-600 hover:text-teal-600 hover:underline transition cursor-pointer inline-flex items-center gap-1"
              title="Website: reading-buddy@solinap.io"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Website: reading-buddy@solinap.io</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Dialog */}
      <LegalModal
        isOpen={modalDoc !== null}
        activeDoc={modalDoc || 'terms'}
        onClose={() => setModalDoc(null)}
        onSelectDoc={(doc) => setModalDoc(doc)}
      />
    </>
  );
};

