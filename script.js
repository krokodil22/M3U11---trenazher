const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const DEGREE_OPTIONS = [['30', '30'], ['60', '60'], ['90', '90'], ['120', '120'], ['180', '180']];
const PROGRESS_STORAGE_KEY = 'trenazher-level-progress-v1';

const objectAssets = {
  neutral: 'neutral.svg',
  robo: 'robo.svg',
  roboDone: 'robo2.svg',
  virus: 'virus.svg',
  virusDone: 'virus2.svg',
};

const levels = [
  {
    title: 'Уровень 1',
    hint: 'Все нейтральные, только 60° — робот.',
    commandLimit: 2,
    items: {
      0: 'neutral', 30: 'neutral', 60: 'robo', 90: 'neutral', 120: 'neutral', 150: 'neutral',
      180: 'neutral', 210: 'neutral', 240: 'neutral', 270: 'neutral', 300: 'neutral', 330: 'neutral',
    },
  },
  {
    title: 'Уровень 2',
    hint: '90° — робот, 120° — вирус, остальные нейтральные.',
    commandLimit: 4,
    items: {
      0: 'neutral', 30: 'neutral', 60: 'neutral', 90: 'robo', 120: 'virus', 150: 'neutral',
      180: 'neutral', 210: 'neutral', 240: 'neutral', 270: 'neutral', 300: 'neutral', 330: 'neutral',
    },
  },
  {
    title: 'Уровень 3',
    hint: '90° — вирус, 150° — робот, 270° — вирус, 330° — робот.',
    commandLimit: 8,
    items: {
      0: 'neutral', 30: 'neutral', 60: 'neutral', 90: 'virus', 120: 'neutral', 150: 'robo',
      180: 'neutral', 210: 'neutral', 240: 'neutral', 270: 'virus', 300: 'neutral', 330: 'robo',
    },
  },
  {
    title: 'Уровень 4',
    hint: '0°, 60°, 120°, 180°, 240°, 300° — вирусы, остальные нейтральные.',
    commandLimit: 3,
    items: {
      0: 'virus', 30: 'neutral', 60: 'virus', 90: 'neutral', 120: 'virus', 150: 'neutral',
      180: 'virus', 210: 'neutral', 240: 'virus', 270: 'neutral', 300: 'virus', 330: 'neutral',
    },
  },
  {
    title: 'Уровень 5',
    hint: 'Чередование типов по кругу: В, Р, Н.',
    commandLimit: 5,
    items: {
      0: 'virus', 30: 'robo', 60: 'neutral', 90: 'virus', 120: 'robo', 150: 'neutral',
      180: 'virus', 210: 'robo', 240: 'neutral', 270: 'virus', 300: 'robo', 330: 'neutral',
    },
  },
];

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
let gunAngle = 0;
let gunRenderAngle = 0;
let levelItems = {};
let isProgramRunning = false;
let orbitElements = {};
let gunElement;
let beamElement;
let passedLevels = levels.map(() => false);

const defineBlocksWithJsonArray = Blockly.common?.defineBlocksWithJsonArray ?? Blockly.defineBlocksWithJsonArray;

defineBlocksWithJsonArray([
  { type: 'train_start', message0: 'Старт', nextStatement: null, colour: 45, deletable: false, movable: false, hat: 'cap' },
  {
    type: 'turn_clockwise',
    message0: 'Повернуться ↻ на %1 °',
    args0: [{ type: 'field_dropdown', name: 'DEGREES', options: DEGREE_OPTIONS }],
    previousStatement: null,
    nextStatement: null,
    colour: 325,
  },
  {
    type: 'turn_counterclockwise',
    message0: 'Повернуться ↺ на %1 °',
    args0: [{ type: 'field_dropdown', name: 'DEGREES', options: DEGREE_OPTIONS }],
    previousStatement: null,
    nextStatement: null,
    colour: 325,
  },
  {
    type: 'repeat_n',
    message0: 'Повторить %1 раз %2 %3',
    args0: [
      { type: 'field_number', name: 'TIMES', value: 2, min: 1, precision: 1 },
      { type: 'input_dummy' },
      { type: 'input_statement', name: 'DO' },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 205,
  },
  { type: 'activate_target', message0: 'Активировать', previousStatement: null, nextStatement: null, colour: 120 },
  { type: 'clear_target', message0: 'Очистить', previousStatement: null, nextStatement: null, colour: 120 },
]);

function getToolbox() {
  return {
    kind: 'flyoutToolbox',
    contents: [
      { kind: 'block', type: 'repeat_n', fields: { TIMES: 2 } },
      { kind: 'block', type: 'turn_clockwise', fields: { DEGREES: '30' } },
      { kind: 'block', type: 'turn_counterclockwise', fields: { DEGREES: '30' } },
      { kind: 'block', type: 'activate_target' },
      { kind: 'block', type: 'clear_target' },
    ],
  };
}

function resetWorkspace() {
  workspace.clear();
  const startBlock = workspace.newBlock('train_start');
  startBlock.initSvg();
  startBlock.render();
  startBlock.moveBy(36, 36);
  workspace.centerOnBlock(startBlock.id);
}

function initializeBlockly() {
  workspace = Blockly.inject(workspaceContainer, {
    toolbox: getToolbox(),
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

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.passedLevels)) return;

    passedLevels = levels.map((_, idx) => Boolean(parsed.passedLevels[idx]));
  } catch (_error) {
    passedLevels = levels.map(() => false);
  }
}

