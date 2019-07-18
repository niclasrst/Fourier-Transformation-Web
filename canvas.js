// Initial Setup
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// Variables
const USER = 0;
const FOURIER = 1;
const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

let time = 0, state = -1;
let path = [], drawing = [];
let x = [], fourierX = [];

// Event Listeners
addEventListener('mousemove', event => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  if (state == USER) { drawing.push(new Vector(mouse.x - canvas.width / 2, mouse.y - canvas.height / 2)); }
});

addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

addEventListener('mousedown', () => {
  time = 0;
  state = USER;
  drawing = [], path = [], x = [];
});

addEventListener('mouseup', () => {
  state = FOURIER;
  const step = 1;
  for (let i = 0; i < drawing.length; i += step) { x.push(new Complex(drawing[i].x, drawing[i].y)); }

  fourierX = fourierTransform(x);
  fourierX.sort((a, b) => b.amp - a.amp);
});

// Utility Functions
function randomIntFromRange(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); }
function map(val, a, b, c, d) { return c + ((val - a) / (b - a)) * (d - c); }

// Objects
function point(x, y) {
  c.beginPath();
  c.arc(x, y, 5, 0, 2 * Math.PI, true);
  c.fillStyle = '#fff';
  c.fill();
  c.closePath();
}

function line(x1, y1, x2, y2) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.strokeStyle = '#fff';
  c.stroke();
  c.closePath();
}

function circle(x, y, radius) {
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2, false);
  c.strokeStyle = '#fff';
  c.stroke();
  c.closePath();
}

function epiCycles(x, y, rotation, fourier) {
  for (let i = 0; i < fourier.length; i++) {
    let prevx = x;
    let prevy = y;

    let freq = fourier[i].freq;
    let radius = fourier[i].amp;
    let phase = fourier[i].phase;

    // s_hat * cos(omega * t + phi) -> Elongation-Zeit
    x += radius * Math.cos(freq * time + phase + rotation);
    y += radius * Math.sin(freq * time + phase + rotation);

    circle(prevx, prevy, radius);
    line(prevx, prevy, x, y);
  }

  return new Vector(x, y);
}

// Implementation
function init() { state = -1; }

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  c.beginPath();
  c.rect(0, 0, canvas.width, canvas.height);
  c.fillStyle = '#2c3e50';
  c.fill();
  c.closePath();
  
  if (state == USER) {
    for (let v of drawing) {
      point(v.x + canvas.width / 2, v.y + canvas.height / 2);
    }
  } else if (state == FOURIER) {
    let v = epiCycles(canvas.width / 2, canvas.height / 2, 0, fourierX);
    path.unshift(v);

    for (let i = 0; i < path.length; i++) {
      point(path[i].x, path[i].y);
    }

    const dt = (Math.PI * 2) / fourierX.length;
    time += dt;
    if (time > (Math.PI * 2)) { time = 0; path = []; }
  }
}

init();
animate();
