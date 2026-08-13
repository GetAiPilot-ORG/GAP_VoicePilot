"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Building2,
  MessageSquare,
  Loader2,
  ArrowRight,
  Send,
  AlertCircle
} from "lucide-react";
import { submitDemoInquiry } from "@/app/actions/demo";
import { PrimaryButton } from "@/components/ui/primary-button";

interface GetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const SERVICE_OPTIONS = [
  "Sales & Lead Qualification Voice Agents",
  "Customer Support & Handoff Automation",
  "Inbound Call Routing & AI Answering",
  "Outbound Bulk Phone Campaigns",
  "Dedicated Phone Number & Calling Channel (₹1,499/mo)",
  "Custom AI Voice Workflows & Integrations"
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM"
];

export function GetDemoModal({ isOpen, onClose, source = "website_hero" }: GetDemoModalProps) {
  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [requirement, setRequirement] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);

  // UX State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  // Min date for date picker (today)
  const todayStr = new Date().toISOString().split("T")[0];

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else {
      const cleanPhone = phone.replace(/[^0-9+]/g, "");
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        newErrors.phone = "Please enter a valid 10-digit phone/WhatsApp number.";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!service) {
      newErrors.service = "Please select a service interested in.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await submitDemoInquiry({
        fullName,
        companyName,
        phone,
        email,
        service,
        requirement,
        preferredDate,
        preferredTime,
        source
      });

      if (res.success) {
        setIsSubmitted(true);
        if (res.whatsappUrl) {
          setWhatsappUrl(res.whatsappUrl);
        }
      } else {
        setSubmitError(res.error || "Failed to submit demo request. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setCompanyName("");
    setPhone("");
    setEmail("");
    setService(SERVICE_OPTIONS[0]);
    setRequirement("");
    setPreferredDate("");
    setPreferredTime(TIME_SLOTS[0]);
    setErrors({});
    setSubmitError("");
    setIsSubmitted(false);
    setWhatsappUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white border border-black/10 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-black max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 text-black/70 hover:text-black flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {isSubmitted ? (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-soft border border-black/5 text-xs font-semibold text-[#ff4b2f]">
                <Sparkles className="h-3.5 w-3.5" />
                Demo Request Confirmed
              </span>
              <h3 className="text-2xl font-bold font-array text-black tracking-tight">
                Your demo request has been received.
              </h3>
              <p className="text-sm text-black/60 max-w-md mx-auto leading-relaxed">
                Our AI Voice Specialist will reach out to you on your preferred date and time to demonstrate your customized voice workflow.
              </p>
            </div>

            {/* Lead Summary Box */}
            <div className="bg-[#f7f6f0] border border-black/5 rounded-[20px] p-4 text-left space-y-2 text-xs text-black/80 font-mono">
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-black/45">Name:</span>
                <span className="font-bold">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-black/45">Phone:</span>
                <span className="font-bold">{phone}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 pb-2">
                <span className="text-black/45">Service:</span>
                <span className="font-bold truncate max-w-[220px]">{service}</span>
              </div>
              {preferredDate && (
                <div className="flex justify-between">
                  <span className="text-black/45">Preferred Time:</span>
                  <span className="font-bold">{preferredDate} ({preferredTime})</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center items-center">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-7 text-sm font-bold shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02]"
                >
                  <Send className="h-4 w-4 fill-current" />
                  Continue on WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto h-12 rounded-full border border-black/10 bg-white hover:bg-black/5 text-black px-6 text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="space-y-1 text-left pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-soft border border-black/5 text-xs font-semibold text-[#ff4b2f]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Live Interactive Walkthrough</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-array tracking-tight text-black pt-1">
                Get a Personalized Demo
              </h2>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                See how VoicePilot handles live sales calls, customer support handoffs, and Hinglish workflows for your business.
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-[16px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Inquiry Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Full Name <span className="text-[#ff4b2f]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                        errors.fullName ? "border-red-500 bg-red-50/20" : "border-black/10"
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.fullName}</p>}
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Health"
                      className="w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Phone / WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                        errors.phone ? "border-red-500 bg-red-50/20" : "border-black/10"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.phone}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@company.com"
                      className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                        errors.email ? "border-red-500 bg-red-50/20" : "border-black/10"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.email}</p>}
                </div>
              </div>

              {/* Service Interested In */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Service Interested In *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all appearance-none cursor-pointer"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
                    <input
                      type="date"
                      min={todayStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black uppercase tracking-wider">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all appearance-none cursor-pointer"
                    >
                      {TIME_SLOTS.map((ts) => (
                        <option key={ts} value={ts}>
                          {ts}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Requirement */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black uppercase tracking-wider">
                  Project Requirement / Details
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-black/40" />
                  <textarea
                    rows={2}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="Describe your use case (e.g., automated outbound calling, Hindi language support, CRM sync)..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[18px] bg-surface-soft border border-black/10 text-xs font-medium text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group inline-flex h-12 items-center justify-between rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white pl-6 pr-2 shadow-[0_6px_20px_rgba(255,75,47,0.25)] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="flex-1 text-center font-bold text-sm tracking-wide">
                    {isSubmitting ? "Submitting request..." : "Get My Demo"}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#ff4b2f] bg-white transition-transform duration-300 group-hover:translate-x-0.5">
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#ff4b2f]" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-[#ff4b2f]" />
                    )}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-center text-black/45 pt-1">
                No setup fees. Free 15-minute live customized voice demonstration.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
