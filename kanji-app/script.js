// 画面の準備が全部終わるのを待ってから動かす「おまじない」
window.addEventListener('DOMContentLoaded', () => {

    // 問題データ
    const questions = [
        { yomi: "1. あいさつ", kanji: "挨拶" }, { yomi: "2. ゆううつ", kanji: "憂鬱" },
        { yomi: "3. きれい", kanji: "綺麗" }, { yomi: "4. しょほうせん", kanji: "処方箋" },
        { yomi: "5. かんかく", kanji: "感覚" }, { yomi: "6. ほうしゅう", kanji: "報酬" },
        { yomi: "7. ぼういんぼうしょく", kanji: "暴飲暴食" }, { yomi: "8. けいこうとう", kanji: "蛍光灯" },
        { yomi: "9. かんれき", kanji: "還暦" }, { yomi: "10. じょうじゅ", kanji: "成就" },
        { yomi: "11. いんぺい", kanji: "隠蔽" }, { yomi: "12. ほうがん", kanji: "包含" },
        { yomi: "13. せんさい", kanji: "繊細" }, { yomi: "14. ほしょう", kanji: "保証" },
        { yomi: "15. ほうかい", kanji: "崩壊" }, { yomi: "16. いろう", kanji: "遺漏" },
        { yomi: "17. しんちょく", kanji: "進捗" }, { yomi: "18. かいり", kanji: "乖離" },
        { yomi: "19. しょうじん", kanji: "精進" }, { yomi: "20. ほうじゅん", kanji: "芳醇" }
    ];

    const listEl = document.getElementById('questions-list');

    // 画面に問題を並べる
    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <div class="yomi">${q.yomi}</div>
            <canvas id="canvas-${index}" width="500" height="150"></canvas>
            <div class="ans-text" id="ans-${index}">${q.kanji}</div>
        `;
        listEl.appendChild(div);
        setupCanvas(`canvas-${index}`);
    });

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
});

// 答え合わせボタン（HTMLから呼ばれるので外に出しておきます）
function finishTest() {
    document.querySelectorAll('.ans-text').forEach(el => el.style.display = 'block');
    document.getElementById('finish-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
