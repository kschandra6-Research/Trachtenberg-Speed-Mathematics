/* ==============================================================================
   TRACHTENBERG MATHEMATICAL EQUATION GRAPH ENGINE
   Replaces complex 2D SVG diagrams and 3D geometry with dynamic, interactive,
   pure HTML5 Canvas graphs of the mathematical equations for all chapters.
   Works 100% OFFLINE with zero external dependencies.
   Concept & Design by K.S.Chandra 2026.
   ============================================================================== */

const EquationGraph = (function() {
  'use strict';

  let canvas = null;
  let ctx = null;
  let currentCalculation = null;
  let currentStepIndex = 0;
  let isPlaying = false;
  let playInterval = null;
  let playSpeedMs = 1200;
  let onStepChangeCallback = null;

  // Viewport / Camera Transformation state
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let mousePos = { x: 0, y: 0, onCanvas: false };

  function init(canvasElement, callback) {
    canvas = canvasElement;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    onStepChangeCallback = callback;

    setupEvents();
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(300, rect.width);
    const h = Math.max(380, rect.height || 420);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    render();
  }

  function setCalculation(calcData) {
    currentCalculation = calcData;
    currentStepIndex = 0;
    scale = 1.0;
    panX = 0;
    panY = 0;
    pause();
    render();
    notifyStep();
  }

  function updateStep(stepIdx) {
    currentStepIndex = stepIdx;
    render();
    notifyStep();
  }

  function notifyStep() {
    if (!currentCalculation) return;
    const step = currentCalculation.steps && currentCalculation.steps[currentStepIndex] ? currentCalculation.steps[currentStepIndex] : null;
    if (typeof onStepChangeCallback === 'function') {
      onStepChangeCallback(currentCalculation, step, currentStepIndex);
    }

    // Update scrubber UI if present
    const scrubber = document.getElementById('stepScrubber');
    const stepIndicator = document.getElementById('stepIndicator');
    if (scrubber && currentCalculation.steps) {
      scrubber.max = Math.max(0, currentCalculation.steps.length - 1);
      scrubber.value = currentStepIndex;
    }
    if (stepIndicator && currentCalculation.steps) {
      stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${currentCalculation.steps.length}`;
    }
  }

  function setSpeed(multiplier) {
    playSpeedMs = Math.max(300, Math.round(1200 / multiplier));
    if (isPlaying) {
      pause();
      play();
    }
  }

  function play() {
    if (!currentCalculation || !currentCalculation.steps || currentCalculation.steps.length === 0) return;
    isPlaying = true;
    updatePlayPauseButtonUI();
    if (playInterval) clearInterval(playInterval);
    playInterval = setInterval(() => {
      if (currentStepIndex < currentCalculation.steps.length - 1) {
        currentStepIndex++;
        render();
        notifyStep();
      } else {
        pause();
      }
    }, playSpeedMs);
  }

  function pause() {
    isPlaying = false;
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    updatePlayPauseButtonUI();
  }

  function togglePlay() {
    if (isPlaying) pause();
    else {
      if (currentCalculation && currentStepIndex >= currentCalculation.steps.length - 1) {
        currentStepIndex = 0;
      }
      play();
    }
  }

  function nextStep() {
    pause();
    if (currentCalculation && currentCalculation.steps && currentStepIndex < currentCalculation.steps.length - 1) {
      currentStepIndex++;
      render();
      notifyStep();
    }
  }

  function prevStep() {
    pause();
    if (currentCalculation && currentStepIndex > 0) {
      currentStepIndex--;
      render();
      notifyStep();
    }
  }

  function goToStep(index) {
    pause();
    if (currentCalculation && currentCalculation.steps && index >= 0 && index < currentCalculation.steps.length) {
      currentStepIndex = index;
      render();
      notifyStep();
    }
  }

  function updatePlayPauseButtonUI() {
    const btn = document.getElementById('btnPlayPause');
    if (!btn) return;
    if (isPlaying) {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
      btn.classList.add('playing');
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play`;
      btn.classList.remove('playing');
    }
  }

  function zoomIn() {
    scale = Math.min(3.5, scale * 1.25);
    render();
  }

  function zoomOut() {
    scale = Math.max(0.5, scale / 1.25);
    render();
  }

  function resetView() {
    scale = 1.0;
    panX = 0;
    panY = 0;
    render();
  }

  function setupEvents() {
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStart = { x: e.clientX - panX, y: e.clientY - panY };
    });

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        mousePos.onCanvas = (mousePos.x >= 0 && mousePos.x <= rect.width && mousePos.y >= 0 && mousePos.y <= rect.height);

        if (isDragging) {
          panX = e.clientX - dragStart.x;
          panY = e.clientY - dragStart.y;
          render();
        } else if (mousePos.onCanvas) {
          render();
        }
      });

      window.addEventListener('mouseup', () => { isDragging = false; });
    }

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      scale = Math.max(0.4, Math.min(4.0, scale * zoomFactor));
      render();
    }, { passive: false });
  }

  // ============================================================================
  // MASTER RENDERING DISPATCHER
  // ============================================================================
  function render() {
    if (!ctx || !canvas) return;
    const w = parseFloat(canvas.style.width) || canvas.width;
    const h = parseFloat(canvas.style.height) || canvas.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#090e1a';
    ctx.fillRect(0, 0, w, h);

    if (!currentCalculation) {
      renderIdleCoordinateGrid(w, h);
      return;
    }

    const calc = currentCalculation;
    const step = calc.steps && calc.steps[currentStepIndex] ? calc.steps[currentStepIndex] : null;

    if (calc.type === 'squaring' || calc.type === 'square_root') {
      renderSquareEquationGraph(w, h, calc, step, currentStepIndex);
    } else if (calc.type === 'trachtenberg_addition') {
      renderAdditionEquationGraph(w, h, calc, step, currentStepIndex);
    } else if (calc.type === 'simple_division' || calc.type === 'fast_division') {
      renderDivisionEquationGraph(w, h, calc, step, currentStepIndex);
    } else if (calc.type === 'persian_necklace') {
      renderPersianNecklaceGraph(w, h, calc, step, currentStepIndex);
    } else if (calc.type === 'carpenter_puzzle') {
      renderCarpenterPuzzleGraph(w, h, calc, step, currentStepIndex);
    } else {
      // Basic, Direct, Two-Finger Multiplications, and Algebraic Proofs: y = M * x
      renderMultiplicationEquationGraph(w, h, calc, step, currentStepIndex);
    }

    // Render interactive HUD overlay
    renderGraphOverlayHUD(w, h, calc, step);
  }

  // ============================================================================
  // 1. MULTIPLICATION EQUATION GRAPH: y = M * x (Linear Curve & Modular Residues)
  // ============================================================================
  function renderMultiplicationEquationGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const multiplicandVal = parseFloat(calc.multiplicand) || 100;
    const multiplierVal = parseFloat(calc.multiplier) || 11;
    const productVal = parseFloat(calc.answer) || (multiplicandVal * multiplierVal);

    const maxX = Math.max(10, multiplicandVal * 1.15);
    const maxY = Math.max(10, productVal * 1.15);

    // Coordinate transforms
    function toScreenX(x) {
      return margin.left + panX + ((x / maxX) * plotW) * scale;
    }
    function toScreenY(y) {
      return (margin.top + plotH + panY) - ((y / maxY) * plotH) * scale;
    }

    drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, "Multiplicand (x)", "Product y = M · x");

    // Plot continuous linear equation line y = M * x
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 12;

    const x0 = 0;
    const y0 = 0;
    const xMaxCoord = maxX;
    const yMaxCoord = multiplierVal * xMaxCoord;

    ctx.moveTo(toScreenX(x0), toScreenY(y0));
    ctx.lineTo(toScreenX(xMaxCoord), toScreenY(yMaxCoord));
    ctx.stroke();
    ctx.restore();

    // Secondary curve: Digital Root Modulo 9 step function
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    const numSamples = 60;
    for (let i = 0; i <= numSamples; i++) {
      const sx = (i / numSamples) * multiplicandVal;
      const sy = ((Math.round(sx * multiplierVal) % 9) || 9) * (maxY / 10);
      const px = toScreenX(sx);
      const py = toScreenY(sy);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Plot discrete step nodes computed so far
    const steps = calc.steps || [];
    steps.forEach((st, idx) => {
      if (idx > stepIdx) return;
      const progressRatio = (idx + 1) / steps.length;
      const curX = multiplicandVal * progressRatio;
      const curY = curX * multiplierVal;
      const isCurrent = (idx === stepIdx);

      const px = toScreenX(curX);
      const py = toScreenY(curY);

      // Dropline to X and Y axes
      if (isCurrent) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, toScreenY(0));
        ctx.moveTo(px, py);
        ctx.lineTo(toScreenX(0), py);
        ctx.stroke();
        ctx.restore();
      }

      // Point node
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, isCurrent ? 8 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent ? '#34d399' : '#00f2fe';
      ctx.shadowColor = isCurrent ? '#34d399' : '#00f2fe';
      ctx.shadowBlur = isCurrent ? 18 : 6;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      ctx.stroke();
      ctx.restore();

      // Label at active point
      if (isCurrent) {
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const label = `Step ${idx + 1}: Digit [${st.digitWritten}] | Output: ${Math.round(curY)}`;
        ctx.fillText(label, px + 12, py - 12);
        ctx.restore();
      }
    });

    // Final answer target point
    const endX = toScreenX(multiplicandVal);
    const endY = toScreenY(productVal);
    ctx.save();
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Final Target (${multiplicandVal}, ${productVal})`, endX + 10, endY + 16);
    ctx.restore();
  }

  // ============================================================================
  // 2. SPEED ADDITION GRAPH: y = sum(x_i) & 11s THRESHOLD FUNCTION
  // ============================================================================
  function renderAdditionEquationGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const numRows = (calc.paddedStrs || []).length || 6;
    const numCols = (calc.paddedStrs && calc.paddedStrs[0]) ? calc.paddedStrs[0].length : 5;

    const maxX = Math.max(10, numCols * numRows + 2);
    const maxY = 22; // Trachtenberg 11s rule focuses on 0 to 20

    function toScreenX(x) {
      return margin.left + panX + ((x / maxX) * plotW) * scale;
    }
    function toScreenY(y) {
      return (margin.top + plotH + panY) - ((y / maxY) * plotH) * scale;
    }

    drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, "Addition Iterations / Steps", "Running Total vs 11s Threshold");

    // Critical Trachtenberg Golden Threshold Line: y = 11 ("Never count higher than 11")
    const y11Screen = toScreenY(11);
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.moveTo(margin.left, y11Screen);
    ctx.lineTo(margin.left + plotW, y11Screen);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('CRITICAL THRESHOLD: y = 11 (TICK DROP TRIGGER)', margin.left + 15, y11Screen - 8);
    ctx.restore();

    // Plot running total trajectory
    const steps = calc.steps || [];
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    let prevX = toScreenX(0);
    let prevY = toScreenY(0);
    ctx.moveTo(prevX, prevY);

    for (let s = 0; s <= stepIdx && s < steps.length; s++) {
      const st = steps[s];
      const val = st.digitWritten !== undefined ? st.digitWritten : (st.runningTotal || 0);
      const px = toScreenX(s + 1);
      const py = toScreenY(val);

      ctx.lineTo(px, py);

      // If tick triggered (sum exceeded 11)
      if (st.carryOut === 1) {
        ctx.save();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('✓ 11', px - 8, py - 10);
        ctx.restore();
      }

      if (s === stepIdx) {
        // Active point highlight
        ctx.save();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      prevX = px;
      prevY = py;
    }
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // 3. DIVISION EQUATION GRAPH: Quotient Line & Remainder Decay
  // ============================================================================
  function renderDivisionEquationGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const dividendVal = parseFloat(calc.dividend) || 8384;
    const divisorVal = parseFloat(calc.divisor) || 32;
    const quotientVal = parseFloat(calc.quotient) || (dividendVal / divisorVal);

    const maxX = Math.max(10, (calc.steps || []).length + 1);
    const maxY = Math.max(10, divisorVal * 2.2);

    function toScreenX(x) {
      return margin.left + panX + ((x / maxX) * plotW) * scale;
    }
    function toScreenY(y) {
      return (margin.top + plotH + panY) - ((y / maxY) * plotH) * scale;
    }

    drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, "Division Step", "Intermediate Remainder Value (r < Divisor)");

    // Divisor ceiling line (remainders must strictly be < divisor)
    const yDivScreen = toScreenY(divisorVal);
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.moveTo(margin.left, yDivScreen);
    ctx.lineTo(margin.left + plotW, yDivScreen);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Divisor Bound (Ceiling = ${divisorVal})`, margin.left + 15, yDivScreen - 8);
    ctx.restore();

    // Plot remainder step curve
    const steps = calc.steps || [];
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;

    for (let s = 0; s <= stepIdx && s < steps.length; s++) {
      const st = steps[s];
      const rem = parseFloat(st.remainder || st.currentRemainder || (st.workingValue ? st.workingValue % divisorVal : 0));
      const px = toScreenX(s + 1);
      const py = toScreenY(rem);

      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);

      const isCurrent = (s === stepIdx);
      ctx.save();
      ctx.fillStyle = isCurrent ? '#34d399' : '#00f2fe';
      ctx.beginPath();
      ctx.arc(px, py, isCurrent ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.stroke();
    ctx.restore();
  }

  // ============================================================================
  // 4. SQUARES & SQUARE ROOTS EQUATION GRAPH: Parabola y = x² and Radical y = √x
  // ============================================================================
  function renderSquareEquationGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const numVal = parseFloat(calc.number) || 35;
    const isSquaring = (calc.type === 'squaring');

    if (isSquaring) {
      // Parabola y = x^2
      const squareVal = parseFloat(calc.square) || (numVal * numVal);
      const maxX = Math.max(10, numVal * 1.3);
      const maxY = Math.max(10, squareVal * 1.3);

      function toScreenX(x) {
        return margin.left + panX + ((x / maxX) * plotW) * scale;
      }
      function toScreenY(y) {
        return (margin.top + plotH + panY) - ((y / maxY) * plotH) * scale;
      }

      drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, "Number (x)", "Square y = x²");

      // Draw Parabola curve y = x^2
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;

      const samples = 100;
      for (let i = 0; i <= samples; i++) {
        const sx = (i / samples) * maxX;
        const sy = sx * sx;
        const px = toScreenX(sx);
        const py = toScreenY(sy);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // Tangent line at (numVal, numVal^2) with slope 2*numVal
      const px = toScreenX(numVal);
      const py = toScreenY(squareVal);
      const slope = 2 * numVal;
      const dx = numVal * 0.35;
      const x1 = numVal - dx;
      const y1 = squareVal - slope * dx;
      const x2 = numVal + dx;
      const y2 = squareVal + slope * dx;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.moveTo(toScreenX(x1), toScreenY(y1));
      ctx.lineTo(toScreenX(x2), toScreenY(y2));
      ctx.stroke();
      ctx.restore();

      // Target Coordinate point
      ctx.save();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`Target: (${numVal}, ${squareVal}) [Slope m = 2x = ${slope}]`, px + 12, py - 12);
      ctx.restore();

    } else {
      // Radical Curve y = √x
      const rootVal = parseFloat(calc.root) || Math.sqrt(numVal);
      const maxX = Math.max(10, numVal * 1.25);
      const maxY = Math.max(10, rootVal * 1.35);

      function toScreenX(x) {
        return margin.left + panX + ((x / maxX) * plotW) * scale;
      }
      function toScreenY(y) {
        return (margin.top + plotH + panY) - ((y / maxY) * plotH) * scale;
      }

      drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, "Radicand (x)", "Square Root y = √x");

      // Draw y = √x curve
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 12;

      const samples = 100;
      for (let i = 0; i <= samples; i++) {
        const sx = (i / samples) * maxX;
        const sy = Math.sqrt(sx);
        const px = toScreenX(sx);
        const py = toScreenY(sy);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // Target Coordinate point
      const px = toScreenX(numVal);
      const py = toScreenY(rootVal);

      ctx.save();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`√${numVal} = ${calc.root} (Exact: ${calc.isExact ? 'YES' : 'Rem ' + calc.remainder})`, px + 12, py - 12);
      ctx.restore();
    }
  }

  // ============================================================================
  // 5. PERSIAN NECKLACE PUZZLE EQUATION GRAPH: Fixed-Point Intersection (p. 247)
  // ============================================================================
  function renderPersianNecklaceGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const total = calc.totalPearls || 48;
    const R = calc.remaining !== undefined ? calc.remaining : 20;
    const maxX = Math.max(65, Math.ceil(total * 1.25));
    const maxY = maxX;

    function toScreenX(val) {
      const norm = (val / maxX) * scale;
      return margin.left + norm * plotW + panX;
    }
    function toScreenY(val) {
      const norm = (val / maxY) * scale;
      return margin.top + plotH - norm * plotH + panY;
    }

    drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, 'Total Pearls (x)', 'Equation Value y(x)');

    // 1. Line 1: y = x (Total Pearls Identity)
    ctx.save();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(maxX), toScreenY(maxX));
    ctx.stroke();

    // 2. Line 2: y = (7/12)x + R (Floor + Couch + String)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(R));
    const yEnd = (7 / 12) * maxX + R;
    ctx.lineTo(toScreenX(maxX), toScreenY(yEnd));
    ctx.stroke();

    // 3. Glowing Fixed-Point Intersection: (total, total)
    const px = toScreenX(total);
    const py = toScreenY(total);

    // Ripple
    ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fill();

    // Pin
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`Solution: x = ${total} Pearls (y = x = ${total})`, px + 12, py - 12);

    // Legend
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('― Total Pearls: y = x', margin.left + 15, margin.top + 25);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`― Fractions: y = 7/12 x + ${R}`, margin.left + 15, margin.top + 45);

    ctx.restore();
  }

  // ============================================================================
  // 6. CARPENTER BOARD PUZZLE EQUATION GRAPH: System of Equations (p. 227)
  // ============================================================================
  function renderCarpenterPuzzleGraph(w, h, calc, step, stepIdx) {
    const margin = { top: 60, right: 60, bottom: 65, left: 85 };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const p1 = calc.piece1 || 3;
    const p2 = calc.piece2 || 5;
    const p3 = calc.piece3 || 8;
    const totalL = calc.totalLength || 16;

    const maxX = Math.max(22, Math.ceil(totalL * 1.3));
    const maxY = 15;

    function toScreenX(val) {
      const norm = (val / maxX) * scale;
      return margin.left + norm * plotW + panX;
    }
    function toScreenY(val) {
      const norm = (val / maxY) * scale;
      return margin.top + plotH - norm * plotH + panY;
    }

    drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, 'Longest Piece z / Board Length (ft)', 'Middle Piece y (ft)');

    ctx.save();
    // 1. Line 1: y = z - x ==> y = z - p1
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(p1), toScreenY(0));
    ctx.lineTo(toScreenX(maxX), toScreenY(maxX - p1));
    ctx.stroke();

    // 2. Line 2: y = p1 + (1/4)z
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(p1));
    ctx.lineTo(toScreenX(maxX), toScreenY(p1 + 0.25 * maxX));
    ctx.stroke();

    // 3. Intersection Point at (z, y) = (p3, p2)
    const px = toScreenX(p3);
    const py = toScreenY(p2);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`Intersection (z=${p3} ft, y=${p2} ft) ⟹ Board = ${totalL} ft`, px + 12, py - 12);

    // Segmented Board visualization in upper HUD
    const barY = margin.top + 20;
    const barH = 18;
    const scaleFactor = (plotW * 0.75) / totalL;

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(margin.left, barY, p1 * scaleFactor, barH);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(margin.left + p1 * scaleFactor, barY, p2 * scaleFactor, barH);
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(margin.left + (p1 + p2) * scaleFactor, barY, p3 * scaleFactor, barH);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, barY, totalL * scaleFactor, barH);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x=${p1}ft`, margin.left + (p1 * scaleFactor) / 2, barY + 12);
    ctx.fillText(`y=${p2}ft`, margin.left + p1 * scaleFactor + (p2 * scaleFactor) / 2, barY + 12);
    ctx.fillText(`z=${p3}ft`, margin.left + (p1 + p2) * scaleFactor + (p3 * scaleFactor) / 2, barY + 12);

    ctx.restore();
  }

  // ============================================================================
  // SHARED CARTESIAN GRID BUILDER
  // ============================================================================
  function drawCartesianGrid(w, h, margin, plotW, plotH, maxX, maxY, toScreenX, toScreenY, xLabel, yLabel) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;

    // Grid lines - X
    const xDivs = 8;
    for (let i = 0; i <= xDivs; i++) {
      const val = (i / xDivs) * maxX;
      const x = toScreenX(val);
      if (x >= margin.left && x <= margin.left + plotW) {
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + plotH);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(formatNumberShort(val), x, margin.top + plotH + 18);
      }
    }

    // Grid lines - Y
    const yDivs = 6;
    for (let j = 0; j <= yDivs; j++) {
      const val = (j / yDivs) * maxY;
      const y = toScreenY(val);
      if (y >= margin.top && y <= margin.top + plotH) {
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + plotW, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(formatNumberShort(val), margin.left - 10, y + 4);
      }
    }

    // Main Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // X Axis
    ctx.moveTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    // Y Axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, margin.left + plotW / 2, margin.top + plotH + 42);

    ctx.save();
    ctx.translate(margin.left - 50, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    ctx.restore();
  }

  function renderIdleCoordinateGrid(w, h) {
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Select a Trachtenberg problem or preset to plot the equation graph.', w / 2, h / 2);
    ctx.restore();
  }

  function drawRoundedRect(c, x, y, width, height, radius) {
    if (!c.quadraticCurveTo) {
      if (c.rect) c.rect(x, y, width, height);
      return;
    }
    const r = Math.min(radius, width / 2, height / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + width - r, y);
    c.quadraticCurveTo(x + width, y, x + width, y + r);
    c.lineTo(x + width, y + height - r);
    c.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    c.lineTo(x + r, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  // ============================================================================
  // INTERACTIVE GRAPH HUD OVERLAY
  // ============================================================================
  function renderGraphOverlayHUD(w, h, calc, step) {
    ctx.save();

    // Top Equation Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, 15, 12, 390, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    let eqStr = "";
    if (calc.type === 'persian_necklace') eqStr = `PUZZLE: x = ⅓x + ¼x + ${calc.remaining || 20}  ⟹  ${calc.totalPearls || 48} Pearls`;
    else if (calc.type === 'carpenter_puzzle') eqStr = `PUZZLE: x=${calc.piece1 || 3}, y=x+¼z, z=x+y  ⟹  Board=${calc.totalLength || 16}ft`;
    else if (calc.type === 'algebraic_proof') eqStr = `PROOF: ${calc.proofTitle || calc.formula || 'Algebraic Derivation'}`;
    else if (calc.type === 'history_postscript') eqStr = `HISTORY: ${calc.title || 'Zurich Institute (1950)'}`;
    else if (calc.type === 'squaring') eqStr = `EQUATION: f(x) = x²  |  ${calc.number}² = ${calc.square}`;
    else if (calc.type === 'square_root') eqStr = `EQUATION: f(x) = √x  |  √${calc.number} = ${calc.root}`;
    else if (calc.type === 'trachtenberg_addition') eqStr = `EQUATION: S(n) = Σ xᵢ (11s Threshold)`;
    else if (calc.type === 'simple_division' || calc.type === 'fast_division') eqStr = `EQUATION: ${calc.dividend} ÷ ${calc.divisor} = ${calc.quotient}`;
    else eqStr = `EQUATION: f(x) = ${calc.multiplier}x  |  ${calc.multiplicand} × ${calc.multiplier} = ${calc.answer}`;

    ctx.fillText(eqStr, 28, 35);

    // Zoom Indicator
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    drawRoundedRect(ctx, w - 110, 12, 95, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Zoom: ${(scale * 100).toFixed(0)}%`, w - 95, 34);

    ctx.restore();
  }

  function formatNumberShort(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }

  return {
    init: init,
    resize: resize,
    setCalculation: setCalculation,
    updateStep: updateStep,
    play: play,
    pause: pause,
    togglePlay: togglePlay,
    nextStep: nextStep,
    prevStep: prevStep,
    goToStep: goToStep,
    setSpeed: setSpeed,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    resetView: resetView,
    getCurrentStepIndex: () => currentStepIndex
  };
})();

if (typeof window !== 'undefined') {
  window.EquationGraph = EquationGraph;
}
if (typeof global !== 'undefined') {
  global.EquationGraph = EquationGraph;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EquationGraph;
}
