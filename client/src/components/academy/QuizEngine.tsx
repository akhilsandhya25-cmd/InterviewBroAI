import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizAttempt } from '../../types/academy';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface QuizEngineProps {
  lessonId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
  bestScore?: number;
  initialPassed?: boolean;
  onComplete?: (score: number, passed: boolean) => void;
  onNextAction?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  lessonId,
  lessonTitle,
  questions,
  bestScore = 0,
  initialPassed = false,
  onComplete,
  onNextAction
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastScore, setLastScore] = useState<number>(bestScore);
  const [hasPassed, setHasPassed] = useState<boolean>(initialPassed);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentSelection = currentQuestion ? selectedOptions[currentQuestion.id] : undefined;
  const isAnswered = currentSelection !== undefined;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered || isCompleted) return; // Prevent double selection or altering submitted answers

    const updatedSelections = {
      ...selectedOptions,
      [currentQuestion.id]: optionId
    };
    setSelectedOptions(updatedSelections);

    // If it's the final question, finalize and calculate score
    if (currentIndex === totalQuestions - 1) {
      calculateAndPersistResults(updatedSelections);
    }
  };

  const calculateAndPersistResults = (finalSelections: Record<string, string>) => {
    let correctCount = 0;
    questions.forEach((q) => {
      const selectedId = finalSelections[q.id];
      const correctOpt = q.options.find((opt) => opt.isCorrect);
      if (correctOpt && selectedId === correctOpt.id) {
        correctCount++;
      }
    });

    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercent >= 75;

    setLastScore(scorePercent);
    setHasPassed(passed);
    setIsCompleted(true);

    // Trigger celebratory confetti on passing
    if (passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe check
      }
    }

    // Persist quiz attempt safely isolated by user ID
    const attempt: QuizAttempt = {
      lessonId,
      score: scorePercent,
      totalQuestions,
      passed,
      selectedOptions: finalSelections,
      attemptedAt: new Date().toISOString()
    };

    try {
      storage.recordLessonQuizAttempt(lessonId, attempt, user?.id);
    } catch (e) {
      console.warn('Could not persist quiz attempt to storage:', e);
    }

    if (onComplete) {
      onComplete(scorePercent, passed);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedOptions({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  if (!currentQuestion && !isCompleted) {
    return (
      <div className="p-8 text-center bg-[#0B0F19] rounded-2xl border border-white/[0.08]">
        <HelpCircle className="w-8 h-8 text-[#9AA4B2] mx-auto mb-2" />
        <p className="text-sm text-[#9AA4B2]">No quiz questions available for this lesson.</p>
      </div>
    );
  }

  // ==========================================
  // RESULTS VIEW
  // ==========================================
  if (isCompleted) {
    let correctCount = 0;
    questions.forEach((q) => {
      const selectedId = selectedOptions[q.id];
      const correctOpt = q.options.find((opt) => opt.isCorrect);
      if (correctOpt && selectedId === correctOpt.id) {
        correctCount++;
      }
    });

    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
          {hasPassed ? (
            <Award className="w-8 h-8 text-[#C5F36B]" />
          ) : (
            <RotateCcw className="w-8 h-8 text-amber-400" />
          )}
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/[0.06] text-[#9AA4B2] border border-white/[0.08]">
            Quiz Results
          </span>
          <h3 className="text-2xl font-black text-[#F5F7FA] mt-2">
            {hasPassed ? 'Placement Quiz Mastered!' : 'Keep Practicing! Review Your Answers'}
          </h3>
          <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-md mx-auto mt-1 leading-relaxed">
            {hasPassed
              ? `Outstanding! You scored ${lastScore}% (${correctCount} of ${totalQuestions} correct) on ${lessonTitle}. Your progress has been updated.`
              : `You scored ${lastScore}% (${correctCount} of ${totalQuestions} correct). You need 75% or higher to earn the completion badge for this lesson.`}
          </p>
        </div>

        {/* Score Ring / Bar */}
        <div className="max-w-xs mx-auto p-4 rounded-2xl bg-[#121826] border border-white/[0.06]">
          <div className="flex justify-between items-center text-xs font-semibold text-[#9AA4B2] mb-1.5">
            <span>Accuracy Score</span>
            <span className={hasPassed ? 'text-[#C5F36B] font-bold' : 'text-amber-400 font-bold'}>
              {lastScore}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hasPassed ? 'bg-[#C5F36B]' : 'bg-amber-400'
              }`}
              style={{ width: `${lastScore}%` }}
            />
          </div>
          <div className="text-[10px] text-[#9AA4B2]/70 mt-2">
            Passing threshold: 75% • Total questions: {totalQuestions}
          </div>
        </div>

        {/* Detailed Breakdown Accordion / List */}
        <div className="text-left space-y-3 pt-4 border-t border-white/[0.06]">
          <div className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            Review Questions & Explanations:
          </div>
          {questions.map((q, idx) => {
            const userChoiceId = selectedOptions[q.id];
            const correctOpt = q.options.find((o) => o.isCorrect);
            const userOpt = q.options.find((o) => o.id === userChoiceId);
            const isUserCorrect = userChoiceId === correctOpt?.id;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border text-xs ${
                  isUserCorrect
                    ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                    : 'bg-rose-500/[0.04] border-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isUserCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-[#F5F7FA]">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="text-[#9AA4B2] text-[11px]">
                      Your answer:{' '}
                      <span className={isUserCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                        {userOpt ? userOpt.text : 'Not answered'}
                      </span>
                    </div>
                    {!isUserCorrect && correctOpt && (
                      <div className="text-[#9AA4B2] text-[11px]">
                        Correct answer: <span className="text-emerald-300 font-medium">{correctOpt.text}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-[#9AA4B2] bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04] mt-1.5 leading-relaxed">
                      <span className="font-semibold text-slate-300">Why: </span>
                      {correctOpt?.explanation}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRestartQuiz}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>

          {onNextAction && (
            <button
              onClick={onNextAction}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{hasPassed ? 'Continue to Next Step' : 'Review Practical Exercise'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUESTION VIEW
  // ==========================================
  const correctOption = currentQuestion.options.find((o) => o.isCorrect);
  const selectedOptionObj = currentQuestion.options.find((o) => o.id === currentSelection);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/[0.08] text-[#C5F36B] border border-[#C5F36B]/20 uppercase">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-[11px] text-[#9AA4B2] font-medium hidden sm:inline">
            • {currentQuestion.conceptKey}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => {
            const hasAnsweredThis = selectedOptions[q.id] !== undefined;
            const isCurrent = i === currentIndex;
            return (
              <span
                key={q.id}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isCurrent
                    ? 'w-6 bg-[#C5F36B]'
                    : hasAnsweredThis
                    ? 'bg-emerald-400/80'
                    : 'bg-white/10'
                }`}
                title={`Question ${i + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Question Prompt */}
      <div>
        <h4 className="text-base sm:text-lg font-bold text-[#F5F7FA] leading-snug">
          {currentQuestion.question}
        </h4>
        {currentQuestion.hint && !isAnswered && (
          <p className="text-xs text-[#9AA4B2] flex items-center gap-1.5 mt-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.04]">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Hint: {currentQuestion.hint}</span>
          </p>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2.5" role="radiogroup" aria-label={currentQuestion.question}>
        {currentQuestion.options.map((option) => {
          const isSelected = currentSelection === option.id;
          const showResult = isAnswered;
          const isCorrect = option.isCorrect;

          let optionStyle =
            'bg-[#121826] border-white/[0.06] text-[#F5F7FA] hover:bg-white/[0.04] hover:border-white/[0.12]';

          if (showResult) {
            if (isCorrect) {
              optionStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-semibold';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'bg-rose-500/10 border-rose-500/40 text-rose-200 font-semibold';
            } else {
              optionStyle = 'bg-[#121826]/40 border-white/[0.03] text-[#9AA4B2] opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${optionStyle} ${
                isAnswered ? 'cursor-default' : 'cursor-pointer'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]`}
              role="radio"
              aria-checked={isSelected}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border ${
                  showResult && isCorrect
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : showResult && isSelected && !isCorrect
                    ? 'bg-rose-500 text-white border-rose-400'
                    : isSelected
                    ? 'bg-[#C5F36B] text-[#080B11] border-[#C5F36B]'
                    : 'bg-white/[0.04] text-[#9AA4B2] border-white/[0.08]'
                }`}
              >
                {option.id.toUpperCase()}
              </div>

              <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                {option.text}
              </div>

              {showResult && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {showResult && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Visible immediately after selecting an answer) */}
      {isAnswered && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in duration-200 ${
            selectedOptionObj?.isCorrect
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {selectedOptionObj?.isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Not Quite Right</span>
              </>
            )}
          </div>
          <p className="text-[#F5F7FA]/90 text-[11px] sm:text-xs">
            {selectedOptionObj?.explanation || correctOption?.explanation}
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      {isAnswered && (
        <div className="flex items-center justify-end pt-2 border-t border-white/[0.06]">
          <button
            onClick={handleNextQuestion}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-md shadow-[#C5F36B]/20 transition-all flex items-center gap-1.5"
          >
            <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'View Final Score'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
