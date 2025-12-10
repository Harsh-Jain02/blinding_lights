const init = () => {
  const grid = document.getElementById("grid");
  const rowsInput = document.getElementById("rows");
  const colsInput = document.getElementById("cols");
  const regenerateButton = document.getElementById("regenerate");
  const toggleButton = document.getElementById("toggle");
  const status = document.getElementById("status");

  if (!grid || !rowsInput || !colsInput || !regenerateButton || !toggleButton) {
    console.error("Missing required DOM elements for the grid.");
    return;
  }

  const DEFAULT_ROWS = 5;
  const DEFAULT_COLS = 5;
  const MAX_DIMENSION = 20;

  let timers = [];
  let running = true;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomFrequency = () => Math.floor(Math.random() * 25) + 1; // inclusive 1-25

  const setCellState = (cell, isBright) => {
    cell.style.backgroundColor = isBright ? "#fff" : "#000";
    cell.style.color = isBright ? "#000" : "#fff";
  };

  const clearAllTimers = () => {
    timers.forEach((id) => clearInterval(id));
    timers = [];
  };

  const startCellFlicker = (cell, freq) => {
    let isBright = false;
    setCellState(cell, isBright);

    // Use half the period so one full cycle (black+white) matches the frequency.
    const intervalMs = 1000 / (freq * 2);
    const timerId = setInterval(() => {
      isBright = !isBright;
      setCellState(cell, isBright);
    }, intervalMs);

    timers.push(timerId);
  };

  const updateStatus = (rows, cols) => {
    if (!status) return;
    const now = new Date();
    status.textContent = `Last generated: ${rows} x ${cols} @ ${now.toLocaleTimeString()}`;
  };

  const buildGrid = (rows, cols) => {
    clearAllTimers();
    grid.style.setProperty("--cols", cols);
    grid.textContent = "";

    const total = rows * cols;
    for (let i = 0; i < total; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const freq = randomFrequency();
      cell.dataset.freq = String(freq);

      grid.append(cell);
      startCellFlicker(cell, freq);
    }

    running = true;
    toggleButton.textContent = "Pause Flicker";
    updateStatus(rows, cols);
  };

  const pauseFlicker = () => {
    if (!running) return;
    clearAllTimers();
    running = false;
    toggleButton.textContent = "Resume Flicker";
  };

  const resumeFlicker = () => {
    if (running) return;
    const cells = grid.querySelectorAll(".cell");
    cells.forEach((cell) => {
      startCellFlicker(cell, Number(cell.dataset.freq));
    });
    running = true;
    toggleButton.textContent = "Pause Flicker";
  };

  const sanitizeDimension = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return clamp(parsed, 1, MAX_DIMENSION);
  };

  const regenerateGrid = () => {
    const rows = sanitizeDimension(rowsInput.value, DEFAULT_ROWS);
    const cols = sanitizeDimension(colsInput.value, DEFAULT_COLS);
    rowsInput.value = rows;
    colsInput.value = cols;
    buildGrid(rows, cols);
  };

  regenerateButton.addEventListener("click", regenerateGrid);
  toggleButton.addEventListener("click", () => {
    if (running) {
      pauseFlicker();
    } else {
      resumeFlicker();
    }
  });

  rowsInput.addEventListener("change", regenerateGrid);
  colsInput.addEventListener("change", regenerateGrid);

  regenerateGrid();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
