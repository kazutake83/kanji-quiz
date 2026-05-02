let allQuestions = [];

// 1. ページが読み込まれたら自動的にCSVを取得する
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('questions.csv');
        if (!response.ok) throw new Error('CSVファイルが見つかりません');
        
        const text = await response.text();
        
        // 改行コード（Windows/Mac両対応）で分割し、余計な空白を消す
        const rows = text.trim().split(/\r?\n/);
        
        // ★修正ポイント：1行目(見出し)を確実に飛ばし、空の行も完全に除外する
        allQuestions = rows
            .slice(1) // 1行目(number,yomi,kanji)を捨てる
            .filter(row => row.trim() !== "" && row.includes(',')) // 空行やカンマのない行を捨てる
            .map(row => {
                const parts = row.split(',');
                return {
                    yomi: parts[1] ? parts[1].trim() : "",
                    kanji: parts[2] ? parts[2].trim() : ""
                };
            });

        console.log("読み込み成功。問題数:", allQuestions.length);
    } catch (e) {
        console.error("エラー:", e);
    }
});

// 2. テスト開始ボタンの処理
function startTest() {
    if (allQuestions.length === 0) {
        alert("データ読み込み中です。数秒待ってからもう一度押してください。");
        return;
    }

    const startVal = parseInt(document.getElementById('range-start').value) - 1;
    const endVal = parseInt(document.getElementById('range-end').value);
    const countVal = parseInt(document.getElementById('question-count').value);

    // 範囲指定とシャッフル
    let selected = allQuestions.slice(startVal, endVal);
    selected.sort(() => Math.random() - 0.5);
    selected = selected.slice(0, countVal);

    const listEl = document.getElementById('questions-list');
    listEl.innerHTML = "";
    
    selected.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <div class="question-header">
                <div class="yomi">${q.yomi}</div>
                <button class="clear-btn" onclick="clearCanvas(${index})">消去</button>
            </div>
            <canvas id="canvas-${index}" width="500" height="150"></canvas>
            <div class="ans-text" id="ans-${index}">${q.kanji}</div>
        `;
        listEl.appendChild(div);
        setupCanvas(`canvas-${index}`);
    });

    document.getElementById('settings').style.display = 'none';
    document.getElementById('finish-btn').style.display = 'block';
}

// 3. キャンバス（手書き）の設定
function setupCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    let drawing = false;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#333';

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX,
            y: ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY
        };
    };

    const start = (e) => { drawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); };
    const move = (e) => { 
        if (!drawing) return; 
        const p = getPos(e); 
        ctx.lineTo(p.x, p.y); 
        ctx.stroke(); 
        if (e.touches) e.preventDefault(); 
    };
    const stop = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, {passive: false});
    canvas.addEventListener('touchmove', move, {passive: false});
    canvas.addEventListener('touchend', stop);
}

// 4. その他のボタン処理
function clearCanvas(index) {
    const canvas = document.getElementById(`canvas-${index}`);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function finishTest() {
    document.querySelectorAll('.ans-text').forEach(el => el.style.display = 'block');
    document.getElementById('finish-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
