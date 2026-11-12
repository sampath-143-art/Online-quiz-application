
import React, { useEffect, useState } from "react";
import { questions } from "./questions.js";
import "./style.css";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const [bestScore, setBestScore] = useState(
    () => Number(localStorage.getItem("quizBestScore")) || 0
  );

  const currentQuestion = quizQuestions[currentIndex];

  // Start quiz with 10 random questions
  function startQuiz() {
    const randomQuestions = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    setQuizQuestions(randomQuestions);
    setCurrentIndex(0);
    setSelected(null);
    setTimeLeft(15);
    setAnswers([]);
    setScore(0);
    setScreen("quiz");
  }

  // Calculate final score
  function finishQuiz(finalAnswers) {
    const finalScore = finalAnswers.filter(
      (answer, index) =>
        answer === quizQuestions[index].answer
    ).length;

    setScore(finalScore);

    setBestScore((oldBest) => {
      const newBest = Math.max(oldBest, finalScore);
      localStorage.setItem("quizBestScore", String(newBest));
      return newBest;
    });

    setScreen("result");
  }

  // Move to next question
  function goToNext() {
    if (currentIndex === quizQuestions.length - 1) {
      finishQuiz(answers);
    } else {
      setCurrentIndex((index) => index + 1);
      setSelected(null);
      setTimeLeft(15);
    }
  }

  // Check selected answer
  function chooseAnswer(optionIndex) {
    if (selected !== null) return;

    setSelected(optionIndex);

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = optionIndex;

    setAnswers(updatedAnswers);
  }

  // Timer logic
  useEffect(() => {
    if (screen !== "quiz" || selected !== null) {
      return;
    }

    if (timeLeft <= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentIndex] = null;

      setAnswers(updatedAnswers);

      if (currentIndex === quizQuestions.length - 1) {
        finishQuiz(updatedAnswers);
      } else {
        setCurrentIndex((index) => index + 1);
        setSelected(null);
        setTimeLeft(15);
      }

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [screen, timeLeft, selected, currentIndex, answers]);

  // Calculate percentage
  const percentage =
    quizQuestions.length > 0
      ? Math.round((score / quizQuestions.length) * 100)
      : 0;

  // Home screen
  if (screen === "home") {
    return (
      <main className="app">
        <section className="card home">
          <h1>QuizMate</h1>

          <p>Welcome to the Online Quiz Application!</p>

          <p>
            Test your knowledge with 10 randomly selected
            questions from a set of 30 questions.
          </p>

          <p>Time limit: 15 seconds per question</p>

          <p className="best">
            Your best score: {bestScore}/10
          </p>

          <button onClick={startQuiz}>Start Quiz</button>
        </section>
      </main>
    );
  }

  // Quiz screen
  if (screen === "quiz") {
    if (!currentQuestion) {
      return <h2>No questions available. Please check questions.js.</h2>;
    }

    return (
      <main className="app">
        <section className="card">
          <div className="top-bar">
            <span>
              Question {currentIndex + 1} of {quizQuestions.length}
            </span>

            <span
              className={timeLeft <= 5 ? "timer danger" : "timer"}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="progress">
            <div
              className="progress-fill"
              style={{
                width: `${
                  ((currentIndex + 1) / quizQuestions.length) * 100
                }%`,
              }}
            />
          </div>

          <h2>{currentQuestion.question}</h2>

          <div className="options">
            {currentQuestion.options.map((option, index) => {
              let className = "option";

              if (
                selected !== null &&
                index === currentQuestion.answer
              ) {
                className += " correct";
              } else if (selected === index) {
                className += " wrong";
              }

              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => chooseAnswer(index)}
                  disabled={selected !== null}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="feedback">
              <p>
                {selected === currentQuestion.answer
                  ? "Correct answer!"
                  : "Incorrect answer!"}
              </p>

              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          <button
            className="next-button"
            onClick={goToNext}
            disabled={selected === null}
          >
            {currentIndex === quizQuestions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </section>
      </main>
    );
  }

  // Result screen
  return (
    <main className="app">
      <section className="card result">
        <h1>Quiz Completed!</h1>

        <h2>
          Your Score: {score}/{quizQuestions.length}
        </h2>

        <h3>Percentage: {percentage}%</h3>

        <p>
          Best Score: {bestScore}/10
        </p>

        <h2>Answer Review</h2>

        <div className="review">
          {quizQuestions.map((question, index) => (
            <div className="review-item" key={index}>
              <p>
                <strong>
                  {index + 1}. {question.question}
                </strong>
              </p>

              <p>
                Your answer:{" "}
                {answers[index] === null ||
                answers[index] === undefined
                  ? "Not answered"
                  : question.options[answers[index]]}
              </p>

              <p>
                Correct answer:{" "}
                {question.options[question.answer]}
              </p>

              <p>{question.explanation}</p>
            </div>
          ))}
        </div>

        <button onClick={startQuiz}>Try Again</button>
      </section>
    </main>
  );
}
