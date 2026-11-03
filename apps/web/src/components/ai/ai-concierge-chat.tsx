"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Send,
  PhoneCall,
  RefreshCw,
  Check,
  Tag,
  CreditCard,
  Building2,
  Mic,
  ArrowUpRight,
  User,
  Bot,
} from "lucide-react";
import { AiService, ChatMessage } from "@/features/ai/ai.service";
import { formatCurrency } from "@/lib/utils";

export function AiConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("SAVE5");
  const [couponApplied, setCouponApplied] = useState(true);
  const [paymentOption, setPaymentOption] = useState<"cod" | "manual">("manual");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello Shakil! Welcome to SoftSasi Store Assistant. How may I assist your itinerary and reservations today?",
      timestamp: "06:10 AM",
    },
    {
      id: "user-1",
      sender: "user",
      text: "do you have beachfront villas?",
      timestamp: "06:11 AM",
    },
    {
      id: "reply-1",
      sender: "assistant",
      text: "Yes! We have the Parian Holiday Villas & Beach Resort on Inani Marine Drive available right now with oceanfront heated infinity pools.",
      timestamp: "06:11 AM",
      recommendations: [
        {
          type: "stay",
          title: "Parian Holiday Villas & Beach Resort",
          price: 16500,
          url: "/stays",
          image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const assistantReply = await AiService.sendMessage(currentInput);
      setMessages((prev) => [...prev, assistantReply]);
    } catch {
      // Error handled by service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 rounded-full bg-gradient-to-tr from-[#00a8ff] via-sky-500 to-indigo-600 text-white shadow-2xl shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center ring-4 ring-white"
          aria-label="SoftSasi AI Store Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="hidden sm:inline-block ml-2 text-xs font-bold tracking-wide pr-1">
                Store Assistant
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Panel matching Figure 14.3 & 14.4 from Sakib_Project_Plan.pdf */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header matching Figure 14.3 & 14.4 (Page 52-53) */}
          <div className="bg-[#4f46e5] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
                S
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Store Assistant</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/90">
              <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Call Concierge">
                <PhoneCall className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title="Refresh Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages & Conversational Commerce Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    m.sender === "user"
                      ? "bg-[#4f46e5] text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Recommendation Card */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {m.recommendations.map((rec, i) => (
                        <Link
                          key={i}
                          href={rec.url}
                          onClick={() => setIsOpen(false)}
                          className="block bg-slate-50 hover:bg-indigo-50 transition-colors p-2 rounded-xl border border-slate-200 group"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={rec.image}
                              alt={rec.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                                {rec.title}
                              </p>
                              <p className="text-[11px] font-black text-indigo-700">
                                {formatCurrency(rec.price)}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>Store Assistant is typing...</span>
              </div>
            )}

            {/* In-Chat Coupon & Payment Box from Figure 14.3 (Page 52) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 mt-4">
              {/* Coupon Row from Figure 14.3 */}
              <div>
                <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mb-1">
                  <Tag className="w-3.5 h-3.5" /> Have a Coupon / Promo Code?
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none"
                  />
                  <button
                    onClick={() => setCouponApplied(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Applied
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">
                    ✓ Coupon '{couponCode}' applied successfully! (৳945.00 off)
                  </p>
                )}
              </div>

              {/* Payment Methods from Figure 14.3 */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div
                  onClick={() => setPaymentOption("cod")}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentOption === "cod" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-extrabold text-slate-900">Cash on Delivery (COD) / Pay at Hotel</p>
                  <p className="text-[10px] text-slate-500">Pay upon arrival at front-desk.</p>
                </div>

                <div
                  onClick={() => setPaymentOption("manual")}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentOption === "manual" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="font-extrabold text-slate-900">Manual Payment (bKash / Nagad / Banks)</p>
                  <p className="text-[10px] text-slate-500">
                    Send Money via bKash, Nagad, Rocket, Cellfin, or Bank Deposit
                  </p>
                </div>
              </div>

              {/* Action Buttons from Figure 14.3 */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  - Back
                </button>
                <button
                  onClick={() => {
                    setOrderConfirmed(true);
                    setTimeout(() => setOrderConfirmed(false), 3000);
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider"
                >
                  {orderConfirmed ? "✓ Order Confirmed!" : "Confirm & Place Order"}
                </button>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box matching Figure 14.4 */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer from Figure 14.4 */}
          <div className="py-1.5 bg-slate-100 text-center text-[10px] font-bold text-slate-500">
            Powered by <strong className="text-indigo-600">Softsasi AI</strong>
          </div>
        </div>
      )}
    </>
  );
}
