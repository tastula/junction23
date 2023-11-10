const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const moveLimit = 4;
const faceRad = 30;
const step = 40;
const timeY = 260;
const timeFont = '128px sans-serif';

let blinkingTime = false;
let faceIdx = 0;
let position = 0;
let faceX = canvas.width / 2 - 60; // based on image size
let faceY = 340;

const loadImages = (imageDir, imageFiles) => {
  const images = [];
  imageFiles.forEach((imageFile) => {
    const image = new Image();
    image.src = `${imageDir}/${imageFile}`;
    images.push(image);
  });
  return images;
};

const faces = loadImages('res', ['face1.png', 'face2.png', 'face3.png']);
const backgrounds = loadImages('res', ['background1.png']);

const getRandomInt = (max) => Math.floor(Math.random() * max);

const move = () => {
  const direction = getRandomInt(2) === 1 ? 1 : -1;
  const proposedPosition = position + direction;

  if (proposedPosition === moveLimit) {
    position = proposedPosition - 1;
  } else if (proposedPosition === -moveLimit) {
    position = proposedPosition + 1;
  } else {
    position = proposedPosition;
  }
};

const selectNewFaceIdx = () => {
  const proposedFaceIdx = getRandomInt(faces.length);
  return proposedFaceIdx === faceIdx ? selectNewFaceIdx() : proposedFaceIdx;
};

const draw = () => {
  const drawBackground = () => {
    ctx.drawImage(backgrounds[0], 0, 0);
  };
  const drawFace = () => {
    ctx.fillStyle = '#fff';
    const steppedFaceX = faceX + step * position;
    faceIdx = selectNewFaceIdx();
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
    ctx.drawImage(faces[faceIdx], steppedFaceX, faceY);
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

  ctx.clearRect(0, 0, 480, 480);
  drawBackground();
  drawTime();
  drawFace();
};

const loop = () => {
  move();
  requestAnimationFrame(draw);
};

setInterval(loop, 1000);
