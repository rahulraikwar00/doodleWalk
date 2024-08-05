const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let isMoving = false;
let eventInfo = null;
let rotationAngle = 0;
const canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

canvas.addEventListener("touchstart", (event) => {
  console.log("Touch started:", event);
  ctx.beginPath();
  ctx.moveTo(event.offsetX, event.offsetY);
  isDrawing = true;
});

// Add touchmove event listener
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  console.log("Touch moved:", event);
  ctx.moveTo(event.offsetX, event.offsetY);
  eventInfo = event;
  // Do something when a touch moves on the element
});

// Add touchend event listener
canvas.addEventListener("touchend", (event) => {
  event.preventDefault();
  console.log("Touch ended:", event);
  isDrawing = false;
  ctx.stroke();
  eventInfo = null;
  // Do something when a touch ends on the element
});
function animate() {
  canvas.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;

  if (isDrawing && eventInfo) {
    const touch = eventInfo.touches[0];
    const xyRelToCenter = {
      x: touch.pageX - window.innerWidth / 2,
      y: touch.pageY - window.innerHeight / 2,
    };

    const pol = toPolar(xyRelToCenter);
    pol.dir -= rotationAngle * (Math.PI / 180);
    const xyWithRotation = toXy(pol);
    xyWithRotation.x += canvas.width / 2;
    xyWithRotation.y += canvas.height / 2;

    ctx.lineTo(xyWithRotation.x, xyWithRotation.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xyWithRotation.x, xyWithRotation.y);
  }

  requestAnimationFrame(animate);
}

animate();

function toPolar({ x, y }) {
  return {
    dir: Math.atan2(y, x),
    mag: Math.hypot(x, y),
  };
}

function toXy({ mag, dir }) {
  return {
    x: mag * Math.cos(dir),
    y: mag * Math.sin(dir),
  };
}

function handleRotation(event) {
  rotationAngle = event.alpha;
}

window.addEventListener("deviceorientation", handleRotation);

function drawLine(from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

window.addEventListener("devicemotion", (event) => {
  if (event.acceleration.x !== 0 || event.acceleration.y !== 0) {
    return true;
  }
  return false;
});
