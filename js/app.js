/**
 * VAWA Application Orchestrator & UI Controller
 * Binds UI components, handles audio/speech events, commands, and security panels
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- DOM ELEMENT REFERENCES ---
  const examinerChamber = document.getElementById('examiner-avatar-chamber');
  const examinerStatusLabel = document.getElementById('examiner-status-label');
  const audioCanvas = document.getElementById('vawa-audio-canvas');
  
  // Topic & Difficulty Controls
  const topicInput = document.getElementById('vawa-topic-input');
  const btnStartExam = document.getElementById('btn-start-exam');
  const tierButtons = document.querySelectorAll('.tier-btn');
  const quickTopicPills = document.querySelectorAll('.quick-topic-pill');

  // Examination Board
  const questionBoard = document.getElementById('question-board');
  const questionCounter = document.getElementById('question-counter');
  const questionDifficultyTag = document.getElementById('question-difficulty-tag');
  const questionText = document.getElementById('question-text');
  
  // Candidate Response Console
  const candidateConsole = document.getElementById('candidate-console');
  const transcriptStreamBox = document.getElementById('transcript-stream-box');
  const btnSpeakMic = document.getElementById('btn-speak-mic');
  const btnSubmitDefense = document.getElementById('btn-submit-defense');
  const handsFreeToggle = document.getElementById('hands-free-toggle');
  const listeningStatusPill = document.getElementById('listening-status-pill');
  const listeningStatusText = document.getElementById('listening-status-text');

  // Evaluation & Good/Simple Answer Stage
  const evaluationStage = document.getElementById('evaluation-stage');
  const scoreVal = document.getElementById('score-val');
  const honorsTitle = document.getElementById('honors-title');
  const scoreFeedbackText = document.getElementById('score-feedback-text');
  const candidateDefenseDisplay = document.getElementById('candidate-defense-display');
  const conceptHitsContainer = document.getElementById('concept-hits-container');
  const conceptMissesContainer = document.getElementById('concept-misses-container');
  const simpleSummaryText = document.getElementById('simple-summary-text');
  const simpleAnalogyText = document.getElementById('simple-analogy-text');
  const threePillarsContainer = document.getElementById('three-pillars-container');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const btnConcludeExam = document.getElementById('btn-conclude-exam');

  // Header & Modals
  const btnOpenVault = document.getElementById('btn-open-vault');
  const btnOpenAudit = document.getElementById('btn-open-audit');
  const btnOpenDossier = document.getElementById('btn-open-dossier');
  const btnToggleMute = document.getElementById('btn-toggle-mute');

  const modalVault = document.getElementById('modal-vault');
  const modalAudit = document.getElementById('modal-audit');
  const modalDossier = document.getElementById('modal-dossier');
  const allModalCloseBtns = document.querySelectorAll('.modal-close-btn');

  // Vault Inputs
  const vaultApiKeyInput = document.getElementById('vault-api-key-input');
  const vaultPassphraseInput = document.getElementById('vault-passphrase-input');
  const btnSaveVaultKey = document.getElementById('btn-save-vault-key');
  const btnUnlockVaultKey = document.getElementById('btn-unlock-vault-key');
  const btnPanicPurgeVault = document.getElementById('btn-panic-purge-vault');
  const vaultStatusText = document.getElementById('vault-status-text');

  // Audit Log Feed
  const securityAuditFeed = document.getElementById('security-audit-feed');
  const badgeSecurityStatus = document.getElementById('badge-security-status');

  // Dossier View
  const dossierFeedContainer = document.getElementById('dossier-feed-container');
  const dossierSummaryBanner = document.getElementById('dossier-summary-banner');
  const btnExportMarkdown = document.getElementById('btn-export-markdown');
  const btnPrintDossier = document.getElementById('btn-print-dossier');

  // --- INITIALIZE SUBSYSTEMS ---

  // 1. Audio Visualizer Canvas
  if (audioCanvas) {
    audioCanvas.width = audioCanvas.parentElement.clientWidth || 320;
    audioCanvas.height = 54;
    window.VAWAudio.bindVisualizerCanvas(audioCanvas);
  }

  // 2. Load Speech Voices
  window.VAWAudio.loadVoices();

  // 3. Initialize Speech Recognition
  let speechInitialized = window.VAWAudio.initSpeechRecognition(
    // On Speech Result
    (result) => {
      if (transcriptStreamBox) {
        const fullSpoken = result.fullText || (result.final + (result.interim ? ' ' + result.interim : '')).trim();
        if (fullSpoken) {
          transcriptStreamBox.innerText = fullSpoken;
          transcriptStreamBox.scrollTop = transcriptStreamBox.scrollHeight;
        }
        
        // Check if candidate issued a voice command like "Ask me about Quantum Computing"
        if (window.VAWAgent.getState() === window.VAWAgent.STATES.IDLE || 
            window.VAWAgent.getState() === window.VAWAgent.STATES.CONCLUDED) {
          const command = window.VAWAgent.parseVivaCommand(result.final);
          if (command) {
            topicInput.value = command.topic;
            setActiveDifficulty(command.difficulty);
            window.VAWAgent.startExamination(command.topic, command.difficulty);
          }
        }
      }
    },
    // On Speech State Change
    (state) => {
      updateExaminerStatusDisplay(state);
    },
    // On Silence Detected (Hands-Free viva conclusion)
    () => {
      if (window.VAWAgent.getState() === window.VAWAgent.STATES.CANDIDATE_LISTENING) {
        const text = transcriptStreamBox ? transcriptStreamBox.innerText.trim() : '';
        if (text.length >= 8) {
          showToast('Speech pause detected. Teacher analyzing defense...', 'info');
          if (listeningStatusText) {
            listeningStatusText.innerText = 'Defense concluded. Teacher analyzing your response...';
          }
          window.VAWAgent.submitCandidateAnswer(text);
        }
      }
    }
  );

  // 4. Academic Anti-Cheat & Session Integrity Monitor
  window.VAWASecurity.initAntiCheatMonitor((warning) => {
    window.VAWAudio.playAlertSound();
    showToast(`⚠️ ${warning.message}`, 'alert');
  });

  // --- SUBSCRIBE TO VAWA AGENT EVENTS ---

  window.VAWAgent.subscribe('stateChange', ({ state }) => {
    updateExaminerStatusDisplay(state);
  });

  window.VAWAgent.subscribe('questionAsked', ({ questionNumber, topic, difficulty, question }) => {
    // Reveal question board and candidate console, hide evaluation stage
    questionBoard.style.display = 'block';
    candidateConsole.style.display = 'flex';
    evaluationStage.style.display = 'none';

    questionCounter.innerText = `Inquiry #${questionNumber}`;
    questionDifficultyTag.innerText = difficulty.toUpperCase();
    questionText.innerText = question.question;

    if (transcriptStreamBox) {
      transcriptStreamBox.innerText = '';
    }
  });

  window.VAWAgent.subscribe('evaluationReady', (record) => {
    // Show evaluation stage and populate Good & Simple Answer
    evaluationStage.style.display = 'flex';
    questionBoard.style.display = 'none';
    candidateConsole.style.display = 'none';

    renderEvaluation(record);
  });

  window.VAWAgent.subscribe('securityAlert', ({ message }) => {
    showToast(message, 'alert');
  });

  window.VAWAgent.subscribe('sessionConcluded', ({ topic, stats, history }) => {
    renderDossierModal(topic, stats, history);
    openModal(modalDossier);
  });

  // --- UI EVENT HANDLERS ---

  // Difficulty Tier Selector Buttons
  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      setActiveDifficulty(tier);
    });
  });

  function setActiveDifficulty(tier) {
    tierButtons.forEach(b => b.classList.remove('active'));
    const target = document.querySelector(`.tier-btn[data-tier="${tier}"]`);
    if (target) target.classList.add('active');
    window.VAWAgent.setDifficulty(tier);
  }

  // Quick Topic Pills
  quickTopicPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const topic = pill.dataset.topic;
      if (topicInput) topicInput.value = topic;
      window.VAWAgent.startExamination(topic, window.VAWAgent.getActiveDifficulty());
    });
  });

  // Start Examination Button
  if (btnStartExam) {
    btnStartExam.addEventListener('click', () => {
      const topic = (topicInput && topicInput.value.trim()) || 'Computer Science & Distributed Systems';
      window.VAWAgent.startExamination(topic, window.VAWAgent.getActiveDifficulty());
    });
  }

  // Topic input 'Enter' key
  if (topicInput) {
    topicInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const topic = topicInput.value.trim() || 'Computer Science & Distributed Systems';
        window.VAWAgent.startExamination(topic, window.VAWAgent.getActiveDifficulty());
      }
    });
  }

  // Speak / Push-to-Talk Button
  if (btnSpeakMic) {
    btnSpeakMic.addEventListener('click', () => {
      window.VAWAudio.initAudioContext();
      const listening = window.VAWAudio.toggleListening();
      if (listening) {
        btnSpeakMic.classList.add('recording');
        btnSpeakMic.innerHTML = '<span>🔴</span> Examiner Listening (Tap to Pause)';
      } else {
        btnSpeakMic.classList.remove('recording');
        btnSpeakMic.innerHTML = '<span>🎙️</span> Tap to Speak Defense';
      }
    });
  }

  // Submit Candidate Defense Button
  if (btnSubmitDefense) {
    btnSubmitDefense.addEventListener('click', () => {
      const text = transcriptStreamBox ? transcriptStreamBox.innerText.trim() : '';
      if (!text) {
        showToast('Please speak or type your defense before submitting.', 'alert');
        return;
      }
      window.VAWAgent.submitCandidateAnswer(text);
    });
  }

  // Hands-Free Mode Toggle
  if (handsFreeToggle) {
    handsFreeToggle.addEventListener('change', () => {
      window.VAWAgent.setHandsFreeMode(handsFreeToggle.checked);
      showToast(handsFreeToggle.checked ? 'Hands-Free Viva Mode Active' : 'Push-to-Talk Mode Active');
    });
  }

  // Next Question Button
  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      window.VAWAgent.askNextQuestion();
    });
  }

  // Conclude Exam Button
  if (btnConcludeExam) {
    btnConcludeExam.addEventListener('click', () => {
      window.VAWAgent.concludeExamination();
    });
  }

  // Header Mute Button
  if (btnToggleMute) {
    btnToggleMute.addEventListener('click', () => {
      const nowMuted = window.VAWAudio.setMuted(!window.VAWAudio.getIsMuted());
      btnToggleMute.innerHTML = nowMuted ? '🔇 Audio Muted' : '🔊 Voice Active';
      showToast(nowMuted ? 'Examiner voice muted' : 'Examiner voice unmuted');
    });
  }

  // --- EVALUATION & THE GOOD AND SIMPLE ANSWER RENDERER ---

  function renderEvaluation(record) {
    const { evaluation, candidateAnswer, question } = record;

    // 1. Score and Honors
    if (scoreVal) scoreVal.innerText = evaluation.score;
    if (honorsTitle) honorsTitle.innerText = evaluation.grade;
    if (scoreFeedbackText) scoreFeedbackText.innerText = evaluation.feedback;

    // 2. Candidate Defense Display
    if (candidateDefenseDisplay) {
      candidateDefenseDisplay.innerText = candidateAnswer || '(No vocal response transcribed)';
    }

    // 3. Concept Tags (Hits vs Misses)
    if (conceptHitsContainer) {
      conceptHitsContainer.innerHTML = '';
      (evaluation.keyConceptsPresent || []).forEach(term => {
        const span = document.createElement('span');
        span.className = 'concept-tag hit';
        span.innerText = `✓ ${term}`;
        conceptHitsContainer.appendChild(span);
      });
      if (!evaluation.keyConceptsPresent || evaluation.keyConceptsPresent.length === 0) {
        conceptHitsContainer.innerHTML = '<span class="concept-tag">None identified</span>';
      }
    }

    if (conceptMissesContainer) {
      conceptMissesContainer.innerHTML = '';
      (evaluation.keyConceptsMissing || []).forEach(term => {
        const span = document.createElement('span');
        span.className = 'concept-tag missed';
        span.innerText = `✗ ${term}`;
        conceptMissesContainer.appendChild(span);
      });
    }

    // 4. THE GOOD & SIMPLE ANSWER BREAKDOWN
    const simple = evaluation.simpleAnswer || {};
    if (simpleSummaryText) {
      simpleSummaryText.innerText = simple.summary || 'Clear intuition model generated by the viva board.';
    }
    if (simpleAnalogyText) {
      simpleAnalogyText.innerText = simple.analogy || 'A vivid real-world analogy to anchor the concept.';
    }

    if (threePillarsContainer) {
      threePillarsContainer.innerHTML = '';
      (simple.threePillars || []).forEach((pillar, idx) => {
        const div = document.createElement('div');
        div.className = 'pillar-item';
        div.innerHTML = `
          <span class="pillar-badge">0${idx + 1}</span>
          <span>${window.VAWASecurity.escapeHtml(pillar)}</span>
        `;
        threePillarsContainer.appendChild(div);
      });
    }
  }

  // --- EXAMINER STATUS & AVATAR UPDATES ---

  function updateExaminerStatusDisplay(state) {
    if (!examinerStatusLabel) return;

    if (state === 'EXAMINER_SPEAKING' || state === 'SPEAKING') {
      examinerStatusLabel.innerText = 'Teacher Inquiring (Speaking)';
      examinerChamber.classList.add('speaking');
      if (listeningStatusPill) listeningStatusPill.style.display = 'none';
      if (btnSpeakMic) {
        btnSpeakMic.classList.remove('recording');
        btnSpeakMic.innerHTML = '<span>🎙️</span> Teacher Speaking...';
      }
    } else if (state === 'CANDIDATE_LISTENING' || state === 'LISTENING') {
      examinerStatusLabel.innerText = 'Teacher Attentive (Listening)';
      examinerChamber.classList.remove('speaking');
      if (listeningStatusPill) {
        listeningStatusPill.style.display = 'flex';
        if (listeningStatusText) {
          listeningStatusText.innerText = 'Teacher is listening to your answer... Speak naturally (or tap Submit when done)';
        }
      }
      if (btnSpeakMic) {
        btnSpeakMic.classList.add('recording');
        btnSpeakMic.innerHTML = '<span>🔴</span> Teacher Listening (Tap to Pause)';
      }
    } else if (state === 'EVALUATING') {
      examinerStatusLabel.innerText = 'Teacher Analyzing Your Answer...';
      examinerChamber.classList.remove('speaking');
      if (listeningStatusPill) {
        listeningStatusPill.style.display = 'flex';
        if (listeningStatusText) {
          listeningStatusText.innerText = 'Teacher is analyzing your response and grading defense...';
        }
      }
      if (btnSpeakMic) {
        btnSpeakMic.classList.remove('recording');
        btnSpeakMic.innerHTML = '<span>⏳</span> Analyzing Response...';
      }
    } else if (state === 'EXPLAINING') {
      examinerStatusLabel.innerText = 'Teacher Explaining & Reviewing';
      examinerChamber.classList.remove('speaking');
      if (listeningStatusPill) listeningStatusPill.style.display = 'none';
      if (btnSpeakMic) {
        btnSpeakMic.classList.remove('recording');
        btnSpeakMic.innerHTML = '<span>🎙️</span> Tap to Speak Defense';
      }
    } else if (state === 'CONCLUDED') {
      examinerStatusLabel.innerText = 'Defense Concluded';
      examinerChamber.classList.remove('speaking');
      if (listeningStatusPill) listeningStatusPill.style.display = 'none';
      if (btnSpeakMic) {
        btnSpeakMic.classList.remove('recording');
        btnSpeakMic.innerHTML = '<span>🎙️</span> Tap to Speak Defense';
      }
    } else {
      examinerStatusLabel.innerText = 'Teacher Standby';
      examinerChamber.classList.remove('speaking');
      if (listeningStatusPill) listeningStatusPill.style.display = 'none';
    }
  }

  // --- VAULT MODAL & SECURITY CONTROLS ---

  if (btnOpenVault) {
    btnOpenVault.addEventListener('click', () => {
      updateVaultUI();
      openModal(modalVault);
    });
  }

  if (btnSaveVaultKey) {
    btnSaveVaultKey.addEventListener('click', async () => {
      const key = vaultApiKeyInput.value.trim();
      const passphrase = vaultPassphraseInput.value.trim();

      if (!key || !passphrase) {
        showToast('Please provide both API key and a Master Passphrase.', 'alert');
        return;
      }

      try {
        await window.VAWASecurity.saveEncryptedApiKey(key, passphrase);
        showToast('API Key encrypted with AES-256-GCM and stored securely.');
        vaultApiKeyInput.value = '';
        vaultPassphraseInput.value = '';
        updateVaultUI();
      } catch (e) {
        showToast(`Vault encryption error: ${e.message}`, 'alert');
      }
    });
  }

  if (btnUnlockVaultKey) {
    btnUnlockVaultKey.addEventListener('click', async () => {
      const passphrase = vaultPassphraseInput.value.trim();
      if (!passphrase) {
        showToast('Enter your master passphrase to unlock.', 'alert');
        return;
      }

      try {
        await window.VAWASecurity.unlockApiKey(passphrase);
        showToast('Vault unlocked. Gemini Engine online.');
        vaultPassphraseInput.value = '';
        updateVaultUI();
      } catch (e) {
        showToast(e.message, 'alert');
      }
    });
  }

  if (btnPanicPurgeVault) {
    btnPanicPurgeVault.addEventListener('click', () => {
      if (confirm('Initiate Emergency Panic Purge? This will permanently wipe all stored keys.')) {
        window.VAWASecurity.panicPurgeKeys();
        updateVaultUI();
        showToast('Panic Purge Complete: All keys zeroized.');
      }
    });
  }

  function updateVaultUI() {
    if (!vaultStatusText) return;
    const hasStored = window.VAWASecurity.hasStoredKey();
    const isUnlocked = !!window.VAWASecurity.getActiveApiKey();

    if (isUnlocked) {
      vaultStatusText.innerHTML = '<span style="color:#34d399">● ACTIVE (AES-256-GCM In-Memory Unlocked)</span>';
    } else if (hasStored) {
      vaultStatusText.innerHTML = '<span style="color:#fbbf24">🔒 ENCRYPTED (Locked with Passphrase)</span>';
    } else {
      vaultStatusText.innerHTML = '<span style="color:#9c8e7e">○ UNCONFIGURED (Using Built-In Universal Knowledge)</span>';
    }
  }

  // --- SECURITY AUDIT FEED MODAL ---

  if (btnOpenAudit) {
    btnOpenAudit.addEventListener('click', () => {
      renderAuditFeed();
      openModal(modalAudit);
    });
  }

  function renderAuditFeed() {
    if (!securityAuditFeed) return;
    const logs = window.VAWASecurity.getAuditLog();
    securityAuditFeed.innerHTML = '';

    logs.forEach(item => {
      const div = document.createElement('div');
      div.className = 'audit-entry';
      div.innerHTML = `
        <span class="audit-time">[${item.timestamp}]</span>
        <span class="audit-type">${item.type}</span>
        <span class="audit-msg">${window.VAWASecurity.escapeHtml(item.message)}</span>
      `;
      securityAuditFeed.appendChild(div);
    });

    if (logs.length === 0) {
      securityAuditFeed.innerHTML = '<div class="audit-entry"><span class="audit-msg">Security shield operational. No adversarial threats detected.</span></div>';
    }
  }

  window.addEventListener('vawa-security-event', () => {
    if (modalAudit && modalAudit.classList.contains('open')) {
      renderAuditFeed();
    }
  });

  // --- DOSSIER TRANSCRIPT MODAL ---

  if (btnOpenDossier) {
    btnOpenDossier.addEventListener('click', () => {
      const stats = window.VAWAgent.calculateSessionStats();
      const history = window.VAWAgent.getSessionHistory();
      renderDossierModal(window.VAWAgent.getActiveTopic(), stats, history);
      openModal(modalDossier);
    });
  }

  function renderDossierModal(topic, stats, history) {
    if (dossierSummaryBanner) {
      dossierSummaryBanner.innerHTML = `
        <h3>Viva Defense Dossier: ${window.VAWASecurity.escapeHtml(topic)}</h3>
        <p>Overall Viva Score: <strong>${stats.averageScore}%</strong> — Distinction: <strong>${stats.honors}</strong></p>
        <p style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-top:4px;">
          Integrity Token: ${stats.securityIntegrity?.sessionToken?.substring(0, 20)}... | Focus Lost Count: ${stats.securityIntegrity?.focusLostCount || 0}
        </p>
      `;
    }

    if (dossierFeedContainer) {
      dossierFeedContainer.innerHTML = '';
      if (!history || history.length === 0) {
        dossierFeedContainer.innerHTML = '<p style="color:var(--text-dim);font-style:italic;">No inquiries defended in this session yet.</p>';
        return;
      }

      history.forEach((h, idx) => {
        const div = document.createElement('div');
        div.className = 'dossier-entry';
        div.innerHTML = `
          <div class="dossier-q">Inquiry #${idx + 1} (${h.difficulty.toUpperCase()}): ${window.VAWASecurity.escapeHtml(h.question)}</div>
          <div class="dossier-a"><strong>Candidate Defense:</strong> ${window.VAWASecurity.escapeHtml(h.candidateAnswer || '(Silence)')}</div>
          <div style="font-size:12px;color:var(--bronze-light);"><strong>Board Score:</strong> ${h.evaluation?.score}% (${h.evaluation?.grade})</div>
          <div style="font-size:12px;background:var(--bg-espresso);padding:8px;border-radius:6px;border-left:3px solid var(--bronze-gold);margin-top:4px;">
            <strong>The Good & Simple Intuition:</strong> ${window.VAWASecurity.escapeHtml(h.evaluation?.simpleAnswer?.summary || '')}
          </div>
        `;
        dossierFeedContainer.appendChild(div);
      });
    }
  }

  // Export Markdown
  if (btnExportMarkdown) {
    btnExportMarkdown.addEventListener('click', () => {
      const history = window.VAWAgent.getSessionHistory();
      const stats = window.VAWAgent.calculateSessionStats();
      const topic = window.VAWAgent.getActiveTopic();

      let md = `# ACADEMIC VIVA EXAMINATION DOSSIER\n`;
      md += `**Topic:** ${topic}\n`;
      md += `**Date:** ${new Date().toLocaleString()}\n`;
      md += `**Cumulative Score:** ${stats.averageScore}%\n`;
      md += `**Academic Honors:** ${stats.honors}\n\n`;
      md += `---\n\n`;

      history.forEach((h, i) => {
        md += `### Inquiry #${i + 1} (${h.difficulty.toUpperCase()})\n`;
        md += `**Question:** ${h.question}\n\n`;
        md += `**Candidate Defense:** ${h.candidateAnswer}\n\n`;
        md += `**Board Score:** ${h.evaluation?.score}% (${h.evaluation?.grade})\n`;
        md += `**Examiner Feedback:** ${h.evaluation?.feedback}\n\n`;
        md += `#### The Good & Simple Answer:\n`;
        md += `> ${h.evaluation?.simpleAnswer?.summary}\n\n`;
        md += `**Analogy:** *${h.evaluation?.simpleAnswer?.analogy}*\n\n`;
        (h.evaluation?.simpleAnswer?.threePillars || []).forEach((p, pi) => {
          md += `- Pillar ${pi + 1}: ${p}\n`;
        });
        md += `\n---\n\n`;
      });

      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VAWA-Dossier-${topic.replace(/\s+/g, '_')}.md`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Viva Dossier exported as Markdown');
    });
  }

  // Print Dossier
  if (btnPrintDossier) {
    btnPrintDossier.addEventListener('click', () => {
      window.print();
    });
  }

  // --- MODAL UTILITIES ---

  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  allModalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.vawa-modal-backdrop');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.vawa-modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.vawa-modal-backdrop.open').forEach(closeModal);
    }
  });

  // --- TOAST NOTIFICATIONS ---

  function showToast(message, type = 'normal') {
    const toast = document.createElement('div');
    toast.className = `badge-bold ${type === 'alert' ? 'alert' : 'secure'}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '999';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.8)';
    toast.innerHTML = `<span class="badge-dot"></span> <span>${window.VAWASecurity.escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }
});
