const GRID_SIZE = 8;

const directionOrder = ['up', 'right', 'down', 'left'];
const directionVectors = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};
const directionRotation = { up: 0, right: 90, down: 180, left: 270 };

const objectAssets = {
  sun: 'sun_bat.svg',
  patch: 'patch.svg',
  air: 'air.svg',
};

const PROGRESS_STORAGE_KEY = 'mazeProgressV1';
const DEBUG_UNLOCK_KEY = 'mazeDebugUnlockAll';

const levels = [
  { start: [3, 1], targets: [{ row: 3, col: 5, type: 'sun' }], minCommands: 5 },
  { start: [2, 1], targets: [{ row: 5, col: 5, type: 'sun' }], minCommands: 6 },
  { start: [1, 2], targets: [{ row: 2, col: 2, type: 'patch' }, { row: 3, col: 2, type: 'patch' }, { row: 4, col: 2, type: 'patch' }, { row: 5, col: 2, type: 'patch' }], minCommands: 4 },
  { start: [1, 2], targets: [{ row: 1, col: 3, type: 'patch' }, { row: 1, col: 4, type: 'patch' }, { row: 2, col: 4, type: 'air' }, { row: 3, col: 4, type: 'air' }, { row: 4, col: 4, type: 'air' }], minCommands: 8 },
  { start: [6, 2], targets: [{ row: 2, col: 5, type: 'sun' }, { row: 3, col: 5, type: 'sun' }, { row: 4, col: 5, type: 'sun' }, { row: 5, col: 5, type: 'sun' }, { row: 6, col: 5, type: 'patch' }], minCommands: 7 },
  { start: [1, 2], targets: [{ row: 2, col: 2, type: 'patch' }, { row: 3, col: 2, type: 'air' }, { row: 4, col: 2, type: 'patch' }, { row: 5, col: 2, type: 'air' }, { row: 6, col: 2, type: 'patch' }, { row: 7, col: 2, type: 'air' }], minCommands: 6 },
  { start: [3, 1], targets: [{ row: 3, col: 2, type: 'sun' }, { row: 3, col: 3, type: 'patch' }, { row: 3, col: 4, type: 'air' }], minCommands: 6 },
  { start: [3, 1], targets: [{ row: 3, col: 2, type: 'sun' }, { row: 3, col: 3, type: 'patch' }, { row: 3, col: 4, type: 'air' }, { row: 3, col: 5, type: 'sun' }, { row: 3, col: 6, type: 'patch' }, { row: 3, col: 7, type: 'air' }], minCommands: 7 },
  { start: [6, 1], targets: [{ row: 4, col: 3, type: 'sun' }, { row: 4, col: 4, type: 'patch' }, { row: 4, col: 5, type: 'air' }, { row: 5, col: 1, type: 'sun' }, { row: 5, col: 2, type: 'patch' }, { row: 5, col: 3, type: 'air' }], minCommands: 9 },
  { start: [6, 3], targets: [{ row: 0, col: 3, type: 'patch' }, { row: 2, col: 3, type: 'patch' }, { row: 4, col: 3, type: 'patch' }], minCommands: 5 },
  { start: [1, 1], targets: [{ row: 1, col: 5, type: 'air' }, { row: 5, col: 1, type: 'air' }, { row: 5, col: 5, type: 'air' }], minCommands: 5 },
  { start: [2, 1], targets: [{ row: 2, col: 2, type: 'air' }, { row: 2, col: 3, type: 'sun' }, { row: 3, col: 2, type: 'air' }, { row: 3, col: 3, type: 'sun' }, { row: 4, col: 2, type: 'air' }, { row: 4, col: 3, type: 'sun' }, { row: 5, col: 2, type: 'air' }, { row: 5, col: 3, type: 'sun' }], minCommands: 11 },
  { start: [2, 1], targets: [{ row: 2, col: 2, type: 'air' }, { row: 2, col: 3, type: 'sun' }, { row: 2, col: 4, type: 'air' }, { row: 2, col: 5, type: 'sun' }, { row: 3, col: 2, type: 'air' }, { row: 3, col: 3, type: 'sun' }, { row: 3, col: 4, type: 'air' }, { row: 3, col: 5, type: 'sun' }, { row: 4, col: 2, type: 'air' }, { row: 4, col: 3, type: 'sun' }, { row: 4, col: 4, type: 'air' }, { row: 4, col: 5, type: 'sun' }, { row: 5, col: 2, type: 'air' }, { row: 5, col: 3, type: 'sun' }, { row: 5, col: 4, type: 'air' }, { row: 5, col: 5, type: 'sun' }], minCommands: 13 },
  { start: [1, 1], targets: [{ row: 1, col: 2, type: 'sun' }, { row: 1, col: 3, type: 'air' }, { row: 1, col: 4, type: 'patch' }, { row: 2, col: 1, type: 'patch' }, { row: 2, col: 5, type: 'sun' }, { row: 3, col: 1, type: 'air' }, { row: 3, col: 5, type: 'air' }, { row: 4, col: 1, type: 'sun' }, { row: 4, col: 5, type: 'patch' }, { row: 5, col: 2, type: 'patch' }, { row: 5, col: 3, type: 'air' }, { row: 5, col: 4, type: 'sun' }], minCommands: 9 },
  { start: [1, 1], targets: [{ row: 1, col: 2, type: 'sun' }, { row: 1, col: 3, type: 'air' }, { row: 1, col: 4, type: 'patch' }, { row: 2, col: 2, type: 'patch' }, { row: 2, col: 3, type: 'air' }, { row: 2, col: 4, type: 'sun' }, { row: 3, col: 2, type: 'sun' }, { row: 3, col: 3, type: 'air' }, { row: 3, col: 4, type: 'patch' }, { row: 4, col: 2, type: 'patch' }, { row: 4, col: 3, type: 'air' }, { row: 4, col: 4, type: 'sun' }], minCommands: 15 },
];

