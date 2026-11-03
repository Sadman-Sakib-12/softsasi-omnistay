import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, Lock, Sparkles, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust features row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-950/60 text-[#00a8ff] border border-sky-800/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Verified Stay Protection</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                100% verified properties & authenticated guest reviews only.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Best Rate Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Direct hotel integration with dynamic yield & no hidden markups.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">Instant Encrypted Voucher</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dynamic QR code pass with contactless digital smart keycard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold">24/7 AI Concierge</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Live autonomous travel advisor with instant custom recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00a8ff] to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                OS
              </div>
              <span className="font-bold text-xl text-white">OmniStay 360</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-sm">
              The unified multi-vertical travel & luxury hospitality marketplace. Seamlessly booking luxury stays, private yacht charters, executive fleets, safari tours, and event spaces.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                PCI-DSS Compliant
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                ISO 27001 Certified
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Travel Verticals
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/stays" className="hover:text-white transition-colors">Hotels & Resorts</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Guided Tours & Safaris</Link></li>
              <li><Link href="/cars" className="hover:text-white transition-colors">Chauffeur & Fleet Rental</Link></li>
              <li><Link href="/boats" className="hover:text-white transition-colors">Yachts & Boat Charters</Link></li>
              <li><Link href="/spaces" className="hover:text-white transition-colors">Banquet & Coworking</Link></li>
              <li><Link href="/flights" className="hover:text-white transition-colors">Helicopter Transfers</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Guest Services
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/guest/bookings" className="hover:text-white transition-colors">My Reservations</Link></li>
              <li><Link href="/guest/wallet" className="hover:text-white transition-colors">Digital Wallet & Rewards</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cross-Vertical Cart</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Help & FAQ Center</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Company & Legal
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Softsasi 360</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Concierge</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SoftSasi OmniStay 360 Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/contact" className="hover:text-slate-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

