const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const moveLimit = 4;
const faceRad = 30;
const step = 40;
const timeY = 280;
const timeFont = '96px sans-serif';
const iconRad = 35;
const iconRowY = 100;
const statSadnessCap = 3;

let statSadness = 0;
let statuses = [];
let blinkingTime = false;
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

const backgrounds = loadImages('res', ['background1.png']);
const sadFaces = loadImages('res', ['sad1.png', 'sad2.png']);
const happyFaces = loadImages('res', [
  'happy1.png',
  'happy2.png',
  'happy3.png',
]);
const icons = { energy: loadImage('res/iconEnergy.png') };

const getRandomInt = (max) => Math.floor(Math.random() * max);
const getRandom256 = () => Math.floor(Math.random() * 256);
const getRandomColor = () =>
  `rgb(${getRandom256()},${getRandom256()},${getRandom256()})`;

const handleStatuses = () => {
  // Remove cured statuses
  statuses = statuses.filter((status) => !status.cured);
  // Add status if a stat exceeds cap
  if (!statuses.length && statSadness > statSadnessCap) {
    const newStatus = {
      img: icons.energy,
      bounds: new Path2D(),
      name: 'sadness',
      color: getRandomColor(),
      cured: false,
    };
    statuses.push(newStatus);
  }
  // Increase stats
  statSadness += 1;
};

const registerEvents = () => {
  const addStatusCallbacks = (event) => {
    statuses.forEach((status) => {
      if (ctx.isPointInPath(status.bounds, event.offsetX, event.offsetY)) {
        status.cured = true;
        statSadness = 0;
      }
    });
  };

  // Re-register events since statuses may have changed
  canvas.removeEventListener('click', addStatusCallbacks);
  canvas.addEventListener('click', addStatusCallbacks);
};

const move = () => {
  const direction = getRandomInt(2) === 1 ? 1 : -1;
  const proposedPosition = position + direction;

  // Move only if everything's okay
  if (statuses.length) {
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
  const faces = statuses.length ? sadFaces : happyFaces;
  const proposedFaceIdx = getRandomInt(faces.length);
  if (proposedFaceIdx === faceIdx) {
    return selectNewFaceIdx();
  } else {
    faceIdx = proposedFaceIdx;
    return faces[faceIdx];
  }
};

const draw = () => {
  const drawBackground = () => {
    ctx.drawImage(backgrounds[0], 0, 0);
  };
  const drawFace = () => {
    ctx.fillStyle = '#fff';
    const steppedFaceX = faceX + step * position;
    ctx.beginPath();
    const padding = 4;
    ctx.roundRect(
      steppedFaceX - padding,
      faceY - padding,
      120 + 2 * padding,
      82 + 2 * padding,
      [40, 40, 10, 10]
    );
    ctx.fill();
    ctx.drawImage(selectNewFaceIdx(), steppedFaceX, faceY);
  };
  const drawTime = () => {
    ctx.fillStyle = '#fff';
    const date = new Date();
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    ctx.font = timeFont;
    blinkingTime = !blinkingTime;
    const timeText = `${hours}${blinkingTime ? ' ' : ':'}${minutes}`;
    const timeWidth = ctx.measureText(timeText).width;
    ctx.fillText(timeText, canvas.width / 2 - timeWidth / 2, timeY);
  };
  const drawStatusIcon = (x, y) => {
    if (statuses.length) {
      const status = statuses[0];
      ctx.beginPath();
      status.bounds.arc(x, y, iconRad, 0, 2 * Math.PI);
      ctx.fillStyle = status.color;
      ctx.fill(status.bounds);
      ctx.drawImage(status.img, x-iconRad, y-iconRad, 2*iconRad, 2*iconRad);
    }
  };

  ctx.clearRect(0, 0, 480, 480);
  drawBackground();
  drawTime();
  drawFace();
  drawStatusIcon(canvas.width / 2, iconRowY);
};

const loop = () => {
  handleStatuses();
  move();
  registerEvents();
  requestAnimationFrame(draw);
};

setInterval(loop, 1000);