function getLevelName(levelIndex) {
  if (levelIndex < 9) return `Уровень ${levelIndex + 1}`;
  return `Доп.задание ${levelIndex - 8}`;
}

const board = document.getElementById('board');
const levelTitle = document.getElementById('level-title');
const levelProgress = document.getElementById('level-progress');
const workspaceContainer = document.getElementById('blockly-workspace');
const runButton = document.getElementById('run-program');
const levelSelect = document.getElementById('level-select');
const levelCompleteModal = document.getElementById('level-complete-modal');
const levelCompleteTitle = document.getElementById('level-complete-title');
const levelCompleteMessage = document.getElementById('level-complete-message');
const nextLevelButton = document.getElementById('next-level-button');
const retryLevelButton = document.getElementById('retry-level-button');
const levelHint = document.getElementById('level-hint');
const levelRule = document.getElementById('level-rule');

let workspace;
let currentLevelIndex = 0;
let currentPosition = [0, 0];
let currentDirection = 'right';
let isProgramRunning = false;
let placedObjects = new Map();
let completedLevels = Array(levels.length).fill(false);

const defineBlocksWithJsonArray = Blockly.common?.defineBlocksWithJsonArray ?? Blockly.defineBlocksWithJsonArray;

defineBlocksWithJsonArray([
  { type: 'maze_start', message0: 'Запуск', nextStatement: null, colour: 45, deletable: false, movable: false, hat: 'cap' },
  { type: 'maze_move_forward', message0: 'Шаг вперед', previousStatement: null, nextStatement: null, colour: 340 },
  { type: 'maze_turn_left', message0: 'Повернуть налево', previousStatement: null, nextStatement: null, colour: 340 },
  { type: 'maze_turn_right', message0: 'Повернуть направо', previousStatement: null, nextStatement: null, colour: 340 },
  {
    type: 'maze_repeat',
    message0: 'Повторить %1 раз %2 %3',
    args0: [
      { type: 'field_number', name: 'TIMES', value: 2, min: 1, precision: 1 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 200,
  },
  { type: 'maze_place_sun', message0: 'Поставить солнечную батарею', previousStatement: null, nextStatement: null, colour: 120 },
  { type: 'maze_place_patch', message0: 'Поставить заплатку', previousStatement: null, nextStatement: null, colour: 120 },
  { type: 'maze_place_air', message0: 'Поставить баллон с воздухом', previousStatement: null, nextStatement: null, colour: 120 },
]);

function getCurrentLevel() {
  return levels[currentLevelIndex];
}

function getToolboxForLevel(levelIndex) {
  const contents = [
    { kind: 'block', type: 'maze_repeat', fields: { TIMES: 2 } },
    { kind: 'block', type: 'maze_move_forward' },
    { kind: 'block', type: 'maze_turn_left' },
    { kind: 'block', type: 'maze_turn_right' },
  ];

  if (levelIndex >= 0) contents.push({ kind: 'block', type: 'maze_place_sun' });
  if (levelIndex >= 2) contents.push({ kind: 'block', type: 'maze_place_patch' });
  if (levelIndex >= 3) contents.push({ kind: 'block', type: 'maze_place_air' });

  return { kind: 'flyoutToolbox', contents };
}

function resetWorkspace() {
  workspace.clear();
  const startBlock = workspace.newBlock('maze_start');
  startBlock.initSvg();
  startBlock.render();
  startBlock.moveBy(36, 36);
  workspace.centerOnBlock(startBlock.id);
}

function initializeBlockly() {
  workspace = Blockly.inject(workspaceContainer, {
    toolbox: getToolboxForLevel(currentLevelIndex),
    toolboxPosition: 'start',
    trashcan: true,
    renderer: 'zelos',
    grid: { spacing: 24, length: 3, colour: 'rgba(124, 140, 255, 0.18)', snap: true },
    zoom: { controls: true, wheel: true, startScale: 0.95, maxScale: 1.4, minScale: 0.7, scaleSpeed: 1.1 },
    move: { scrollbars: true, drag: true, wheel: true },
  });

  resetWorkspace();
  requestAnimationFrame(() => Blockly.svgResize(workspace));
  window.addEventListener('resize', () => Blockly.svgResize(workspace));
}

function toKey(row, col) {
  return `${row},${col}`;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.completedLevels)) return;
    completedLevels = levels.map((_, idx) => Boolean(parsed.completedLevels[idx]));
  } catch {
    completedLevels = Array(levels.length).fill(false);
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completedLevels }));
}

