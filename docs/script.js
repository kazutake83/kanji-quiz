let allQuestions = [];
let results = [];

// ページ読み込み時の処理
window.addEventListener('DOMContentLoaded', async () => {
    // 1. CSV読み込み
    try {
        const response = await fetch('questions.csv');
        const text = await response.text();
        const rows = text.trim().split(/\r?\n/);
        
        // 🌟各章の問題数を定義（1章:500, 2章:500, 3章:500, 4章:500, 5章:300, 6章:350, 7章:500）
        const chapterSizes = [500, 500, 500, 500, 300, 350, 500];

        allQuestions = rows.slice(1).filter(row => row.includes(',')).map((row, index) => {
            const parts = row.split(',');
            const globalId = index + 1; // 1から始まる通し番号
            
            // 🌟通し番号(globalId)から、正しい「章」と「章内の番号」を計算する
            let currentId = globalId;
            let chapter = 1;
            let num = 1;

            for (let i = 0; i < chapterSizes.length; i++) {
                if (currentId <= chapterSizes[i]) {
                    chapter = i + 1;
                    num = currentId;
                    break;
                }
                currentId -= chapterSizes[i];
            }

            return { 
                globalId: globalId,
                chapter: chapter,
                num: num,
                displayId: `${chapter}-${num}`, // 「1-1」や「5-300」などの表示用
                yomi: parts[1], 
                kanji: parts[2] 
            };
        });

        // プルダウンの選択肢を初期化
        initDropdowns();

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

// プルダウンを作ったり連動させたりする関数
function initDropdowns() {
    const startCh = document.getElementById('range-start-chapter');
    const startNum = document.getElementById('range-start-num');
    const endCh = document.getElementById('range-end-chapter');
    const endNum = document.getElementById('range-end-num');

    // CSVデータから存在する最高の章数を取得
    const maxChapter = allQuestions[allQuestions.length - 1].chapter;

    // 章のプルダウン（開始・終了）を作成
    for (let c = 1; c <= maxChapter; c++) {
        const opt1 = new Option(c, c);
        const opt2 = new Option(c, c);
        startCh.add(opt1);
        endCh.add(opt2);
    }

    // 章が切り替わったら、その章にある番号（1〜500など）をセットする関数
    const updateNumbers = (chSelect, numSelect, selectMax) => {
        const selectedCh = parseInt(chSelect.value);
        numSelect.innerHTML = "";
        
        // 選ばれた章に属する問題だけを抜き出す
        const filtered = allQuestions.filter(q => q.chapter === selectedCh);
        filtered.forEach(q => {
            const opt = new Option(q.num, q.num);
            numSelect.add(opt);
        });

        if (selectMax) {
            numSelect.selectedIndex = numSelect.options.length - 1;
        }
    };

    // イベントを設定（章を変えたら番号の選択肢を更新）
    startCh.addEventListener('change', () => updateNumbers(startCh, startNum, false));
    endCh.addEventListener('change', () => updateNumbers(endCh, endNum, true));

    // 初期状態のセット
    startCh.value = 1;
    updateNumbers(startCh, startNum, false);
    
    endCh.value = maxChapter;
    updateNumbers(endCh, endNum, true); // 終了側は一番最後の問題を選択状態にする
}

// テスト開始処理
function startTest() {
    const startCh = parseInt(document.getElementById('range-start-chapter').value);
    const startNum = parseInt(document.getElementById('range-start-num').value);
    const endCh = parseInt(document.getElementById('range-end-chapter').value);
    const endNum = parseInt(document.getElementById('range-end-num').value);
    const countVal = parseInt(document.getElementById('question-count').value);

    // 選択された【章-番号】に対応する、CSVの通し番号(globalId)を見つける
    const startItem = allQuestions.find(q => q.chapter === startCh && q.num === startNum);
    const endItem = allQuestions.find(q => q.chapter === endCh && q.num === endNum);

    if (!startItem || !endItem) return;

    // 範囲内の問題を切り出す
    let selected = allQuestions.filter(q => q.globalId >= startItem.globalId && q.globalId <= endItem.globalId);
    
    // ランダムシャッフルして指定の問題数だけ選ぶ
    selected.sort(() => Math.random() - 0.5);
    selected = selected.slice(0, countVal);

    const listEl = document.getElementById('questions-list');
    listEl.innerHTML = "";
    results = new Array(selected.length).fill(null);
    
    selected.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        
        // 問題文の {カタカナ} を装飾
        const formattedYomi = formatQuestion(q.yomi);

        div.innerHTML = `
            <div class="question-header">
                <div class="yomi"><span style="font-size:0.8em; color:gray; margin-right:8px;">[${q.displayId}]</span><strong>${formattedYomi}</strong></div>
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
    document.getElementById('score-container').style.display = 'none';
}

function formatQuestion(text) {
    if (!text) return "";
    return text.replace(/\{(.+?)\}/g, '<b><u>$1</u></b>');
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
        const color = getComputedStyle(document.body).getPropertyValue('--stroke-color').trim() || '#333';
        ctx.strokeStyle = color;
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
    const buttons = area.querySelectorAll('.check-btn');
    buttons[0].classList.toggle('active', isCorrect === true);
    buttons[1].classList.toggle('active', isCorrect === false);
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