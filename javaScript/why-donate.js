/**
 * ONE DROP BLOOD BANK - Why Donate Interactivity & 10-MCQ Eligibility Test
 * Myth vs Fact card flip toggle & 10-MCQ Eligibility Assessment (>= 80% to qualify).
 * Used on: why-donate.html
 * Depends on: store.js, ui.js
 */

const OneDropWhyDonate = {
  questions: [
    {
      id: 1,
      question: "1. What is the standard minimum age required to donate blood?",
      options: [
        "14 years old",
        "18 years old",
        "25 years old",
        "30 years old"
      ],
      correctIndex: 1,
      explanation: "Donors must be at least 18 years old to legally and safely donate blood without parental consent."
    },
    {
      id: 2,
      question: "2. What is the minimum body weight required for whole blood donation?",
      options: [
        "40 kg (88 lbs)",
        "45 kg (99 lbs)",
        "50 kg (110 lbs)",
        "65 kg (143 lbs)"
      ],
      correctIndex: 2,
      explanation: "A minimum weight of 50 kg (110 lbs) ensures that removing 350-450 ml of blood does not cause hypovolemia or fainting."
    },
    {
      id: 3,
      question: "3. What is the required gap between two consecutive whole blood donations?",
      options: [
        "1 week",
        "4 weeks",
        "90 days (approx. 3 months)",
        "1 full year"
      ],
      correctIndex: 2,
      explanation: "A minimum 90-day waiting period allows your body to fully replenish hemoglobin and iron reserves."
    },
    {
      id: 4,
      question: "4. If you have an active fever, cold, or flu symptoms today, can you donate?",
      options: [
        "Yes, donation is always allowed",
        "No, you must wait until fully recovered and symptom-free",
        "Yes, if you take paracetamol right before",
        "Yes, but only plasma units"
      ],
      correctIndex: 1,
      explanation: "Donors must be in good health and completely fever/infection-free on donation day."
    },
    {
      id: 5,
      question: "5. What is the recommended waiting period after getting a new tattoo or piercing?",
      options: [
        "24 hours",
        "6 months",
        "5 years",
        "No waiting period needed"
      ],
      correctIndex: 1,
      explanation: "Standard health safety rules recommend a 6-month deferral to rule out transmission of blood-borne pathogens."
    },
    {
      id: 6,
      question: "6. What is the best preparation before arriving for your blood donation?",
      options: [
        "Fast completely for 24 hours without water",
        "Drink plenty of water and eat a healthy, iron-rich meal",
        "Perform heavy weightlifting right before donating",
        "Drink large quantities of caffeinated energy drinks"
      ],
      correctIndex: 1,
      explanation: "Good hydration and a nutritious meal keep your blood pressure stable and prevent lightheadedness."
    },
    {
      id: 7,
      question: "7. Which of the following conditions permanently disqualifies someone from donating?",
      options: [
        "Having had a mild seasonal cough last month",
        "Testing positive for HIV or active Hepatitis B / C",
        "Having seasonal spring allergies",
        "Wearing corrective prescription glasses"
      ],
      correctIndex: 1,
      explanation: "Chronic viral blood infections like HIV or Hepatitis carry serious transfusion risk and cause permanent deferral."
    },
    {
      id: 8,
      question: "8. How long does the actual blood collection (needle draw) take?",
      options: [
        "8 to 12 minutes",
        "45 seconds",
        "3 to 4 hours",
        "A full day"
      ],
      correctIndex: 0,
      explanation: "The actual blood drawing process takes only 8 to 12 minutes; the rest of the appointment is registration and resting."
    },
    {
      id: 9,
      question: "9. Can you contract HIV or other infections from donating blood?",
      options: [
        "No, sterile single-use disposable needles are used once and discarded",
        "Yes, needles and tubing are reused between donors",
        "Yes, blood donation always weakens immunity permanently",
        "Only if you donate more than once"
      ],
      correctIndex: 0,
      explanation: "Donating blood is 100% safe. Every kit and needle is pre-sterilized, used only once, and immediately disposed of."
    },
    {
      id: 10,
      question: "10. How quickly does the human body replace the lost fluid (plasma) volume after donating?",
      options: [
        "Within 24 to 48 hours with adequate fluids",
        "It takes 6 to 12 months",
        "Plasma volume is never regenerated",
        "It takes 2 years"
      ],
      correctIndex: 0,
      explanation: "Your body replenishes plasma fluid within 24 to 48 hours, while red blood cells rebuild in 4 to 6 weeks."
    }
  ],

  init() {
    this._initMythToggles();
    this._initEligibilityChecker();
  },

  _initMythToggles() {
    document.querySelectorAll('.wd-myth-card').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('open'));
    });
  },

  _initEligibilityChecker() {
    const checkBtn = document.getElementById('check-eligibility-btn') || document.querySelector('.wd-btn-primary');
    if (!checkBtn) return;

    checkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openQuizModal();
    });
  },

  openQuizModal() {
    const questionsHtml = this.questions.map((q, qIdx) => `
      <div class="quiz-q-box" id="quiz-q-${qIdx}">
        <div class="quiz-q-title">${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, optIdx) => `
            <label class="quiz-opt-label">
              <input type="radio" name="q_${qIdx}" value="${optIdx}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const modalContent = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div>
            <span class="quiz-badge">10 MCQs &bull; 100 Marks Total</span>
            <div style="font-size:0.85rem;color:#4b5563;margin-top:4px;">
              Pass Mark: <strong>&ge; 80 Marks (80%)</strong> to qualify as an eligible donor.
            </div>
          </div>
          <div id="quiz-progress-pill" style="font-size:0.8rem;background:#f3f4f6;padding:4px 10px;border-radius:12px;font-weight:600;color:#374151;">
            Answered: <span id="quiz-answered-count">0</span> / 10
          </div>
        </div>

        <form id="eligibility-quiz-form">
          <div style="max-height:55vh;overflow-y:auto;padding-right:6px;" id="quiz-scroll-body">
            ${questionsHtml}
          </div>

          <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end;">
            <button type="submit" class="btn-continue" id="quiz-submit-btn" style="width:100%;justify-content:center;padding:12px;font-size:1rem;background:#dc2626;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;">
              Submit & Check Eligibility &rarr;
            </button>
          </div>
        </form>

        <div id="quiz-result-section" style="display:none;margin-top:20px;"></div>
      </div>
    `;

    const { modalElement } = OneDropUI.showModal('🩸 Blood Donor Eligibility Assessment', modalContent);

    // Expand modal width for comfortable reading
    if (modalElement) {
      modalElement.style.maxWidth = '640px';
    }

    const form = document.getElementById('eligibility-quiz-form');
    const answeredCountEl = document.getElementById('quiz-answered-count');

    // Track selections
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        // Highlight active option
        const parentBox = radio.closest('.quiz-q-box');
        parentBox.querySelectorAll('.quiz-opt-label').forEach(lbl => lbl.classList.remove('selected'));
        radio.closest('.quiz-opt-label').classList.add('selected');
        parentBox.style.borderColor = '#10b981';

        // Update answered count
        const checkedCount = form.querySelectorAll('input[type="radio"]:checked').length;
        if (answeredCountEl) answeredCountEl.textContent = checkedCount;
      });
    });

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const userAnswers = [];
      let unanswered = [];

      this.questions.forEach((q, idx) => {
        const checked = form.querySelector(`input[name="q_${idx}"]:checked`);
        if (checked) {
          userAnswers.push(parseInt(checked.value, 10));
        } else {
          userAnswers.push(null);
          unanswered.push(idx + 1);
        }
      });

      if (unanswered.length > 0) {
        OneDropUI.showToast(`Please answer all questions (Missing: Q${unanswered.join(', Q')})`, 'error', 4000);
        const firstMissing = document.getElementById(`quiz-q-${unanswered[0] - 1}`);
        if (firstMissing) {
          firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstMissing.style.borderColor = '#ef4444';
          firstMissing.style.background = '#fff5f5';
        }
        return;
      }

      // Calculate score
      let correctCount = 0;
      const reviewDetails = [];

      this.questions.forEach((q, idx) => {
        const userAns = userAnswers[idx];
        const isCorrect = userAns === q.correctIndex;
        if (isCorrect) correctCount++;

        reviewDetails.push({
          num: idx + 1,
          question: q.question,
          userChoice: q.options[userAns],
          correctChoice: q.options[q.correctIndex],
          isCorrect,
          explanation: q.explanation
        });
      });

      const marks = correctCount * 10;
      const isEligible = marks >= 80;

      // Hide form and show results
      form.style.display = 'none';
      const resultSection = document.getElementById('quiz-result-section');
      resultSection.style.display = 'block';

      if (isEligible) {
        resultSection.innerHTML = `
          <div class="quiz-result-card pass">
            <div style="font-size:2.8rem;margin-bottom:8px;">🎉</div>
            <h3 style="font-size:1.4rem;font-weight:800;margin-bottom:6px;">CONGRATULATIONS!</h3>
            <p style="font-size:1rem;margin-bottom:12px;">You are fully <strong>ELIGIBLE</strong> to donate blood!</p>
            
            <div class="quiz-result-score">${marks} / 100 Marks</div>
            <div style="font-size:0.95rem;font-weight:700;margin-bottom:16px;">
              Score: ${marks}% (Threshold: &ge; 80% — PASSED)
            </div>

            <p style="font-size:0.9rem;line-height:1.6;color:#065f46;max-width:480px;margin:0 auto 20px;">
              You answered <strong>${correctCount} out of 10</strong> questions correctly. Your health knowledge and clinical status meet standard donation guidelines.
            </p>

            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="become-a-donar.html" class="btn-continue" style="display:inline-block;text-decoration:none;background:#10b981;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;">
                Register as a Donor Now &rarr;
              </a>
              <button type="button" id="review-answers-btn" style="background:#fff;border:1px solid #10b981;color:#065f46;padding:12px 20px;border-radius:10px;font-weight:600;cursor:pointer;">
                Review Answers (${correctCount}/10)
              </button>
            </div>
          </div>
          <div id="quiz-review-container" style="display:none;margin-top:20px;"></div>
        `;
        OneDropUI.showToast(`Passed with ${marks}/100 Marks! You are eligible to donate.`, 'success', 5000);
      } else {
        resultSection.innerHTML = `
          <div class="quiz-result-card fail">
            <div style="font-size:2.8rem;margin-bottom:8px;">⚠️</div>
            <h3 style="font-size:1.4rem;font-weight:800;margin-bottom:6px;">ELIGIBILITY NOT MET</h3>
            <p style="font-size:1rem;margin-bottom:12px;">You scored below the passing threshold of <strong>80 Marks</strong>.</p>
            
            <div class="quiz-result-score">${marks} / 100 Marks</div>
            <div style="font-size:0.95rem;font-weight:700;margin-bottom:16px;">
              Score: ${marks}% (Required: &ge; 80% — NOT PASSED)
            </div>

            <p style="font-size:0.9rem;line-height:1.6;color:#991b1b;max-width:480px;margin:0 auto 20px;">
              You answered <strong>${correctCount} out of 10</strong> questions correctly. To ensure donor and patient safety, candidates must score at least 80 marks.
            </p>

            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <button type="button" id="quiz-retry-btn" class="btn-continue" style="background:#dc2626;color:#fff;border:none;padding:12px 24px;border-radius:10px;font-weight:700;cursor:pointer;">
                🔄 Retake Assessment Test
              </button>
              <button type="button" id="review-answers-btn" style="background:#fff;border:1px solid #dc2626;color:#991b1b;padding:12px 20px;border-radius:10px;font-weight:600;cursor:pointer;">
                Review Explanations
              </button>
            </div>
          </div>
          <div id="quiz-review-container" style="display:none;margin-top:20px;"></div>
        `;
        OneDropUI.showToast(`Scored ${marks}/100 Marks. Need >= 80 to qualify.`, 'error', 5000);
      }

      // Review Answers Toggle
      const reviewBtn = document.getElementById('review-answers-btn');
      const reviewBox = document.getElementById('quiz-review-container');
      if (reviewBtn && reviewBox) {
        reviewBtn.addEventListener('click', () => {
          const isHidden = reviewBox.style.display === 'none';
          reviewBox.style.display = isHidden ? 'block' : 'none';
          reviewBtn.textContent = isHidden ? 'Hide Explanations' : 'Review Explanations';

          if (isHidden && reviewBox.children.length === 0) {
            reviewBox.innerHTML = `
              <h4 style="font-size:1.1rem;margin-bottom:14px;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">
                Detailed Question Review & Explanations
              </h4>
              <div style="max-height:40vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-right:6px;">
                ${reviewDetails.map(r => `
                  <div style="padding:12px 14px;border-radius:10px;background:${r.isCorrect ? '#f0fdf4' : '#fef2f2'};border:1px solid ${r.isCorrect ? '#86efac' : '#fca5a5'};">
                    <div style="font-weight:700;font-size:0.9rem;color:#111827;margin-bottom:6px;">
                      ${r.isCorrect ? '✅' : '❌'} ${r.question}
                    </div>
                    <div style="font-size:0.83rem;margin-bottom:4px;">
                      Your choice: <strong>${r.userChoice}</strong>
                    </div>
                    ${!r.isCorrect ? `
                      <div style="font-size:0.83rem;color:#059669;margin-bottom:4px;">
                        Correct answer: <strong>${r.correctChoice}</strong>
                      </div>
                    ` : ''}
                    <div style="font-size:0.8rem;color:#6b7280;margin-top:6px;font-style:italic;">
                      💡 ${r.explanation}
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          }
        });
      }

      // Retry Button
      const retryBtn = document.getElementById('quiz-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          form.reset();
          form.querySelectorAll('.quiz-opt-label').forEach(lbl => lbl.classList.remove('selected'));
          form.querySelectorAll('.quiz-q-box').forEach(b => {
            b.style.borderColor = '#e5e7eb';
            b.style.background = '#f9fafb';
          });
          if (answeredCountEl) answeredCountEl.textContent = '0';
          form.style.display = 'block';
          resultSection.style.display = 'none';
          resultSection.innerHTML = '';
          const scroll = document.getElementById('quiz-scroll-body');
          if (scroll) scroll.scrollTop = 0;
        });
      }
    });
  }
};
