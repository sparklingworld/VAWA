/**
 * VAWA High-Fidelity Audio & Speech Engine
 * Features:
 * 1. Web Speech Synthesis (TTS) - Authoritative Academic Viva Examiner Voice
 * 2. Web Speech Recognition (STT) - Continuous & Push-to-Talk Candidate Voice Ingestion
 * 3. Web Audio API Acoustic Sound Effects (Synthesized Gavel, Chimes, Alerts)
 * 4. Real-time HTML5 Canvas Audio Waveform & FFT Spectrum Visualizer
 */

const VAWAudio = (() => {
  'use strict';

  // --- AUDIO CONTEXT & SYNTHESIS ---
  let audioCtx = null;
  let micStream = null;
  let micSource = null;
  let analyser = null;
  let dataArray = null;
  let isListening = false;
  let isSpeaking = false;
  let isMuted = false;
  let recognition = null;
  let activeUtterance = null;
  let selectedVoice = null;
  let canvasRef = null;
  let canvasCtx = null;
  let animFrameId = null;

  // Sound state
  let speechRate = 0.98; // Deliberate, clear cadence
  let speechPitch = 0.95; // Authoritative, resonant tone

  // Callback hooks
  let onSpeechResultCallback = null;
  let onSpeechStateCallback = null;
  let onSilenceDetectedCallback = null;
  let silenceTimer = null;

  /**
   * Initializes Web Audio Context upon user interaction
   */
  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // --- PROCEDURAL ACOUSTIC SOUNDS (Synthesized Oscillators) ---

  /**
   * Deep academic gavel strike (Simulating exam inauguration / conclusion)
   */
  function playGavel() {
    if (isMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // Sub-bass impact
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.18);
    gain1.gain.setValueAtTime(0.8, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.26);

    // Resonant wooden body
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(260, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.35);
    gain2.gain.setValueAtTime(0.4, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + 0.37);
  }

  /**
   * Soft metallic chime for question prompt
   */
  function playQuestionChime() {
    if (isMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  }

  /**
   * Ascending chord for positive evaluation
   */
  function playSuccessChord() {
    if (isMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.55);
    });
  }

  /**
   * Subdued warning buzz for security / anti-cheat alerts
   */
  function playAlertSound() {
    if (isMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // --- SPEECH SYNTHESIS (TTS) ---

  /**
   * Populates available voices and selects a prestigious academic examiner voice
   */
  function loadVoices(callback) {
    if (!('speechSynthesis' in window)) {
      if (callback) callback([]);
      return;
    }

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for natural, UK English, or resonant English voices
      const preferred = voices.find(v => 
        (v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) && 
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Male') || v.name.includes('Oliver') || v.name.includes('Daniel') || v.name.includes('Ryan'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      selectedVoice = preferred || null;
      if (callback) callback(voices);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
  }

  /**
   * Speaks viva dialogue using SpeechSynthesis
   */
  function speak(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel(); // Stop prior speech
    if (isMuted || !text) {
      if (onComplete) onComplete();
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    activeUtterance = new SpeechSynthesisUtterance(cleanText);

    if (selectedVoice) {
      activeUtterance.voice = selectedVoice;
    }

    activeUtterance.rate = speechRate;
    activeUtterance.pitch = speechPitch;

    activeUtterance.onstart = () => {
      isSpeaking = true;
      notifySpeechState('SPEAKING');
    };

    activeUtterance.onend = () => {
      isSpeaking = false;
      notifySpeechState('IDLE');
      if (onComplete) onComplete();
    };

    activeUtterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      isSpeaking = false;
      notifySpeechState('IDLE');
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(activeUtterance);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    notifySpeechState('IDLE');
  }

  // --- SPEECH RECOGNITION (STT) ---

  /**
   * Initializes Web Speech Recognition
   */
  function initSpeechRecognition(onResult, onStateChange, onSilence) {
    onSpeechResultCallback = onResult;
    onSpeechStateCallback = onStateChange;
    onSilenceDetectedCallback = onSilence;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn('Speech Recognition not natively supported in this browser.');
      return false;
    }

    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      notifySpeechState('LISTENING');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (onSpeechResultCallback) {
        onSpeechResultCallback({ interim, final });
      }

      // Reset silence detection timer
      resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition notice:', event.error);
      if (event.error === 'not-allowed') {
        notifySpeechState('MIC_DENIED');
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // If still supposed to be listening, attempt soft restart
        try { recognition.start(); } catch (e) {}
      } else {
        notifySpeechState('IDLE');
      }
    };

    return true;
  }

  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (isListening && onSilenceDetectedCallback) {
        onSilenceDetectedCallback();
      }
    }, 3200); // 3.2 seconds of silence signals candidate conclusion
  }

  function startListening() {
    initAudioContext();
    if (isSpeaking) {
      stopSpeaking();
    }

    if (recognition) {
      try {
        isListening = true;
        recognition.start();
      } catch (e) {
        // Already started or restarting
      }
    }

    // Connect microphone to visualizer
    connectMicVisualizer();
    notifySpeechState('LISTENING');
  }

  function stopListening() {
    isListening = false;
    if (silenceTimer) clearTimeout(silenceTimer);
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    notifySpeechState('IDLE');
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
    return isListening;
  }

  function notifySpeechState(state) {
    if (onSpeechStateCallback) {
      onSpeechStateCallback(state);
    }
  }

  // --- CANVAS VISUALIZER (Real-time Web Audio FFT + Simulated Waves) ---

  async function connectMicVisualizer() {
    initAudioContext();
    if (!audioCtx) return;

    if (!micStream) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micSource = audioCtx.createMediaStreamSource(micStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        micSource.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        console.info('Microphone visualizer direct stream unavailable or denied, falling back to procedural visualizer');
      }
    }
  }

  function bindVisualizerCanvas(canvasElement) {
    canvasRef = canvasElement;
    canvasCtx = canvasRef.getContext('2d');
    startCanvasLoop();
  }

  let wavePhase = 0;

  function renderVisualizerFrame() {
    if (!canvasRef || !canvasCtx) return;

    const width = canvasRef.width;
    const height = canvasRef.height;
    const halfH = height / 2;

    canvasCtx.clearRect(0, 0, width, height);

    if (isListening && analyser && dataArray) {
      // Real-time microphone FFT spectrum
      analyser.getByteFrequencyData(dataArray);

      const barCount = 48;
      const barWidth = (width / barCount) - 2;
      let x = 1;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] || 0;
        const percent = val / 255;
        const barHeight = Math.max(4, percent * height * 0.85);

        // Brown, bronze & amber gradient
        const gradient = canvasCtx.createLinearGradient(0, halfH + barHeight / 2, 0, halfH - barHeight / 2);
        gradient.addColorStop(0, '#5a3d28');
        gradient.addColorStop(0.5, '#c99355');
        gradient.addColorStop(1, '#f5c98a');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, halfH - barHeight / 2, barWidth, barHeight);
        x += barWidth + 2;
      }
    } else if (isSpeaking) {
      // Dynamic oscilloscope wave for Examiner Speech
      wavePhase += 0.12;
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 3.5;
      canvasCtx.strokeStyle = '#e5a85c';

      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 6 + wavePhase;
        const amp = Math.sin(x * 0.03 + wavePhase) * (height * 0.32);
        const y = halfH + Math.sin(angle) * amp;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();

      // Glowing reflection wave
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 1.5;
      canvasCtx.strokeStyle = 'rgba(212, 151, 85, 0.4)';
      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 8 - wavePhase;
        const amp = Math.cos(x * 0.02 - wavePhase) * (height * 0.2);
        const y = halfH + Math.sin(angle) * amp;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();
    } else {
      // Idle ambient golden pulse
      wavePhase += 0.03;
      canvasCtx.beginPath();
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgba(184, 125, 59, 0.35)';

      for (let x = 0; x < width; x++) {
        const y = halfH + Math.sin((x * 0.015) + wavePhase) * 6;
        if (x === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
      }
      canvasCtx.stroke();
    }

    animFrameId = requestAnimationFrame(renderVisualizerFrame);
  }

  function startCanvasLoop() {
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(renderVisualizerFrame);
    }
  }

  // --- CONTROLS ---

  function setMuted(muted) {
    isMuted = !!muted;
    if (isMuted && isSpeaking) {
      stopSpeaking();
    }
    return isMuted;
  }

  function setVoice(voice) {
    selectedVoice = voice;
  }

  function setRate(rate) {
    speechRate = Math.max(0.6, Math.min(1.4, rate));
  }

  function setPitch(pitch) {
    speechPitch = Math.max(0.6, Math.min(1.4, pitch));
  }

  return {
    initAudioContext,
    playGavel,
    playQuestionChime,
    playSuccessChord,
    playAlertSound,
    loadVoices,
    speak,
    stopSpeaking,
    initSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
    bindVisualizerCanvas,
    setMuted,
    setVoice,
    setRate,
    setPitch,
    getIsListening: () => isListening,
    getIsSpeaking: () => isSpeaking,
    getIsMuted: () => isMuted
  };
})();

window.VAWAudio = VAWAudio;
