/* ==============================================================================
   TRACHTENBERG SOUND & VOICE ENGINE (Pure Web Audio API & Speech Synthesis)
   Zero external audio files required. Generates pleasant synthetic acoustic
   feedback, tick drop sounds, carry chimes, victory fanfares, and speech narration.
   Concept & Design by K.S.Chandra 2026.
   ============================================================================== */

const SoundEngine = (function() {
  'use strict';

  let audioCtx = null;
  let isMuted = false;
  let isVoiceEnabled = false;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play a soft pleasant click / step note
  function playStep() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08); // E5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Distinct wooden/metallic tick sound when an 11s tick is dropped in addition
  function playTick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  // Carry overflow chime
  function playCarry() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.12); // C6

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Calculation complete triumph fanfare (3 ascending notes)
  function playSuccess() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.3);
      });
    } catch (e) {}
  }

  // Web Speech API Voice Narration
  function speak(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel(); // Cancel ongoing utterance
      const cleanText = text
        .replace(/×/g, ' multiplied by ')
        .replace(/÷/g, ' divided by ')
        .replace(/√/g, ' square root of ')
        .replace(/²/g, ' squared ')
        .replace(/≥/g, ' greater than or equal to ')
        .replace(/·/g, ' dot ')
        .replace(/=/g, ' equals ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Prefer a clean English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Zira')));
      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) stopSpeaking();
    return isMuted;
  }

  function toggleVoice() {
    isVoiceEnabled = !isVoiceEnabled;
    if (!isVoiceEnabled) stopSpeaking();
    return isVoiceEnabled;
  }

  return {
    playStep: playStep,
    playTick: playTick,
    playCarry: playCarry,
    playSuccess: playSuccess,
    speak: speak,
    stopSpeaking: stopSpeaking,
    toggleMute: toggleMute,
    toggleVoice: toggleVoice,
    isMuted: () => isMuted,
    isVoiceEnabled: () => isVoiceEnabled
  };
})();

if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
}
if (typeof global !== 'undefined') {
  global.SoundEngine = SoundEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundEngine;
}
