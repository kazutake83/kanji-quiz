const questions = [
    { yomi: "あいさつ", kanji: "挨拶" },
    { yomi: "ゆううつ", kanji: "憂鬱" }
];

let currentIndex = 0;
const canvas = document.getElementById('draw-area');
const ctx = canvas.getContext('2d');
let drawing = false;

// --- 手書き機能のセットアップ ---
function setupCanvas() {
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';

    const startDraw = (e) => {
        drawing = true;
        draw(e);
    };
    const endDraw = () => {
        drawing = false;
        ctx.beginPath();
    };
    const draw = (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        e.preventDefault();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDraw);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- ゲーム進行 ---
function showQuestion() {
    document.getElementById("yomi-display").innerText = questions[currentIndex].yomi;
    document.getElementById("answer-zone").style.display = "none";
    document.getElementById("show-ans-btn").style.display = "inline-block";
    clearCanvas();
}

function showAnswer() {
    document.getElementById("correct-kanji").innerText = questions[currentIndex].kanji;
    document.getElementById("answer-zone").style.display = "block";
    document.getElementById("show-ans-btn").style.display = "none";
}

function nextQuestion(isCorrect) {
    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion();
    } else {
        alert("終了です！");
        currentIndex = 0;
        showQuestion();
    }
}

setupCanvas();
showQuestion();