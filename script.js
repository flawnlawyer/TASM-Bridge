const canvas = document.getElementById('web-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let cars = [];
let buildings = [];
let waterOffset = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
}

window.addEventListener('resize', resize);

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 1.5 + 0.5;
        this.density = (Math.random() * 30) + 1;
        this.phase = Math.random() * Math.PI * 2;
        this.hasThread = Math.random() > 0.7;
        this.threadLength = Math.random() * 20 + 5;
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        if (this.hasThread) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const sway = Math.sin(Date.now() * 0.002 + this.phase) * 2;
            ctx.lineTo(this.x + sway, this.y + this.threadLength);
            ctx.stroke();
        }
    }

    update() {
        this.x = this.baseX + Math.sin(Date.now() * 0.001 + this.phase) * 0.3;
        this.y = this.baseY + Math.cos(Date.now() * 0.0015 + this.phase) * 0.3;
    }
}

class Car {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height * 0.6;
        this.speed = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
        this.size = Math.random() * 3 + 2;
        if (width < 600) this.size *= 0.6;

        if (this.speed > 0) this.color = '#ffeb3b';
        else this.color = '#ff5252';
    }

    update() {
        this.x += this.speed;
        if (this.x > width + 10 || this.x < -10) {
            this.reset();
            if (this.speed > 0) this.x = -10;
            else this.x = width + 10;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y - 2, this.size * 2, this.size);
        ctx.shadowBlur = 0;
    }
}

class Building {
    constructor(x, w, h) {
        this.x = x;
        this.w = w;
        this.h = h;
        this.windows = [];
        const rows = Math.floor(h / 15);
        const cols = Math.floor(w / 10);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() > 0.7) {
                    this.windows.push({
                        x: x + c * 10 + 2,
                        y: (height * 0.85 - h) + r * 15 + 5,
                        on: Math.random() > 0.5,
                        flickerRate: Math.random() * 0.05
                    });
                }
            }
        }
    }

    draw() {
        const waterLevel = height * 0.85;
        ctx.fillStyle = '#121212';
        ctx.fillRect(this.x, waterLevel - this.h, this.w, this.h);

        ctx.fillStyle = '#fdf5e6';
        for (let win of this.windows) {
            if (Math.random() < win.flickerRate) win.on = !win.on;
            if (win.on) {
                ctx.globalAlpha = 0.6;
                ctx.fillRect(win.x, win.y, 4, 8);
                ctx.globalAlpha = 1.0;
            }
        }
    }
}

function init() {
    particles = [];
    cars = [];
    buildings = [];

    let currentX = 0;
    while (currentX < width) {
        const buildingWidth = 20 + Math.random() * 60;
        const buildingHeight = 50 + Math.random() * 150;
        buildings.push(new Building(currentX, buildingWidth, buildingHeight));
        currentX += buildingWidth - 5;
    }

    for (let i = 0; i < 20; i++) {
        cars.push(new Car());
    }

    const offCanvas = document.createElement('canvas');
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');

    let fontSize = Math.min(width, height) * 0.15;
    if (width < 600) fontSize = width * 0.2;

    offCtx.font = `bold ${fontSize}px "Times New Roman", serif`;
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    offCtx.save();
    offCtx.translate(width / 2, height * 0.45);
    offCtx.fillText('I LOVE YOU', 0, 0);
    offCtx.restore();

    const textData = offCtx.getImageData(0, 0, width, height);

    const step = width < 600 ? 5 : 4;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;
            const alpha = textData.data[index + 3];

            if (alpha > 128) {
                const posX = x + (Math.random() - 0.5) * 2;
                const posY = y + (Math.random() - 0.5) * 2;
                particles.push(new Particle(posX, posY));
            }
        }
    }
}

