/**
 * =========================================================================
 * SIMULADOR EDO: DIFUSIÓN DE SOFTWARE COMUNITARIO
 * Implementación de Heun (RK2), RK4 y Solución Analítica Exacta
 * Métodos Numéricos - Desafío Individual
 * =========================================================================
 */

// Estado global de la aplicación
const state = {
  y0: 50,       // Condición inicial: organizaciones piloto
  K: 2500,      // Capacidad de carga: total organizaciones comunitarias
  r: 0.25,      // Tasa de adopción intrínseca (semanas^-1)
  tMax: 35,     // Tiempo total de simulación (semanas)
  h1: 0.5,      // Tamaño de paso principal (semanas)
  h2: 0.1,      // Tamaño de paso secundario para análisis comparativo
  
  // Resultados calculados
  dataH1: null,
  dataH2: null,
  
  // Instancias de Chart.js
  mainChart: null,
  errorChart: null
};

// Función de la EDO: f(t, y) = r * y * (1 - y / K)
function f(t, y, r, K) {
  return r * y * (1 - y / K);
}

// Solución analítica exacta: y(t) = K / (1 + ((K - y0)/y0) * exp(-r * t))
function exactSolution(t, y0, r, K) {
  const C0 = (K - y0) / y0;
  return K / (1 + C0 * Math.exp(-r * t));
}

// Método de Heun (Runge-Kutta de Orden 2)
function solveHeun(y0, r, K, tMax, h) {
  const steps = Math.round(tMax / h);
  const results = [];
  
  let t = 0;
  let y = y0;
  
  for (let i = 0; i <= steps; i++) {
    const yExact = exactSolution(t, y0, r, K);
    const errAbs = Math.abs(yExact - y);
    const errRel = yExact !== 0 ? (errAbs / Math.abs(yExact)) * 100 : 0;
    
    results.push({
      step: i,
      t: Number(t.toFixed(4)),
      yExact: yExact,
      yApprox: y,
      errAbs: errAbs,
      errRel: errRel
    });
    
    // Algoritmo Heun: Predictor - Corrector
    const k1 = f(t, y, r, K);
    const yPredictor = y + h * k1;
    const k2 = f(t + h, yPredictor, r, K);
    
    y = y + (h / 2) * (k1 + k2);
    t = (i + 1) * h;
  }
  
  return results;
}

// Método Clásico de Runge-Kutta de 4.° Orden (RK4)
function solveRK4(y0, r, K, tMax, h) {
  const steps = Math.round(tMax / h);
  const results = [];
  
  let t = 0;
  let y = y0;
  
  for (let i = 0; i <= steps; i++) {
    const yExact = exactSolution(t, y0, r, K);
    const errAbs = Math.abs(yExact - y);
    const errRel = yExact !== 0 ? (errAbs / Math.abs(yExact)) * 100 : 0;
    
    results.push({
      step: i,
      t: Number(t.toFixed(4)),
      yExact: yExact,
      yApprox: y,
      errAbs: errAbs,
      errRel: errRel
    });
    
    // Algoritmo RK4
    const k1 = f(t, y, r, K);
    const k2 = f(t + 0.5 * h, y + 0.5 * h * k1, r, K);
    const k3 = f(t + 0.5 * h, y + 0.5 * h * k2, r, K);
    const k4 = f(t + h, y + h * k3, r, K);
    
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = (i + 1) * h;
  }
  
  return results;
}

// Ejecutar todos los cálculos
function runSimulation() {
  const { y0, r, K, tMax, h1, h2 } = state;
  
  // Calcular para paso h1
  const heunH1 = solveHeun(y0, r, K, tMax, h1);
  const rk4H1 = solveRK4(y0, r, K, tMax, h1);
  
  // Calcular para paso secundario h2
  const heunH2 = solveHeun(y0, r, K, tMax, h2);
  const rk4H2 = solveRK4(y0, r, K, tMax, h2);
  
  state.dataH1 = { heun: heunH1, rk4: rk4H1, h: h1 };
  state.dataH2 = { heun: heunH2, rk4: rk4H2, h: h2 };
  
  // Actualizar UI
  updateKPIs();
  updateCharts();
  renderTable();
  updateConclusions();
  
  // Si MathJax está disponible, volver a formatear
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise();
  }
}

