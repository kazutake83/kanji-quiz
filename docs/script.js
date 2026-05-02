let allQuestions = [];
let results = [];

// ページ読み込み時の処理
window.addEventListener('DOMContentLoaded', async () => {
    // 1. CSV読み込み
    try {
        const response = await fetch('questions.csv');
        const text = await response.text();
        const rows = text.trim().split(/\r?\n/);
        allQuestions = rows.slice(1).filter(row => row.includes(',')).map(row => {
            const parts = row.split(',');
            return { yomi: parts[1], kanji: parts[2] };
        });
        } catch (e) { console.error("CSV読み込みエラー", e); }

    // 2. ダークモード切り替えイベント
    const darkToggle = document.getElementById('dark-mode-toggle');
    darkToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', darkToggle.checked);
    });

    // 3. テスト開始ボタン
    document.getElementById('start-btn').addEventListener('click', startTest);
    
    // 4. 答え合わせボタン
    document.getElementById('finish-btn').addEventListener('click', finishTest);
});

function startTest() {
    const startVal = parseInt(document.getElementById('range-start').value) - 1;
    const endVal = parseInt(document.getElementById('range-end').value);
    const countVal = parseInt(document.getElementById('question-count').value);

    let selected = allQuestions.slice(startVal, endVal);
    selected.sort(() => Math.random() - 0.5);
    selected = selected.slice(0, countVal);

    const listEl = document.getElementById('questions-list');
    listEl.innerHTML = "";
    results = new Array(selected.length).fill(null);
    
    selected.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <div class="question-header">
                <div class="yomi"><strong>${q.yomi}</strong></div>
                <button class="clear-btn" onclick="clearCanvas(${index})">消去</button>
            </div>
            <canvas id="canvas-${index}" width="500" height="150"></canvas>
            <div class="ans-text" id="ans-${index}">${q.kanji}</div>
            <div class="check-controls" id="check-area-${index}" style="display:none;">
                <button class="check-btn btn-ok" onclick="mark(${index}, true)">◯</button>
                <button class="check-btn btn-ng" onclick="mark(${index}, false)">×</button>
            </div>
        `;
        listEl.appendChild(div);
        setupCanvas(`canvas-${index}`);
    });

    document.getElementById('settings').style.display = 'none';
    document.getElementById('finish-btn').style.display = 'block';
}

function setupCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    let drawing = false;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const start = (e) => {
        drawing = true;
        ctx.beginPath();
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--stroke-color').trim();
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
    };
    const move = (e) => {
        if (!drawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        if (e.touches) e.preventDefault();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('touchstart', start, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', () => drawing = false);
}

function mark(index, isCorrect) {
    results[index] = isCorrect;
    const area = document.getElementById(`check-area-${index}`);
    area.querySelectorAll('.check-btn')[0].classList.toggle('active', isCorrect === true);
    area.querySelectorAll('.check-btn')[1].classList.toggle('active', isCorrect === false);
    updateScore();
}

function updateScore() {
    const correctCount = results.filter(r => r === true).length;
    document.getElementById('score-text').innerText = `結果：${results.length}問中 ${correctCount}問正解！`;
}

function finishTest() {
    document.querySelectorAll('.ans-text').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.check-controls').forEach(el => el.style.display = 'flex');
    document.getElementById('finish-btn').style.display = 'none';
    document.getElementById('score-container').style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function clearCanvas(index) {
    const canvas = document.getElementById(`canvas-${index}`);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
