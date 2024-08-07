const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let offsetX = 0;
let offsetY = 0;
let rotatingAngle = 0;
let updateoffsetvalue = 0;
const drawings = [];
let walking = false;
const accelerationHistory = [];
const sampleSize = 50;
let threshold = 0.2;

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
  // if (!drawing) return;
  const dx = 0;
  const dy = updateoffsetvalue;
  const { mag, dir } = toPolar(dx, dy);
  const { x, y } = polatToXy(mag, dir - rotatingAngle * (Math.PI / 180));
  offsetX += x;
  offsetY += y;
  if (drawing) {
    drawings.push({ dx: offsetX, dy: offsetY });
  }
  ctx.moveTo(centerX - offsetX, centerY - offsetY);
}

// Function to redraw the canvas
function redraw() {
  // if (!drawing) return;
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
  deviceDetails.innerText = `Device: ${rotatingAngle.toFixed(2)}°`;
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

const tresholdValue = document.getElementById("addthreshold");
tresholdValue.textContent = "Threshold: " + threshold;
tresholdValue.addEventListener("click", () => {
  threshold += 0.1;
  tresholdValue.textContent = "Threshold: " + threshold.toFixed(1);
});

// Request permission for iOS 13+ devices
if (typeof DeviceMotionEvent.requestPermission === "function") {
  DeviceMotionEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        window.addEventListener("devicemotion", handleMotionEvent);
      }
    })
    .catch(console.error);
} else {
  // For devices that do not require permission
  window.addEventListener("devicemotion", handleMotionEvent);
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  const magnitude = Math.sqrt(
    acceleration.x * acceleration.x +
      acceleration.y * acceleration.y +
      acceleration.z * acceleration.z
  );

  // Add the magnitude to the history
  accelerationHistory.push(magnitude);

  // Maintain a fixed-size history
  if (accelerationHistory.length > sampleSize) {
    accelerationHistory.shift();
  }

  // Calculate the variance
  if (accelerationHistory.length === sampleSize) {
    const mean = accelerationHistory.reduce((a, b) => a + b) / sampleSize;
    const variance =
      accelerationHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / sampleSize;

    // Determine if the person is walking based on the variance
    if (variance > threshold) {
      walking = true;
      updateoffsetvalue = 1;
      document.getElementById("walkigStatus").innerText = "staus: Walking";
    } else {
      walking = false;
      updateoffsetvalue = 0;
      document.getElementById("walkigStatus").innerText =
        " status: Not Walking";
    }
  }
}