function drawBridge() {
    const silhouetteColor = '#1a1a1a';
    const cableColor = '#2a2a2a';
    const deckY = height * 0.6;

    let towerWidth = width * 0.08;
    let towerX1 = width * 0.2;
    let towerX2 = width * 0.8;

    if (width < 600) {
        towerWidth = width * 0.12;
        towerX1 = width * 0.1;
        towerX2 = width * 0.9;
    }

    const towerTop = height * 0.2;
    const waterLevel = height * 0.85;

    ctx.fillStyle = silhouetteColor;
    ctx.fillRect(towerX1 - towerWidth / 2, towerTop, towerWidth, waterLevel - towerTop);
    ctx.fillRect(towerX2 - towerWidth / 2, towerTop, towerWidth, waterLevel - towerTop);

    ctx.fillStyle = '#2b1055';
    ctx.fillRect(towerX1 - towerWidth / 4, deckY - 50, towerWidth / 2, 40);
    ctx.beginPath(); ctx.arc(towerX1, deckY - 50, towerWidth / 4, Math.PI, 0); ctx.fill();
    ctx.fillRect(towerX2 - towerWidth / 4, deckY - 50, towerWidth / 2, 40);
    ctx.beginPath(); ctx.arc(towerX2, deckY - 50, towerWidth / 4, Math.PI, 0); ctx.fill();

    ctx.strokeStyle = silhouetteColor;
    ctx.lineWidth = width < 600 ? 6 : 10;
    ctx.beginPath();
    ctx.moveTo(0, deckY);
    ctx.lineTo(width, deckY);
    ctx.stroke();

    ctx.strokeStyle = cableColor;
    ctx.lineWidth = width < 600 ? 2 : 3;
    ctx.beginPath();
    ctx.moveTo(0, deckY - 50);
    ctx.quadraticCurveTo(towerX1 / 2, deckY - 20, towerX1, towerTop);
    ctx.moveTo(towerX1, towerTop);
    ctx.quadraticCurveTo(width / 2, deckY + 50, towerX2, towerTop);
    ctx.moveTo(towerX2, towerTop);
    ctx.quadraticCurveTo(width - (width - towerX2) / 2, deckY - 20, width, deckY - 50);
    ctx.stroke();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.6)';

    const h = width / 2;
    const k = deckY + 50;
    const a = (towerTop - k) / Math.pow(towerX1 - h, 2);

    const suspenderStep = width < 600 ? 12 : 8;
    for (let x = towerX1 + 10; x < towerX2; x += suspenderStep) {
        const y = a * Math.pow(x - h, 2) + k;
        ctx.beginPath();
        ctx.moveTo(x, deckY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function drawWater() {
    const waterLevel = height * 0.85;
    const gradient = ctx.createLinearGradient(0, waterLevel, 0, height);
    gradient.addColorStop(0, '#0f1526');
    gradient.addColorStop(1, '#05070a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, waterLevel, width, height - waterLevel);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    waterOffset += 0.02;

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
            const y = waterLevel + 10 + i * 15 + Math.sin(x * 0.01 + waterOffset + i) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    drawWater();

    for (let b of buildings) b.draw();

    drawBridge();

    for (let car of cars) {
        car.update();
        car.draw();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    ctx.beginPath();
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let connections = 0;

        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 15) {
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                connections++;
            }
            if (connections > 3) break;
            if (Math.abs(dy) > 20) break;
        }
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    const deckY = height * 0.6;

    let towerWidth = width * 0.08;
    let towerX1 = width * 0.2;
    if (width < 600) {
        towerWidth = width * 0.12;
        towerX1 = width * 0.1;
    }
    const towerTop = height * 0.2;
    const h = width / 2;
    const k = deckY + 50;
    const a = (towerTop - k) / Math.pow(towerX1 - h, 2);

    for (let i = 0; i < particles.length; i++) {
        if (Math.random() > 0.99) {
            const p = particles[i];
            const cableY = a * Math.pow(p.x - h, 2) + k;
            if (p.y > cableY) {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, cableY);
            }
        }
    }
    ctx.stroke();

    requestAnimationFrame(animate);
}

resize();
animate();
