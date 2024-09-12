const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

let frames = 0;
const gravity = 0.25;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let pipeSpeed = 2;
let gameOver = false;

// Música de fundo
const backgroundMusic = document.getElementById('backgroundMusic');
backgroundMusic.play();

// Sons
const flapSound = document.getElementById('flapSound');
const hitSound = document.getElementById('hitSound');
const scoreSound = document.getElementById('scoreSound');

// Efeito Parallax (camadas de fundo)
const backgroundLayer1 = {
  x: 0,
  y: canvas.height - 100,
  width: canvas.width,
  height: 100,
  speed: 1,
  draw() {
    ctx.fillStyle = '#654321'; // Cor do chão
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillRect(this.x + this.width, this.y, this.width, this.height);
  },
  update() {
    this.x -= this.speed;
    if (this.x <= -this.width) {
      this.x = 0;
    }
  }
};

const backgroundLayer2 = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  speed: 0.5,
  draw() {
    ctx.fillStyle = '#87CEEB'; // Cor do céu
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillRect(this.x + this.width, this.y, this.width, this.height);
  },
  update() {
    this.x -= this.speed;
    if (this.x <= -this.width) {
      this.x = 0;
    }
  }
};

// Sistema de partículas
const particles = [];

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 2,
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 - 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      life: 100
    });
  }
}

function drawParticles() {
  particles.forEach((particle, index) => {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.life--;
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });
}

// Novo tipo de obstáculo: Nuvens
const clouds = [];

function createCloud() {
  clouds.push({
    x: canvas.width,
    y: Math.random() * (canvas.height / 2),
    width: 40,
    height: 20,
    speed: 2
  });
}

function drawClouds() {
  clouds.forEach(cloud => {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
  });
}

function updateClouds() {
  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < 0) {
      clouds.shift();
    }
  });
}

// Função de Game Over personalizada
function showGameOverScreen() {
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScoreElement = document.getElementById('finalScore');
  finalScoreElement.textContent = score;
  gameOverScreen.style.display = 'block';
}

function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  clouds.length = 0;
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
  }
  score = 0;
  pipeSpeed = 2;
  gameOver = false;
  backgroundMusic.play();
  document.getElementById('gameOverScreen').style.display = 'none';
}

const bird = {
  x: 50,
  y: 150,
  width: 20,
  height: 20,
  velocity: 0,
  jump: 4.6,
  rotation: 0,
  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  },
  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    if (this.velocity >= 0) {
      this.rotation = Math.min(this.velocity / 10, Math.PI / 4);
    } else {
      this.rotation = Math.max(this.velocity / 10, -Math.PI / 4);
    }

    if (this.y + this.height > canvas.height) {
      hitSound.play();
      createParticles(this.x + this.width / 2, canvas.height);
      backgroundMusic.pause();
      gameOver = true;
      showGameOverScreen();
    }
  },
  flap() {
    if (!gameOver) {
      this.velocity = -this.jump;
      flapSound.play();
    }
  }
};

// Canos e pontuação permanecem os mesmos

function loop() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo parallax
    backgroundLayer2.draw();
    backgroundLayer2.update();
    backgroundLayer1.draw();
    backgroundLayer1.update();

    // Pássaro
    bird.draw();
    bird.update();

    // Canos, nuvens e partículas
    drawClouds();
    updateClouds();
    drawPipes();
    updatePipes();
    drawParticles();

    drawScore();
    frames++;

    if (frames % 100 === 0) {
      createPipe();
      createCloud();
    }

    if (frames % 500 === 0) {
      pipeSpeed += 0.5;
    }

    requestAnimationFrame(loop);
  }
}

document.addEventListener('keydown', () => {
  bird.flap();
});

document.getElementById('restartButton').addEventListener('click', resetGame);

loop();


