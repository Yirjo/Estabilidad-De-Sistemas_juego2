// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ← NUEVO: función para ajustar el canvas a pantalla completa
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// UI
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");

// Imágenes
const droneImg = new Image();
droneImg.src = "dron.png";

const bgImg = new Image();
bgImg.src = "fondo.jpg";

// Game variables
let droneY, droneVel;
let gravity = 0.12;
let controlForce = 0.7;
let noiseForce = 0.08;

let zoneY;
let zoneHeight = 150;

// Oscilación del setpoint
let oscillationTime = 0;
let oscillationSpeed = 0.010;
let oscillationAmplitude = 120;

// Estado
let isGameOver = false;
let difficulty = 1;

// Temporizador
let startTime = 0;
let currentTime = 0;

// High Score
let bestTime = localStorage.getItem("bestTime") || 0;

// Input
let upPressed = false;
let downPressed = false;

// EVENTOS
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;

    if (e.key.toLowerCase() === "r" && isGameOver) restartGame();
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
});

// ← NUEVO: al redimensionar la ventana, actualizar canvas
window.addEventListener("resize", resizeCanvas);

startBtn.onclick = () => {
    startScreen.style.display = "none";

    resizeCanvas();        // ← NUEVO: pantalla completa
    canvas.style.display = "block";

    restartGame();
};

// REINICIO
function restartGame() {
    gameOverScreen.style.display = "none";

    droneY = canvas.height / 2;
    droneVel = 0;

    zoneHeight = 260;
    zoneY = canvas.height / 2 - zoneHeight / 2;

    oscillationTime = 0;
    difficulty = 1;
    isGameOver = false;

    // Temporizador
    startTime = Date.now();

    update();
}

// LOOP PRINCIPAL
function update() {

    if (isGameOver) return;

    currentTime = ((Date.now() - startTime) / 1000).toFixed(1);

    difficulty += 0.0024;
    noiseForce = 0.12 * difficulty;
    gravity = 0.12 * difficulty;

    // Ruido aleatorio
    droneVel += (Math.random() - 0.5) * noiseForce;

    // Controles
    if (upPressed) droneVel -= controlForce;
    if (downPressed) droneVel += controlForce;

    // Tendencia natural
    droneVel += gravity;

    droneY += droneVel;

    // Oscilación del setpoint
    oscillationTime += oscillationSpeed;
    const newCenter = (canvas.height / 2) + Math.sin(oscillationTime) * oscillationAmplitude;
    zoneY = newCenter - (zoneHeight / 2);

    // Límites
    if (droneY < 0 || droneY > canvas.height) return gameOver();

    // Salida del área estable
    if (droneY < zoneY || droneY > zoneY + zoneHeight) return gameOver();

    draw();
    requestAnimationFrame(update);
}

// DIBUJAR TODO
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Zona estable
    ctx.fillStyle = "rgba(0,255,60,0.45)";
    ctx.fillRect(0, zoneY, canvas.width, zoneHeight);

    // Dron
    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 15;

    const droneX = 150;
    const droneSize = 100;

    ctx.drawImage(droneImg, droneX - droneSize / 2, droneY - droneSize / 2, droneSize, droneSize);

    ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "18px Segoe UI";

    ctx.fillText(`Tiempo: ${currentTime}s`, 20, 30);
    ctx.fillText(`Récord: ${bestTime}s`, 20, 55);
}

// GAME OVER
function gameOver() {
    isGameOver = true;

    if (parseFloat(currentTime) > parseFloat(bestTime)) {
        bestTime = currentTime;
        localStorage.setItem("bestTime", bestTime);
    }

    gameOverScreen.style.display = "block";
}