function saveProgress() {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ passedLevels }));
}

function getMaxUnlockedLevelIndex() {
  let unlocked = 0;
  while (unlocked < levels.length - 1 && passedLevels[unlocked]) unlocked += 1;
  return unlocked;
}

function isLevelUnlocked(index) {
  return index <= getMaxUnlockedLevelIndex();
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function cloneItemsForLevel(index) {
  return JSON.parse(JSON.stringify(levels[index].items));
}

function angleToPosition(angle) {
  const radius = 41;
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: 50 + Math.cos(rad) * radius,
    y: 50 + Math.sin(rad) * radius,
  };
}

function renderBoard() {
  board.innerHTML = '';
  orbitElements = {};

  ANGLES.forEach((angle) => {
    const type = levelItems[angle];
    const item = document.createElement('div');
    item.className = 'orbit-item';
    item.style.backgroundImage = `url('./${objectAssets[type]}')`;
    const position = angleToPosition(angle);
    item.style.left = `${position.x}%`;
    item.style.top = `${position.y}%`;
    board.appendChild(item);
    orbitElements[angle] = item;
  });

  beamElement = document.createElement('div');
  beamElement.className = 'beam';
  board.appendChild(beamElement);

  gunElement = document.createElement('div');
  gunElement.className = 'gun';
  gunElement.style.transform = `translate(-50%, -50%) rotate(${gunRenderAngle}deg)`;
  board.appendChild(gunElement);

  const level = levels[currentLevelIndex];
  levelTitle.textContent = level.title;
  levelProgress.textContent = `${currentLevelIndex + 1} / ${levels.length}`;
  levelHint.textContent = level.hint;
  levelRule.textContent = `Лимит: ${level.commandLimit} команд(ы). Пройденный уровень отмечается ✅.`;
}

function renderLevelOptions() {
  levelSelect.innerHTML = levels
    .map((level, idx) => {
      const passed = passedLevels[idx];
      const unlocked = isLevelUnlocked(idx);
      const icon = passed ? '✅' : unlocked ? '•' : '🔒';
      return `<option value="${idx}" ${idx === currentLevelIndex ? 'selected' : ''} ${unlocked ? '' : 'disabled'}>${icon} ${level.title}</option>`;
    })
    .join('');
}

function hideLevelCompleteModal() {
  levelCompleteModal.classList.add('hidden');
}

function showLevelCompleteModal(message, title, canProceed) {
  levelCompleteTitle.textContent = title;
  levelCompleteMessage.textContent = message;
  nextLevelButton.hidden = !canProceed;
  retryLevelButton.hidden = false;
  levelCompleteModal.classList.remove('hidden');
}

function resetLevelState() {
  gunAngle = 0;
  gunRenderAngle = 0;
  levelItems = cloneItemsForLevel(currentLevelIndex);
  renderBoard();
}

function setLevel(index) {
  if (index < 0 || index >= levels.length || !isLevelUnlocked(index)) return;
  currentLevelIndex = index;
  hideLevelCompleteModal();
  resetWorkspace();
  resetLevelState();
  renderLevelOptions();
}

