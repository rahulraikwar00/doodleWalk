const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let offsetX = 0;
let offsetY = 0;
let lastX, lastY;
let rotatingAngle = 90;
const drawings = [];

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseleave", stopDrawing);

function drawTriangle(size) {
  ctx.save();
  ctx.translate(centerX - offsetX, centerY - offsetY);
  ctx.rotate(-rotatingAngle * (Math.PI / 180));
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function startDrawing(event) {
  drawing = true;
  lastX = event.clientX;
  lastY = event.clientY;
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath(); // Begin a new path to stop connecting lines
}

function draw(event) {
  if (!drawing) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;

  const { mag, dir } = toPolar(dx, dy);
  const { x, y } = polatToXy(mag, dir - rotatingAngle * (Math.PI / 180));

  console.table({ dx, dy, mag, dir, x, y });
  offsetX += x;
  offsetY += y;
  lastX = event.clientX;
  lastY = event.clientY;

  drawings.push({ dx: offsetX, dy: offsetY });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  redraw();

  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX - x, centerY - y);
  ctx.stroke();

  ctx.moveTo(centerX - x, centerY - y);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.translate(offsetX, offsetY);

  drawTriangle(10);
  drawings.forEach((drawing) => {
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.beginPath();
    // ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - drawing.dx, centerY - drawing.dy);
    ctx.stroke();
  });

  ctx.restore();
}

function toPolar(x, y) {
  return {
    mag: Math.hypot(x, y),
    dir: Math.atan2(y, x),
  };
}

function polatToXy(mag, dir) {
  return {
    x: mag * Math.cos(dir),
    y: mag * Math.sin(dir),
  };
}
window.addEventListener("deviceorientation", (event) => {
  rotatingAngle = event.alpha;
  canvas.style.transform = `rotate(${rotatingAngle}deg)`;
  redraw();
});

window.addEventListener("devicemotion", (event) => {
  drawing = true;
  lastX = 10;
  lastY = 10;
  redraw();
});
