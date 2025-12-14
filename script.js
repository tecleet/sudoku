// Game State
let game;
let currentBoard = [];
let solution = [];
let notes = [];
let history = [];
let selectedCellIndex = -1;
let mistakes = 0;
let score = 0;
let timerInterval;
let seconds = 0;
let isGameActive = false;
let hintsUsed = 0;
let game3D;

// Settings & Modes
let isNotesMode = false;
let settings = {
  showTimer: true,
  highlightRelated: true,
  highlightSame: true
};

// DOM Elements
const gridContainer = document.getElementById('sudoku-grid');
const mistakesEl = document.getElementById('mistakes');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const difficultyModal = document.getElementById('difficulty-modal');
const winModal = document.getElementById('win-modal');
const gameOverModal = document.getElementById('game-over-modal');
const settingsModal = document.getElementById('settings-modal');
const adModal = document.getElementById('ad-modal');
const notesBtn = document.getElementById('notes-btn');
const notesBadge = document.getElementById('notes-badge');

// Initialize
function init() {
  try {
    // Ensure Sudoku class exists
    if (typeof Sudoku === 'undefined') {
      console.error('Sudoku class not found!');
      alert('Error: Sudoku logic failed to load. Please refresh.');
      return;
    }
    game = new Sudoku();
    setupEventListeners();

    // Show difficulty modal initially
    difficultyModal.classList.add('active');

    // Init 3D Game
    // Wait for module to load if not ready
    if (window.Game3D) {
      game3D = new window.Game3D('toy-3d-container');
    } else {
      // Retry after a moment if module hasn't loaded
      setTimeout(() => {
        if (window.Game3D) {
          game3D = new window.Game3D('toy-3d-container');
        } else {
          console.error('Game3D not loaded');
        }
      }, 500);
    }

    console.log('Game initialized');
  } catch (e) {
    console.error('Init error:', e);
    alert('Game initialization failed: ' + e.message);
  }
}

function setupEventListeners() {
  // Difficulty Selection
  document.querySelectorAll('.diff-btn[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      startGame(btn.dataset.diff);
      difficultyModal.classList.remove('active');
    });
  });

  // Numpad
  document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => handleInput(parseInt(btn.dataset.num)));
  });

  // Keyboard Input
  document.addEventListener('keydown', (e) => {
    if (!isGameActive) return;

    if (e.key >= '1' && e.key <= '9') {
      handleInput(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleInput(0);
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      moveSelection(e.key);
    } else if (e.key.toLowerCase() === 'n') {
      toggleNotesMode();
    } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
      undo();
    }
  });

  // Action Buttons
  document.getElementById('new-game-btn').addEventListener('click', () => {
    difficultyModal.classList.add('active');
  });

  document.getElementById('erase-btn').addEventListener('click', () => handleInput(0));

  document.getElementById('play-again-btn').addEventListener('click', () => {
    winModal.classList.remove('active');
    difficultyModal.classList.add('active');
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    gameOverModal.classList.remove('active');
    difficultyModal.classList.add('active');
  });

  // New Tools
  document.getElementById('undo-btn').addEventListener('click', undo);
  notesBtn.addEventListener('click', toggleNotesMode);
  document.getElementById('hint-btn').addEventListener('click', useHint);
  document.getElementById('settings-btn').addEventListener('click', () => settingsModal.classList.add('active'));

  // Settings Modal
  document.getElementById('close-settings').addEventListener('click', () => settingsModal.classList.remove('active'));

  document.getElementById('toggle-timer').addEventListener('click', function () {
    settings.showTimer = !settings.showTimer;
    timerEl.parentElement.style.visibility = settings.showTimer ? 'visible' : 'hidden';
    this.textContent = settings.showTimer ? 'Hide Timer' : 'Show Timer';
  });

  document.getElementById('toggle-highlight').addEventListener('click', function () {
    settings.highlightRelated = !settings.highlightRelated;
    settings.highlightSame = !settings.highlightSame;
    this.textContent = settings.highlightRelated ? 'Disable Highlights' : 'Enable Highlights';
    if (selectedCellIndex !== -1) selectCell(selectedCellIndex); // Refresh
  });

  // Ad Modal
  document.getElementById('close-ad-btn').addEventListener('click', () => adModal.classList.remove('active'));
  document.getElementById('watch-ad-btn').addEventListener('click', watchAd);
}

