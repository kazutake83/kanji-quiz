const allQuestions = [
    { yomi: "126. 新しい思想の生まれる可能性はカイムに等しい。", kanji: "皆無" },
    { yomi: "127. 「花といえば桜」というアンモクの了解がある。", kanji: "暗黙" },
    { yomi: "128. 想像力を働かせてカクウの物語を創出する。", kanji: "架空" },
    { yomi: "129. 真夏の太陽が大地をヨウシャなく照りつける。", kanji: "容赦" },
    { yomi: "130. 社会が強固なイデオロギーにソクバクされる。", kanji: "束縛" },
    { yomi: "131. 作者の心情が一言にギョウシュクされている。", kanji: "凝縮" },
    { yomi: "132. 茶の湯は最もセンレンされた芸術の一つだ。", kanji: "洗練" },
    { yomi: "133. 罪と官憲の恩を明るみに出してキュウダンした。", kanji: "糾弾" },
    { yomi: "134. ダラクした生活から立ち直ることが大切だ。", kanji: "堕落" },
    { yomi: "135. 人間の知に関するタクエツした理論を構築した。", kanji: "卓越" },
    { yomi: "136. 社会は対立とダキョウを繰り返して発展する。", kanji: "妥協" },
    { yomi: "137. 美術館で世界の名画をカンショウする。", kanji: "鑑賞" },
    { yomi: "138. 明治の文学者は言文一致をモサクしていた。", kanji: "模索" },
    { yomi: "139. 水素からヘリウムへの核ユウゴウ反応が起こる。", kanji: "融合" },
    { yomi: "140. 一族のケイフをたどると革命家につらなる。", kanji: "系譜" },
    { yomi: "141. 日本にクンリンしてきた財閥を解体する。", kanji: "君臨" },
    { yomi: "142. 常に何かをしていないと不安にオチイル。", kanji: "陥る" },
    { yomi: "143. 行事の宗教的意味付けがキハクになった。", kanji: "希薄" },
    { yomi: "144. 混迷の時代をショウチョウする出来事が起こる。", kanji: "象徴" },
    { yomi: "145. 作品の主題の変化は、作者の心のキセキである。", kanji: "軌跡" },
    { yomi: "146. 新しいものには常にケイカイの目を向ける。", kanji: "警戒" },
    { yomi: "147. 理論をジッセンに移す環境がようやく整った。", kanji: "実践" },
    { yomi: "148. 夏の高温多湿の気候にはガマンがならない。", kanji: "我慢" },
    { yomi: "149. 受験会場にただならぬ緊張感がタダヨっている。", kanji: "漂う" },
    { yomi: "150. 国家の体制があっという間にクズレ去った。", kanji: "崩れ" }
];

function startTest() {
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
