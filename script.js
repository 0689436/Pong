const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

const paddleWidth = 10;
const paddleHeight = 80;
const ballRadius = 8;
const speed = 4;

let playerPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2 };
let computerPaddle = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: -speed, dy: speed };
let score = 0;
let isRGBCelebration = false;
let rgbTimer = 0;
let isGameOver = false;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Fetch and display total commits from GitHub API
function fetchRevisions() {
  const owner = "0689436";
  const repo = "pong";
  const branch = "main"; // Replace with your branch name
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=1`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`GitHub API returned an error: ${response.status}`);
      }

      // Get the 'Link' header to determine pagination
      const linkHeader = response.headers.get("Link");
      let totalCommits;

      if (linkHeader) {
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (match) {
          totalCommits = parseInt(match[1], 10);
        }
      }

      // If not paginated (only 1 page), get the number of results
      return response.json().then(data => totalCommits || data.length);
    })
    .then(totalCommits => {
      pubrevnum = totalCommits;
      console.log("Total Commits:", pubrevnum);

      // Update the displayed revision number
      const pubRevNumDisplay = document.getElementById("pubrevnum");
      if (pubRevNumDisplay) {
        pubRevNumDisplay.textContent = pubrevnum; // Set only the revision number
      }
    })
    .catch(error => {
      console.error("Error fetching commits:", error);
    });
}

function update() {
    if (isGameOver) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y >= canvas.height) ball.dy *= -1;

    // Player paddle collision
    if (
        ball.x - ballRadius <= playerPaddle.x + paddleWidth &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + paddleHeight
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball moves toward the computer
        score++;
        if (score >= 10) {
            isRGBCelebration = true;
            rgbTimer = 30; // Celebrate for 30 frames (~0.5 seconds at 60 FPS)
        }
    }

    // Computer paddle collision
    if (
        ball.x + ballRadius >= computerPaddle.x &&
        ball.y >= computerPaddle.y &&
        ball.y <= computerPaddle.y + paddleHeight
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves toward the player
        score++;
        if (score >= 10) {
            isRGBCelebration = true;
            rgbTimer = 30;
        }
    }

    // Ball goes off-screen or misses paddle
    if (ball.x < 0 || ball.x > canvas.width) {
        isGameOver = true;
        return;
    }

    // Computer paddle AI: Perfect tracking
    computerPaddle.y = ball.y - paddleHeight / 2;

    // RGB Celebration countdown
    if (isRGBCelebration) {
        rgbTimer--;
        if (rgbTimer <= 0) isRGBCelebration = false;
    }
}

function resetGame() {
    ball = { x: canvas.width / 2, y: canvas.height / 2, dx: -speed, dy: speed };
    score = 0;
    isRGBCelebration = false;
    rgbTimer = 0;
    isGameOver = false;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(playerPaddle.x, playerPaddle.y, paddleWidth, paddleHeight, 'white');
    drawRect(computerPaddle.x, computerPaddle.y, paddleWidth, paddleHeight, 'white');

    const ballColor = isRGBCelebration
        ? `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
        : 'white';
    drawBall(ball.x, ball.y, ballRadius, ballColor);

    ctx.fillText(`Score: ${score}`, 10, 20);

    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Game Over! Press Reset to Restart', canvas.width / 4, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
    if (isGameOver) return;

    if (event.key === 'ArrowUp' && playerPaddle.y > 0) playerPaddle.y -= 20;
    if (event.key === 'ArrowDown' && playerPaddle.y < canvas.height - paddleHeight) playerPaddle.y += 20;
    if (event.key === 'w' && playerPaddle.y > 0) playerPaddle.y -= 20;
    if (event.key === 's' && playerPaddle.y < canvas.height - paddleHeight) playerPaddle.y += 20;
});

// Toggle the hamburger menu
function toggleMenu() {
    const menu = document.getElementById('menu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
}

gameLoop();
