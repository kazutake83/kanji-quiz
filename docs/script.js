let allQuestions = []; // ここにCSVの中身が入ります

// ページが開かれたら自動でCSVを読み込む
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('kanji_questions.csv'); // CSVファイルを取得
        const data = await response.text();
        
        // CSVのテキストを行ごとに分解して配列に入れる
        const lines = data.split('\n');
        // 1行目はヘッダー(yomi, kanji)なので飛ばす
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(',');
            if (line.length === 2) {
                allQuestions.push({
                    yomi: line[0].trim(),
                    kanji: line[1].trim()
                });
            }
        }
        console.log("CSVの読み込みが完了しました:", allQuestions);
    } catch (error) {
        console.error("CSVの読み込みに失敗しました:", error);
    }
});

// --- startTest などの他の関数は、前のコードと全く同じでOKです ---

function startTest() {
    if (allQuestions.length === 0) {
        alert("問題データがまだ読み込まれていません。少し待ってからお試しください。");
        return;
    }
    
    const startVal = parseInt(document.getElementById('range-start').value) - 1;
    const endVal = parseInt(document.getElementById('range-end').value);
    const countVal = parseInt(document.getElementById('question-count').value);

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

// setupCanvas, clearCanvas, finishTest は以前のものをそのまま下に貼り付けてください

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

function clearCanvas(index) {
    const canvas = document.getElementById(`canvas-${index}`);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function finishTest() {
    document.querySelectorAll('.ans-text').forEach(el => el.style.display = 'block');
    document.getElementById('finish-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'block';
}
