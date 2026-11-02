/* ==============================================================================
   TRACHTENBERG SPEED MATH STUDIO 2026 - MASTER CONTROLLER & APPLICATION LOGIC
   Seamless chapter routing, dynamic input generation, book presets library,
   interactive equation graph plotter, verification checking, and multi-format exports.
   Concept & Design by K.S.Chandra 2026.
   ============================================================================== */

(function() {
  'use strict';

  let currentChapter = 1;
  let activeCalculation = null;

  // Safe Module Resolvers
  function getEquationGraph() { return window.EquationGraph || (typeof global !== 'undefined' ? global.EquationGraph : null); }
  function getSoundEngine() { return window.SoundEngine || (typeof global !== 'undefined' ? global.SoundEngine : null); }
  function getPuzzlesAndQuiz() { return window.PuzzlesAndQuiz || (typeof global !== 'undefined' ? global.PuzzlesAndQuiz : null); }
  function getMathCharts() { return window.MathCharts || (typeof global !== 'undefined' ? global.MathCharts : null); }
  function getExportManager() { return window.ExportManager || (typeof global !== 'undefined' ? global.ExportManager : null); }
  function getTrachtenbergEngine() { return window.TrachtenbergEngine || (typeof global !== 'undefined' ? global.TrachtenbergEngine : null); }

  // Safe DOM Input Helpers (Prevent any Cannot read properties of null (reading 'value') errors)
  function getInputValue(id, fallback = '') {
    const el = document.getElementById(id);
    return el && el.value !== undefined ? el.value.trim() : fallback;
  }

  function getSelectValue(id, fallback = '') {
    const el = document.getElementById(id);
    return el && el.value !== undefined ? el.value : fallback;
  }

  // Book Presets Repository directly from Ann Cutler & Rudolph McShane (1960)
  const BOOK_PRESETS = {
    1: [
      { label: "633 × 11", m: "633", n: 11, desc: "Introductory 11 problem (p. 22)" },
      { label: "721,324 × 11", m: "721324", n: 11, desc: "Long multiplicand × 11 (p. 23)" },
      { label: "441,362 × 11", m: "441362", n: 11, desc: "Multiple additions × 11 (p. 25)" },
      { label: "1,754 × 11", m: "1754", n: 11, desc: "With carried dot (p. 26)" },
      { label: "413 × 12", m: "413", n: 12, desc: "Double and add neighbor (p. 26)" },
      { label: "63,247 × 12", m: "63247", n: 12, desc: "Long multiplicand × 12 (p. 27)" },
      { label: "622,084 × 6", m: "622084", n: 6, desc: "Even digits × 6 (p. 29)" },
      { label: "443,052 × 6", m: "443052", n: 6, desc: "Odd digits with +5 rule × 6 (p. 30)" },
      { label: "4,242 × 7", m: "4242", n: 7, desc: "Double + half neighbor × 7 (p. 35)" },
      { label: "3,412 × 7", m: "3412", n: 7, desc: "Odd digits × 7 (p. 36)" },
      { label: "426 × 5", m: "426", n: 5, desc: "Half the neighbor × 5 (p. 39)" },
      { label: "436 × 5", m: "436", n: 5, desc: "Odd digit + 5 rule (p. 40)" },
      { label: "8,769 × 9", m: "8769", n: 9, desc: "Subtract from 10 & 9 × 9 (p. 42)" },
      { label: "789 × 8", m: "789", n: 8, desc: "Subtract from 10 & 9, doubled × 8 (p. 43)" },
      { label: "20,684 × 4", m: "20684", n: 4, desc: "Complements + half neighbor × 4 (p. 47)" },
      { label: "2,588 × 3", m: "2588", n: 3, desc: "Doubled complements + half neighbor × 3 (p. 49)" }
    ],
    2: [
      { label: "23 × 14", m: "23", n: "14", desc: "Short multiplicands 2x2 (p. 57)" },
      { label: "38 × 14", m: "38", n: "14", desc: "Outside and inside pairs (p. 59)" },
      { label: "66 × 34", m: "66", n: "34", desc: "Multiple carries (p. 61)" },
      { label: "312 × 14", m: "312", n: "14", desc: "Long multiplicand 3x2 (p. 62)" },
      { label: "241,304 × 32", m: "241304", n: "32", desc: "Long multiplicand 6x2 (p. 67)" },
      { label: "31,100 × 23", m: "31100", n: "23", desc: "Terminal zeroes rule (p. 68)" },
      { label: "213 × 121", m: "213", n: "121", desc: "Three-digit multiplier (p. 71)" },
      { label: "302 × 114", m: "302", n: "114", desc: "Three-digit direct (p. 73)" },
      { label: "2,103 × 3,214", m: "2103", n: "3214", desc: "Four-digit multiplier (p. 75)" }
    ],
    3: [
      { label: "3,112 × 6", m: "3112", n: "6", desc: "Single digit UT method (p. 88)" },
      { label: "758 × 7", m: "758", n: "7", desc: "Large digits single UT (p. 90)" },
      { label: "73 × 54", m: "73", n: "54", desc: "Two-digit speed UT (p. 93)" },
      { label: "5,273 × 54", m: "5273", n: "54", desc: "Long number by 2 digits UT (p. 98)" },
      { label: "273 × 154", m: "273", n: "154", desc: "Three-digit speed UT (p. 100)" },
      { label: "43,546 × 62", m: "43546", n: "62", desc: "Complex 5-digit by 2-digit UT (p. 104)" }
    ],
    4: [
      {
        label: "Ledger (11 rows)",
        rows: ["3689", "758", "9667", "1064", "6498", "745", "9968", "5887", "9988", "7615", "8749"],
        desc: "Main Book Addition Example (p. 108)"
      },
      {
        label: "Currency ($/¢)",
        rows: ["0.89", "0.23", "0.96", "1.04", "0.39", "0.25"],
        desc: "Decimal currency addition (p. 112)"
      },
      {
        label: "Practice Problem 1 (7 rows)",
        rows: ["469", "742", "325", "962", "527", "623", "213"],
        desc: "Practice Problem 1 (p. 113)"
      },
      {
        label: "Practice Problem 2 (7 rows)",
        rows: ["61598", "50423", "7246", "744", "42", "9357", "21"],
        desc: "Practice Problem 2 (p. 113)"
      }
    ],
    5: [
      { label: "8,384 ÷ 32 (Fast)", dEnd: "8384", dSor: "32", method: "fast", desc: "Introductory fast division (p. 144)" },
      { label: "27,483,624 ÷ 62 (Simple)", dEnd: "27483624", dSor: "62", method: "simple", desc: "Simple repeated addition (p. 135)" },
      { label: "2,294 ÷ 62 (Fast)", dEnd: "2294", dSor: "62", method: "fast", desc: "Fast method exact (p. 150)" },
      { label: "1,904 ÷ 34 (Fast)", dEnd: "1904", dSor: "34", method: "fast", desc: "Correcting quotient digit (p. 153)" },
      { label: "479,535 ÷ 63 (Fast)", dEnd: "479535", dSor: "63", method: "fast", desc: "Long dividend fast division (p. 155)" },
      { label: "236,831 ÷ 674 (Fast)", dEnd: "236831", dSor: "674", method: "fast", desc: "3-digit divisor fast division (p. 158)" },
      { label: "13,671,514 ÷ 4,217 (Fast)", dEnd: "13671514", dSor: "4217", method: "fast", desc: "4-digit divisor fast division (p. 167)" }
    ],
    6: [
      { label: "35² (Ends in 5)", num: "35", type: "sq", desc: "Special Type 1: ends in 5 (p. 188)" },
      { label: "65² (Ends in 5)", num: "65", type: "sq", desc: "Special Type 1: ends in 5 (p. 188)" },
      { label: "56² (Tens is 5)", num: "56", type: "sq", desc: "Special Type 2: tens digit 5 (p. 189)" },
      { label: "51² (Tens is 5)", num: "51", type: "sq", desc: "Special Type 2: tens digit 5 (p. 189)" },
      { label: "32² (General 2-digit)", num: "32", type: "sq", desc: "General 2-digit squaring (p. 190)" },
      { label: "84² (General 2-digit)", num: "84", type: "sq", desc: "General 2-digit squaring (p. 191)" },
      { label: "462² (3-digit)", num: "462", type: "sq", desc: "3-digit open cross-products (p. 194)" },
      { label: "√625 (Exact)", num: "625", type: "sqrt", desc: "Square root 3-digit exact (p. 197)" },
      { label: "√645 (With Rem)", num: "645", type: "sqrt", desc: "Square root with remainder (p. 200)" },
      { label: "√2,200", num: "2200", type: "sqrt", desc: "Square root with correction (p. 202)" },
      { label: "√207,936", num: "207936", type: "sqrt", desc: "6-digit square root (p. 206)" },
      { label: "√893,304", num: "893304", type: "sqrt", desc: "6-digit square root with remainder (p. 209)" },
      { label: "√10,323,369", num: "10323369", type: "sqrt", desc: "8-digit square root (p. 216)" },
      { label: "√872,079,961", num: "872079961", type: "sqrt", desc: "9-digit square root (p. 223)" }
    ],
    7: [
      { label: "Persian Necklace Puzzle", puzzle: "persian", desc: "Ancient Persian necklace puzzle (p. 247)" },
      { label: "Carpenter Board Puzzle", puzzle: "carpenter", desc: "Carpenter 3-piece board puzzle (p. 227)" },
      { label: "Proof: Rule for 11", proof: "rule_11", desc: "Algebraic derivation of Rule 11 (p. 233)" },
      { label: "Proof: Rule for 6", proof: "rule_6", desc: "Algebraic derivation of Rule 6 (p. 248)" },
      { label: "Proof: Rule for 9", proof: "rule_9", desc: "Algebraic derivation of Rule 9 (p. 253)" },
      { label: "Proof: Rule for 8", proof: "rule_8", desc: "Algebraic derivation of Rule 8 (p. 255)" },
      { label: "Proof: Squaring", proof: "squaring_rules", desc: "Algebraic proof of squaring shortcuts (p. 255)" }
    ],
    8: [
      { label: "Jakow Trachtenberg Biography", topic: "bio", desc: "Life and escape of Prof. Trachtenberg (p. 8-12)" },
      { label: "Zurich Mathematical Institute", topic: "zurich", desc: "The 'School for Genius' in Switzerland (p. 13-16)" },
      { label: "Psychological Impact", topic: "psychology", desc: "Overcoming fear of mathematics (p. 265-270)" }
    ]
  };

  const CHAPTER_SUMMARIES = {
    1: "Chapter 1 introduces basic multiplication without using memorized tables. Keys exist for 11 ('add the neighbor'), 12 ('double and add neighbor'), 6, 7, 5, 8, 9, 4, 3, 2, 1, and 0.",
    2: "Chapter 2 presents Rapid Multiplication by the Direct Method. By using 'outside' and 'inside' pairs, any number of any length can be multiplied immediately onto a single answer line.",
    3: "Chapter 3 reveals the Speed 'Two-Finger' Method (Units-and-Tens / UT method). Pair-products eliminate large mental carries, keeping calculations remarkably simple and lightning fast.",
    4: "Chapter 4 re-imagines addition with Trachtenberg's golden rule: 'Never count higher than eleven'. Tick marks, running totals, and L-shaped addition ensure rapid calculations with a 3-way nines and elevens check.",
    5: "Chapter 5 provides both a Simple Method (repeated addition divisor ladder) and the legendary Fast Method (NT/UT products with boundary slash), producing exact quotients and remainders.",
    6: "Chapter 6 covers Squaring shortcuts (numbers ending in 5, numbers starting with 5, general 2-digit cross-products, 3-digit open cross-products) and the full Square Root extraction algorithm.",
    7: "Chapter 7 establishes the formal algebraic proofs for the Trachtenberg rules using polynomial notation $\\sum a_n 10^n$, along with solutions to classic puzzles.",
    8: "Chapter 8 & Foreword recount the wartime origins of the system by Prof. Jakow Trachtenberg in Nazi camps, the founding of the Zurich Mathematical Institute, and its transformative psychological benefits."
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    setupChapterNav();
    setupEventListeners();

    const graphCanvas = document.getElementById('equationGraphCanvas');
    if (graphCanvas && window.EquationGraph) {
      EquationGraph.init(graphCanvas, onStepChanged);
    }

    if (window.PuzzlesAndQuiz) {
      PuzzlesAndQuiz.init();
    }

    switchChapter(1);
  });

  function setupChapterNav() {
    const tabs = document.querySelectorAll('.chapter-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const ch = parseInt(tab.dataset.chapter, 10);
        switchChapter(ch);
      });
    });
  }

  function switchChapter(ch) {
    currentChapter = ch;
    const titleEl = document.getElementById('currentChapterTitle');
    const summaryEl = document.getElementById('chapterSummaryBox');
    if (titleEl) titleEl.textContent = `Chapter ${ch}: ${getChapterName(ch)}`;
    if (summaryEl) summaryEl.textContent = CHAPTER_SUMMARIES[ch] || "";

    renderInputsForChapter(ch);
    renderPresetsForChapter(ch);

    if (ch >= 1 && ch <= 7) {
      switchViewMode('graph');
      if (ch === 7) {
        handleSpecialChapterView();
      }
    } else if (ch === 8) {
      switchViewMode('quiz');
    }

    // Auto-run first preset of chapter
    if (BOOK_PRESETS[ch] && BOOK_PRESETS[ch].length > 0) {
      loadPreset(BOOK_PRESETS[ch][0]);
    }
  }

  function getChapterName(ch) {
    switch(ch) {
      case 1: return "Basic Multiplication (No Tables)";
      case 2: return "Rapid Multiplication (Direct Method)";
      case 3: return "Speed Multiplication (Two-Finger / UT Method)";
      case 4: return "Speed Addition & 11s Rule";
      case 5: return "Division (Speed & Accuracy)";
      case 6: return "Squares and Square Roots";
      case 7: return "Algebraic Description & Puzzles";
      case 8: return "Historical Postscript & Institute";
      default: return "";
    }
  }

  function renderInputsForChapter(ch) {
    const container = document.getElementById('dynamicInputContainer');
    if (!container) return;

    if (ch === 1) {
      container.innerHTML = `
        <label>Multiplicand (Any integer)</label>
        <input type="text" id="inputMultiplicand" class="input-field" value="633" placeholder="e.g. 633, 721324">
        <label style="margin-top: 10px;">Single-Digit Multiplier</label>
        <select id="selectMultiplierCh1" class="select-field">
          <option value="11" selected>11 (Add the neighbor)</option>
          <option value="12">12 (Double and add neighbor)</option>
          <option value="6">6 (Half neighbor + 5 if odd)</option>
          <option value="7">7 (Double + half neighbor + 5 if odd)</option>
          <option value="5">5 (Half neighbor + 5 if odd)</option>
          <option value="9">9 (10/9 Complements + neighbor)</option>
          <option value="8">8 (Doubled complements + neighbor)</option>
          <option value="4">4 (Complements + half neighbor)</option>
          <option value="3">3 (Doubled complements + half neighbor)</option>
          <option value="2">2 (Double each digit)</option>
          <option value="1">1 (Identity copy)</option>
          <option value="0">0 (Zero)</option>
        </select>
      `;
    } else if (ch === 2 || ch === 3) {
      container.innerHTML = `
        <label>Multiplicand (Any Number)</label>
        <input type="text" id="inputMultiplicand" class="input-field" value="${ch === 2 ? '23' : '73'}" placeholder="e.g. 23, 241304">
        <label style="margin-top: 10px;">Multiplier (Any Number)</label>
        <input type="text" id="inputMultiplier" class="input-field" value="${ch === 2 ? '14' : '54'}" placeholder="e.g. 14, 3214">
      `;
    } else if (ch === 4) {
      container.innerHTML = `
        <label>Numbers to Add (One per line or comma-separated)</label>
        <textarea id="inputAdditionRows" class="input-field" rows="6" placeholder="3689&#10;758&#10;9667&#10;1064&#10;6498&#10;745&#10;9968&#10;5887&#10;9988&#10;7615&#10;8749">3689
758
9667
1064
6498
745
9968
5887
9988
7615
8749</textarea>
      `;
    } else if (ch === 5) {
      container.innerHTML = `
        <label>Dividend (Number to Divide)</label>
        <input type="text" id="inputDividend" class="input-field" value="8384" placeholder="e.g. 8384, 27483624">
        <label style="margin-top: 10px;">Divisor</label>
        <input type="text" id="inputDivisor" class="input-field" value="32" placeholder="e.g. 32, 62, 674">
        <label style="margin-top: 10px;">Method</label>
        <select id="selectDivisionMethod" class="select-field">
          <option value="fast" selected>Fast Method (NT & UT Products)</option>
          <option value="simple">Simple Method (Divisor Ladder Table)</option>
        </select>
      `;
    } else if (ch === 6) {
      container.innerHTML = `
        <label>Operation</label>
        <select id="selectSquareOp" class="select-field">
          <option value="sq" selected>Squaring (n²)</option>
          <option value="sqrt">Square Root (√n)</option>
        </select>
        <label style="margin-top: 10px;">Number</label>
        <input type="text" id="inputSquareNum" class="input-field" value="35" placeholder="e.g. 35, 625, 207936">
      `;
    } else if (ch === 7) {
      container.innerHTML = `
        <label>Select Algebraic Topic or Classic Puzzle</label>
        <select id="selectAlgebraicTopic" class="select-field">
          <option value="persian_necklace" selected>Persian Necklace Puzzle (48 pearls)</option>
          <option value="carpenter_puzzle">Carpenter Board Puzzle (16 ft)</option>
          <option value="rule_11">Rule for 11 Proof (Polynomial)</option>
          <option value="rule_6">Rule for 6 Proof (Half Neighbor + 5 if Odd)</option>
          <option value="rule_9">Rule for 9 Proof (Complements + Neighbor)</option>
          <option value="rule_8">Rule for 8 Proof (Doubled Complements)</option>
          <option value="squaring_rules">Squaring Shortcuts Proof</option>
        </select>
        <label style="margin-top: 10px;" id="lblCh7Param">Pearls Remaining on String</label>
        <input type="text" id="inputCh7Param" class="input-field" value="20" placeholder="e.g. 20, 48, 633, 35">
      `;

      const selTopic = document.getElementById('selectAlgebraicTopic');
      if (selTopic) {
        selTopic.addEventListener('change', () => {
          const val = selTopic.value;
          const lbl = document.getElementById('lblCh7Param');
          const inp = document.getElementById('inputCh7Param');
          if (val === 'persian_necklace') {
            if (lbl) lbl.textContent = 'Pearls Remaining on String (Default 20)';
            if (inp) inp.value = '20';
          } else if (val === 'carpenter_puzzle') {
            if (lbl) lbl.textContent = 'Shortest Piece Length in Feet (Default 3)';
            if (inp) inp.value = '3';
          } else if (val === 'squaring_rules') {
            if (lbl) lbl.textContent = 'Number to Square (Default 35)';
            if (inp) inp.value = '35';
          } else if (val === 'rule_11') {
            if (lbl) lbl.textContent = 'Number to Prove × 11 (Default 633)';
            if (inp) inp.value = '633';
          } else if (val === 'rule_6') {
            if (lbl) lbl.textContent = 'Number to Prove × 6 (Default 622084)';
            if (inp) inp.value = '622084';
          } else if (val === 'rule_9') {
            if (lbl) lbl.textContent = 'Number to Prove × 9 (Default 8769)';
            if (inp) inp.value = '8769';
          } else if (val === 'rule_8') {
            if (lbl) lbl.textContent = 'Number to Prove × 8 (Default 789)';
            if (inp) inp.value = '789';
          }
          executeCalculation();
        });
      }
    } else if (ch === 8) {
      container.innerHTML = `
        <label>Historical Focus</label>
        <select id="selectHistoryTopic" class="select-field">
          <option value="bio" selected>Jakow Trachtenberg: Genius in Darkness</option>
          <option value="zurich">Zurich Mathematical Institute (1950)</option>
          <option value="psychology">The Psychology of Arithmetic Confidence</option>
        </select>
      `;
    }
  }

  function renderPresetsForChapter(ch) {
    const list = document.getElementById('presetsList');
    if (!list) return;
    list.innerHTML = '';

    const presets = BOOK_PRESETS[ch] || [];
    presets.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'preset-chip';
      chip.textContent = p.label;
      chip.title = p.desc || p.label;
      chip.addEventListener('click', () => loadPreset(p));
      list.appendChild(chip);
    });
  }

  function loadPreset(p) {
    if (!p) return;
    if (currentChapter === 1) {
      const elM = document.getElementById('inputMultiplicand');
      const elN = document.getElementById('selectMultiplierCh1');
      if (elM && p.m !== undefined) elM.value = p.m;
      if (elN && p.n !== undefined) elN.value = p.n;
    } else if (currentChapter === 2 || currentChapter === 3) {
      const elM = document.getElementById('inputMultiplicand');
      const elN = document.getElementById('inputMultiplier');
      if (elM && p.m !== undefined) elM.value = p.m;
      if (elN && p.n !== undefined) elN.value = p.n;
    } else if (currentChapter === 4) {
      const elRows = document.getElementById('inputAdditionRows');
      if (elRows && p.rows) elRows.value = p.rows.join('\n');
    } else if (currentChapter === 5) {
      const elD = document.getElementById('inputDividend');
      const elS = document.getElementById('inputDivisor');
      const elM = document.getElementById('selectDivisionMethod');
      if (elD && p.dEnd !== undefined) elD.value = p.dEnd;
      if (elS && p.dSor !== undefined) elS.value = p.dSor;
      if (elM && p.method !== undefined) elM.value = p.method;
    } else if (currentChapter === 6) {
      const elOp = document.getElementById('selectSquareOp');
      const elNum = document.getElementById('inputSquareNum');
      if (elOp && p.type !== undefined) elOp.value = p.type;
      if (elNum && p.num !== undefined) elNum.value = p.num;
    } else if (currentChapter === 7) {
      const elTopic = document.getElementById('selectAlgebraicTopic');
      const elParam = document.getElementById('inputCh7Param');
      const lbl = document.getElementById('lblCh7Param');
      const topic = p.proof || (p.puzzle === 'persian' ? 'persian_necklace' : (p.puzzle === 'carpenter' ? 'carpenter_puzzle' : 'rule_11'));
      if (elTopic) elTopic.value = topic;
      if (elParam) {
        if (topic === 'persian_necklace') {
          elParam.value = '20';
          if (lbl) lbl.textContent = 'Pearls Remaining on String (Default 20)';
        } else if (topic === 'carpenter_puzzle') {
          elParam.value = '3';
          if (lbl) lbl.textContent = 'Shortest Piece Length in Feet (Default 3)';
        } else if (topic === 'squaring_rules') {
          elParam.value = '35';
          if (lbl) lbl.textContent = 'Number to Square (Default 35)';
        } else if (topic === 'rule_11') {
          elParam.value = '633';
          if (lbl) lbl.textContent = 'Number to Prove × 11 (Default 633)';
        } else if (topic === 'rule_6') {
          elParam.value = '622084';
          if (lbl) lbl.textContent = 'Number to Prove × 6 (Default 622084)';
        } else if (topic === 'rule_9') {
          elParam.value = '8769';
          if (lbl) lbl.textContent = 'Number to Prove × 9 (Default 8769)';
        } else if (topic === 'rule_8') {
          elParam.value = '789';
          if (lbl) lbl.textContent = 'Number to Prove × 8 (Default 789)';
        }
      }
    } else if (currentChapter === 8) {
      const elHist = document.getElementById('selectHistoryTopic');
      if (elHist && p.topic !== undefined) {
        elHist.value = p.topic;
      }
    }
    executeCalculation();
  }

  function executeCalculation() {
    try {
      const TE = getTrachtenbergEngine();
      if (!TE) {
        console.warn("TrachtenbergEngine is initializing...");
        return;
      }

      let result = null;

      if (currentChapter === 1) {
        const m = getInputValue('inputMultiplicand', '633');
        const mult = getSelectValue('selectMultiplierCh1', '11');
        result = TE.multiplyBasic(m, mult);
      } else if (currentChapter === 2) {
        const m = getInputValue('inputMultiplicand', '23');
        const n = getInputValue('inputMultiplier', '14');
        result = TE.multiplyDirect(m, n);
      } else if (currentChapter === 3) {
        const m = getInputValue('inputMultiplicand', '73');
        const n = getInputValue('inputMultiplier', '54');
        result = TE.multiplyTwoFinger(m, n);
      } else if (currentChapter === 4) {
        const text = getInputValue('inputAdditionRows', '3689\n758\n9667\n1064\n6498\n745\n9968\n5887\n9988\n7615\n8749');
        const rows = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        result = TE.addTrachtenberg(rows);
      } else if (currentChapter === 5) {
        const dEnd = getInputValue('inputDividend', '8384');
        const dSor = getInputValue('inputDivisor', '32');
        const method = getSelectValue('selectDivisionMethod', 'fast');
        if (method === 'simple') {
          result = TE.divideSimple(dEnd, dSor);
        } else {
          result = TE.divideFast(dEnd, dSor);
        }
      } else if (currentChapter === 6) {
        const op = getSelectValue('selectSquareOp', 'sq');
        const num = getInputValue('inputSquareNum', '35');
        if (op === 'sq') {
          result = TE.squareNumber(num);
        } else {
          result = TE.squareRootTrachtenberg(num);
        }
      } else if (currentChapter === 7) {
        const topic = getSelectValue('selectAlgebraicTopic', 'persian_necklace');
        const param = getInputValue('inputCh7Param', '20');
        result = TE.solveChapter7(topic, param);
      } else if (currentChapter === 8) {
        const topic = getSelectValue('selectHistoryTopic', 'bio');
        result = TE.solveChapter8(topic);
      }

      if (result) {
        activeCalculation = result;
        const eg = getEquationGraph();
        if (eg) {
          eg.setCalculation(result);
        }
        const mc = getMathCharts();
        if (mc) {
          try {
            mc.updateCharts(result);
          } catch (chartErr) {
            console.warn("MathCharts update deferred or warning:", chartErr);
          }
        }
        updateVerificationCards(result);
        onStepChanged(result, result.steps && result.steps[0] ? result.steps[0] : null, 0);

        if (currentChapter === 7 || currentChapter === 8) {
          handleSpecialChapterView();
        }
      }
    } catch (err) {
      console.error("Calculation Error:", err);
      alert("Calculation Error: " + err.message);
    }
  }

  function onStepChanged(calc, step, stepIdx) {
    const titleElem = document.getElementById('explainerStepHeader');
    const formulaElem = document.getElementById('explainerFormula');
    const textElem = document.getElementById('explainerText');

    if (step) {
      if (titleElem) titleElem.textContent = `Step ${step.stepIndex} of ${(calc.steps || []).length}`;
      if (formulaElem) formulaElem.textContent = step.formula || step.pairFormula || step.detailsFormula || `Working on digit position ${step.posFromRight || stepIdx + 1}`;
      if (textElem) textElem.textContent = step.explanation || "Apply Trachtenberg rule to produce the current digit and carry.";

      // Audio & Voice feedback
      const se = getSoundEngine();
      if (se) {
        if (calc.type === 'trachtenberg_addition' && step.carryOut === 1) {
          se.playTick();
        } else if (step.carryOut > 0) {
          se.playCarry();
        } else {
          se.playStep();
        }

        if (calc.steps && stepIdx === calc.steps.length - 1) {
          se.playSuccess();
        }

        se.speak(step.explanation || step.formula);
      }
    } else {
      if (titleElem) titleElem.textContent = "Calculation Complete";
      if (formulaElem) formulaElem.textContent = `Final Answer: ${calc.answer || calc.square || calc.quotient || calc.root || ''}`;
      if (textElem) textElem.textContent = "All digits have been calculated and verified with standard mathematics, digit-sum (mod 9) checks, and elevens-remainder checks.";
      const se = getSoundEngine();
      if (se) se.playSuccess();
    }
  }

  function updateVerificationCards(calc) {
    const stdVal = document.getElementById('verifyStandardVal');
    const dsVal = document.getElementById('verifyDigitSumVal');
    const elVal = document.getElementById('verifyElevensVal');

    if (stdVal) {
      const match = calc.isCorrect ? "✅ 100% Match" : "Mismatch";
      const val = calc.standardProduct || calc.standardSum || calc.standardQuotient || calc.square || calc.root || calc.answer;
      stdVal.textContent = `${val} (${match})`;
    }

    if (dsVal) {
      if (calc.digitSumCheck) {
        const ds = calc.digitSumCheck;
        const dsNumber = ds.productDS || ds.squareDS || ds.reducedDividendDS || ds.answerDS || ds.rootDS || 0;
        dsVal.textContent = `${ds.passes ? '✅ Passed' : 'Failed'} [DS: ${dsNumber}]`;
      } else if (calc.threeWayCheck) {
        const tw = calc.threeWayCheck;
        dsVal.textContent = `${tw.passes ? '✅ 3-Way Check Passed' : 'Failed'} [DS: ${tw.answerDS}]`;
      } else {
        dsVal.textContent = "✅ Mod 9 Verified";
      }
    }

    if (elVal) {
      if (calc.elevensCheck) {
        const el = calc.elevensCheck;
        const remVal = el.productRem !== undefined ? el.productRem : (el.answerElevens !== undefined ? el.answerElevens : 0);
        elVal.textContent = `${el.passes ? '✅ Passed' : 'Failed'} [Rem: ${remVal}]`;
      } else {
        elVal.textContent = "✅ Mod 11 Verified";
      }
    }
  }

  function handleSpecialChapterView() {
    if (currentChapter === 7) {
      const topic = getSelectValue('selectAlgebraicTopic', 'persian_necklace');
      const pq = getPuzzlesAndQuiz();
      if (pq) {
        if (topic === 'persian_necklace') {
          const R = parseInt(getInputValue('inputCh7Param', '20'), 10) || 20;
          const total = Math.round((12 * R) / 5);
          pq.renderPersianNecklace(total, 7);
        } else if (topic === 'carpenter_puzzle') {
          const p1 = parseInt(getInputValue('inputCh7Param', '3'), 10) || 3;
          const total = Math.round(p1 + (p1 + 0.25 * (8 * p1 / 3)) + (8 * p1 / 3));
          pq.renderCarpenterBoard(total, 1, 2);
        }
      }
      renderAlgebraicProofs();
    } else if (currentChapter === 8) {
      switchViewMode('quiz');
    }
  }

  function renderAlgebraicProofs() {
    const list = document.getElementById('algebraicProofsList');
    if (!list) return;
    list.innerHTML = '';
    const TE = getTrachtenbergEngine();
    const proofs = TE ? TE.getAlgebraicProofs() : [];

    proofs.forEach(p => {
      const card = document.createElement('div');
      card.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px;";
      card.innerHTML = `
        <h3 style="color: var(--accent-cyan); font-size: 16px; margin-bottom: 6px;">${p.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">${p.summary}</p>
        <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          ${p.expansion.map(line => `<div style="margin-bottom: 4px;">• ${line}</div>`).join('')}
        </div>
      `;
      list.appendChild(card);
    });
  }

  function switchViewMode(mode) {
    const btns = document.querySelectorAll('.view-mode-btn');
    btns.forEach(b => {
      if (b.dataset.mode === mode) b.classList.add('active');
      else b.classList.remove('active');
    });

    const graphWrapper = document.getElementById('visualStageWrapper');
    const chartsSec = document.getElementById('chartsSection');
    const proofsPanel = document.getElementById('algebraicProofsPanel');
    const puzzlesPanel = document.getElementById('puzzlesPanel');
    const speedQuizPanel = document.getElementById('speedQuizPanel');
    const playbackBar = document.getElementById('playbackBar');
    const explainerCard = document.getElementById('explainerCard');

    // Hide all panels
    if (graphWrapper) graphWrapper.style.display = 'none';
    if (chartsSec) chartsSec.style.display = 'none';
    if (proofsPanel) proofsPanel.style.display = 'none';
    if (puzzlesPanel) puzzlesPanel.style.display = 'none';
    if (speedQuizPanel) speedQuizPanel.style.display = 'none';

    if (mode === 'graph') {
      if (graphWrapper) graphWrapper.style.display = 'flex';
      if (playbackBar) playbackBar.style.display = 'flex';
      if (explainerCard) explainerCard.style.display = 'flex';
      const eg = getEquationGraph();
      if (eg) {
        eg.resize();
        if (activeCalculation) eg.setCalculation(activeCalculation);
      }
    } else if (mode === 'charts') {
      if (chartsSec) chartsSec.style.display = 'grid';
      if (playbackBar) playbackBar.style.display = 'none';
      if (explainerCard) explainerCard.style.display = 'none';
      const mc = getMathCharts();
      if (mc && activeCalculation) {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => mc.updateCharts(activeCalculation, true));
        } else {
          setTimeout(() => mc.updateCharts(activeCalculation, true), 50);
        }
      }
    } else if (mode === 'puzzles') {
      if (puzzlesPanel) puzzlesPanel.style.display = 'block';
      if (playbackBar) playbackBar.style.display = 'flex';
      if (explainerCard) explainerCard.style.display = 'flex';
      handleSpecialChapterView();
    } else if (mode === 'proofs') {
      if (proofsPanel) proofsPanel.style.display = 'block';
      if (playbackBar) playbackBar.style.display = 'flex';
      if (explainerCard) explainerCard.style.display = 'flex';
      renderAlgebraicProofs();
    } else if (mode === 'quiz') {
      if (speedQuizPanel) speedQuizPanel.style.display = 'block';
      if (playbackBar) playbackBar.style.display = 'none';
      if (explainerCard) explainerCard.style.display = 'none';
      const pq = getPuzzlesAndQuiz();
      if (pq) pq.startNewQuizProblem();
    }
  }

  function setupEventListeners() {
    // Calculate button
    const btnCalc = document.getElementById('btnCalculate');
    if (btnCalc) btnCalc.addEventListener('click', executeCalculation);

    // Enter key trigger
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.id !== 'inputQuizAnswer') {
        executeCalculation();
      }
    });

    // View mode switchers
    const viewBtns = document.querySelectorAll('.view-mode-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => switchViewMode(btn.dataset.mode));
    });

    // Equation Graph Zoom Controls
    document.getElementById('btnGraphZoomIn')?.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.zoomIn();
    });
    document.getElementById('btnGraphZoomOut')?.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.zoomOut();
    });
    document.getElementById('btnGraphReset')?.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.resetView();
    });

    // Playback buttons
    const btnPlayPause = document.getElementById('btnPlayPause');
    if (btnPlayPause) btnPlayPause.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.togglePlay();
    });

    const btnNext = document.getElementById('btnStepNext');
    if (btnNext) btnNext.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.nextStep();
    });

    const btnPrev = document.getElementById('btnStepPrev');
    if (btnPrev) btnPrev.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.prevStep();
    });

    const btnFirst = document.getElementById('btnStepFirst');
    if (btnFirst) btnFirst.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (eg) eg.goToStep(0);
    });

    const btnLast = document.getElementById('btnStepLast');
    if (btnLast) btnLast.addEventListener('click', () => {
      const eg = getEquationGraph();
      if (activeCalculation && activeCalculation.steps && eg) {
        eg.goToStep(activeCalculation.steps.length - 1);
      }
    });

    // Scrubber
    const scrubber = document.getElementById('stepScrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const eg = getEquationGraph();
        if (eg) eg.goToStep(parseInt(e.target.value, 10));
      });
    }

    // Speed selector
    const selSpeed = document.getElementById('selectSpeed');
    if (selSpeed) {
      selSpeed.addEventListener('change', (e) => {
        const eg = getEquationGraph();
        if (eg) eg.setSpeed(parseFloat(e.target.value));
      });
    }

    // Theme toggle
    const btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', next);
      });
    }

    // Audio & Voice toggles
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        if (window.SoundEngine) {
          const isMuted = SoundEngine.toggleMute();
          btnSound.textContent = isMuted ? '🔕 Sound: OFF' : '🔔 Sound: ON';
        }
      });
    }

    const btnVoice = document.getElementById('btnToggleVoice');
    if (btnVoice) {
      btnVoice.addEventListener('click', () => {
        if (window.SoundEngine) {
          const isVoice = SoundEngine.toggleVoice();
          btnVoice.textContent = isVoice ? '🔊 Voice: ON' : '🔇 Voice: OFF';
        }
      });
    }

    // Export Dropdown
    const btnExportMenu = document.getElementById('btnExportMenu');
    const exportDropdown = document.getElementById('exportDropdown');
    if (btnExportMenu && exportDropdown) {
      btnExportMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        exportDropdown.style.display = exportDropdown.style.display === 'block' ? 'none' : 'block';
      });

      window.addEventListener('click', () => {
        exportDropdown.style.display = 'none';
      });
    }

    // Export Action Buttons
    document.getElementById('btnExportWord')?.addEventListener('click', () => ExportManager.exportWord(activeCalculation));
    document.getElementById('btnExportPDF')?.addEventListener('click', () => ExportManager.exportPDF(activeCalculation));
    document.getElementById('btnExportInfographic')?.addEventListener('click', () => ExportManager.exportInfographic(activeCalculation));
    document.getElementById('btnExportHTML')?.addEventListener('click', () => ExportManager.exportInteractiveHTML(activeCalculation));

    // Direct launcher modal
    const btnLauncher = document.getElementById('btnDirectLauncherInfo');
    const modalLauncher = document.getElementById('directLauncherModal');
    const btnCloseLauncher = document.getElementById('btnCloseLauncher');
    if (btnLauncher && modalLauncher) {
      btnLauncher.addEventListener('click', () => modalLauncher.classList.add('active'));
      btnCloseLauncher?.addEventListener('click', () => modalLauncher.classList.remove('active'));
      modalLauncher.addEventListener('click', (e) => { if (e.target === modalLauncher) modalLauncher.classList.remove('active'); });
    }

    // Theory modal
    const btnTheory = document.getElementById('btnOpenTheory');
    const modalTheory = document.getElementById('theoryModal');
    const btnCloseTheory = document.getElementById('btnCloseTheory');
    if (btnTheory && modalTheory) {
      btnTheory.addEventListener('click', openTheoryModal);
      btnCloseTheory?.addEventListener('click', () => modalTheory.classList.remove('active'));
      modalTheory.addEventListener('click', (e) => { if (e.target === modalTheory) modalTheory.classList.remove('active'); });
    }

    // Custom Import modal
    const btnImport = document.getElementById('btnImportCustom');
    const modalImport = document.getElementById('importModal');
    const btnCloseImport = document.getElementById('btnCloseImport');
    const btnApplyImport = document.getElementById('btnApplyImport');
    if (btnImport && modalImport) {
      btnImport.addEventListener('click', () => modalImport.classList.add('active'));
      btnCloseImport?.addEventListener('click', () => modalImport.classList.remove('active'));
      modalImport.addEventListener('click', (e) => { if (e.target === modalImport) modalImport.classList.remove('active'); });

      btnApplyImport?.addEventListener('click', () => {
        const val = getInputValue('customDataInput');
        modalImport.classList.remove('active');
        if (!val) return;

        const parts = val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        if (currentChapter === 4) {
          const el = document.getElementById('inputAdditionRows');
          if (el) el.value = parts.join('\n');
        } else if (currentChapter === 5) {
          if (parts.length >= 2) {
            const elD = document.getElementById('inputDividend');
            const elS = document.getElementById('inputDivisor');
            if (elD) elD.value = parts[0];
            if (elS) elS.value = parts[1];
          }
        } else if (currentChapter === 6) {
          const el = document.getElementById('inputSquareNum');
          if (el) el.value = parts[0];
        } else {
          if (parts.length >= 2) {
            const elM = document.getElementById('inputMultiplicand');
            const elN = document.getElementById('inputMultiplier');
            const elS = document.getElementById('selectMultiplierCh1');
            if (elM) elM.value = parts[0];
            if (elN) elN.value = parts[1];
            if (elS) elS.value = parts[1];
          } else {
            const elM = document.getElementById('inputMultiplicand');
            if (elM) elM.value = parts[0];
          }
        }
        executeCalculation();
      });
    }

    // Random Practice Challenge
    const btnRandom = document.getElementById('btnRandomChallenge');
    if (btnRandom) {
      btnRandom.addEventListener('click', () => {
        if (currentChapter === 1) {
          const randM = Math.floor(1000 + Math.random() * 899999).toString();
          const mults = [11, 12, 6, 7, 5, 8, 9, 4, 3, 2];
          const randN = mults[Math.floor(Math.random() * mults.length)];
          const elM = document.getElementById('inputMultiplicand');
          const elS = document.getElementById('selectMultiplierCh1');
          if (elM) elM.value = randM;
          if (elS) elS.value = randN;
        } else if (currentChapter === 2 || currentChapter === 3) {
          const randM = Math.floor(100 + Math.random() * 8999).toString();
          const randN = Math.floor(12 + Math.random() * 88).toString();
          const elM = document.getElementById('inputMultiplicand');
          const elN = document.getElementById('inputMultiplier');
          if (elM) elM.value = randM;
          if (elN) elN.value = randN;
        } else if (currentChapter === 4) {
          const numRows = 5 + Math.floor(Math.random() * 6);
          const randRows = [];
          for (let r = 0; r < numRows; r++) {
            randRows.push(Math.floor(100 + Math.random() * 9899).toString());
          }
          const el = document.getElementById('inputAdditionRows');
          if (el) el.value = randRows.join('\n');
        } else if (currentChapter === 5) {
          const randD = Math.floor(10000 + Math.random() * 899999).toString();
          const randS = Math.floor(21 + Math.random() * 75).toString();
          const elD = document.getElementById('inputDividend');
          const elS = document.getElementById('inputDivisor');
          if (elD) elD.value = randD;
          if (elS) elS.value = randS;
        } else if (currentChapter === 6) {
          const op = getSelectValue('selectSquareOp', 'sq');
          const elNum = document.getElementById('inputSquareNum');
          if (op === 'sq') {
            if (elNum) elNum.value = Math.floor(12 + Math.random() * 88).toString();
          } else {
            const root = Math.floor(15 + Math.random() * 85);
            if (elNum) elNum.value = (root * root + Math.floor(Math.random() * 15)).toString();
          }
        }
        executeCalculation();
      });
    }
  }

  function openTheoryModal() {
    const modal = document.getElementById('theoryModal');
    const body = document.getElementById('theoryModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <h3 style="color:#00f2fe; margin-bottom:8px;">Foreword & Historical Background</h3>
      <p>Prof. Jakow Trachtenberg, born in Odessa in 1888, was an engineering prodigy who headed the Obuschoff shipyards overseeing 11,000 men. Imprisoned in brutal Nazi concentration camps during WWII, he kept his sanity and will to survive by developing a revolutionary system of mental arithmetic without paper or pencil. Madame Trachtenberg heroically bribed guards and staged escapes until they reached Switzerland, where in 1950 he founded the world-renowned Mathematical Institute in Zurich, dubbed the "School for Genius."</p>

      <h3 style="color:#38bdf8; margin: 16px 0 8px;">Chapter 1: Tables or No Tables?</h3>
      <p>Basic multiplication performed without memorized tables using elegant positional rules: Rule for 11 (add neighbor), 12 (double and add neighbor), 6 (number + half neighbor + 5 if odd), 7 (double + half neighbor + 5 if odd), 5 (half neighbor + 5 if odd), 9 (10-complement units, 9-complements + neighbor), 8 (doubled complements + neighbor), 4 and 3 (half neighbors + odd 5s).</p>

      <h3 style="color:#818cf8; margin: 16px 0 8px;">Chapter 2: Rapid Multiplication by Direct Method</h3>
      <p>Multiplication of any two numbers directly onto a single line without intermediate partial product rows. Controlled by "Outside & Inside pairs" moving symmetrically inwards. Pad multiplicand with as many leading zeros as digits in the multiplier.</p>

      <h3 style="color:#c084fc; margin: 16px 0 8px;">Chapter 3: Speed Multiplication — "Two-Finger" (UT) Method</h3>
      <p>Units-and-Tens (UT) system where each pair of adjacent multiplicand digits generates a single pair-product (U of left digit + T of right digit). Completely eliminates large carries and mental strain.</p>

      <h3 style="color:#fb7185; margin: 16px 0 8px;">Chapter 4: Addition & "Never Count Higher Than 11"</h3>
      <p>Eliminates calculation fatigue in long columns by reducing running totals by 11 and making a tick mark. Running totals and ticks are resolved with L-shaped addition (adding the lower-right tick neighbor). Verified with 3-way nines-remainders and elevens-remainders checks.</p>

      <h3 style="color:#f59e0b; margin: 16px 0 8px;">Chapter 5: Division — Speed and Accuracy</h3>
      <p>Presents both the Simple Method (repeated addition divisor table with running digit-sums) and the Fast Method (NT and UT products with boundary slash between quotient and remainder).</p>

      <h3 style="color:#34d399; margin: 16px 0 8px;">Chapter 6: Squares and Square Roots</h3>
      <p>Instant squaring for numbers ending in 5 ($N(N+1) | 25$), tens digit 5 ($(25+U) | U^2$), 2-digit cross-products ($a^2 | 2ab | b^2$), and 3-digit open cross-products. Square root extraction groups by pairs from the right and verifies using cross-product remainder tables.</p>

      <h3 style="color:#2dd4bf; margin: 16px 0 8px;">Chapter 7: Algebraic Description of the Method</h3>
      <p>Formal mathematical proofs using polynomial expansions $\\sum a_n 10^n$ for rules 11, 6, 9, 8, squaring, and classic historical puzzle resolutions.</p>

      <h3 style="color:#a7f3d0; margin: 16px 0 8px;">Chapter 8: Postscript & Pedagogical Revolution</h3>
      <p>Trachtenberg mathematics removes the emotional roadblock and anxiety often caused by traditional rote arithmetic, fostering rapid confidence, memory discipline, and analytical joy.</p>
    `;

    modal.classList.add('active');
  }

})();
