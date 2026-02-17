/**
 * QuizEngine — Core quiz logic, reusable across standalone and embedded modes
 */
class QuizEngine {
    constructor(options = {}) {
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answers = []; // { questionIndex, selectedAnswer, correct }
        this.shuffle = options.shuffle !== false;
        this.timer = options.timer || false;
        this.timeLimit = options.timeLimit || 0; // seconds, 0 = no limit
        this.elapsed = 0;
        this.timerInterval = null;
        this.state = 'idle'; // idle, active, finished
        this.onTick = options.onTick || null;
    }

    /**
     * Load questions from data source
     * @param {Array} questions — array of question objects
     */
    loadQuestions(questions) {
        this.questions = questions.map((q, i) => ({ ...q, originalIndex: i }));
        if (this.shuffle) {
            this.questions = this._shuffleArray(this.questions);
        }
        // Shuffle options for each question
        this.questions = this.questions.map(q => {
            const optionKeys = Object.keys(q.options);
            const shuffledKeys = this.shuffle ? this._shuffleArray([...optionKeys]) : optionKeys;
            return { ...q, displayOrder: shuffledKeys };
        });
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        this.elapsed = 0;
        this.state = 'idle';
    }

    /**
     * Start the quiz
     */
    start() {
        if (this.questions.length === 0) return;
        this.state = 'active';
        this.currentIndex = 0;
        this.score = 0;
        this.answers = [];
        this.elapsed = 0;

        if (this.timer) {
            this._startTimer();
        }
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        if (this.state !== 'active') return null;
        return this.questions[this.currentIndex] || null;
    }

    /**
     * Submit answer for current question
     * @param {string} answerKey — 'a', 'b', 'c', 'd', or 'e'
     * @returns {{ correct: boolean, correctAnswer: string }}
     */
    submitAnswer(answerKey) {
        if (this.state !== 'active') return null;

        const question = this.questions[this.currentIndex];
        const correct = answerKey === question.correct_answer;

        if (correct) this.score++;

        this.answers.push({
            questionIndex: this.currentIndex,
            selectedAnswer: answerKey,
            correctAnswer: question.correct_answer,
            correct
        });

        return { correct, correctAnswer: question.correct_answer };
    }

    /**
     * Move to next question
     * @returns {boolean} true if there's a next question, false if quiz is done
     */
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            return true;
        } else {
            this.finish();
            return false;
        }
    }

    /**
     * Finish the quiz
     */
    finish() {
        this.state = 'finished';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Get quiz results
     */
    getResults() {
        const total = this.questions.length;
        const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;
        let rating;
        if (percentage >= 90) rating = 'excellent';
        else if (percentage >= 70) rating = 'good';
        else if (percentage >= 50) rating = 'average';
        else rating = 'poor';

        return {
            score: this.score,
            total,
            percentage,
            rating,
            elapsed: this.elapsed,
            answers: this.answers
        };
    }

    /**
     * Get progress
     */
    getProgress() {
        return {
            current: this.currentIndex + 1,
            total: this.questions.length,
            percentage: Math.round(((this.currentIndex + 1) / this.questions.length) * 100)
        };
    }

    // --- Private methods ---

    _startTimer() {
        this.timerInterval = setInterval(() => {
            this.elapsed++;
            if (this.onTick) this.onTick(this.elapsed);
            if (this.timeLimit > 0 && this.elapsed >= this.timeLimit) {
                this.finish();
            }
        }, 1000);
    }

    _shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Format seconds as mm:ss
     */
    static formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

// Export for module usage or keep global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}
