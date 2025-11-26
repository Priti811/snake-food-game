const board = document.querySelector(".board");
const startBtn = document.querySelector(".btn-start");
const model = document.querySelector(".model");
const startGameModel = document.querySelector(".start-game");
const gameOverModel = document.querySelector(".game-over");
const restartBtn = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

// const blockHeight = 50;
// const blockWidth = 50;

// responsive block size
const blockSize = window.innerWidth < 600 ? 30 : 50;
document.documentElement.style.setProperty("--block-size", blockSize + "px");

const blockHeight = blockSize;
const blockWidth = blockSize;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00:00`;
highScoreElement.innerText = highScore;

const rows = Math.floor(board.clientHeight / blockHeight);
const cols = Math.floor(board.clientWidth / blockWidth);

const blocks = [];
let snake = [{ x: 1, y: 3 }];
let direction = "down";

let intervalId = null;
let timerIntervalId = null;
let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    // block.style.top = `${r * blockHeight}px`;
    // block.style.left = `${c * blockWidth}px`;
    // block.innerText = `${r},${c}`;
    blocks[`${r}-${c}`] = block;
  }
}

function render() {
  let head = null;

  // draw food
  blocks[`${food.x}-${food.y}`].classList.add("food");
  // move snake
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }
  // check collisions with walls
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    // phone vibration
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // desktop shake
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 400);

    model.style.display = "flex";
    startGameModel.style.display = "none";
    gameOverModel.style.display = "flex";
    return;
  }

  // eat food
  if (head.x == food.x && head.y == food.y) {
    // remove old food
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    // redraw food after eating
    blocks[`${food.x}-${food.y}`].classList.add("food");
    // grow snake
    snake.unshift(head);
    score += 10;
    scoreElement.innerText = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
    }
  }
  // erase snake
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
  snake.unshift(head);
  snake.pop();
  // draw snake
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

// start game
startBtn.addEventListener("click", () => {
  model.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, 500);
  // start timer
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${min}:${sec}`;
    timeElement.innerText = time;
  }, 1000);
});

restartBtn.addEventListener("click", resetGame);

function resetGame() {
  // Remove existing food and snake from the board
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
  // Reset variables
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  score = 0;
  time = `00:00`;

  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;
  // Reset snake position
  model.style.display = "none";
  direction = "down";
  snake = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  intervalId = setInterval(() => {
    render();
  }, 500);
  // Restart timer
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${min}:${sec}`;
    timeElement.innerText = time;
  }, 1000);
}

addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") {
    direction = "up";
  } else if (e.key == "ArrowDown") {
    direction = "down";
  } else if (e.key == "ArrowLeft") {
    direction = "left";
  } else if (e.key == "ArrowRight") {
    direction = "right";
  }
});

// TOUCH (Swipe Controls)
let startX = 0,
  startY = 0;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchmove", (e) => {
  if (!startX || !startY) return;

  let endX = e.touches[0].clientX;
  let endY = e.touches[0].clientY;

  let diffX = startX - endX;
  let diffY = startY - endY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) direction = "left";
    else direction = "right";
  } else {
    if (diffY > 0) direction = "up";
    else direction = "down";
  }

  startX = null;
  startY = null;
});
