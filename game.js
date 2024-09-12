const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

let frames = 0;
const gravity = 0.25;
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let pipeSpeed = 2;

// Sons
const flapSound = document.getElementById('flapSound');
const hitSound = document.getElementById('hitSound');
const scoreSound = document.getElementById('scoreSound');

// Sistema de partículas
const particles = [];

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 5 + 2, // Tamanho aleatório entre 2 e 7
      speedX: Math.random() * 4 - 2, // Velocidade horizontal aleatória
      speedY: Math.random() * 4 - 2, // Velocidade vertical aleatória
      color: `hsl(${Math.random() * 360}, 100%, 50%)`, // Cor aleatória
      life: 100 // Vida útil da partícula
    });
  }
}

function drawParticles() {
  particles.forEach((particle, index) => {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    // Movimenta a partícula
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    // Diminui a vida útil
    particle.life--;
    // Remove a partícula se sua vida acabar
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });
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
      this.rotation = Math.min(this.velocity / 10, Math.PI / 4); // Inclina para baixo
    } else {
      this.rotation = Math.max(this.velocity / 10, -Math.PI / 4); // Inclina para cima
    }

    // Se o pássaro bater no chão, reseta o jogo e gera partículas
    if (this.y + this.height > canvas.height) {
      hitSound.play();
      createParticles(this.x + this.width / 2, canvas.height); // Cria partículas no chão
      resetGame();
    }
  },
  flap() {
    this.velocity = -this.jump;
    flapSound.play(); // Som ao bater asas
  }
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = 100;

function createPipe() {
  const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
  pipes.push({
    x: canvas.width,
    y: pipeHeight
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
    ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - (pipe.y + pipeGap));
  });
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    if (pipe.x + pipeWidth < 0) {
      pipes.shift();
      score++;
      scoreSound.play(); // Som ao passar por um cano
    }

    // Detectar colisão com os canos
    if (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)
    ) {
      hitSound.play(); // Som ao colidir
      createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2); // Cria partículas na colisão
      resetGame();
    }
  });
}

function resetGame() {
  bird.y = 150;
  bird.velocity = 0;
  pipes.length = 0;
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('highscore', highscore);
  }
  score = 0;
  pipeSpeed = 2;
}

function drawScore() {
  document.getElementById('score').innerText = `Pontuação: ${score}`;
  document.getElementById('highscore').innerText = `Melhor Pontuação: ${highscore}`;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenha e atualiza o pássaro
  bird.draw();
  bird.update();

  // Gerencia os canos
  if (frames % 100 === 0) {
    createPipe();
  }
  drawPipes();
  updatePipes();

  // Desenha e atualiza as partículas
  drawParticles();

  // Exibe a pontuação
  drawScore();

  frames++;

  // Aumenta a velocidade dos canos conforme o jogo progride
  if (frames % 500 === 0) {
    pipeSpeed += 0.5;
  }

  requestAnimationFrame(loop);
}

document.addEventListener('keydown', () => {
  bird.flap();
});

loop();


