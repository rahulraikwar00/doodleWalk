const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight - 300;

let drawing = false;
let offsetX = 0;
let offsetY = 0;
let rotatingAngle = 0;
let updateoffsetvalue = 0;
let drawings = [];
let walking = false;
const accelerationHistory = [];
const sampleSize = 50;
let walkingThreshold = 0.0;
let jumpThreshold = 15;
let initialVelocity = 0;
let timestamp = Date.now();

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const deviceDetails = document.getElementById("device-details");
const permissionStatus = document.getElementById("permission-status"); // New element
const walkigStatus = document.getElementById("walkigStatus");
const tresholdValue = document.getElementById("tresholdValue");
const startButton = document.getElementById("startButton");
const clearCanvas = document.getElementById("clearCanvas");
const deviceVelocity = document.getElementById("velocity");
const updateoffset = document.getElementById("updateoffsetvalue");
const jumpcount = document.getElementById("jumpcount");

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
  ctx.fillStyle = "green";
  ctx.restore();
}

// Function to handle drawing
function draw() {
  const dx = 0;
  const dy = updateoffsetvalue;
  const { mag, dir } = toPolar(dx, dy);
  const { x, y } = polatToXy(mag, dir - rotatingAngle * (Math.PI / 180));
  offsetX += x;
  offsetY += y;
  if (drawing) {
    drawings.push({ dx: offsetX, dy: offsetY });
  }
  if (drawings.length > 300) {
    drawings.shift();
  }
  ctx.moveTo(centerX - offsetX, centerY - offsetY);
}

// Function to redraw the canvas
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.translate(centerX - offsetX, centerY - offsetY);
  ctx.rotate(rotatingAngle * (Math.PI / 180));
  ctx.save();
  ctx.restore();
  ctx.translate(-centerX + offsetX, -centerY + offsetY);

  drawTriangle(20);
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

// Function to handle device orientation events
function handleOrientation(event) {
  rotatingAngle = event.alpha;
  deviceDetails.innerText =
    `Device: ${rotatingAngle > 0 ? rotatingAngle.toFixed(2) : rotatingAngle}°` +
    `${drawings.length}`;
  // canvas.style.transform = `rotate(${rotatingAngle}deg)`;
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

tresholdValue.textContent = "walkingThreshold: " + walkingThreshold.toFixed(1);
tresholdValue.addEventListener("click", () => {
  walkingThreshold += 0.1;
  tresholdValue.textContent =
    "walkingThreshold: " + walkingThreshold.toFixed(1);
});

startButton.addEventListener("click", () => {
  drawing = !drawing;
  if (drawing) {
    startButton.innerText = "Stop"; // Change startButton text to "Stop"
  } else {
    updateoffsetvalue = 0; // Reset offset value
    startButton.innerText = "Start"; // Change startButton text to "Start"
  }
});

clearCanvas.addEventListener("click", () => {
  // empty the array
  drawings.length = 0;
  offsetX = 0;
  offsetY = 0;
  rotatingAngle = 0;
  updateoffsetvalue = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  walking = false;
  drawing = false;
  walkigStatus.innerText = "status: Not Walking";
  startButton.innerText = "Start";

  console.log("canvas cleared");
  console.table(drawings, offsetX, offsetY, rotatingAngle, updateoffsetvalue);
});

animate();

setInterval(() => {
  draw();
}, 20);

// Function to animate the drawing
function animate() {
  redraw();
  requestAnimationFrame(animate);
}

// Function to handle device motion events
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
    if (variance > walkingThreshold) {
      walking = true;
      // updateoffsetvalue = 1;
      walkigStatus.innerText = "staus: Walking";
    } else {
      walking = false;
      // updateoffsetvalue = 0;
      walkigStatus.innerText = " status: Not Walking";
    }
  }
}

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

// ######################################################
// ######################################################
// ######################################################
// ######################################################
// ######################################################
let accelerationDataFrame = [];
let jumpCount = 0;
window.addEventListener("devicemotion", (event) => {
  const acceleration = event.acceleration;
  const magnitude = Math.sqrt(
    acceleration.x * acceleration.x + acceleration.y * acceleration.y
    // acceleration.z * acceleration.z
  );
  const timeDiff = Date.now() - timestamp;
  accelerationDataFrame.push(acceleration.z);
  if (timeDiff > 400) {
    let acceleration = event.accelerationIncludingGravity;

    if (acceleration.z > jumpThreshold) {
      jumpCount++;
      jumpcount.innerText = `Jumps: ${jumpCount}`;
    }
    timestamp = Date.now();
    currtVelocity = (magnitude * 100) / timeDiff + initialVelocity;
    initialVelocity = currtVelocity - initialVelocity;

    updateoffsetvalue = 0.7 * currtVelocity;
    updateoffset.innerText = `Offset: ${updateoffsetvalue.toFixed(2)}`;
    deviceVelocity.innerText = `Velocity: ${currtVelocity.toFixed(2)} m/s`;
  }
});
