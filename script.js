const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let offsetX = 0;
let offsetY = 0;
let rotatingAngle = 0;
let updateoffsetvalue = 0;
const drawings = [];

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Function to draw a triangle
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

// Function to handle drawing
function draw() {
  if (!drawing) return;
  const dx = 0;
  const dy = updateoffsetvalue;
  const { mag, dir } = toPolar(dx, dy);
  const { x, y } = polatToXy(mag, dir - rotatingAngle * (Math.PI / 180));

  offsetX += x;
  offsetY += y;
  drawings.push({ dx: offsetX, dy: offsetY });
  ctx.moveTo(centerX - offsetX, centerY - offsetY);
}

// Function to redraw the canvas
function redraw() {
  if (!drawing) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);

  drawTriangle(10);
  drawings.forEach((drawing) => {
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(centerX - drawing.dx, centerY - drawing.dy, 5, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.restore();
}

// Function to convert Cartesian coordinates to polar
function toPolar(x, y) {
  return {
    mag: Math.hypot(x, y),
    dir: Math.atan2(y, x),
  };
}

// Function to convert polar coordinates to Cartesian
function polatToXy(mag, dir) {
  return {
    x: mag * Math.cos(dir),
    y: mag * Math.sin(dir),
  };
}

const deviceDetails = document.getElementById("device-details");
const permissionStatus = document.getElementById("permission-status"); // New element

// Function to handle device orientation events
function handleOrientation(event) {
  rotatingAngle = event.alpha;
  deviceDetails.innerText = `Device: ${rotatingAngle}`;
  canvas.style.transform = `rotate(${rotatingAngle}deg)`;
}

// Request permission and update status
if (typeof DeviceOrientationEvent.requestPermission === "function") {
  DeviceOrientationEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        window.addEventListener("deviceorientation", handleOrientation);
        permissionStatus.innerText = "Device orientation permission granted.";
      } else {
        permissionStatus.innerText = "Device orientation permission denied.";
      }
    })
    .catch((error) => {
      console.error(error);
      permissionStatus.innerText = "Error requesting permission.";
    });
} else {
  window.addEventListener("deviceorientation", handleOrientation);
  permissionStatus.innerText = "Device orientation permission not required.";
}

setInterval(() => {
  updateoffsetvalue = 1;
}, 500);

animate();

// Function to animate the drawing
function animate() {
  draw();
  redraw();
  requestAnimationFrame(animate);
}

const button = document.getElementById("btn");

// Event listener for button click
button.addEventListener("click", () => {
  drawing = !drawing;
  if (drawing) {
    button.innerText = "Stop"; // Change button text to "Stop"
  } else {
    updateoffsetvalue = 0; // Reset offset value
    button.innerText = "Start"; // Change button text to "Start"
  }
});
