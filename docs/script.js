let allQuestions = [];

// 1. ページが読み込まれたら自動的にCSVを取得する
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // GitHubにアップした questions.csv を読み込む
        // ※ fetchは同じフォルダ内のファイルを探しに行きます
        const response = await fetch('questions.csv');
        if (!response.ok) throw new Error('CSVファイルが見つかりません');
        
        const text = await response.text();
        
        // テキストを行ごとに分解
        const rows = text.trim().split('\n');
        
        // 1行目（ヘッダー）を飛ばして、データを配列に入れる
        allQuestions = rows.slice(1).map(row => {
            // カンマで分割。 [番号, 問題文, 漢字] の順番を想定
            const parts = row.split(',');
            return {
                yomi: parts[1] ? parts[1].trim() : "",
                kanji: parts[2] ? parts[2].trim() : ""
            };
        }).filter(q => q.yomi !== ""); // 空の行を除去

        console.log("問題の読み込みに成功しました！", allQuestions);
    } catch (e) {
        console.error("データの読み込み中にエラーが発生しました:", e);
        alert("問題データの読み込みに失敗しました。GitHubに questions.csv があるか確認してください。");
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
