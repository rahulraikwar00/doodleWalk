const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let eventInfo = null;
let rotationAngle = 0;

const canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

function drawPoint() {
  ctx.beginPath();
  ctx.moveTo(canvasCenter.x, canvasCenter.y);
  ctx.arc(canvasCenter.x, canvasCenter.y, 10, 0, 8 * Math.PI);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.stroke();
}
function drawTriangel(canvasCenter, position) {
  ctx.save();
  ctx.translate(canvasCenter.x, canvasCenter.y);
  ctx.rotate(-rotationAngle * (Math.PI / 180));
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-5, 5);
  ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
  ctx.stroke();
  ctx.restore();
}
// drawTriangel(canvasCenter);

document.getElementById("moveup").addEventListener("click", (event) => {
  const canvasCenter = rotatePoint(
    canvasCenter.x,
    canvasCenter.y,
    canvasCenter.x,
    canvasCenter.y,
    10
  );
  canvasCenter.x += 10;
  // ctx.translate(canvasCenter.x, canvasCenter.y);
});

document.getElementById("btn").addEventListener("touchstart", (event) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(canvasCenter.x, canvasCenter.y);
});

document.getElementById("btn").addEventListener("touchend", (event) => {
  isDrawing = false;
  ctx.stroke();
  eventInfo = null;
});

function animate() {
  canvas.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;

  if (isDrawing && eventInfo) {
    const offsetX = eventInfo.acceleration.x * 10 + 100; // Scale factor for visibility
    const offsetY = eventInfo.acceleration.y * 10 + 100;
    const newX = offsetX;
    const newY = offsetY;
    ctx.lineTo(newX, newY);
    ctx.stroke();

    ctx.moveTo(newX, newY); // Move to the new point for the next line segment
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTriangel(canvasCenter);
  requestAnimationFrame(animate);
}

animate();

function handleRotation(event) {
  rotationAngle = event.alpha;
}

window.addEventListener("deviceorientation", handleRotation);

window.addEventListener("devicemotion", (event) => {
  eventInfo = event;
});

function rotatePoint(x, y, centerX, centerY, angle) {
  // Convert angle to radians
  let radians = angle * (Math.PI / 180);

  // Translate point to origin
  let translatedX = x - centerX;
  let translatedY = y - centerY;

  // Rotate point
  let rotatedX =
    translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
  let rotatedY =
    translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

  // Translate point back
  let newX = rotatedX + centerX;
  let newY = rotatedY + centerY;

  return { x: newX, y: newY };
}
