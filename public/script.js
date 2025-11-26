const board = document.querySelector(".board");
const startBtn = document.querySelector(".btn-start");
const model = document.querySelector(".model");
const startGameModel = document.querySelector(".start-game");
const gameOverModel = document.querySelector(".game-over");
const restartBtn = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

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

// generate grid blocks
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${r}-${c}`] = block;
  }
}

function render() {
  let head = null;

  blocks[`${food.x}-${food.y}`].classList.add("food");

  if (direction === "left") head = { x: snake[0].x, y: snake[0].y - 1 };
  else if (direction === "right") head = { x: snake[0].x, y: snake[0].y + 1 };
  else if (direction === "down") head = { x: snake[0].x + 1, y: snake[0].y };
  else if (direction === "up") head = { x: snake[0].x - 1, y: snake[0].y };

  // GAME OVER → wall hit
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

  // FOOD EAT
  if (head.x == food.x && head.y == food.y) {
    blocks[`${food.x}-${food.y}`].classList.remove("food");

    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };

    blocks[`${food.x}-${food.y}`].classList.add("food");

    snake.unshift(head);

    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore.toString());
    }
  }

  snake.forEach(segment =>
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
  );

  snake.unshift(head);
  snake.pop();

  snake.forEach(segment =>
    blocks[`${segment.x}-${segment.y}`].classList.add("fill")
  );
}

// Start Game
startBtn.addEventListener("click", () => {
  model.style.display = "none";

  intervalId = setInterval(render, 500);

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);
    sec++;
    if (sec === 60) {
      min++;
      sec = 0;
    }
    time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
});

restartBtn.addEventListener("click", resetGame);

function resetGame() {
  blocks[`${food.x}-${food.y}`].classList.remove("food");

  snake.forEach(segment =>
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
  );

  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  score = 0;
  time = `00:00`;
  scoreElement.innerText = score;
  timeElement.innerText = time;

  model.style.display = "none";

  snake = [{ x: 1, y: 3 }];
  direction = "down";

  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };

  intervalId = setInterval(render, 500);

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split(":").map(Number);
    sec++;
    if (sec === 60) {
      min++;
      sec = 0;
    }
    time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
}

// KEYBOARD
addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") direction = "up";
  if (e.key == "ArrowDown") direction = "down";
  if (e.key == "ArrowLeft") direction = "left";
  if (e.key == "ArrowRight") direction = "right";
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
