/**
 * QuizUI — Renders and controls quiz interface
 * Works with QuizEngine for logic
 */
class QuizUI {
  constructor(containerEl, engine, options = {}) {
    this.container = typeof containerEl === 'string'
      ? document.querySelector(containerEl)
      : containerEl;
    this.engine = engine;
    this.onFinish = options.onFinish || null;
    this.showTimer = options.showTimer !== false;
    this.feedbackDelay = options.feedbackDelay || 1200;
    this.isTransitioning = false;
  }

  /**
   * Render the quiz start screen or jump straight to questions
   */
  render() {
    this.engine.start();
    this._renderQuestion();
  }

  /**
   * Render current question
   */
  _renderQuestion() {
    const question = this.engine.getCurrentQuestion();
    if (!question) return;

    const progress = this.engine.getProgress();

    this.container.innerHTML = `
      <div class="quiz-container animate-fade-in">
        <div class="quiz-card-premium">
            <!-- Header -->
            <div class="quiz-header">
                <span class="quiz-question-number">Questão ${progress.current} de ${progress.total}</span>
                <div class="quiz-score">🏁 ${this.engine.score} acertos</div>
            </div>

            <!-- Progress Bar -->
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" style="width: ${progress.percentage}%"></div>
            </div>

            <!-- Question Box -->
            <div class="quiz-question-box">
                <div class="quiz-question-text">${this._formatQuestionText(question.question)}</div>
            </div>

            <!-- Options -->
            <div class="quiz-options stagger" id="quiz-options">
                ${question.displayOrder.map(key => `
                    <div class="quiz-option" data-answer="${key}" onclick="quizUI._selectOption('${key}')">
                        <span class="quiz-option-letter">${key.toUpperCase()}</span>
                        <span class="quiz-option-text">${question.options[key]}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Actions (hidden until answer selected) -->
            <div class="quiz-actions hidden" id="quiz-actions">
                <div id="quiz-feedback"></div>
                <button class="btn btn-primary btn-lg" onclick="quizUI._next()">
                    ${progress.current < progress.total ? 'Próxima Questão →' : 'Finalizar Quiz →'}
                </button>
            </div>
        </div>
      </div>
    `;

    // Update timer display
    if (this.showTimer) {
      this.engine.onTick = (elapsed) => {
        const el = document.getElementById('quiz-timer-display');
        if (el) el.textContent = QuizEngine.formatTime(elapsed);
      };
    }
  }

  /**
   * Handle option selection
   */
  _selectOption(answerKey) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const result = this.engine.submitAnswer(answerKey);
    const options = document.querySelectorAll('.quiz-option');

    // Disable all options
    options.forEach(opt => {
      opt.classList.add('disabled');
      const key = opt.dataset.answer;
      if (key === result.correctAnswer) {
        opt.classList.add('correct');
      } else if (key === answerKey && !result.correct) {
        opt.classList.add('incorrect');
      }
    });

    // Show feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    const actionsEl = document.getElementById('quiz-actions');

    if (result.correct) {
      feedbackEl.innerHTML = '<span style="color: #10b981;">✨ Excelente! Você acertou!</span>';
    } else {
      feedbackEl.innerHTML = `<span style="color: #ef4444;">📚 Ops! A correta era <strong>${result.correctAnswer.toUpperCase()}</strong></span>`;
    }

    // Update score display if any
    const scoreEl = this.container.querySelector('.quiz-score');
    if (scoreEl) scoreEl.innerHTML = `🏁 ${this.engine.score} acertos`;

    actionsEl.classList.remove('hidden');
    actionsEl.classList.add('animate-fade-in');
  }

  /**
   * Go to next question or show results
   */
  _next() {
    this.isTransitioning = false;
    const hasNext = this.engine.nextQuestion();

    if (hasNext) {
      this._renderQuestion();
    } else {
      this._renderResult();
    }
  }

  /**
   * Render quiz results screen
   */
  _renderResult() {
    const results = this.engine.getResults();
    const emoji = results.rating === 'excellent' ? '🏆' :
      results.rating === 'good' ? '🎉' :
        results.rating === 'average' ? '📚' : '💪';

    const message = results.rating === 'excellent' ? 'Fantástico! Você é um mestre!' :
      results.rating === 'good' ? 'Muito bom! Quase perfeito!' :
        results.rating === 'average' ? 'Bom esforço! Mais uma revisão e você chega lá.' :
          'O importante é não parar! Vamos estudar mais um pouco?';

    this.container.innerHTML = `
      <div class="quiz-container animate-fade-in">
        <div class="quiz-card-premium quiz-result">
          <div style="font-size: 5rem; margin-bottom: var(--space-md);">${emoji}</div>
          <h2 style="margin-bottom: 0;">Resultado</h2>
          <div class="quiz-result-score ${results.rating}">
            ${results.percentage}%
          </div>
          <div class="quiz-result-label" style="font-weight: 800; font-size: 1.25rem; margin-bottom: var(--space-md);">${message}</div>
          
          <div class="quiz-result-details">
            Você gabaritou <strong>${results.score}</strong> de <strong>${results.total}</strong> questões
            ${this.showTimer ? ` em um tempo de <strong>${QuizEngine.formatTime(results.elapsed)}</strong>` : ''}
          </div>

          <!-- Answer review -->
          <div style="text-align: left; margin: var(--space-xl) 0;">
            <h3 style="margin-bottom: var(--space-md); font-family: var(--font-serif);">📋 Revisão Final</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              ${results.answers.map((a, i) => `
                <div class="review-item">
                  <div class="review-badge ${a.correct ? 'correct' : 'incorrect'}">${a.correct ? 'Correta' : 'Incorreta'}</div>
                  <div style="font-size: 0.95rem; color: var(--toggl-purple);">
                    <strong>Q${i + 1}:</strong> Sua escolha foi <strong>${a.selectedAnswer.toUpperCase()}</strong>
                    ${!a.correct ? ` <br><span style="opacity: 0.7">Gabarito: <strong>${a.correctAnswer.toUpperCase()}</strong></span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: var(--space-md); justify-content: center; margin-top: var(--space-xl);">
            <button class="btn btn-primary btn-lg" onclick="quizUI._restart()">
              🔄 Tentar Novamente
            </button>
            <button class="btn btn-secondary btn-lg" onclick="quizUI._goBack()">
              ← Voltar à Jornada
            </button>
          </div>

          <div style="margin-top: var(--space-xl); color: var(--toggl-purple); opacity: 0.5; font-size: 0.85rem; font-weight: 600;">
            Seu progresso foi salvo localmente! Continue evoluindo. 🚀
          </div>
        </div>
      </div>
    `;

    // Save to localStorage
    this._saveResult(results);

    if (this.onFinish) this.onFinish(results);
  }

  /**
   * Restart quiz with same questions
   */
  _restart() {
    this.engine.loadQuestions(this.engine.questions.map(q => {
      // reconstruct original question
      const { displayOrder, originalIndex, ...rest } = q;
      return rest;
    }));
    this.render();
  }

  /**
   * Navigate back
   */
  _goBack() {
    const params = new URLSearchParams(window.location.search);
    const week = params.get('week');
    if (week) {
      window.location.href = `week.html?week=${week}`;
    } else {
      window.location.href = 'syllabus.html';
    }
  }

  /**
   * Save result to localStorage
   */
  _saveResult(results) {
    try {
      const params = new URLSearchParams(window.location.search);
      const week = params.get('week') || 'all';
      const key = `tutoria_quiz_${week}`;

      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      saved.push({
        score: results.score,
        total: results.total,
        percentage: results.percentage,
        elapsed: results.elapsed,
        date: new Date().toISOString()
      });

      if (saved.length > 20) saved.shift();
      localStorage.setItem(key, JSON.stringify(saved));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  /**
   * Format question text, handling newlines and special formatting
   */
  _formatQuestionText(text) {
    if (!text) return '';
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\|(.*?)\|/g, (match) => match);
  }
}

// Global reference for inline onclick handlers
let quizUI = null;
