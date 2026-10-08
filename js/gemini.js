/**
 * VAWA Gemini AI Bridge
 * Direct client-side integration with Google Gemini API:
 * - Generates real-time adaptive viva questions for ANY topic
 * - Deeply evaluates candidate answers with customized rubric
 * - Synthesizes crystal-clear "Good & Simple Answers"
 * - Automatically falls back to offline engine when key is absent or offline
 */

const VAWAGemini = (() => {
  'use strict';

  const GEMINI_MODEL = 'gemini-2.5-flash';
  const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  /**
   * Generates a tailored viva question using Gemini API
   */
  async function generateQuestion(topic, difficultyLevel, previousQAHistory = []) {
    const apiKey = window.VAWASecurity ? window.VAWASecurity.getActiveApiKey() : null;
    
    // If no key configured, use built-in knowledge engine
    if (!apiKey) {
      const curriculum = window.VAWAKnowledge.findCurriculum(topic);
      const tierQuestions = curriculum.questions[difficultyLevel] || curriculum.questions['standard'];
      const questionIndex = Math.min(previousQAHistory.length, tierQuestions.length - 1);
      return tierQuestions[questionIndex] || tierQuestions[0];
    }

    const difficultyPrompts = {
      foundation: 'Foundational & conceptual grounding. Focus on primary definitions, primary intuition, and why it exists.',
      standard: 'Practitioner & applied mechanics. Focus on architectural trade-offs, internal mechanisms, and concrete operations.',
      rigorous: 'Advanced & pathological conditions. Focus on failure modes, edge cases, mathematical/structural limits, and stress testing.',
      crucible: 'Doctoral / PhD defense level. Highly dialectical, challenging core dogmas, counter-examples, and theoretical validity.'
    };

    const systemInstruction = `You are the Lead Senior Professor and Chairman of an elite Academic Oral Viva Examination Board.
Your mission is to examine the candidate on the topic: "${topic}".
Difficulty level: ${difficultyLevel.toUpperCase()} (${difficultyPrompts[difficultyLevel] || ''}).

Respond strictly in valid JSON adhering to this schema:
{
  "id": "gemini-${Date.now()}",
  "question": "A formal, piercing viva question addressed to 'Candidate...'",
  "keywords": ["list", "of", "4-8", "critical", "technical", "terms"],
  "idealAnswer": "Thorough, authoritative master's level answer.",
  "simpleAnswer": {
    "summary": "Crisp 1-2 sentence core intuition in plain, direct English.",
    "analogy": "A brilliant, vivid real-world analogy that makes the concept instantly memorable.",
    "threePillars": [
      "Pillar 1: Key mechanism",
      "Pillar 2: Critical trade-off or boundary",
      "Pillar 3: Lasting takeaway rule"
    ]
  }
}`;

    const promptText = `Generate the next viva question for topic "${topic}".
Previous examination questions asked in this session:
${previousQAHistory.map((qa, i) => `Q${i+1}: ${qa.question}`).join('\n') || 'None (This is the inaugural question).'}`;

    try {
      const response = await fetch(`${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(rawText);
      return parsed;
    } catch (err) {
      console.warn('Gemini question generation error, falling back to local engine:', err);
      // Fallback
      const curriculum = window.VAWAKnowledge.findCurriculum(topic);
      const tierQuestions = curriculum.questions[difficultyLevel] || curriculum.questions['standard'];
      return tierQuestions[0];
    }
  }

  /**
   * Evaluates candidate response using Gemini API
   */
  async function evaluateAnswer(candidateAnswer, questionObj, difficultyLevel) {
    const apiKey = window.VAWASecurity ? window.VAWASecurity.getActiveApiKey() : null;

    if (!apiKey) {
      // Offline fallback
      return window.VAWAKnowledge.evaluateAnswer(candidateAnswer, questionObj, difficultyLevel);
    }

    const systemInstruction = `You are a prestigious Academic Viva Examiner evaluating a candidate's spoken defense.
Question asked: "${questionObj.question}"
Difficulty: ${difficultyLevel}
Ideal Benchmark: "${questionObj.idealAnswer}"

Analyze the candidate's actual response. Grade strictly but constructively.
Respond strictly in valid JSON adhering to this schema:
{
  "score": <integer from 0 to 100>,
  "grade": "<First Class Honours (Summa Cum Laude) | Upper Second Honours (Magna Cum Laude) | Merit Pass | Conditional Pass | Deficient>",
  "feedback": "<2-3 sentences of formal viva feedback, praising strong concepts and pointing out missed nuances>",
  "keyConceptsPresent": ["list", "of", "concepts", "candidate", "mentioned"],
  "keyConceptsMissing": ["list", "of", "vital", "concepts", "candidate", "omitted"],
  "simpleAnswer": {
    "summary": "<The most crystal-clear, plain-English explanation of this concept>",
    "analogy": "<A memorable, intuitive real-world analogy>",
    "threePillars": [
      "<Pillar 1>",
      "<Pillar 2>",
      "<Pillar 3>"
    ]
  }
}`;

    try {
      const response = await fetch(`${BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Candidate's Response: "${candidateAnswer}"` }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      parsed.idealAnswer = questionObj.idealAnswer;
      return parsed;
    } catch (err) {
      console.warn('Gemini evaluation error, falling back to local engine:', err);
      return window.VAWAKnowledge.evaluateAnswer(candidateAnswer, questionObj, difficultyLevel);
    }
  }

  return {
    generateQuestion,
    evaluateAnswer
  };
})();

window.VAWAGemini = VAWAGemini;
