/**
 * VAWA High-Security Module
 * Enterprise-grade client-side security architecture:
 * 1. WebCrypto AES-256-GCM Cryptographic Key Vault
 * 2. Multi-Vector Prompt Injection & Adversarial Jailbreak Defense
 * 3. Academic Integrity & Anti-Cheat Session Monitor
 * 4. XSS & HTML Sanitizer with Content Boundary Protection
 * 5. Input Rate Limiting Token Bucket
 */

const VAWASecurity = (() => {
  'use strict';

  // --- 1. STATE & CONSTANTS ---
  const STORAGE_KEY = 'vawa_vault_enc';
  const SALT_KEY = 'vawa_vault_salt';
  const SESSION_TOKEN_KEY = 'vawa_session_integrity';
  
  let inMemoryDecryptedKey = null;
  let sessionStartTime = Date.now();
  let focusLostCount = 0;
  let securityAuditLog = [];
  let tokenBucket = { tokens: 10, maxTokens: 10, lastRefill: Date.now(), refillRateMs: 1000 };

  // --- 2. CRYPTOGRAPHIC VAULT (Web Crypto AES-GCM) ---
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  /**
   * Derives a 256-bit AES-GCM key from a user passphrase using PBKDF2
   */
  async function deriveKey(passphrase, salt) {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Securely saves an API key encrypted with AES-256-GCM
   */
  async function saveEncryptedApiKey(apiKey, passphrase) {
    if (!apiKey || !passphrase) throw new Error('API Key and Master Passphrase are required.');
    
    // Generate fresh 16-byte salt and 12-byte IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const derivedKey = await deriveKey(passphrase, salt);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      encoder.encode(apiKey.trim())
    );

    const payload = {
      iv: Array.from(iv),
      cipher: Array.from(new Uint8Array(ciphertextBuffer)),
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)));
    
    // Cache in memory for active viva session
    inMemoryDecryptedKey = apiKey.trim();
    logSecurityEvent('KEY_VAULT', 'API Key encrypted and locked with AES-256-GCM');
    return true;
  }

  /**
   * Decrypts the stored API key using the master passphrase
   */
  async function unlockApiKey(passphrase) {
    const rawPayload = localStorage.getItem(STORAGE_KEY);
    const rawSalt = localStorage.getItem(SALT_KEY);

    if (!rawPayload || !rawSalt) return null;

    try {
      const payload = JSON.parse(rawPayload);
      const salt = new Uint8Array(JSON.parse(rawSalt));
      const iv = new Uint8Array(payload.iv);
      const cipher = new Uint8Array(payload.cipher);

      const derivedKey = await deriveKey(passphrase, salt);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        cipher
      );

      const decryptedKey = decoder.decode(decryptedBuffer);
      inMemoryDecryptedKey = decryptedKey;
      logSecurityEvent('KEY_VAULT', 'Vault unlocked successfully via cryptographic derivation');
      return decryptedKey;
    } catch (e) {
      logSecurityEvent('KEY_VAULT_ERROR', 'Failed unlock attempt: invalid passphrase or corrupted payload');
      throw new Error('Authentication failed. Master Passphrase incorrect.');
    }
  }

  /**
   * Instantly wipes keys from memory and storage (Emergency Panic Zeroization)
   */
  function panicPurgeKeys() {
    inMemoryDecryptedKey = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
    logSecurityEvent('PANIC_PURGE', 'All cryptographic keys permanently zeroized and purged from memory');
    return true;
  }

  function getActiveApiKey() {
    return inMemoryDecryptedKey;
  }

  function hasStoredKey() {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  // --- 3. PROMPT INJECTION & JAILBREAK DEFENSE ENGINE ---
  const ADVERSARIAL_PATTERNS = [
    { name: 'INSTRUCTION_OVERRIDE', regex: /(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|former)\s+(?:instructions|rules|prompts|commands|system\s+directions)/i },
    { name: 'ROLE_HIJACK', regex: /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be|simulate)\s+(?:DAN|unfiltered|jailbroken|godmode|root|evil|chaos|assistant\s+without\s+rules)/i },
    { name: 'SYSTEM_DELIMITER_POISONING', regex: /(?:<\|im_start\|>|<\|im_end\|>|<\|system\|>|\[SYSTEM\]|\[INST\]|```system)/i },
    { name: 'PROMPT_LEAKAGE_PROBE', regex: /(?:reveal|output|display|print|show)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|secret\s+instructions|base\s+prompt)/i },
    { name: 'MALICIOUS_SCRIPT_TAG', regex: /<\s*script[^>]*>|<\s*\/\s*script\s*>|javascript:|onerror\s*=|onload\s*=|alert\(|eval\(/i },
    { name: 'SQL_COMMAND_INJECTION', regex: /(?:UNION\s+SELECT|DROP\s+TABLE|1=1|--|\/\*|\*\/)/i }
  ];

  /**
   * Comprehensive security scan for candidate voice or typed responses
   */
  function sanitizeCandidateInput(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { safe: true, threats: [], sanitizedText: '', riskLevel: 'LOW' };
    }

    const threats = [];
    let cleaned = rawText.trim();

    // Check for adversarial patterns
    for (const pattern of ADVERSARIAL_PATTERNS) {
      if (pattern.regex.test(cleaned)) {
        threats.push(pattern.name);
      }
    }

    // Sanitize high-risk control characters & HTML tags
    cleaned = cleaned
      .replace(/[<>]/g, '') // strip angle brackets
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''); // strip ASCII control chars

    const riskLevel = threats.length > 1 ? 'CRITICAL' : threats.length === 1 ? 'MEDIUM' : 'LOW';

    if (threats.length > 0) {
      logSecurityEvent('PROMPT_DEFENSE', `Adversarial probe intercepted: [${threats.join(', ')}] from input.`);
    }

    return {
      safe: threats.length === 0,
      threats: threats,
      sanitizedText: cleaned,
      riskLevel: riskLevel
    };
  }

  // --- 4. SESSION INTEGRITY & ACADEMIC ANTI-CHEAT MONITOR ---
  function initAntiCheatMonitor(onIntegrityWarning) {
    // Generate cryptographic session fingerprint
    const sessionData = `${Date.now()}-${window.crypto.getRandomValues(new Uint32Array(4)).join('-')}`;
    crypto.subtle.digest('SHA-256', encoder.encode(sessionData)).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem(SESSION_TOKEN_KEY, hashHex);
      logSecurityEvent('INTEGRITY_SHIELD', `Session integrity fingerprint signed: ${hashHex.substring(0, 16)}...`);
    });

    // Track tab focus / candidate gaze away
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        focusLostCount++;
        logSecurityEvent('ANTI_CHEAT_WARNING', `Candidate switched tabs or minimized window (Focus Lost #${focusLostCount})`);
        if (typeof onIntegrityWarning === 'function') {
          onIntegrityWarning({
            type: 'FOCUS_LOST',
            count: focusLostCount,
            message: `Academic Integrity Alert: Examination window focus lost (${focusLostCount}x). This event has been logged to your viva transcript.`
          });
        }
      }
    });

    window.addEventListener('blur', () => {
      logSecurityEvent('FOCUS_EVENT', 'Window blur recorded.');
    });
  }

  function getIntegrityStats() {
    return {
      focusLostCount,
      sessionToken: sessionStorage.getItem(SESSION_TOKEN_KEY) || 'INITIALIZING',
      auditLogLength: securityAuditLog.length
    };
  }

  // --- 5. RATE LIMITING (Token Bucket) ---
  function checkRateLimit() {
    const now = Date.now();
    const elapsed = now - tokenBucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / tokenBucket.refillRateMs);
    
    if (tokensToAdd > 0) {
      tokenBucket.tokens = Math.min(tokenBucket.maxTokens, tokenBucket.tokens + tokensToAdd);
      tokenBucket.lastRefill = now;
    }

    if (tokenBucket.tokens > 0) {
      tokenBucket.tokens--;
      return { allowed: true, remaining: tokenBucket.tokens };
    } else {
      logSecurityEvent('RATE_LIMIT', 'Candidate input throttled: burst frequency exceeded');
      return { allowed: false, remaining: 0 };
    }
  }

  // --- 6. XSS CONTEXT ESCAPING ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- 7. AUDIT LOGGING ---
  function logSecurityEvent(type, message) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    securityAuditLog.unshift(entry);
    if (securityAuditLog.length > 100) securityAuditLog.pop();
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('vawa-security-event', { detail: entry }));
  }

  function getAuditLog() {
    return [...securityAuditLog];
  }

  return {
    saveEncryptedApiKey,
    unlockApiKey,
    panicPurgeKeys,
    getActiveApiKey,
    hasStoredKey,
    sanitizeCandidateInput,
    initAntiCheatMonitor,
    getIntegrityStats,
    checkRateLimit,
    escapeHtml,
    logSecurityEvent,
    getAuditLog
  };
})();

window.VAWASecurity = VAWASecurity;
