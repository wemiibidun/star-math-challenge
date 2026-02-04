const difficultySelect = document.getElementById('difficulty');
const timeLeftEl = document.getElementById('timeLeft');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const feedbackEl = document.getElementById('feedback');
const progressBar = document.getElementById('progressBar');
const scoreValue = document.getElementById('scoreValue');
const streakValue = document.getElementById('streakValue');
const bestValue = document.getElementById('bestValue');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');

const STORAGE_KEY = 'maths-sprint-best';

let currentQuestion = null;
let timerId = null;
let timeLeft = 30;
let score = 0;
let streak = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;
let history = [];

const ranges = {
  easy: { min: 0, max: 10 },
  medium: { min: 0, max: 50 },
  hard: { min: 0, max: 100 }
};

const operators = ['+', '-', '*', '/'];

const updateStats = () => {
  scoreValue.textContent = score;
  streakValue.textContent = streak;
  bestValue.textContent = bestScore;
};

const updateTimer = () => {
  timeLeftEl.textContent = timeLeft;
  progressBar.style.width = `${(timeLeft / 30) * 100}%`;
};

const setFeedback = (message, type = '') => {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateQuestion = () => {
  const level = difficultySelect.value;
  const { min, max } = ranges[level];
  const op = operators[Math.floor(Math.random() * operators.length)];
  let a = getRandomNumber(min, max);
  let b = getRandomNumber(min, max);

  if (op === '-') {
    if (b > a) [a, b] = [b, a];
  }

  if (op === '/') {
    b = b === 0 ? 1 : b;
    a = a === 0 ? b : a;
    const factor = getRandomNumber(1, Math.max(2, Math.floor(max / b)));
    a = b * factor;
  }

  let answer;
  switch (op) {
    case '+':
      answer = a + b;
      break;
    case '-':
      answer = a - b;
      break;
    case '*':
      answer = a * b;
      break;
    default:
      answer = a / b;
  }

  return {
    label: `${a} ${op} ${b}`,
    answer
  };
};

const renderHistory = () => {
  historyList.innerHTML = '';

  if (!history.length) {
    historyEmpty.style.display = 'block';
    return;
  }

  historyEmpty.style.display = 'none';

  history.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `<div>${item.label} = ${item.user}</div><span>${item.correct ? 'Correct' : 'Wrong'}</span>`;
    historyList.appendChild(li);
  });
};

const startTimer = () => {
  clearInterval(timerId);
  timeLeft = 30;
  updateTimer();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      setFeedback('Time is up! Press next for a new question.', 'error');
      submitBtn.disabled = true;
    }
  }, 1000);
};

const startGame = () => {
  score = 0;
  streak = 0;
  history = [];
  updateStats();
  renderHistory();
  nextQuestion();
  startTimer();
  submitBtn.disabled = false;
  nextBtn.disabled = false;
  answerInput.focus();
};

const nextQuestion = () => {
  currentQuestion = generateQuestion();
  questionEl.textContent = currentQuestion.label;
  answerInput.value = '';
  setFeedback('');
  submitBtn.disabled = false;
  startTimer();
};

const handleSubmit = () => {
  if (!currentQuestion) return;
  const userValue = Number(answerInput.value.trim());

  if (Number.isNaN(userValue)) {
    setFeedback('Enter a valid number to submit.', 'error');
    return;
  }

  const isCorrect = userValue === currentQuestion.answer;

  history.unshift({
    label: currentQuestion.label,
    user: userValue,
    correct: isCorrect
  });
  history = history.slice(0, 5);

  if (isCorrect) {
    score += 10;
    streak += 1;
    setFeedback('Correct! Keep going.', 'success');
  } else {
    score = Math.max(0, score - 5);
    streak = 0;
    setFeedback(`Incorrect. Answer was ${currentQuestion.answer}.`, 'error');
  }

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(STORAGE_KEY, bestScore);
  }

  updateStats();
  renderHistory();

  submitBtn.disabled = true;
  clearInterval(timerId);
}

startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextQuestion);
submitBtn.addEventListener('click', handleSubmit);

answerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleSubmit();
  }
});

difficultySelect.addEventListener('change', () => {
  if (currentQuestion) {
    nextQuestion();
  }
});

updateStats();
renderHistory();
updateTimer();