// Actualizar tarjetas de KPI
function updateKPIs() {
  const { rk4, heun } = state.dataH1;
  const { K, y0, r } = state;
  
  // Tiempo para alcanzar el 90% de saturación
  // y(t) = 0.9 * K => 0.9 * K = K / (1 + C0 * exp(-rt)) => 1 + C0 * exp(-rt) = 1 / 0.9 = 10/9
  // C0 * exp(-rt) = 1/9 => exp(-rt) = 1 / (9 * C0) => -rt = -ln(9 * C0) => t = ln(9 * C0) / r
  const C0 = (K - y0) / y0;
  const t90 = C0 > 0 ? (Math.log(9 * C0) / r) : 0;
  
  const t90Str = t90 > 0 ? `${t90.toFixed(1)} sem` : 'Inmediato';
  document.getElementById('kpi-t90').textContent = t90Str;
  const sidebarT90 = document.getElementById('sidebar-t90');
  if (sidebarT90) sidebarT90.textContent = t90Str;
  
  // Máximo Error Relativo
  let maxErrHeun = 0;
  let maxErrRK4 = 0;
  
  heun.forEach(pt => { if (pt.errRel > maxErrHeun) maxErrHeun = pt.errRel; });
  rk4.forEach(pt => { if (pt.errRel > maxErrRK4) maxErrRK4 = pt.errRel; });
  
  document.getElementById('kpi-err-heun').textContent = `${maxErrHeun.toFixed(4)} %`;
  document.getElementById('kpi-err-rk4').textContent = `${maxErrRK4.toExponential(3)} %`;
}

