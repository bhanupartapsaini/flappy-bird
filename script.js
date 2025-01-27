//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let highestScore = 0; // Track highest score in session

//sounds
let wingSound = new Audio("./assets/sfx_wing.wav");
let hitSound = new Audio("./assets/sfx_hit.wav");
let bgm = new Audio("./assets/bgm_mario.mp3");
bgm.loop = true;

let dieSound = new Audio("./assets/sfx_die.wav");
let point = new Audio("./assets/sfx_point.wav");
let swooshing = new Audio("./assets/sfx_swooshing.wav");

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  for (let i = 0; i < 4; i++) {
    let birdImg = new Image();
    birdImg.src = `./assets/flappybird${i}.png`;
    birdImgs.push(birdImg);
  }

  topPipeImg = new Image();
  topPipeImg.src = "./assets/toppipe.png";
  bottomPipeImg = new Image();
  bottomPipeImg.src = "./assets/bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipes, 1500);
  setInterval(animateBird, 100);
  document.addEventListener("keydown", moveBird);
  board.addEventListener("touchstart", moveBird);
};

function update() {
  requestAnimationFrame(update);
  if (gameOver) return;

  context.clearRect(0, 0, board.width, board.height);

  // Bird physics
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);

  // Play swooshing sound when falling
  try {
    if (velocityY > 0) {
      swooshing.play();
    }
  } catch (e) {}

  context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    dieSound.play();
    gameOver = true;
  }

  // Pipes movement
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      point.play();
    }

    if (detectCollision(bird, pipe)) {
      hitSound.play();
      gameOver = true;
    }
  }

  // Remove old pipes
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // Score display
  context.fillStyle = "white";
  context.font = "30px sans-serif";
  context.fillText(`Score: ${score}`, 5, 45);
  context.fillText(`Highest Score: ${highestScore}`, 5, 90); // Show highest score

  // Game Over Display
  if (gameOver) {
    if (score > highestScore) {
      highestScore = score; // Update highest score if beaten
    }

    context.fillText("GAME OVER", 5, 135);
  }
}

function animateBird() {
  birdImgsIndex++;
  birdImgsIndex %= birdImgs.length;
}

function placePipes() {
  if (gameOver) return;

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (
    e.code == "Space" ||
    e.code == "ArrowUp" ||
    e.code == "KeyX" ||
    e.type === "touchstart"
  ) {
    if (bgm.paused) bgm.play();

    wingSound.play();

    // Jump
    velocityY = -6;

    // Reset game
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