function startGame(difficulty) {
  try {
    console.log('Starting game with difficulty:', difficulty);
    const data = game.generate(difficulty);
    currentBoard = [...data.board];
    solution = [...data.solution];
    notes = Array(81).fill().map(() => new Set());
    history = [];
    mistakes = 0;
    score = 0;
    seconds = 0;
    hintsUsed = 0; // Reset hints
    isGameActive = true;
    selectedCellIndex = -1;

    updateStats();
    startTimer();
    renderGrid();
    console.log('Game started successfully');
  } catch (e) {
    console.error('Start game error:', e);
    alert('Failed to start game: ' + e.message);
  }
}

function renderGrid() {
  gridContainer.innerHTML = '';
  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;

    if (currentBoard[i] !== 0) {
      cell.textContent = currentBoard[i];
      cell.classList.add('initial');
    } else {
      // Create notes grid
      const notesGrid = document.createElement('div');
      notesGrid.classList.add('notes-grid');
      for (let n = 1; n <= 9; n++) {
        const noteEl = document.createElement('div');
        noteEl.classList.add('note-num');
        noteEl.dataset.note = n;
        notesGrid.appendChild(noteEl);
      }
      cell.appendChild(notesGrid);
    }

    cell.addEventListener('click', () => selectCell(i));
    gridContainer.appendChild(cell);
  }
}

function selectCell(index) {
  if (!isGameActive) return;

  // Deselect previous
  if (selectedCellIndex !== -1) {
    gridContainer.children[selectedCellIndex].classList.remove('selected');
  }

  // Clear highlights
  document.querySelectorAll('.cell').forEach(c => {
    c.classList.remove('related', 'same-num');
  });

  selectedCellIndex = index;
  const cell = gridContainer.children[index];
  cell.classList.add('selected');

  // Highlight related cells (row, col, box)
  if (settings.highlightRelated) highlightRelated(index);

  // Highlight same numbers
  const val = currentBoard[index];
  if (val && settings.highlightSame) {
    highlightSameNumbers(val.toString());
  }
}

function highlightRelated(index) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxStartRow = row - row % 3;
  const boxStartCol = col - col % 3;

  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9);
    const c = i % 9;

    if (r === row || c === col ||
      (r >= boxStartRow && r < boxStartRow + 3 && c >= boxStartCol && c < boxStartCol + 3)) {
      gridContainer.children[i].classList.add('related');
    }
  }
}

function highlightSameNumbers(num) {
  for (let i = 0; i < 81; i++) {
    if (currentBoard[i] == num) {
      gridContainer.children[i].classList.add('same-num');
    }
  }
}

function handleInput(num) {
  console.log('handleInput called with:', num, 'GameActive:', isGameActive, 'Selected:', selectedCellIndex);
  if (!isGameActive) {
    console.warn('Game not active, ignoring input');
    return;
  }
  if (selectedCellIndex === -1) {
    console.warn('No cell selected, ignoring input');
    return;
  }

  const cell = gridContainer.children[selectedCellIndex];

  // Cannot edit initial cells
  if (cell.classList.contains('initial')) {
    console.warn('Cannot edit initial cell');
    cell.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(2px)' },
      { transform: 'translateX(0)' }
    ], { duration: 100 });
    return;
  }

  // Erase
  if (num === 0) {
    saveMove(selectedCellIndex, currentBoard[selectedCellIndex], new Set(notes[selectedCellIndex]), 'input');
    currentBoard[selectedCellIndex] = 0;
    notes[selectedCellIndex].clear();
    renderCell(selectedCellIndex);
    cell.classList.remove('error');
    return;
  }

  if (isNotesMode) {
    // Toggle Note
    saveMove(selectedCellIndex, currentBoard[selectedCellIndex], new Set(notes[selectedCellIndex]), 'note');
    if (notes[selectedCellIndex].has(num)) {
      notes[selectedCellIndex].delete(num);
    } else {
      notes[selectedCellIndex].add(num);
    }
    renderCell(selectedCellIndex);
  } else {
    // Enter Number
    saveMove(selectedCellIndex, currentBoard[selectedCellIndex], new Set(notes[selectedCellIndex]), 'input');

    // Check correctness
    if (num === solution[selectedCellIndex]) {
      currentBoard[selectedCellIndex] = num;
      notes[selectedCellIndex].clear(); // Clear notes on fill
      renderCell(selectedCellIndex);
      cell.classList.remove('error');
      score += 50;

      // Animation
      cell.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
      ], { duration: 200 });

      if (settings.highlightSame) highlightSameNumbers(num.toString());
      checkWin();
    } else {
      currentBoard[selectedCellIndex] = num;
      renderCell(selectedCellIndex);
      cell.classList.add('error');
      mistakes++;
      score = Math.max(0, score - 10);

      // Shake animation
      cell.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
      ], { duration: 200 });

      if (mistakes >= 3) {
        gameOver();
      }
    }
  }

  updateStats();
}