// Inicializar y actualizar gráficos con Chart.js
function updateCharts() {
  const { heun: heunH1, rk4: rk4H1 } = state.dataH1;
  const { rk4: rk4H2 } = state.dataH2;
  
  const labelsH1 = heunH1.map(pt => pt.t.toFixed(1));
  const exactValues = heunH1.map(pt => pt.yExact);
  const heunValues = heunH1.map(pt => pt.yApprox);
  const rk4Values = rk4H1.map(pt => pt.yApprox);
  
  // 1. Gráfica Principal: Curvas de Solución
  const ctxMain = document.getElementById('mainChart').getContext('2d');
  
  if (state.mainChart) {
    state.mainChart.destroy();
  }
  
  state.mainChart = new Chart(ctxMain, {
    type: 'line',
    data: {
      labels: labelsH1,
      datasets: [
        {
          label: 'Solución Analítica Exacta',
          data: exactValues,
          borderColor: '#10b981', // Verde esmeralda
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: `Heun (h = ${state.h1})`,
          data: heunValues,
          borderColor: '#f59e0b', // Ámbar
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          pointBackgroundColor: '#f59e0b'
        },
        {
          label: `RK4 (h = ${state.h1})`,
          data: rk4Values,
          borderColor: '#6366f1', // Índigo
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: '#6366f1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' },
          title: { display: true, text: 'Tiempo transcurrido t (semanas)', color: '#94a3b8' }
        },
        y: {
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' },
          title: { display: true, text: 'Organizaciones que adoptaron el software y(t)', color: '#94a3b8' }
        }
      }
    }
  });

  // 2. Gráfica de Errores Absolutos
  const ctxErr = document.getElementById('errorChart').getContext('2d');
  const errHeunH1 = heunH1.map(pt => pt.errAbs);
  const errRK4H1 = rk4H1.map(pt => pt.errAbs);
  
  if (state.errorChart) {
    state.errorChart.destroy();
  }
  
  state.errorChart = new Chart(ctxErr, {
    type: 'line',
    data: {
      labels: labelsH1,
      datasets: [
        {
          label: `Error Absoluto Heun (h = ${state.h1})`,
          data: errHeunH1,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          borderWidth: 2,
          pointRadius: 2
        },
        {
          label: `Error Absoluto RK4 (h = ${state.h1})`,
          data: errRK4H1,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          borderWidth: 2,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toExponential(4)}`;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
        y: {
          grid: { color: '#334155' },
          ticks: {
            color: '#94a3b8',
            callback: function(val) { return val < 0.01 ? val.toExponential(1) : val.toFixed(2); }
          },
          title: { display: true, text: 'Magnitud del Error Absoluto', color: '#94a3b8' }
        }
      }
    }
  });
}

// Renderizar tabla comparativa (Tab 5)
function renderTable() {
  const { heun, rk4 } = state.dataH1;
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  
  let sumErrHeun = 0;
  let sumErrRK4 = 0;
  
  heun.forEach((ptHeun, i) => {
    const ptRK4 = rk4[i];
    sumErrHeun += ptHeun.errRel;
    sumErrRK4 += ptRK4.errRel;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ptHeun.step}</td>
      <td>${ptHeun.t.toFixed(2)}</td>
      <td><strong>${ptHeun.yExact.toFixed(4)}</strong></td>
      <td>${ptHeun.yApprox.toFixed(4)}</td>
      <td>${ptHeun.errAbs < 0.001 ? ptHeun.errAbs.toExponential(3) : ptHeun.errAbs.toFixed(4)}</td>
      <td class="text-warning">${ptHeun.errRel.toFixed(4)}%</td>
      <td>${ptRK4.yApprox.toFixed(4)}</td>
      <td>${ptRK4.errAbs.toExponential(3)}</td>
      <td class="text-success">${ptRK4.errRel.toExponential(3)}%</td>
    `;
    tbody.appendChild(tr);
  });
  
  // Actualizar stats
  const count = heun.length;
  document.getElementById('stat-total-steps').textContent = count;
  document.getElementById('stat-current-h').textContent = state.h1;
  document.getElementById('stat-avg-heun').textContent = (sumErrHeun / count).toFixed(4);
  document.getElementById('stat-avg-rk4').textContent = (sumErrRK4 / count).toExponential(3);
}

// Actualizar análisis y texto de conclusiones
function updateConclusions() {
  const { y0, r, K, h1, h2 } = state;
  const { heun: heun1, rk4: rk41 } = state.dataH1;
  const { heun: heun2, rk4: rk42 } = state.dataH2;
  
  // Cálculo de tiempo para 90%
  const C0 = (K - y0) / y0;
  const t90 = C0 > 0 ? (Math.log(9 * C0) / r).toFixed(1) : 0;
  const targetUnits = Math.round(0.9 * K);
  
  // Punto de inflexión y = K/2
  const yInflection = K / 2;
  const tInflection = C0 > 0 ? (Math.log(C0) / r).toFixed(1) : 0;
  const maxGrowthRate = (r * K / 4).toFixed(1);
  
  const elInflectionY = document.getElementById('info-inflection-y');
  const elInflectionT = document.getElementById('info-inflection-t');
  const elInflectionRate = document.getElementById('info-inflection-rate');
  if (elInflectionY && elInflectionT && elInflectionRate) {
    elInflectionY.textContent = yInflection.toLocaleString();
    elInflectionT.textContent = tInflection;
    elInflectionRate.textContent = maxGrowthRate;
  }

  const pAns = document.getElementById('ans-challenge');
  if (pAns) {
    pAns.innerHTML = `
      Bajo las condiciones operativas de difusión (\\(r = ${r}\\), \\(y_0 = ${y0}\\), \\(K = ${K}\\)), 
      la plataforma comunitaria alcanzará la meta del 90% (<strong>${targetUnits} comedores y organizaciones</strong>) 
      a las <strong>${t90} semanas</strong>. Entre las semanas ${Math.max(1, Math.round(t90 * 0.4))} y ${Math.round(t90 * 0.75)} 
      se concentra la pendiente máxima de incorporaciones, momento en el cual el equipo de desarrollo debe activar el autoescalado de réplicas en servidores de producción.
    `;
  }
  
  // Comparación entre h1 y h2
  let maxHeun1 = 0, maxHeun2 = 0;
  let maxRK41 = 0, maxRK42 = 0;
  
  heun1.forEach(p => { if (p.errRel > maxHeun1) maxHeun1 = p.errRel; });
  heun2.forEach(p => { if (p.errRel > maxHeun2) maxHeun2 = p.errRel; });
  rk41.forEach(p => { if (p.errRel > maxRK41) maxRK41 = p.errRel; });
  rk42.forEach(p => { if (p.errRel > maxRK42) maxRK42 = p.errRel; });
  
  const ratioSteps = (h1 / h2).toFixed(1);
  const factorHeun = maxHeun2 > 0 ? (maxHeun1 / maxHeun2).toFixed(1) : 0;
  const factorRK4 = maxRK42 > 0 ? (maxRK41 / maxRK42).toFixed(1) : 0;
  
  const pComp = document.getElementById('step-comparison-text');
  if (pComp) {
    pComp.innerHTML = `
      Al reducir el tamaño de paso de \\(h_1 = ${h1}\\) a \\(h_2 = ${h2}\\) (factor de reducción de <strong>${ratioSteps}x</strong>):<br>
      • <strong>Método de Heun (Orden 2):</strong> El error relativo máximo disminuyó de <strong>${maxHeun1.toFixed(4)}%</strong> a <strong>${maxHeun2.toFixed(4)}%</strong> (reducción de ~<strong>${factorHeun}x</strong>, consistente con la teoría de convergencia cuadrática \\(O(h^2)\\)).<br>
      • <strong>Método RK4 (Orden 4):</strong> El error relativo máximo disminuyó de <strong>${maxRK41.toExponential(3)}%</strong> a <strong>${maxRK42.toExponential(3)}%</strong> (reducción de ~<strong>${factorRK4}x</strong>, consistente con la teoría de convergencia de orden 4 \\(O(h^4)\\)).
    `;
  }
}

// Exportar datos a CSV
function exportCSV() {
  const { heun, rk4 } = state.dataH1;
  let csv = 'Paso,Tiempo_t_sem,Solucion_Analitica,Heun_Aprox,Error_Abs_Heun,Error_Rel_Heun_pct,RK4_Aprox,Error_Abs_RK4,Error_Rel_RK4_pct\n';
  
  heun.forEach((ptHeun, i) => {
    const ptRK4 = rk4[i];
    csv += `${ptHeun.step},${ptHeun.t},${ptHeun.yExact.toFixed(6)},${ptHeun.yApprox.toFixed(6)},${ptHeun.errAbs.toExponential(6)},${ptHeun.errRel.toExponential(6)},${ptRK4.yApprox.toFixed(6)},${ptRK4.errAbs.toExponential(6)},${ptRK4.errRel.toExponential(6)}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulacion_edo_heun_rk4_h${state.h1}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Sincronización de Inputs y Sliders
function setupSyncInputs() {
  const syncPairs = [
    { num: 'input-y0', rng: 'range-y0', key: 'y0', isFloat: false },
    { num: 'input-k', rng: 'range-k', key: 'K', isFloat: false },
    { num: 'input-r', rng: 'range-r', key: 'r', isFloat: true },
    { num: 'input-tmax', rng: 'range-tmax', key: 'tMax', isFloat: false }
  ];
  
  syncPairs.forEach(pair => {
    const numEl = document.getElementById(pair.num);
    const rngEl = document.getElementById(pair.rng);
    
    numEl.addEventListener('input', (e) => {
      const val = pair.isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        state[pair.key] = val;
        rngEl.value = val;
        runSimulation();
      }
    });
    
    rngEl.addEventListener('input', (e) => {
      const val = pair.isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
      state[pair.key] = val;
      numEl.value = val;
      runSimulation();
    });
  });
  
  // Selects de pasos h1 y h2
  document.getElementById('input-h1').addEventListener('change', (e) => {
    state.h1 = parseFloat(e.target.value);
    runSimulation();
  });
  
  document.getElementById('input-h2').addEventListener('change', (e) => {
    state.h2 = parseFloat(e.target.value);
    runSimulation();
  });
  
  // Botón restablecer
  document.getElementById('btn-reset').addEventListener('click', () => {
    state.y0 = 50;
    state.K = 2500;
    state.r = 0.25;
    state.tMax = 35;
    state.h1 = 0.5;
    state.h2 = 0.1;
    
    document.getElementById('input-y0').value = 50;
    document.getElementById('range-y0').value = 50;
    document.getElementById('input-k').value = 2500;
    document.getElementById('range-k').value = 2500;
    document.getElementById('input-r').value = 0.25;
    document.getElementById('range-r').value = 0.25;
    document.getElementById('input-tmax').value = 35;
    document.getElementById('range-tmax').value = 35;
    document.getElementById('input-h1').value = "0.5";
    document.getElementById('input-h2').value = "0.1";
    
    runSimulation();
  });

  document.getElementById('btn-simulate').addEventListener('click', () => {
    runSimulation();
  });

  document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
}

// Configurar ScrollSpy para el índice vertical sticky
function setupScrollSpy() {
  const indexLinks = document.querySelectorAll('.index-link');
  const sections = document.querySelectorAll('.flow-section');
  
  if (indexLinks.length === 0 || sections.length === 0) return;

  // Interacción suave con clic
  indexLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        indexLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // IntersectionObserver para detectar la sección activa al hacer scroll
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        indexLinks.forEach(link => {
          if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

// Checkboxes de visualización de series en el gráfico principal
function setupChartToggles() {
  const toggles = [
    { id: 'chk-exact', datasetIndex: 0 },
    { id: 'chk-heun', datasetIndex: 1 },
    { id: 'chk-rk4', datasetIndex: 2 }
  ];
  
  toggles.forEach(toggle => {
    const el = document.getElementById(toggle.id);
    if (el) {
      el.addEventListener('change', (e) => {
        if (state.mainChart) {
          state.mainChart.setDatasetVisibility(toggle.datasetIndex, e.target.checked);
          state.mainChart.update();
        }
      });
    }
  });
}

// Configurar Cronómetro interactivo de 60 segundos para el video
let timerInterval = null;
let secondsLeft = 60;

function setupTimer() {
  const display = document.getElementById('timer-display');
  const btnStart = document.getElementById('btn-timer-start');
  const btnReset = document.getElementById('btn-timer-reset');
  const steps = document.querySelectorAll('.script-step');
  
  if (!btnStart) return;

  function updateDisplay() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Resaltar el paso del guion correspondiente según el tiempo transcurrido
    const elapsed = 60 - secondsLeft;
    steps.forEach((st, idx) => {
      st.classList.remove('highlight');
      if (elapsed >= idx * 15 && elapsed < (idx + 1) * 15) {
        st.classList.add('highlight');
      }
    });

    if (secondsLeft <= 10 && secondsLeft > 0) {
      display.className = 'timer-display warning';
    } else if (secondsLeft === 0) {
      display.className = 'timer-display finished';
    } else {
      display.className = 'timer-display running';
    }
  }

  btnStart.addEventListener('click', () => {
    if (timerInterval) {
      // Pausar
      clearInterval(timerInterval);
      timerInterval = null;
      btnStart.innerHTML = '<i class="fa-solid fa-play"></i> Reanudar';
      display.classList.remove('running');
    } else {
      // Iniciar
      if (secondsLeft === 0) secondsLeft = 60;
      btnStart.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
      display.classList.add('running');
      updateDisplay();
      
      timerInterval = setInterval(() => {
        secondsLeft--;
        updateDisplay();
        if (secondsLeft <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          btnStart.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Repetir';
        }
      }, 1000);
    }
  });

  btnReset.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    secondsLeft = 60;
    btnStart.innerHTML = '<i class="fa-solid fa-play"></i> Ensayar 60s';
    display.className = 'timer-display';
    display.textContent = '01:00';
    steps.forEach(st => st.classList.remove('highlight'));
  });
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  setupScrollSpy();
  setupSyncInputs();
  setupChartToggles();
  setupTimer();
  runSimulation();
});

