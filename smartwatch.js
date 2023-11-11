const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const moveLimit = 4;
const faceRad = 30;
const step = 40;
const timeY = 280;
const timeFont = '96px sans-serif';
const iconRad = 35;
const iconRowY = 100;

const statusEffect = {
  OK: 0,
  TIRED: 1,
  SAD: 2,
  LONELY: 3,
};

let blink = false;
let hasCondition = true;
let faceIdx = 0;
let position = 0;
let faceX = canvas.width / 2 - 60; // based on image size
let faceY = 340;

const loadImage = (path) => {
  const image = new Image();
  image.src = path;
  return image;
};
const loadImages = (imageDir, imageFiles) => {
  const images = [];
  imageFiles.forEach((imageFile) => {
    images.push(loadImage(`${imageDir}/${imageFile}`));
  });
  return images;
};

const bodyImage = loadImage('res/body.png');
const backgrounds = loadImages('res', ['background1.png']);
const sadFaces = loadImages('res', ['sad1.png', 'sad2.png']);
const happyFaces = loadImages('res', [
  'happy1.png',
  'happy2.png',
  'happy3.png',
]);
const getRandomInt = (max) => Math.floor(Math.random() * max);
const getRandom256 = () => Math.floor(Math.random() * 256);
const getRandomColor = () =>
  `rgb(${getRandom256()},${getRandom256()},${getRandom256()})`;

const handleStatuses = () => {
  // Remove cured statuses
  stats.forEach((stat) => {
    if (stat.amount) {
      stat.amount -= 1;
    }
  });
};

const stats = [
  {
    name: 'energy',
    icon: loadImage('res/iconEnergy.png'),
    amount: 31, // one energy is consumed before draw
    maxAmount: 30,
    effect: statusEffect.TIRED,
    bounds: new Path2D(),
    color: 'rgb(255,255,125)',
  },
  {
    name: 'happiness',
    icon: loadImage('res/iconHappiness.png'),
    amount: 16, // one energy is consumed before draw
    maxAmount: 15,
    effect: statusEffect.SAD,
    bounds: new Path2D(),
    color: 'rgb(125,255,125)',
  },
  {
    name: 'social',
    icon: loadImage('res/iconSocial.png'),
    amount: 29, // one energy is consumed before draw
    maxAmount: 28,
    effect: statusEffect.LONELY,
    bounds: new Path2D(),
    color: 'rgb(255,125,125)',
  },
];

const registerEvents = () => {
  const addStatusCallbacks = (event) => {
    stats.forEach((status) => {
      if (ctx.isPointInPath(status.bounds, event.offsetX, event.offsetY)) {
        status.amount = status.maxAmount + 1;
      }
    });
  };

  // Re-register events since statuses may have changed
  canvas.removeEventListener('click', addStatusCallbacks);
  canvas.addEventListener('click', addStatusCallbacks);
};

const currentStatusEffect = () => {
  let effect = statusEffect.OK;
  stats.forEach((stat) => {
    effect = !stat.amount ? stat.effect : effect;
  });
  return effect;
};

const move = () => {
  const direction = getRandomInt(2) === 1 ? 1 : -1;
  const proposedPosition = position + direction;

  // Move only if everything's okay
  if (currentStatusEffect() != statusEffect.OK) {
    return;
  }

  if (proposedPosition === moveLimit) {
    position = proposedPosition - 1;
  } else if (proposedPosition === -moveLimit) {
    position = proposedPosition + 1;
  } else {
    position = proposedPosition;
  }
};

const selectNewFaceIdx = () => {
  const faces =
    currentStatusEffect() != statusEffect.OK ? sadFaces : happyFaces;
  const proposedFaceIdx = getRandomInt(faces.length);
  if (proposedFaceIdx === faceIdx) {
    return selectNewFaceIdx();
  } else {
    faceIdx = proposedFaceIdx;
    return faces[faceIdx];
  }
};

const selectCircleColor = (percentage) => {
  if (percentage > 0.66) {
    return '#238823';
  }
  if (percentage > 0.33) {
    return '#ffd900';
  }
  return '#d2222d';
};

const draw = () => {
  const drawBackground = () => {
    ctx.drawImage(backgrounds[0], 0, 0);
  };
  const drawNakki = () => {
    const steppedFaceX = faceX + step * position;
    ctx.drawImage(bodyImage, steppedFaceX, faceY - 20);
    ctx.drawImage(selectNewFaceIdx(), steppedFaceX, faceY);
  };
  const drawTime = () => {
    ctx.fillStyle = '#fff';
    const date = new Date();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    ctx.font = timeFont;
    blink = !blink;
    const timeText = `${hours}${blink ? ' ' : ':'}${minutes}`;
    const timeWidth = ctx.measureText(timeText).width;
    ctx.fillText(timeText, canvas.width / 2 - timeWidth / 2, timeY);
  };
  const drawStatusIcon = (cx, cy) => {
    let step = iconRad * 1.5;
    let x = cx - (stats.length - 1) * step;
    let y = cy;
    stats.forEach((status) => {
      const statPercentage = status.amount / status.maxAmount;
      status.bounds.arc(x, y, iconRad, 0, 2 * Math.PI);
      const radStart = 1.5 * Math.PI;

      // Draw indicator background and real value
      const drawIndicators = (radEnd, inBackground) => {
        const getBlinkingColor = (color) => {
          return !statPercentage && blink ? `${color}22` : `${color}66`;
        };
        const color = selectCircleColor(statPercentage);
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.arc(x, y, iconRad, radStart, radEnd);
        ctx.strokeStyle = inBackground ? getBlinkingColor(color) : color;
        ctx.stroke();
      };
      drawIndicators(radStart + 2 * Math.PI, true);
      drawIndicators(radStart + 2 * Math.PI * statPercentage, false);

      let r = iconRad * 0.7;
      ctx.drawImage(status.icon, x - r, y - r, 2 * r, 2 * r);
      x += step * 2;
    });
  };

  ctx.clearRect(0, 0, 480, 480);
  drawBackground();
  drawTime();
  drawNakki();
  drawStatusIcon(canvas.width / 2, iconRowY);
};

const loop = () => {
  handleStatuses();
  move();
  registerEvents();
  requestAnimationFrame(draw);
};

setInterval(loop, 500);
