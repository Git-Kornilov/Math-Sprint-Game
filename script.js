"use strict";

// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh splashPage best scores
const bestScoresToDOM = () => {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
};

// Check localStorage
const getSavedBestScores = () => {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      {
        questions: 10,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 25,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 50,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 99,
        bestScore: finalTimeDisplay,
      },
    ];

    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }

  bestScoresToDOM();
};

// update bestScoreArray
const updateBestScore = () => {
  bestScoreArray.forEach((score, index) => {
    // use ==
    if (questionAmount == score.questions) {
      const saveBestScore = Number(bestScoreArray[index].bestScore);

      if (saveBestScore === 0 || saveBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });

  bestScoresToDOM();

  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
};

// Play again
const playAgain = () => {
  gamePage.addEventListener("click", startTimer);

  scorePage.hidden = true;
  splashPage.hidden = false;
  playAgainBtn.hidden = true;

  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
};

const showScorePage = () => {
  setTimeout(() => (playAgainBtn.hidden = false), 1000);

  gamePage.hidden = true;
  scorePage.hidden = false;
};

//Results to DOM
const scoresToDom = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  baseTimeEl.textContent = `Base time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScore();

  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });

  showScorePage();
};

// Stop timer
const checkTime = () => {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);

    playerGuessArray.forEach((equations, indx) => {
      if (equations.evaluated === playerGuessArray[indx]) {
        // no penalty
      } else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;

    scoresToDom();
  }
};

const addTime = () => {
  timePlayed += 0.1;

  checkTime();
};

// Start timer
const startTimer = () => {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;

  timer = setInterval(addTime, 100);

  gamePage.removeEventListener("click", startTimer);
};

const select = (guessedTrue) => {
  //scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);

  // guess to array
  return guessedTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
};

const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    const item = document.createElement("div");
    item.classList.add("item");

    const equationText = document.createElement("h1");
    equationText.textContent = equation.value;

    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }

  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }

  // shuffle array
  shuffle(equationsArray);
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

const countdownStart = () => {
  let count = 3;
  countdown.textContent = count;

  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      countdown.textContent = "GO!";
    } else if (count === -1) {
      showGamePage();
      clearInterval(timer);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
};

const showCountdown = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;

  countdownStart();
  populateGamePage();
};

const getRadioValue = () => {
  let radioValue;

  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });

  return radioValue;
};

const selectQuestionAmount = function (e) {
  e.preventDefault();
  questionAmount = getRadioValue();

  if (questionAmount) showCountdown();
};

// addEventListener
startForm.addEventListener("click", () => {
  radioContainers.forEach((radioEl) => {
    radioEl.classList.remove("selected-label");

    // radioEl is radio-container;
    // radioEl.children[1] is 'input type="radio" ...' in radio-container
    if (radioEl.children[1].checked) radioEl.classList.add("selected-label");
  });
});

startForm.addEventListener("submit", selectQuestionAmount);

gamePage.addEventListener("click", startTimer);

getSavedBestScores();