function flattenProgram(block, commands = []) {
  let currentBlock = block;
  while (currentBlock) {
    switch (currentBlock.type) {
      case 'turn_clockwise':
        commands.push({ type: 'turn-cw', degrees: Number(currentBlock.getFieldValue('DEGREES')) || 0 });
        break;
      case 'turn_counterclockwise':
        commands.push({ type: 'turn-ccw', degrees: Number(currentBlock.getFieldValue('DEGREES')) || 0 });
        break;
      case 'activate_target':
        commands.push({ type: 'activate' });
        break;
      case 'clear_target':
        commands.push({ type: 'clear' });
        break;
      case 'repeat_n': {
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

function getExecutionSequence() {
  const startBlock = workspace.getBlocksByType('train_start', false)[0];
  if (!startBlock) return [];
  return flattenProgram(startBlock.getNextBlock(), []);
}

function isLevelPassed() {
  return ANGLES.every((angle) => {
    const type = levelItems[angle];
    return type !== 'robo' && type !== 'virus';
  });
}

function tryAction(actionType) {
  const currentType = levelItems[gunAngle];
  if (actionType === 'activate' && currentType === 'robo') {
    levelItems[gunAngle] = 'roboDone';
  }
  if (actionType === 'clear' && currentType === 'virus') {
    levelItems[gunAngle] = 'virusDone';
  }
}

function refreshOrbitItem(angle) {
  const item = orbitElements[angle];
  if (!item) return;
  item.style.backgroundImage = `url('./${objectAssets[levelItems[angle]]}')`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateTurn(degrees) {
  const duration = Math.max(260, Math.round(Math.abs(degrees) * 8));
  gunRenderAngle += degrees;
  gunAngle = normalizeAngle(gunAngle + degrees);

  if (!gunElement) return;

  gunElement.style.transition = `transform ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
  gunElement.style.transform = `translate(-50%, -50%) rotate(${gunRenderAngle}deg)`;
  await wait(duration + 20);
}

async function playBeam(actionType) {
  if (!beamElement) return;
  const boardSize = board.clientWidth;
  const shotDistance = boardSize * 0.42;
  const gunTipOffset = boardSize * 0.085;
  const radians = ((gunAngle - 90) * Math.PI) / 180;
  const beamStartX = boardSize / 2 + Math.cos(radians) * gunTipOffset;
  const beamStartY = boardSize / 2 + Math.sin(radians) * gunTipOffset;

  beamElement.style.left = `${beamStartX.toFixed(2)}px`;
  beamElement.style.top = `${beamStartY.toFixed(2)}px`;
  beamElement.style.width = `${shotDistance.toFixed(2)}px`;
  beamElement.style.setProperty('--beam-rotation', `${gunRenderAngle - 90}deg`);
  beamElement.classList.remove('beam--activate', 'beam--clear', 'beam--shoot');
  beamElement.classList.add(actionType === 'activate' ? 'beam--activate' : 'beam--clear');
  void beamElement.offsetWidth;
  beamElement.classList.add('beam--shoot');
  await wait(420);
  beamElement.classList.remove('beam--shoot');
}

function markLevelPassed(index) {
  if (passedLevels[index]) return;
  passedLevels[index] = true;
  saveProgress();
  renderLevelOptions();
}

async function runProgram() {
  if (isProgramRunning) return;
  const sequence = getExecutionSequence();
  const level = levels[currentLevelIndex];
  resetLevelState();
  if (sequence.length === 0) return;

  if (sequence.length > level.commandLimit) {
    showLevelCompleteModal(
      `Превышен лимит: ${sequence.length} команд при максимуме ${level.commandLimit}. Прохождение не засчитано.`,
      'Лимит команд превышен',
      false,
    );
    return;
  }

  isProgramRunning = true;
  runButton.disabled = true;

  try {
    for (const command of sequence) {
      await wait(160);

      if (command.type === 'turn-cw') {
        await animateTurn(command.degrees);
      } else if (command.type === 'turn-ccw') {
        await animateTurn(-command.degrees);
      } else if (command.type === 'activate' || command.type === 'clear') {
        tryAction(command.type);
        refreshOrbitItem(gunAngle);
        await playBeam(command.type);
      }
    }

    if (isLevelPassed()) {
      markLevelPassed(currentLevelIndex);
      const hasNext = currentLevelIndex < levels.length - 1;
      showLevelCompleteModal('Уровень пройден: цели обработаны в рамках лимита команд.', 'Победа!', hasNext);
      return;
    }

    showLevelCompleteModal('Не все цели обработаны. Проверь углы поворота и действия.', 'Попробуй ещё', false);
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
initializeBlockly();
setLevel(0);
