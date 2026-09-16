"use client";

import React from "react";

export function playVoiceSample({
  voice,
  onStart,
  onEnd,
  onError,
  audioRef
}: {
  voice: {
    name: string;
    title?: string;
    provider?: string;
    language?: string;
    gender?: "male" | "female" | "neutral";
    preview_url?: string | null;
  };
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}): () => void {
  // Stop any active speech synthesis or audio
  stopAllVoiceAudio(audioRef);

  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    stopAllVoiceAudio(audioRef);
    if (onEnd) onEnd();
  };

  const playWithSpeechSynthesis = () => {
    if (isCancelled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const lang = String(voice.language || "en-US").toLowerCase();
      const isHindi = lang.includes("hi") || lang.includes("hindi") || voice.name.toLowerCase().includes("hi-in");
      const isIndianEnglish = lang.includes("en-in") || lang.includes("indian");

      let text = "Hello! I am your AI Voice Assistant. How can I help you today?";
      if (isHindi) {
        text = voice.gender === "male"
          ? "नमस्ते! मैं आपका एआई वॉइस असिस्टेंट हूँ। मैं आपकी क्या सहायता कर सकता हूँ?"
          : "नमस्ते! मैं आपकी एआई वॉइस असिस्टेंट हूँ। मैं आपकी क्या सहायता कर सकती हूँ?";
      } else if (isIndianEnglish) {
        text = "Hello! I am your AI Voice Assistant. I am here to assist you with any inquiries or bookings.";
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? "hi-IN" : isIndianEnglish ? "en-IN" : "en-US";
      utterance.rate = 1.0;
      utterance.pitch = voice.gender === "female" ? 1.08 : voice.gender === "male" ? 0.92 : 1.0;

      // Select matching browser speech voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const targetLangCode = isHindi ? "hi" : isIndianEnglish ? "en-in" : "en";
        const matchingVoice = voices.find((v) => {
          const vLang = v.lang.toLowerCase();
          const vName = v.name.toLowerCase();
          const matchLang = vLang.startsWith(targetLangCode) || (isIndianEnglish && vLang.includes("in"));
          const matchGender = voice.gender === "female"
            ? (vName.includes("female") || vName.includes("zira") || vName.includes("samantha") || vName.includes("swara") || vName.includes("kalpana") || vName.includes("google") || vName.includes("natural"))
            : (vName.includes("male") || vName.includes("david") || vName.includes("rishi") || vName.includes("george") || vName.includes("hemant"));
          return matchLang && matchGender;
        }) || voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode)) || voices[0];

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        if (!isCancelled && onStart) onStart();
      };
      utterance.onend = () => {
        if (!isCancelled && onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error:", e);
        if (!isCancelled && onEnd) onEnd();
      };

      if (onStart) onStart();
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failure:", e);
      if (onEnd) onEnd();
    }
  };

  // If preview_url is present, try playing it first
  if (voice.preview_url && typeof voice.preview_url === "string" && voice.preview_url.startsWith("http")) {
    try {
      const audio = audioRef?.current || new Audio();
      audio.src = voice.preview_url;

      audio.onplay = () => {
        if (!isCancelled && onStart) onStart();
      };
      audio.onended = () => {
        if (!isCancelled && onEnd) onEnd();
      };
      audio.onerror = () => {
        console.warn("Audio URL failed, falling back to Web Speech Synthesis:", voice.preview_url);
        playWithSpeechSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play blocked/failed, falling back to Web Speech:", err);
          playWithSpeechSynthesis();
        });
      }
    } catch (err) {
      playWithSpeechSynthesis();
    }
  } else {
    // Direct Web Speech API synthesis for non-Azure or local voices
    playWithSpeechSynthesis();
  }

  return cancel;
}

export function stopAllVoiceAudio(audioRef?: React.RefObject<HTMLAudioElement | null>) {
  if (typeof window !== "undefined") {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
  if (audioRef?.current) {
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } catch (e) {}
  }
}
