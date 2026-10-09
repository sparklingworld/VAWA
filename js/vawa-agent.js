/**
 * VAWA Central Agent Controller
 * Orchestrates the viva examination state machine:
 * - Listens to candidate's voice / commands
 * - Probes candidate with adaptive questions
 * - Tracks every answer in candidate's viva dossier
 * - Evaluates defenses and synthesizes "Good & Simple Answers"
 * - Maintains academic decorum and security audit trails
 */

const VAWAgent = (() => {
  'use strict';

  // --- AGENT STATES ---
  const STATES = {
    IDLE: 'IDLE',
    PREPARING: 'PREPARING',
    EXAMINER_SPEAKING: 'EXAMINER_SPEAKING',
    CANDIDATE_LISTENING: 'CANDIDATE_LISTENING',
    EVALUATING: 'EVALUATING',
    EXPLAINING: 'EXPLAINING',
    CONCLUDED: 'CONCLUDED'
  };

  // --- AGENT INTERNAL STATE ---
  let currentState = STATES.IDLE;
  let activeTopic = 'Computer Science & Distributed Systems';
  let activeDifficulty = 'standard'; // 'foundation' | 'standard' | 'rigorous' | 'crucible'
  let adaptiveMode = true;
  let currentQuestion = null;
  let questionIndex = 0;
  let sessionHistory = [];
  let isHandsFreeMode = true; // Enabled by default for natural viva conversation

  // Listeners for UI binding
  const listeners = {
    stateChange: [],
    questionAsked: [],
    answerTranscribed: [],
    evaluationReady: [],
    sessionConcluded: [],
    securityAlert: []
  };

  function subscribe(event, callback) {
    if (listeners[event]) {
      listeners[event].push(callback);
    }
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  }

  function setState(newState) {
    currentState = newState;
    emit('stateChange', { state: currentState, topic: activeTopic, questionIndex });
  }

  // --- COMMAND INTERPRETATION ("Ask me about...") ---
  /**
   * Interprets natural speech or text commands such as:
   * "Ask me about Quantum Computing"
   * "Test me on Operating Systems at crucible difficulty"
   */
  function parseVivaCommand(input) {
    if (!input || typeof input !== 'string') return null;

    const lower = input.toLowerCase().trim();

    // Check for difficulty keywords
    let difficulty = null;
    if (lower.includes('crucible') || lower.includes('doctorate') || lower.includes('phd') || lower.includes('hardest')) {
      difficulty = 'crucible';
    } else if (lower.includes('rigorous') || lower.includes('hard') || lower.includes('advanced')) {
      difficulty = 'rigorous';
    } else if (lower.includes('foundation') || lower.includes('easy') || lower.includes('beginner') || lower.includes('novice')) {
      difficulty = 'foundation';
    } else if (lower.includes('standard') || lower.includes('medium') || lower.includes('intermediate')) {
      difficulty = 'standard';
    }

    // Patterns matching "ask me about [topic]", "test me on [topic]", "viva on [topic]"
    const patterns = [
      /(?:ask\s+me\s+about|test\s+me\s+on|examine\s+me\s+on|viva\s+on|questions?\s+on|quiz\s+me\s+on)\s+([a-zA-Z0-9\s\-_&,]+)/i,
      /(?:start\s+viva\s+for|begin\s+exam\s+on)\s+([a-zA-Z0-9\s\-_&,]+)/i
    ];

    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match && match[1]) {
        let topicCandidate = match[1]
          .replace(/\b(at|on|level|difficulty|crucible|rigorous|standard|foundation|hard|easy)\b.*/g, '')
          .trim();
        if (topicCandidate.length > 2) {
          return {
            topic: topicCandidate,
            difficulty: difficulty || activeDifficulty
          };
        }
      }
    }

    return null;
  }

  // --- VIVA SESSION FLOW ---

  /**
   * Starts a fresh viva examination on the chosen topic
   */
  async function startExamination(topic, difficulty = 'standard') {
    activeTopic = topic || activeTopic;
    activeDifficulty = difficulty || activeDifficulty;
    questionIndex = 0;
    sessionHistory = [];

    setState(STATES.PREPARING);

    // Audio Gavel effect
    window.VAWAudio.playGavel();

    const welcomeSpeech = `Candidate, welcome to your Academic Oral Defense on ${activeTopic}. We shall proceed under ${activeDifficulty.toUpperCase()} scrutiny. Listen closely to the inquiry.`;

    window.VAWAudio.speak(welcomeSpeech, () => {
      askNextQuestion();
    });
  }

  /**
   * Generates and presents the next viva inquiry
   */
  async function askNextQuestion() {
    setState(STATES.PREPARING);
    questionIndex++;

    try {
      // Fetch question from Gemini or Universal Knowledge Engine
      currentQuestion = await window.VAWAGemini.generateQuestion(activeTopic, activeDifficulty, sessionHistory);
    } catch (e) {
      const curriculum = window.VAWAKnowledge.findCurriculum(activeTopic);
      currentQuestion = curriculum.questions[activeDifficulty]?.[0] || curriculum.questions['standard'][0];
    }

    setState(STATES.EXAMINER_SPEAKING);
    emit('questionAsked', {
      questionNumber: questionIndex,
      topic: activeTopic,
      difficulty: activeDifficulty,
      question: currentQuestion
    });

    // Play subtle metallic chime
    window.VAWAudio.playQuestionChime();

    // Examiner speaks the question
    window.VAWAudio.speak(currentQuestion.question, () => {
      // Examiner has finished speaking, now listens to candidate
      prepareCandidateResponse();
    });
  }

  /**
   * Transitions agent to attentive listening state
   */
  function prepareCandidateResponse() {
    setState(STATES.CANDIDATE_LISTENING);
    window.VAWAudio.clearSpeechBuffer();
    window.VAWAudio.startListening();
  }

  /**
   * Submits candidate response (via voice transcription or typed text)
   */
  async function submitCandidateAnswer(rawAnswerText) {
    if (currentState !== STATES.CANDIDATE_LISTENING) {
      console.warn('Not in listening state; ignoring submit');
      return;
    }

    // Stop microphone if currently listening
    window.VAWAudio.stopListening();
    setState(STATES.EVALUATING);

    // 1. Check Rate Limiter
    const rateCheck = window.VAWASecurity.checkRateLimit();
    if (!rateCheck.allowed) {
      emit('securityAlert', { message: 'Input throttled: rate limit exceeded.' });
      setState(STATES.CANDIDATE_LISTENING);
      return;
    }

    // 2. High-Security Prompt Injection & Adversarial Defense Scan
    const securityReport = window.VAWASecurity.sanitizeCandidateInput(rawAnswerText);
    if (!securityReport.safe) {
      window.VAWAudio.playAlertSound();
      emit('securityAlert', {
        message: `Security Shield: Adversarial vector intercepted [${securityReport.threats.join(', ')}]. Input neutralized.`
      });
    }

    const cleanedAnswer = securityReport.sanitizedText;

    // 3. Deep Evaluation & "Good and Simple Answer" Synthesis
    let evalResult = null;
    try {
      evalResult = await window.VAWAGemini.evaluateAnswer(cleanedAnswer, currentQuestion, activeDifficulty);
    } catch (e) {
      evalResult = window.VAWAKnowledge.evaluateAnswer(cleanedAnswer, currentQuestion, activeDifficulty);
    }

    // 4. Record to Session History Dossier
    const record = {
      questionNumber: questionIndex,
      topic: activeTopic,
      difficulty: activeDifficulty,
      question: currentQuestion.question,
      candidateAnswer: cleanedAnswer,
      securityReport: securityReport,
      evaluation: evalResult,
      timestamp: new Date().toLocaleTimeString()
    };
    sessionHistory.push(record);

    // Audio cue based on score
    if (evalResult.score >= 80) {
      window.VAWAudio.playSuccessChord();
    } else {
      window.VAWAudio.playQuestionChime();
    }

    setState(STATES.EXPLAINING);
    emit('evaluationReady', record);

    // Verbal examiner feedback snippet
    const verbalFeedback = `Score: ${evalResult.score} percent. ${evalResult.feedback}`;
    window.VAWAudio.speak(verbalFeedback, () => {
      // Auto-escalate or adapt if enabled
      if (adaptiveMode) {
        adaptDifficulty(evalResult.score);
      }
    });
  }

  /**
   * Dynamically adapts viva difficulty according to candidate performance
   */
  function adaptDifficulty(lastScore) {
    if (lastScore >= 85) {
      if (activeDifficulty === 'foundation') activeDifficulty = 'standard';
      else if (activeDifficulty === 'standard') activeDifficulty = 'rigorous';
      else if (activeDifficulty === 'rigorous') activeDifficulty = 'crucible';
    } else if (lastScore < 50) {
      if (activeDifficulty === 'crucible') activeDifficulty = 'rigorous';
      else if (activeDifficulty === 'rigorous') activeDifficulty = 'standard';
      else if (activeDifficulty === 'standard') activeDifficulty = 'foundation';
    }
  }

  /**
   * Concludes the viva session and creates final academic transcript dossier
   */
  function concludeExamination() {
    setState(STATES.CONCLUDED);
    window.VAWAudio.stopSpeaking();
    window.VAWAudio.stopListening();
    window.VAWAudio.playGavel();

    const stats = calculateSessionStats();

    const conclusionSpeech = `This concludes your Viva Defense on ${activeTopic}. You achieved an overall score of ${stats.averageScore} percent, earning the distinction of ${stats.honors}. Your full transcript has been compiled.`;
    window.VAWAudio.speak(conclusionSpeech);

    emit('sessionConcluded', {
      topic: activeTopic,
      stats: stats,
      history: sessionHistory
    });
  }

  function calculateSessionStats() {
    if (sessionHistory.length === 0) {
      return { totalQuestions: 0, averageScore: 0, honors: 'No Data' };
    }

    const total = sessionHistory.length;
    const sum = sessionHistory.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
    const avg = Math.round(sum / total);

    let honors = 'Pass';
    if (avg >= 92) honors = 'First Class Honours (Summa Cum Laude)';
    else if (avg >= 80) honors = 'Upper Second Honours (Magna Cum Laude)';
    else if (avg >= 65) honors = 'Merit Pass';
    else if (avg >= 45) honors = 'Conditional Pass';
    else honors = 'Revision Required';

    return {
      totalQuestions: total,
      averageScore: avg,
      honors: honors,
      securityIntegrity: window.VAWASecurity.getIntegrityStats()
    };
  }

  // --- ACCESSORS & SETTERS ---
  return {
    STATES,
    getState: () => currentState,
    getActiveTopic: () => activeTopic,
    getActiveDifficulty: () => activeDifficulty,
    getCurrentQuestion: () => currentQuestion,
    getSessionHistory: () => sessionHistory,
    setTopic: (t) => { activeTopic = t; },
    setDifficulty: (d) => { activeDifficulty = d; },
    setAdaptiveMode: (a) => { adaptiveMode = !!a; },
    setHandsFreeMode: (hf) => { isHandsFreeMode = !!hf; },
    parseVivaCommand,
    startExamination,
    askNextQuestion,
    submitCandidateAnswer,
    concludeExamination,
    subscribe,
    calculateSessionStats
  };
})();

window.VAWAgent = VAWAgent;
