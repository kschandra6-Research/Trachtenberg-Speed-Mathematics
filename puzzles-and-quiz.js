/* ==============================================================================
   TRACHTENBERG INTERACTIVE PUZZLES & SPEED PRACTICE QUIZ ENGINE
   1. The Persian Necklace Puzzle (Cutler & McShane p. 247)
   2. The Carpenter's Board Puzzle (Cutler & McShane p. 227)
   3. Interactive Trachtenberg Speed Drill / Flashcard Academy
   4. Historical Multimedia Museum & Timeline
   Concept & Design by K.S.Chandra 2026.
   ============================================================================== */

const PuzzlesAndQuiz = (function() {
  'use strict';

  // State for Quiz
  let quizActive = false;
  let quizRule = '11';
  let currentProblem = null;
  let quizStartTime = 0;
  let quizTimerInterval = null;
  let currentStreak = 0;
  let bestTimeMs = null;

  // Initialize
  function init() {
    renderPersianNecklace(48, 7);
    renderCarpenterBoard(16, 1, 2);
    setupQuiz();
  }

  // ============================================================================
  // 1. THE PERSIAN NECKLACE PUZZLE (p. 247)
  // ============================================================================
  function renderPersianNecklace(totalPearls = 48, fractionK = 7) {
    const container = document.getElementById('persianNecklaceContent');
    if (!container) return;

    // Simulate step by step distribution
    let remaining = totalPearls;
    const history = [];
    let daughter = 1;
    let sharePerDaughter = null;
    let isValid = true;

    while (remaining > 0 && daughter <= 50) {
      const initialTake = daughter;
      if (remaining < initialTake) {
        isValid = false;
        break;
      }
      const remAfterInitial = remaining - initialTake;
      const fracTake = remAfterInitial / fractionK;

      const totalTake = initialTake + fracTake;
      if (sharePerDaughter === null) {
        sharePerDaughter = totalTake;
      }

      history.push({
        daughter: daughter,
        startRem: remaining,
        initialTake: initialTake,
        remAfterInitial: remAfterInitial,
        fracTake: fracTake.toFixed(2),
        totalTake: totalTake.toFixed(2),
        newRem: (remaining - totalTake).toFixed(2)
      });

      remaining -= totalTake;
      if (remaining < 0.001) break;
      daughter++;
    }

    const standardSolutionP = (fractionK - 1) * (fractionK - 1);
    const standardDaughters = fractionK - 1;

    let html = `
      <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
        <h3 style="color: var(--accent-cyan); font-size: 18px; margin-bottom: 8px;">The Persian Necklace Puzzle (Cutler & McShane p. 247)</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          An ancient Persian merchant bequeathed an exquisite pearl necklace to his daughters. The eldest daughter received 1 pearl plus 1/7 of the remaining pearls. The second received 2 pearls plus 1/7 of the new remainder. The third received 3 pearls plus 1/7 of what remained, and so on. When finished, all pearls were distributed and <em>every daughter received the exact same number of pearls</em>.
        </p>

        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 16px; align-items: flex-end;">
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 700;">TOTAL PEARLS (P):</label>
            <input type="number" id="inputNecklacePearls" value="${totalPearls}" min="1" max="500" class="input-field" style="width: 130px; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 700;">FRACTION (1/k):</label>
            <input type="number" id="inputNecklaceK" value="${fractionK}" min="2" max="20" class="input-field" style="width: 130px; margin-top: 4px;">
          </div>
          <button class="btn-primary" id="btnSolveNecklace" style="padding: 9px 18px;">Simulate Distribution</button>
        </div>

        <div style="background: rgba(0,0,0,0.35); border-radius: 8px; padding: 14px; margin-bottom: 16px; border-left: 4px solid var(--accent-cyan); font-family: var(--font-mono); font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <strong>Algebraic Principle:</strong> For fraction 1/k, exact integer equality occurs when <span style="color:#00f2fe;">P = (k - 1)²</span>.
          <br>For k = ${fractionK}: Perfect integer solution is <strong>P = (${fractionK} - 1)² = ${standardSolutionP} pearls</strong>, yielding <strong>${standardDaughters} daughters</strong> each getting <strong>${standardDaughters} pearls</strong>!
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead>
              <tr style="background: rgba(30,41,59,0.8); color: #38bdf8;">
                <th style="padding: 8px; border: 1px solid var(--border-color);">Daughter #</th>
                <th style="padding: 8px; border: 1px solid var(--border-color);">Pearls Before</th>
                <th style="padding: 8px; border: 1px solid var(--border-color);">Fixed Share (n)</th>
                <th style="padding: 8px; border: 1px solid var(--border-color);">1/${fractionK} of Remainder</th>
                <th style="padding: 8px; border: 1px solid var(--border-color);">Total Received</th>
                <th style="padding: 8px; border: 1px solid var(--border-color);">Remaining</th>
              </tr>
            </thead>
            <tbody>
              ${history.slice(0, 10).map(h => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="padding: 8px; border: 1px solid var(--border-color); font-weight: bold; color: #fbbf24;">Daughter ${h.daughter}</td>
                  <td style="padding: 8px; border: 1px solid var(--border-color);">${h.startRem}</td>
                  <td style="padding: 8px; border: 1px solid var(--border-color);">${h.initialTake}</td>
                  <td style="padding: 8px; border: 1px solid var(--border-color);">${h.fracTake}</td>
                  <td style="padding: 8px; border: 1px solid var(--border-color); font-weight: bold; color: #34d399;">${h.totalTake}</td>
                  <td style="padding: 8px; border: 1px solid var(--border-color);">${h.newRem}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('btnSolveNecklace')?.addEventListener('click', () => {
      const pVal = parseInt(document.getElementById('inputNecklacePearls').value, 10) || 48;
      const kVal = parseInt(document.getElementById('inputNecklaceK').value, 10) || 7;
      renderPersianNecklace(pVal, kVal);
    });
  }

  // ============================================================================
  // 2. THE CARPENTER'S BOARD PUZZLE (p. 227)
  // ============================================================================
  function renderCarpenterBoard(totalLength = 16, piece2Diff = 1, piece3Sub = 2) {
    const container = document.getElementById('carpenterBoardContent');
    if (!container) return;

    // Equation: x + (x + piece2Diff) + (2x - piece3Sub) = totalLength
    // 4x + piece2Diff - piece3Sub = totalLength
    // 4x = totalLength - piece2Diff + piece3Sub
    const numerator = totalLength - piece2Diff + piece3Sub;
    const x = numerator / 4;
    const piece1 = x;
    const piece2 = x + piece2Diff;
    const piece3 = (2 * x) - piece3Sub;

    const p1Pct = ((piece1 / totalLength) * 100).toFixed(1);
    const p2Pct = ((piece2 / totalLength) * 100).toFixed(1);
    const p3Pct = ((piece3 / totalLength) * 100).toFixed(1);

    let html = `
      <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; margin-top: 20px;">
        <h3 style="color: var(--accent-cyan); font-size: 18px; margin-bottom: 8px;">The Carpenter's Board Puzzle (Cutler & McShane p. 227)</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
          A carpenter has a board <strong>${totalLength} feet long</strong>. He cuts it into 3 pieces such that the second piece is <strong>${piece2Diff} ft longer</strong> than the first, and the third piece is <strong>twice the first minus ${piece3Sub} ft</strong>. Find the exact length of each piece.
        </p>

        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 16px; align-items: flex-end;">
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 700;">TOTAL BOARD LENGTH (ft):</label>
            <input type="number" id="inputBoardLength" value="${totalLength}" min="4" max="100" class="input-field" style="width: 140px; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 700;">PIECE 2 DIFF (+ft):</label>
            <input type="number" id="inputPiece2Diff" value="${piece2Diff}" min="0" max="20" class="input-field" style="width: 130px; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 700;">PIECE 3 OFFSET (-ft):</label>
            <input type="number" id="inputPiece3Sub" value="${piece3Sub}" min="0" max="20" class="input-field" style="width: 130px; margin-top: 4px;">
          </div>
          <button class="btn-primary" id="btnSolveCarpenter" style="padding: 9px 18px;">Compute Pieces</button>
        </div>

        <!-- Visual Segmented Board -->
        <div style="margin: 20px 0;">
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px; font-weight: bold;">LIVE CUT BOARD VISUALIZATION:</div>
          <div style="display: flex; height: 50px; border-radius: 8px; overflow: hidden; border: 2px solid #334155; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <div style="width: ${p1Pct}%; background: linear-gradient(135deg, #0284c7, #0ea5e9); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
              Piece 1: ${piece1.toFixed(2)} ft (${p1Pct}%)
            </div>
            <div style="width: ${p2Pct}%; background: linear-gradient(135deg, #059669, #10b981); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
              Piece 2: ${piece2.toFixed(2)} ft (${p2Pct}%)
            </div>
            <div style="width: ${p3Pct}%; background: linear-gradient(135deg, #d97706, #f59e0b); display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 13px; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
              Piece 3: ${piece3.toFixed(2)} ft (${p3Pct}%)
            </div>
          </div>
        </div>

        <!-- Algebraic Steps -->
        <div style="background: rgba(0,0,0,0.35); border-radius: 8px; padding: 14px; font-family: var(--font-mono); font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <strong>Algebraic Resolution:</strong>
          <br>• Let Piece 1 = <span style="color:#38bdf8;">x</span>
          <br>• Piece 2 = <span style="color:#34d399;">x + ${piece2Diff}</span>
          <br>• Piece 3 = <span style="color:#fbbf24;">2x - ${piece3Sub}</span>
          <br>• Sum: x + (x + ${piece2Diff}) + (2x - ${piece3Sub}) = ${totalLength}
          <br>• 4x + ${piece2Diff - piece3Sub} = ${totalLength} &implies; 4x = ${totalLength - (piece2Diff - piece3Sub)} &implies; <span style="color:#38bdf8; font-weight: bold;">x = ${piece1.toFixed(2)} ft</span>
          <br>• Piece 1 = <strong>${piece1.toFixed(2)} ft</strong> | Piece 2 = <strong>${piece2.toFixed(2)} ft</strong> | Piece 3 = <strong>${piece3.toFixed(2)} ft</strong> (Total = ${totalLength} ft ✅)
        </div>
      </div>
    `;

    container.innerHTML = html;

    document.getElementById('btnSolveCarpenter')?.addEventListener('click', () => {
      const l = parseFloat(document.getElementById('inputBoardLength').value) || 16;
      const d = parseFloat(document.getElementById('inputPiece2Diff').value) || 1;
      const s = parseFloat(document.getElementById('inputPiece3Sub').value) || 2;
      renderCarpenterBoard(l, d, s);
    });
  }

  // ============================================================================
  // 3. SPEED MATH PRACTICE QUIZ ACADEMY
  // ============================================================================
  function setupQuiz() {
    const selectRule = document.getElementById('selectQuizRule');
    const btnNew = document.getElementById('btnQuizNewProblem');
    const inputAns = document.getElementById('inputQuizAnswer');
    const btnCheck = document.getElementById('btnQuizCheck');
    const btnHint = document.getElementById('btnQuizHint');

    if (selectRule) {
      selectRule.addEventListener('change', (e) => {
        quizRule = e.target.value;
        startNewQuizProblem();
      });
    }

    if (btnNew) btnNew.addEventListener('click', startNewQuizProblem);
    if (btnCheck) btnCheck.addEventListener('click', checkQuizAnswer);

    if (inputAns) {
      inputAns.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkQuizAnswer();
      });
    }

    if (btnHint) {
      btnHint.addEventListener('click', () => {
        const hintBox = document.getElementById('quizHintBox');
        if (hintBox) {
          hintBox.style.display = hintBox.style.display === 'none' ? 'block' : 'none';
        }
      });
    }
  }

  function startNewQuizProblem() {
    const promptElem = document.getElementById('quizProblemPrompt');
    const inputAns = document.getElementById('inputQuizAnswer');
    const feedback = document.getElementById('quizFeedback');
    const hintBox = document.getElementById('quizHintBox');

    if (inputAns) {
      inputAns.value = '';
      if (typeof inputAns.focus === 'function') inputAns.focus();
    }
    if (feedback) feedback.textContent = '';
    if (hintBox) hintBox.style.display = 'none';

    let m = 0;
    let n = 11;
    let expected = 0;
    let hintText = "";

    if (quizRule === '11') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 11;
      expected = m * 11;
      hintText = `Rule for 11: Add the neighbor. The rightmost digit is itself. Each subsequent digit is digit + right neighbor. Leading digit is first digit + carry.`;
    } else if (quizRule === '12') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 12;
      expected = m * 12;
      hintText = `Rule for 12: Double each digit and add the neighbor.`;
    } else if (quizRule === '6') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 6;
      expected = m * 6;
      hintText = `Rule for 6: Number + half neighbor. If the number is odd, add 5.`;
    } else if (quizRule === '7') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 7;
      expected = m * 7;
      hintText = `Rule for 7: Double number + half neighbor. If number is odd, add 5.`;
    } else if (quizRule === '5') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 5;
      expected = m * 5;
      hintText = `Rule for 5: Half the neighbor. If number is odd, add 5.`;
    } else if (quizRule === '9') {
      m = Math.floor(100 + Math.random() * 8999);
      n = 9;
      expected = m * 9;
      hintText = `Rule for 9: Subtract rightmost digit from 10; subtract other digits from 9 and add neighbor. Reduce leading digit by 1.`;
    } else if (quizRule === 'squaring_5') {
      const tens = Math.floor(2 + Math.random() * 8);
      m = tens * 10 + 5;
      n = m;
      expected = m * m;
      hintText = `Squaring ends in 5: Tens digit ${tens} × (${tens} + 1) = ${tens * (tens + 1)}, attach 25!`;
    } else {
      m = Math.floor(12 + Math.random() * 88);
      n = Math.floor(12 + Math.random() * 88);
      expected = m * n;
      hintText = `Direct method: Multiply outside pairs and inside pairs and sum!`;
    }

    currentProblem = {
      m: m,
      n: n,
      expected: expected.toString(),
      hint: hintText
    };

    if (promptElem) {
      promptElem.innerHTML = `${m} <span style="color:#94a3b8;">×</span> ${n} = <span style="color:#00f2fe;">?</span>`;
    }
    if (hintBox) hintBox.textContent = hintText;

    // Reset and start timer
    quizStartTime = Date.now();
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    const timerElem = document.getElementById('quizTimerDisplay');

    quizTimerInterval = setInterval(() => {
      if (!quizStartTime) return;
      const elapsed = (Date.now() - quizStartTime) / 1000;
      if (timerElem) timerElem.textContent = `⏱ ${elapsed.toFixed(1)}s`;
    }, 100);
  }

  function checkQuizAnswer() {
    if (!currentProblem) return;
    const inputAns = document.getElementById('inputQuizAnswer');
    const feedback = document.getElementById('quizFeedback');
    const streakElem = document.getElementById('quizStreakCount');
    const bestElem = document.getElementById('quizBestTime');

    const userVal = inputAns ? inputAns.value.trim() : '';
    if (!userVal) return;

    const elapsed = ((Date.now() - quizStartTime) / 1000);
    clearInterval(quizTimerInterval);

    if (userVal === currentProblem.expected) {
      currentStreak++;
      if (streakElem) streakElem.textContent = `🔥 Streak: ${currentStreak}`;

      if (bestTimeMs === null || elapsed < bestTimeMs) {
        bestTimeMs = elapsed;
        if (bestElem) bestElem.textContent = `⚡ Record: ${elapsed.toFixed(1)}s`;
      }

      if (feedback) {
        feedback.innerHTML = `<span style="color:#34d399; font-weight:800;">✅ Brilliant! Exact Match in ${elapsed.toFixed(1)}s!</span>`;
      }

      if (window.SoundEngine) SoundEngine.playSuccess();

      // Automatically queue next problem after 1.4s
      setTimeout(startNewQuizProblem, 1400);
    } else {
      currentStreak = 0;
      if (streakElem) streakElem.textContent = `🔥 Streak: 0`;

      if (feedback) {
        feedback.innerHTML = `<span style="color:#f43f5e; font-weight:800;">❌ Not quite. Expected ${currentProblem.expected}. Check the rule hint!</span>`;
      }
      if (window.SoundEngine) SoundEngine.playTick();
    }
  }

  return {
    init: init,
    renderPersianNecklace: renderPersianNecklace,
    renderCarpenterBoard: renderCarpenterBoard,
    startNewQuizProblem: startNewQuizProblem
  };
})();

if (typeof window !== 'undefined') {
  window.PuzzlesAndQuiz = PuzzlesAndQuiz;
}
if (typeof global !== 'undefined') {
  global.PuzzlesAndQuiz = PuzzlesAndQuiz;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PuzzlesAndQuiz;
}
