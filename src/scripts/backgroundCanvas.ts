interface CellState {
  char: string;
  opacity: number;
  delayRemaining: number;
  fadeIn: boolean;
  fadeDuration: number;
}

interface AnimationOptions {
  cellSize: number;
  color: string;
  font: string;
  fontSize: number;
  backgroundColor: string;
  fadeDurationRangeSeconds: [number, number];
  delayDurationRangeSeconds: [number, number];
  chars: string;
  initialDensity: number;
}

const defaultOptions: AnimationOptions = {
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  cellSize: 20,
  color: '#00ff00',
  font: 'monospace',
  fontSize: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  fadeDurationRangeSeconds: [2, 5],
  delayDurationRangeSeconds: [0, 2],
  initialDensity: 0.1,
};

function setupMatrixAnimation(id: string, customOptions: Partial<AnimationOptions> = {}) {
  const options: AnimationOptions = { ...defaultOptions, ...customOptions };

  const canvas = document.getElementById(id) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas with id "${id}" not found`);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Unable to get 2D context');
    return;
  }

  const {
    cellSize,
    color,
    font,
    fontSize,
    backgroundColor,
    fadeDurationRangeSeconds,
    delayDurationRangeSeconds,
  } = options;

  const cols = Math.floor(canvas.width / cellSize);
  const rows = Math.floor(canvas.height / cellSize);

  function getRandomChar(): string {
    return options.chars[Math.floor(Math.random() * options.chars.length)];
  }

  function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  const grid: CellState[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => {
          const densityRoll = Math.random();
          let opacity = 0;
          let delayRemaining;
          if (densityRoll < options.initialDensity) {
            opacity = Math.random();
            delayRemaining = 0;
          } else {
            delayRemaining = getRandomInRange(...delayDurationRangeSeconds);
          }

          return {
            char: getRandomChar(),
            opacity,
            delayRemaining,
            fadeIn: true,
            fadeDuration: getRandomInRange(...fadeDurationRangeSeconds),
          };
        })
    );

  let lastTime = 0;
  function animate(time: number) {
    const deltaTime = (time - lastTime) / 1000; // Convert to seconds
    lastTime = time;

    const context = ctx as CanvasRenderingContext2D;
    context.fillStyle = backgroundColor;
    context.globalAlpha = 1;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = `${fontSize}px ${font}`;
    context.fillStyle = color;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = grid[y][x];

        if (cell.delayRemaining > 0) {
          cell.delayRemaining -= deltaTime;
          continue;
        }

        const fadeSpeed = 1 / cell.fadeDuration;
        if (cell.fadeIn) {
          cell.opacity += fadeSpeed * deltaTime;
          if (cell.opacity >= 1) {
            cell.fadeIn = false;
          }
        } else {
          cell.opacity -= fadeSpeed * deltaTime;
          if (cell.opacity <= 0) {
            cell.char = getRandomChar();
            cell.fadeIn = true;
            cell.delayRemaining = getRandomInRange(...delayDurationRangeSeconds);
            cell.fadeDuration = getRandomInRange(...fadeDurationRangeSeconds);
          }
        }

        if (cell.opacity > 0.01) {
          context.globalAlpha = cell.opacity;
          context.fillText(cell.char, x * cellSize, y * cellSize + fontSize);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

export { setupMatrixAnimation };
