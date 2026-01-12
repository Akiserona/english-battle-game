const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let animationId;

// Entities
const player = {
    x: 50,
    y: 175, // Centered vertically (400/2 - 50/2)
    width: 50,
    height: 50,
    color: '#3498db'
};

const enemy = {
    x: 800,
    y: 175,
    width: 50,
    height: 50,
    color: '#e74c3c',
    speed: 0.5
};

// Quiz Data
const questions = [
    { jp: "諦めないで（我慢して）", en: "Hang in there" },
    { jp: "楽勝だよ", en: "It's a piece of cake" },
    { jp: "今日はここまでにしよう", en: "Let's call it a day" },
    { jp: "決めかねているんだ", en: "I'm on the fence" },
    { jp: "彼は私のカンに障る", en: "He gets on my nerves" },
    { jp: "その調子！", en: "Way to go" },
    { jp: "理解できなかった（頭上を通り越した）", en: "It went over my head" },
    { jp: "元気出して", en: "Keep your chin up" },
    { jp: "高みの見物といこう（様子を見よう）", en: "Let's wait and see" },
    { jp: "要点を言ってくれ", en: "Cut to the chase" },
    { jp: "お互い様だね", en: "We're in the same boat" },
    { jp: "本気で言ってるの？", en: "Are you pulling my leg?" },
    { jp: "めったにないことだ", en: "Once in a blue moon" },
    { jp: "体調が優れない", en: "I feel under the weather" },
    { jp: "費用は私が持ちます", en: "It's on me" }
];

let currentQuestion = null;
let currentAnswerIndex = 0;

// DOM Elements
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const jpPromptEl = document.getElementById('jp-prompt');
const enAnswerDisplayEl = document.getElementById('en-answer-display');
const wordButtonsContainer = document.getElementById('word-buttons-container');
const gameOverOverlay = document.getElementById('game-over-overlay');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// --- Game Logic ---

function initGame() {
    score = 0;
    scoreEl.textContent = score;

    gameState = 'PLAYING';

    // Hide overlays
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    nextRound();

    // Start Loops
    gameLoop();
}

function nextRound() {
    resetEnemy();
    setNewQuestion();
}

function resetEnemy() {
    enemy.x = canvas.width;
    // Speed increases with score
    enemy.speed = 0.3 + (score * 0.05);
    // Cap speed
    if (enemy.speed > 2.5) enemy.speed = 2.5;
}

function update() {
    if (gameState !== 'PLAYING') return;

    // Move Enemy
    enemy.x -= enemy.speed;

    // Collision Detection
    if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    ) {
        gameOver();
    }
}

function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Player Face
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 15, 5, 0, Math.PI * 2); // Left Eye
    ctx.arc(player.x + 35, player.y + 15, 5, 0, Math.PI * 2); // Right Eye
    ctx.fill();


    // Draw Enemy
    if (gameState === 'PLAYING') {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Draw Enemy Face (Angry)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Eyebrows
        ctx.moveTo(enemy.x + 10, enemy.y + 15);
        ctx.lineTo(enemy.x + 20, enemy.y + 20);

        ctx.moveTo(enemy.x + 40, enemy.y + 15);
        ctx.lineTo(enemy.x + 30, enemy.y + 20);
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x + 15, enemy.y + 25, 3, 0, Math.PI * 2);
        ctx.arc(enemy.x + 35, enemy.y + 25, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;

    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'GAMEOVER';
    cancelAnimationFrame(animationId);
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
}

// --- Quiz Logic ---

function setNewQuestion() {
    // Pick random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];

    // Display JP Prompt
    jpPromptEl.textContent = currentQuestion.jp;

    // Reset Answer Display
    enAnswerDisplayEl.textContent = "";
    currentAnswerIndex = 0;

    // Prepare Buttons
    // Split by space
    const words = currentQuestion.en.split(" ");

    // Shuffle for buttons
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    renderButtons(shuffledWords, words);
}

function renderButtons(shuffledWords, correctOrderWords) {
    wordButtonsContainer.innerHTML = '';

    shuffledWords.forEach((word, index) => {
        const btn = document.createElement('button');
        btn.textContent = word;
        btn.classList.add('word-btn');
        // We use a unique ID or just text content if unique.
        // Duplicate words in a sentence could be an issue if we just check text.
        // For simple phrases, text check usually suffices, but index mapping is safer.
        // Let's stick to text matching for simplicity unless we see "that that" issues.

        btn.onclick = () => handleWordClick(btn, word, correctOrderWords);
        wordButtonsContainer.appendChild(btn);
    });
}

function handleWordClick(btn, word, correctOrderWords) {
    const expectedWord = correctOrderWords[currentAnswerIndex];

    if (word === expectedWord) {
        // Correct
        // Add to display
        const currentText = enAnswerDisplayEl.textContent;
        enAnswerDisplayEl.textContent = currentText + (currentText ? " " : "") + word;

        // Remove button or disable it
        btn.remove();

        currentAnswerIndex++;

        // Check if sentence complete
        if (currentAnswerIndex >= correctOrderWords.length) {
            handleSuccess();
        }
    } else {
        // Wrong
        btn.style.backgroundColor = '#e74c3c';
        setTimeout(() => {
            btn.style.backgroundColor = '#3498db';
        }, 300);
    }
}

function handleSuccess() {
    score++;
    scoreEl.textContent = score;
    // Visual effect?

    // Next Round
    nextRound();
}

// --- Event Listeners ---
startBtn.addEventListener('click', () => {
    initGame();
});

restartBtn.addEventListener('click', () => {
    initGame();
});

// Initial draw
draw();
