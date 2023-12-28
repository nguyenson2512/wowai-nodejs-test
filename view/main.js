const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const ctxo = overlay.getContext("2d");

// Style
ctx.strokeStyle = "red";
ctx.lineWidth = 2;
ctxo.strokeStyle = "red";
ctxo.lineWidth = 2;

// Canvas position and dimensions
const canvasRect = canvas.getBoundingClientRect();
const offsetX = canvasRect.left;
const offsetY = canvasRect.top;

// Flags and variables for drawing
let isDrawing = false;
let startX, startY;
let prevStartX = 0,
  prevStartY = 0;
let prevWidth = 0,
  prevHeight = 0;

function handleMouseDown(e) {
  e.preventDefault();
  e.stopPropagation();

  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
  isDrawing = true;
}

function handleMouseUp(e) {
  e.preventDefault();
  e.stopPropagation();

  isDrawing = false;
  ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);

  fetch("http://localhost:3000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      x1: prevStartX,
      y1: prevStartY,
      x2: prevStartX + prevHeight,
      y2: prevStartY + prevWidth,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}

function handleMouseOut(e) {
  e.preventDefault();
  e.stopPropagation();

  isDrawing = false;
}

function handleMouseMove(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!isDrawing) return;

  const mouseX = e.clientX - offsetX;
  const mouseY = e.clientY - offsetY;

  const width = mouseX - startX;
  const height = mouseY - startY;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(startX, startY, width, height);

  prevStartX = startX;
  prevStartY = startY;
  prevWidth = width;
  prevHeight = height;
}

//events
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mouseout", handleMouseOut);
