/* ==============================================================================
   TRACHTENBERG ANALYTICAL CHARTS & GRAPHS
   Visualizes operational efficiency, mental load comparison, carry dynamics,
   and accuracy verification using Chart.js.
   Includes defensive visibility guards, safe canvas recycling, and explicit scale definitions.
   Concept & Design by K.S.Chandra 2026.
   ============================================================================== */

const MathCharts = (function() {
  'use strict';

  let efficiencyChart = null;
  let radarChart = null;
  let stepDynamicsChart = null;
  let cachedCalculation = null;

  function isSectionVisible() {
    const sec = document.getElementById('chartsSection');
    if (!sec) return false;
    if (sec.style.display === 'none') return false;
    const rect = sec.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function safeDestroy(canvasId, currentChart) {
    if (typeof window === 'undefined' || !window.Chart) return null;
    try {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const existing = Chart.getChart(canvas);
        if (existing) {
          existing.destroy();
        }
      }
    } catch (e) {
      console.warn(`Warning destroying chart on #${canvasId}:`, e);
    }

    if (currentChart) {
      try {
        currentChart.destroy();
      } catch (e) {}
    }
    return null;
  }

  function updateCharts(calcData, forceRender = false) {
    if (calcData) {
      cachedCalculation = calcData;
    }
    const targetCalc = calcData || cachedCalculation;
    if (!targetCalc || typeof window === 'undefined' || !window.Chart) return;

    // If charts section is hidden (e.g. user is in Equation Graph view), defer rendering!
    if (!forceRender && !isSectionVisible()) {
      return;
    }

    renderEfficiencyChart(targetCalc);
    renderRadarChart(targetCalc);
    renderStepDynamicsChart(targetCalc);
  }

  // 1. Bar Chart: Trachtenberg vs Conventional Operations
  function renderEfficiencyChart(calc) {
    const canvas = document.getElementById('efficiencyChartCanvas');
    if (!canvas) return;

    let digitsCount = 4;
    if (calc.multiplicand) digitsCount = calc.multiplicand.length;
    else if (calc.number) digitsCount = calc.number.length;
    else if (calc.dividend) digitsCount = calc.dividend.length;

    let multLen = (calc.multiplier ? calc.multiplier.toString().length : 1);

    const trachtenbergOps = {
      multiplications: calc.chapter === 1 ? 0 : Math.round(digitsCount * multLen * 1.2),
      carries: Math.max(1, Math.round(digitsCount * 0.4)),
      rowsWritten: 1,
      mentalLoadIndex: 25
    };

    const conventionalOps = {
      multiplications: digitsCount * multLen,
      carries: Math.round(digitsCount * multLen * 0.8),
      rowsWritten: multLen > 1 ? multLen + 2 : 2,
      mentalLoadIndex: 85
    };

    efficiencyChart = safeDestroy('efficiencyChartCanvas', efficiencyChart);

    try {
      efficiencyChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Memorized Tables', 'Carry Operations', 'Intermediate Rows', 'Cognitive Strain %'],
          datasets: [
            {
              label: 'Trachtenberg System',
              data: [
                trachtenbergOps.multiplications,
                trachtenbergOps.carries,
                trachtenbergOps.rowsWritten,
                trachtenbergOps.mentalLoadIndex
              ].map(v => isNaN(v) ? 0 : Number(v)),
              backgroundColor: 'rgba(0, 242, 254, 0.75)',
              borderColor: '#00f2fe',
              borderWidth: 1.5,
              borderRadius: 6
            },
            {
              label: 'Conventional School Method',
              data: [
                conventionalOps.multiplications,
                conventionalOps.carries,
                conventionalOps.rowsWritten,
                conventionalOps.mentalLoadIndex
              ].map(v => isNaN(v) ? 0 : Number(v)),
              backgroundColor: 'rgba(244, 63, 94, 0.65)',
              borderColor: '#f43f5e',
              borderWidth: 1.5,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif", size: 12 } }
            },
            title: {
              display: true,
              text: 'Operational Efficiency Comparison',
              color: '#f1f5f9',
              font: { size: 14, weight: '700' }
            }
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#94a3b8',
                precision: 0,
                callback: function(val) {
                  const num = Number(val);
                  return isNaN(num) ? '' : Math.round(num);
                }
              },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    } catch (err) {
      console.warn("Efficiency chart render deferred or bypassed:", err);
    }
  }

  // 2. Radar Chart: System Capability Profile
  function renderRadarChart(calc) {
    const canvas = document.getElementById('radarChartCanvas');
    if (!canvas) return;

    radarChart = safeDestroy('radarChartCanvas', radarChart);

    try {
      radarChart = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: ['Speed', 'Accuracy Verification', 'Ease of Practice', 'Small-Carry Safety', 'Table Freedom', 'Mental Focus'],
          datasets: [
            {
              label: 'Trachtenberg System',
              data: [95, 99, 90, 98, 92, 95],
              fill: true,
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderColor: '#10b981',
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#10b981'
            },
            {
              label: 'Conventional Method',
              data: [55, 45, 60, 40, 20, 50],
              fill: true,
              backgroundColor: 'rgba(148, 163, 184, 0.2)',
              borderColor: '#64748b',
              pointBackgroundColor: '#64748b',
              pointBorderColor: '#fff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } },
            title: {
              display: true,
              text: 'System Capability Profile',
              color: '#f1f5f9',
              font: { size: 14, weight: '700' }
            }
          },
          scales: {
            r: {
              min: 0,
              max: 100,
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 100,
              angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              pointLabels: { color: '#cbd5e1', font: { size: 11 } },
              ticks: {
                display: false,
                stepSize: 20
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn("Radar chart render deferred or bypassed:", err);
    }
  }

  // 3. Line Chart: Step Dynamics & Carry Flow
  function renderStepDynamicsChart(calc) {
    const canvas = document.getElementById('stepDynamicsChartCanvas');
    if (!canvas) return;

    const steps = calc.steps || [];
    const labels = steps.map((s, idx) => `Step ${idx + 1}`);
    const values = steps.map(s => {
      const v = s.rawSum !== undefined ? s.rawSum : (s.partialSum || s.totalVal || s.sum || 0);
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    });
    const carries = steps.map(s => {
      const c = Number(s.carryOut || 0);
      return isNaN(c) ? 0 : c;
    });

    stepDynamicsChart = safeDestroy('stepDynamicsChartCanvas', stepDynamicsChart);

    try {
      stepDynamicsChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels.length > 0 ? labels : ['Step 1'],
          datasets: [
            {
              label: 'Intermediate Value',
              data: values.length > 0 ? values : [0],
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              tension: 0.35,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#38bdf8'
            },
            {
              label: 'Carry Out (Dots)',
              data: carries.length > 0 ? carries : [0],
              borderColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              stepped: true,
              pointRadius: 4,
              pointBackgroundColor: '#f43f5e'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } },
            title: {
              display: true,
              text: 'Step Dynamics & Carry Progression',
              color: '#f1f5f9',
              font: { size: 14, weight: '700' }
            }
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#94a3b8',
                precision: 0,
                callback: function(val) {
                  const num = Number(val);
                  return isNaN(num) ? '' : Math.round(num);
                }
              },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });
    } catch (err) {
      console.warn("Step dynamics chart render deferred or bypassed:", err);
    }
  }

  return {
    updateCharts: updateCharts,
    renderVisibleCharts: function() { updateCharts(cachedCalculation, true); }
  };
})();

if (typeof window !== 'undefined') {
  window.MathCharts = MathCharts;
}
if (typeof global !== 'undefined') {
  global.MathCharts = MathCharts;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathCharts;
}