function isLevelUnlocked(index) {
  if (localStorage.getItem(DEBUG_UNLOCK_KEY) === '1') return true;
  if (index === 0) return true;
  for (let idx = 0; idx < index; idx += 1) {
    if (!completedLevels[idx]) return false;
  }
  return true;
}

function renderLevelOptions() {
  levelSelect.innerHTML = levels.map((_, idx) => {
    const isLocked = !isLevelUnlocked(idx);
    const completeIcon = completedLevels[idx] ? '✅ ' : '';
    const lockIcon = isLocked ? '🔒 ' : '';
    return (
      `<option value="${idx}" ${idx === currentLevelIndex ? 'selected' : ''} ${isLocked ? 'disabled' : ''}>${lockIcon}${completeIcon}${getLevelName(idx)}</option>`
    );
  }).join('');
}

function markLevelCompleted(levelIndex) {
  if (completedLevels[levelIndex]) return;
  completedLevels[levelIndex] = true;
  saveProgress();
}

function getHighestUnlockedLevel() {
  for (let idx = 1; idx < levels.length; idx += 1) {
    if (!isLevelUnlocked(idx)) return idx - 1;
  }
  return levels.length - 1;
}

function syncCurrentLevelWithProgress() {
  const highestUnlocked = getHighestUnlockedLevel();
  if (currentLevelIndex > highestUnlocked) currentLevelIndex = highestUnlocked;
}

function renderBoard() {
  const level = getCurrentLevel();
  const targetMap = new Map(level.targets.map((target) => [toKey(target.row, target.col), target.type]));

  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, minmax(0, 1fr))`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, minmax(0, 1fr))`;
  board.innerHTML = '';

  const boardBackground = document.createElement('div');
  boardBackground.className = 'board-background';
  boardBackground.style.backgroundImage = "url('./Back.svg')";
  board.appendChild(boardBackground);

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const key = toKey(row, col);
      const cell = document.createElement('div');
      cell.className = 'cell';

      const ghostType = targetMap.get(key);
      if (ghostType) {
        const ghost = document.createElement('div');
        ghost.className = `object ghost ${ghostType}`;
        ghost.style.backgroundImage = `url('./${objectAssets[ghostType]}')`;
        cell.appendChild(ghost);
      }

      const placedType = placedObjects.get(key);
      if (placedType) {
        const placed = document.createElement('div');
        placed.className = 'object placed';
        placed.style.backgroundImage = `url('./${objectAssets[placedType]}')`;
        cell.appendChild(placed);
      }

      if (currentPosition[0] === row && currentPosition[1] === col) {
        const hero = document.createElement('div');
        hero.className = 'hero';
        hero.style.transform = `rotate(${directionRotation[currentDirection]}deg) scale(1.3)`;
        cell.appendChild(hero);
      }

      board.appendChild(cell);
    }
  }

  levelTitle.textContent = getLevelName(currentLevelIndex);
  levelProgress.textContent = `${currentLevelIndex + 1} / ${levels.length}`;
  levelHint.textContent = 'Цель: поставь все объекты на отмеченные клетки.';
  levelRule.textContent = `Составь программу из ${level.minCommands} команд.`;
  renderLevelOptions();
}

function resetLevelState() {
  const level = getCurrentLevel();
  currentPosition = [...level.start];
  currentDirection = 'right';
  placedObjects = new Map();
  renderBoard();
}

function setLevel(index) {
  if (index < 0 || index >= levels.length) return;
  if (!isLevelUnlocked(index)) {
    renderLevelOptions();
    return;
  }
  currentLevelIndex = index;
  hideLevelCompleteModal();
  workspace.updateToolbox(getToolboxForLevel(index));
  resetWorkspace();
  resetLevelState();
}