function renderCell(index) {
  const cell = gridContainer.children[index];
  const val = currentBoard[index];

  // Clear content
  cell.textContent = '';

  if (val !== 0) {
    cell.textContent = val;
  } else {
    // Re-render notes
    const notesGrid = document.createElement('div');
    notesGrid.classList.add('notes-grid');
    for (let n = 1; n <= 9; n++) {
      const noteEl = document.createElement('div');
      noteEl.classList.add('note-num');
      if (notes[index].has(n)) {
        noteEl.textContent = n;
      }
      notesGrid.appendChild(noteEl);
    }
    cell.appendChild(notesGrid);
  }
}

function toggleNotesMode() {
  isNotesMode = !isNotesMode;
  notesBtn.classList.toggle('active', isNotesMode);
  notesBadge.style.display = isNotesMode ? 'flex' : 'none';
}

function saveMove(index, prevVal, prevNotes, type) {
  history.push({
    index,
    prevVal,
    prevNotes,
    type
  });
  if (history.length > 50) history.shift(); // Limit history
}

function undo() {
  if (history.length === 0 || !isGameActive) return;

  const move = history.pop();
  currentBoard[move.index] = move.prevVal;
  notes[move.index] = move.prevNotes;

  const cell = gridContainer.children[move.index];
  cell.classList.remove('error'); // Clear error state on undo

  renderCell(move.index);
  selectCell(move.index);
}

function useHint() {
  if (!isGameActive || selectedCellIndex === -1) return;

  const cell = gridContainer.children[selectedCellIndex];
  if (currentBoard[selectedCellIndex] !== 0) return; // Already filled

  if (hintsUsed > 0) {
    adModal.classList.add('active');
    return;
  }

  applyHint();
}

function watchAd() {
  const btn = document.getElementById('watch-ad-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Watching...';
  btn.disabled = true;

  // Simulate 2 second ad
  setTimeout(() => {
    adModal.classList.remove('active');
    btn.textContent = originalText;
    btn.disabled = false;
    applyHint();
  }, 2000);
}

function applyHint() {
  const correctNum = solution[selectedCellIndex];

  // Penalty logic (optional, keeping it simple for now)
  // score = Math.max(0, score - 100);
  // updateStats();

  hintsUsed++;
  handleInput(correctNum);
}

function moveSelection(key) {
  if (selectedCellIndex === -1) {
    selectCell(0);
    return;
  }

  let row = Math.floor(selectedCellIndex / 9);
  let col = selectedCellIndex % 9;

  switch (key) {
    case 'ArrowUp': row = Math.max(0, row - 1); break;
    case 'ArrowDown': row = Math.min(8, row + 1); break;
    case 'ArrowLeft': col = Math.max(0, col - 1); break;
    case 'ArrowRight': col = Math.min(8, col + 1); break;
  }

  selectCell(row * 9 + col);
}

function updateStats() {
  mistakesEl.textContent = `${mistakes}/3`;
  scoreEl.textContent = score;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function checkWin() {
  if (game.checkWin(currentBoard)) {
    isGameActive = false;
    clearInterval(timerInterval);
    document.getElementById('final-score').textContent = score + (1000 - seconds); // Time bonus
    document.getElementById('final-time').textContent = timerEl.textContent;
    winModal.classList.add('active');
  }
}

function gameOver() {
  isGameActive = false;
  clearInterval(timerInterval);

  // Show Animation
  const animContainer = document.getElementById('game-over-animation');
  const animTime = document.getElementById('anim-time');
  const animClock = document.getElementById('anim-clock');
  const animToy = document.getElementById('anim-toy-wrapper');

  // Set time
  animTime.textContent = timerEl.textContent;

  animContainer.classList.add('active');

  // Resize 3D canvas now that container is visible
  if (game3D) game3D.resize();

  // Trigger animations
  setTimeout(() => {
    animClock.classList.add('throwing');

    if (game3D) game3D.playGameOver();

    // Wobble trash can on impact (approx 1.2s after throw starts)
    setTimeout(() => {
      const trashCan = document.getElementById('anim-trash-can');
      trashCan.classList.add('wobble');
    }, 1200);
  }, 2000);

  // End animation and show modal
  setTimeout(() => {
    animContainer.classList.remove('active');
    animClock.classList.remove('throwing');

    if (game3D) game3D.reset();

    document.getElementById('anim-trash-can').classList.remove('wobble');
    gameOverModal.classList.add('active');
  }, 4500);
}

// Start
init();
