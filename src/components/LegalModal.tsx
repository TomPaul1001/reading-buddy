import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, AlertCircle, Mail, Globe, Sparkles } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  activeDoc: LegalDocType;
  onClose: () => void;
  onSelectDoc: (doc: LegalDocType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  activeDoc,
  onClose,
  onSelectDoc,
}) => {
  // Prevent background scrolling when modal is open and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-word-active"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] sm:rounded-[36px] max-w-2xl w-full max-h-[90vh] flex flex-col border-4 border-[#FFD93D] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#FFF9E5] border-b-2 border-[#FFD93D] px-5 sm:px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD93D] flex items-center justify-center text-slate-800 shadow-xs">
              {activeDoc === 'terms' && <FileText className="w-5 h-5" />}
              {activeDoc === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-700" />}
              {activeDoc === 'disclaimer' && <AlertCircle className="w-5 h-5 text-amber-700" />}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-[#4A4A4A]">
                {activeDoc === 'terms' && 'Terms of Service'}
                {activeDoc === 'privacy' && 'Privacy Policy'}
                {activeDoc === 'disclaimer' && 'Educational Disclaimer'}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Reading Buddy • Student & Parent Guide
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-legal-modal-btn"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#FF6B6B] hover:text-[#FF6B6B] flex items-center justify-center text-slate-600 transition cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectDoc('terms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'terms'
                ? 'bg-[#4D96FF] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Service
          </button>

          <button
            type="button"
            onClick={() => onSelectDoc('privacy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'privacy'
                ? 'bg-[#6BCB77] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => onSelectDoc('disclaimer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'disclaimer'
                ? 'bg-[#FFD93D] text-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Disclaimer
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-[#4A4A4A] text-sm sm:text-base leading-relaxed">
          {/* TERMS OF SERVICE */}
          {activeDoc === 'terms' && (
            <div className="space-y-5">
              <div className="bg-[#FFF9E5] border-2 border-[#FFD93D] rounded-2xl p-4 text-xs sm:text-sm text-slate-700 font-medium">
                <p className="font-bold text-[#D4A017] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Friendly Summary
                </p>
                Reading Buddy is a free, interactive early reading aid. We don’t collect accounts or save anything to a server. Everything lives on your device!
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  1. What Reading Buddy Is (and Isn’t)
                </h3>
                <p className="text-slate-600 mb-2">
                  Reading Buddy is an educational practice tool designed to help early readers practice word recognition, syllable chunking, and reading fluency in a self-paced, encouraging format.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Educational Practice Only:</strong> This app is provided solely for educational and practice purposes. It is not a substitute for formal classroom instruction, professional tutoring, speech therapy, or individualized educational plans (IEPs).
                  </li>
                  <li>
                    <strong className="text-slate-800">No Guaranteed Academic Results:</strong> While we hope Reading Buddy makes reading practice fun and rewarding, we cannot guarantee specific grades, test scores, or reading level advancements.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  2. Provided “As Is”
                </h3>
                <p className="text-slate-600">
                  Reading Buddy is provided on an <em>“as is”</em> and <em>“as available”</em> basis without warranties of any kind (express or implied). While we do our best to ensure the app works smoothly and accurately across all web browsers and tablets, we do not promise that the service will always be error-free or uninterrupted.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  3. Your Progress & Local Storage
                </h3>
                <p className="text-slate-600 mb-2">
                  <strong className="text-slate-800">No Cloud Backup:</strong> Reading Buddy operates entirely inside your web browser. All reader profiles, completed stories, stars, and practice records are stored solely in your browser’s local storage on your device.
                </p>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs sm:text-sm text-rose-800">
                  <strong>Important Notice:</strong> If you clear your browser history, cache, or site data, or if you switch devices or private/incognito windows, <strong>all saved progress will be permanently erased</strong>. We cannot recover lost profiles or stars because no data is sent to our servers.
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  4. Acceptable Use
                </h3>
                <p className="text-slate-600">
                  You are welcome to use Reading Buddy for personal, family, homeschool, or classroom use. You agree not to disrupt, reverse-engineer, or tamper with the application code or use the application in violation of applicable local or national laws.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  5. Limitation of Liability
                </h3>
                <p className="text-slate-600">
                  To the fullest extent permitted by law, the developer shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use Reading Buddy, including the loss of saved reading data.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  6. Termination & Governing Law
                </h3>
                <p className="text-slate-600">
                  We reserve the right to update or discontinue the app at any time without prior notice. These terms are governed by the applicable laws of the user's local jurisdiction.
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm space-y-1">
                <p className="font-black text-slate-700">Questions or Feedback?</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#4D96FF]" />
                  <span>Email:</span>
                  <a href="mailto:thomas@solinap.io" className="text-[#4D96FF] font-bold hover:underline">
                    thomas@solinap.io
                  </a>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#6BCB77]" />
                  <span>Website:</span>
                  <span className="font-bold text-slate-700">reading-buddy@solinap.io</span>
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeDoc === 'privacy' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-xs sm:text-sm text-emerald-900 font-medium">
                <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Private by Design
                </p>
                We do not collect, transmit, store, or sell any personal data whatsoever. No servers, no tracking, and no cookies.
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  1. No Data Collection or Server Storage
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>We collect zero personal information:</strong> No emails, names, IP addresses, or device IDs are sent to us.</li>
                  <li><strong>No backend servers or databases:</strong> Reading Buddy runs purely on the client side inside your web browser.</li>
                  <li><strong>No advertising or third-party trackers:</strong> We do not include advertising pixels, behavioral analytics, or third-party trackers.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  2. Local Storage on Your Device
                </h3>
                <p className="text-slate-600 mb-2">
                  When you create a reader profile (like choosing a name or avatar) and earn stars, that data is stored <strong>only in your browser’s local storage</strong> on your personal device.
                </p>
                <p className="text-slate-600">
                  The developer never sees your information. Clearing your browser data or cache will permanently delete all saved reader profiles and stars with no way to recover them.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  3. Children’s Privacy (COPPA Compliant)
                </h3>
                <p className="text-slate-600">
                  Because Reading Buddy does not collect any personal data from any user, no personal information is knowingly or unknowingly collected from children of any age. Parents, guardians, and educators can let kids read and explore with full confidence.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1.5">
                  4. Speech Synthesis & Audio
                </h3>
                <p className="text-slate-600">
                  Read-aloud and syllable sound-out features utilize your web browser’s built-in Speech Synthesis API. Audio is generated locally on your device; no voice recordings or microphone data are ever captured or uploaded.
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm space-y-1">
                <p className="font-black text-slate-700">Privacy Inquiries</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#4D96FF]" />
                  <span>Email:</span>
                  <a href="mailto:thomas@solinap.io" className="text-[#4D96FF] font-bold hover:underline">
                    thomas@solinap.io
                  </a>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#6BCB77]" />
                  <span>Website:</span>
                  <span className="font-bold text-slate-700">reading-buddy@solinap.io</span>
                </p>
              </div>
            </div>
          )}

          {/* DISCLAIMER */}
          {activeDoc === 'disclaimer' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 font-medium">
                <p className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" /> Educational Notice
                </p>
                Reading Buddy is an interactive reading practice aid created to encourage reading enthusiasm and fluency.
              </div>

              <div className="border-l-4 border-[#FFD93D] pl-4 py-1 text-slate-700 text-base sm:text-lg font-medium italic">
                “Reading Buddy is an educational practice aid designed for early readers and is not a substitute for professional classroom instruction or tutoring. No academic outcomes are guaranteed. All profiles, stars, and reading progress are stored locally on your device—clearing your browser data will reset your saved history.”
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-black text-slate-800 text-base">Key Highlights for Parents & Teachers:</h4>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                  <li>
                    <strong>Complementary Practice:</strong> Great for 1st and 2nd graders to practice word-by-word tracking, syllable chunking, and vocabulary at their own pace.
                  </li>
                  <li>
                    <strong>Browser-Bound Data:</strong> Since progress is kept in your device’s browser local storage, ensure you use the same browser and device for continuous progress.
                  </li>
                  <li>
                    <strong>Safe & Ad-Free:</strong> 100% free of ads, tracking, in-app purchases, or external links.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-xs sm:text-sm space-y-1">
                <p className="font-black text-slate-700">Contact</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#4D96FF]" />
                  <span>Email:</span>
                  <a href="mailto:thomas@solinap.io" className="text-[#4D96FF] font-bold hover:underline">
                    thomas@solinap.io
                  </a>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#6BCB77]" />
                  <span>Website:</span>
                  <span className="font-bold text-slate-700">reading-buddy@solinap.io</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-7 py-3.5 flex justify-end">
          <button
            type="button"
            id="dismiss-legal-modal-btn"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl btn-tactile-blue font-black text-sm uppercase cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