function flattenProgram(block, commands = []) {
  let currentBlock = block;
  while (currentBlock) {
    switch (currentBlock.type) {
      case 'maze_move_forward': commands.push({ type: 'move' }); break;
      case 'maze_turn_left': commands.push({ type: 'turn-left' }); break;
      case 'maze_turn_right': commands.push({ type: 'turn-right' }); break;
      case 'maze_place_sun': commands.push({ type: 'place', objectType: 'sun' }); break;
      case 'maze_place_patch': commands.push({ type: 'place', objectType: 'patch' }); break;
      case 'maze_place_air': commands.push({ type: 'place', objectType: 'air' }); break;
      case 'maze_repeat': {
        const times = Number(currentBlock.getFieldValue('TIMES')) || 0;
        const nested = flattenProgram(currentBlock.getInputTargetBlock('DO'), []);
        for (let i = 0; i < times; i += 1) commands.push(...nested);
        break;
      }
      default:
        break;
    }
    currentBlock = currentBlock.getNextBlock();
  }
  return commands;
}

function countProgramCommands(block) {
  let total = 0;
  let currentBlock = block;
  while (currentBlock) {
    total += 1;
    if (currentBlock.type === 'maze_repeat') total += countProgramCommands(currentBlock.getInputTargetBlock('DO'));
    currentBlock = currentBlock.getNextBlock();
  }
  return total;
}

function getExecutionSequence() {
  const startBlock = workspace.getBlocksByType('maze_start', false)[0];
  if (!startBlock) return [];
  return flattenProgram(startBlock.getNextBlock(), []);
}

function getProgramCommandCount() {
  const startBlock = workspace.getBlocksByType('maze_start', false)[0];
  return startBlock ? countProgramCommands(startBlock.getNextBlock()) : 0;
}

function rotateDirection(direction, turn) {
  const index = directionOrder.indexOf(direction);
  const delta = turn === 'turn-left' ? -1 : 1;
  return directionOrder[(index + delta + 4) % 4];
}

function isInsideBoard([row, col]) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function showLevelCompleteModal(message, canProceed, title = 'Молодец!') {
  levelCompleteTitle.hidden = false;
  levelCompleteTitle.textContent = title;
  levelCompleteMessage.textContent = message;
  nextLevelButton.hidden = !canProceed;
  retryLevelButton.hidden = false;
  levelCompleteModal.classList.remove('hidden');
}

function hideLevelCompleteModal() {
  levelCompleteModal.classList.add('hidden');
}

function checkWin() {
  const level = getCurrentLevel();
  return level.targets.every((target) => placedObjects.get(toKey(target.row, target.col)) === target.type);
}

async function runProgram() {
  if (isProgramRunning) return;
  const sequence = getExecutionSequence();
  resetLevelState();
  if (sequence.length === 0) return;

  isProgramRunning = true;
  runButton.disabled = true;

  try {
    for (const command of sequence) {
      await new Promise((resolve) => setTimeout(resolve, 280));

      if (command.type === 'move') {
        const [dr, dc] = directionVectors[currentDirection];
        const nextPos = [currentPosition[0] + dr, currentPosition[1] + dc];
        if (!isInsideBoard(nextPos)) {
          showLevelCompleteModal('Робот вышел за границы поля 8×8. Попробуй снова.', false, 'Ошибка');
          return;
        }
        currentPosition = nextPos;
      } else if (command.type === 'turn-left' || command.type === 'turn-right') {
        currentDirection = rotateDirection(currentDirection, command.type);
      } else if (command.type === 'place') {
        placedObjects.set(toKey(currentPosition[0], currentPosition[1]), command.objectType);
      }

      renderBoard();
    }

    const programCommands = getProgramCommandCount();
    const level = getCurrentLevel();

    if (!checkWin()) {
      showLevelCompleteModal('Не все объекты стоят на нужных местах.', false, 'Почти!');
      return;
    }

    if (programCommands > level.minCommands) {
      showLevelCompleteModal(
        `Ты решил задачу, но использовал ${programCommands} команд. Нужно ${level.minCommands} или меньше.`,
        false,
        'Есть решение короче',
      );
      return;
    }

    markLevelCompleted(currentLevelIndex);
    renderLevelOptions();
    const hasNext = currentLevelIndex < levels.length - 1 && isLevelUnlocked(currentLevelIndex + 1);
    showLevelCompleteModal('Все объекты расставлены правильно!', hasNext, 'Победа!');
  } finally {
    isProgramRunning = false;
    runButton.disabled = false;
  }
}

runButton.addEventListener('click', runProgram);
levelSelect.addEventListener('change', (event) => setLevel(Number(event.target.value)));
nextLevelButton.addEventListener('click', () => setLevel(Math.min(currentLevelIndex + 1, levels.length - 1)));
retryLevelButton.addEventListener('click', () => {
  hideLevelCompleteModal();
  resetLevelState();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideLevelCompleteModal();
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) runProgram();
});

loadProgress();
syncCurrentLevelWithProgress();
initializeBlockly();
setLevel(currentLevelIndex);
