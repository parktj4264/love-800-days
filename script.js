const heartLayer = document.querySelector("#heart-layer");
const sparkleCanvas = document.querySelector("#sparkle-layer");
const ctx = sparkleCanvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const heartGlyphs = ["♥", "❤", "♡"];
const heartColors = ["#ff6f9f", "#ffd166", "#fff8f3", "#f45d96", "#8bd3dd"];
const numberColors = ["#ffd166", "#fff8f3", "#ff8fab", "#8bd3dd"];
const sparkColors = [
  [255, 209, 102],
  [255, 143, 171],
  [139, 211, 221],
  [255, 248, 243],
];

let sparkles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  sparkleCanvas.width = Math.floor(canvasWidth * pixelRatio);
  sparkleCanvas.height = Math.floor(canvasHeight * pixelRatio);
  sparkleCanvas.style.width = `${canvasWidth}px`;
  sparkleCanvas.style.height = `${canvasHeight}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = reducedMotion ? 18 : Math.round((canvasWidth * canvasHeight) / 15500);
  sparkles = Array.from({ length: Math.max(24, count) }, () => ({
    x: randomBetween(0, canvasWidth),
    y: randomBetween(0, canvasHeight),
    radius: randomBetween(0.7, 2.3),
    phase: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.0008, 0.0022),
    drift: randomBetween(-0.06, 0.06),
    color: pick(sparkColors),
  }));
}

function drawSparkles(time) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (const sparkle of sparkles) {
    const twinkle = 0.34 + Math.sin(time * sparkle.speed + sparkle.phase) * 0.28;
    const alpha = Math.max(0.08, Math.min(0.72, twinkle));
    sparkle.y -= reducedMotion ? 0 : 0.018;
    sparkle.x += reducedMotion ? 0 : sparkle.drift;

    if (sparkle.y < -8) sparkle.y = canvasHeight + 8;
    if (sparkle.x < -8) sparkle.x = canvasWidth + 8;
    if (sparkle.x > canvasWidth + 8) sparkle.x = -8;

    const [r, g, b] = sparkle.color;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.arc(sparkle.x, sparkle.y, sparkle.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawSparkles);
}

function makeHeart(x, y, index, total) {
  const heart = document.createElement("span");
  const spread = 70 + total * 5;
  const angle = randomBetween(-Math.PI * 0.93, -Math.PI * 0.07);
  const distance = randomBetween(88, spread + 105);
  const moveX = Math.cos(angle) * distance + randomBetween(-26, 26);
  const moveY = Math.sin(angle) * distance - randomBetween(18, 72);

  heart.className = "heart";
  heart.textContent = pick(heartGlyphs);
  heart.style.setProperty("--x", `${x}px`);
  heart.style.setProperty("--y", `${y}px`);
  heart.style.setProperty("--move-x", `${moveX}px`);
  heart.style.setProperty("--move-y", `${moveY}px`);
  heart.style.setProperty("--rotate", `${randomBetween(-38, 38)}deg`);
  heart.style.setProperty("--scale", randomBetween(0.9, 1.72).toFixed(2));
  heart.style.setProperty("--duration", `${randomBetween(980, 1660)}ms`);
  heart.style.setProperty("--size", `${randomBetween(20, 44)}px`);
  heart.style.setProperty("--color", pick(heartColors));
  heart.style.animationDelay = `${index * randomBetween(9, 26)}ms`;
  heartLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove(), { once: true });
}

function makeNumberBurst(x, y, index, total) {
  const number = document.createElement("span");
  const angle = randomBetween(-Math.PI * 0.98, -Math.PI * 0.02);
  const distance = randomBetween(72, 178);
  const moveX = Math.cos(angle) * distance + randomBetween(-18, 18);
  const moveY = Math.sin(angle) * distance - randomBetween(4, 46);

  number.className = "burst-number";
  number.textContent = "800";
  number.style.setProperty("--x", `${x}px`);
  number.style.setProperty("--y", `${y}px`);
  number.style.setProperty("--move-x", `${moveX}px`);
  number.style.setProperty("--move-y", `${moveY}px`);
  number.style.setProperty("--rotate", `${randomBetween(-22, 22)}deg`);
  number.style.setProperty("--scale", randomBetween(0.9, 1.28).toFixed(2));
  number.style.setProperty("--duration", `${randomBetween(980, 1380)}ms`);
  number.style.setProperty("--size", `${randomBetween(28, 58)}px`);
  number.style.setProperty("--color", pick(numberColors));
  number.style.animationDelay = `${index * randomBetween(18, 42)}ms`;
  heartLayer.appendChild(number);
  number.addEventListener("animationend", () => number.remove(), { once: true });
}

function burstAt(x, y, strength = 1) {
  const base = reducedMotion ? 5 : Math.round(randomBetween(14, 22) * strength);
  const total = Math.min(base, 30);
  const numberTotal = reducedMotion ? 2 : Math.min(9, Math.max(5, Math.round(total * 0.34)));

  for (let index = 0; index < total; index += 1) {
    makeHeart(
      x + randomBetween(-18, 18),
      y + randomBetween(-12, 12),
      index,
      total,
    );
  }

  for (let index = 0; index < numberTotal; index += 1) {
    makeNumberBurst(
      x + randomBetween(-16, 16),
      y + randomBetween(-14, 14),
      index,
      numberTotal,
    );
  }
}

function welcomeBurst() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.55;
  burstAt(centerX, centerY, reducedMotion ? 0.55 : 1.2);
}

document.addEventListener("pointerdown", (event) => {
  burstAt(event.clientX, event.clientY);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawSparkles);

window.setTimeout(welcomeBurst, 520);
