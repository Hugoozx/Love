// ============================================================
//  CONFIGURACIÓN
// ============================================================
const START_DATE = new Date('2022-11-10T00:00:00');
const MAX_DEPTH = 6;
function isMobile() { return window.innerWidth <= 699; }

// ============================================================
//  CANVAS DE ESTRELLAS + LUNA LLENA
// ============================================================
// ============================================================
//  CANVAS DE ESTRELLAS + LUNA + ESTRELLAS FUGACES MÁGICAS
// ============================================================
const starCanvas = document.getElementById('starCanvas');
const sCtx = starCanvas.getContext('2d');
let stars = [], shootingStars = [];

function resizeStarCanvas() {
    starCanvas.width  = window.innerWidth;
    starCanvas.height = window.innerHeight;
}

function initStars() {
    const count = isMobile() ? 120 : 250;
    stars = [];
    for (let i = 0; i < count; i++) {
        const starSize = Math.random() * 1.8 + 0.4;
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            r: starSize,
            // Factor de profundidad para el brillo
            depthFactor: starSize > 1.4 ? 1.0 : starSize > 0.8 ? 0.6 : 0.3, 
            baseAlpha: Math.random() * 0.6 + 0.2, 
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.008 + 0.002, 
            color: Math.random() < 0.2 ? '#c9a0dc' : Math.random() < 0.25 ? '#f9c88b' : Math.random() < 0.15 ? '#80a8c9' : '#fffaf0',
        });
    }

    shootingStars = [];
    const ssCount = isMobile() ? 3 : 6;
    for (let i = 0; i < ssCount; i++) {
        shootingStars.push(newShootingStar(Math.random() * 8000 + 1000));
    }
}

function newShootingStar(delay = 0) {
    return {
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height * 0.5,
        len: Math.random() * 160 + 80,
        speed: Math.random() * 11 + 6,
        angle: Math.PI / 4 + Math.random() * 0.2,
        life: 0,
        maxLife: Math.random() * 50 + 40, 
        alpha: 0,
        delay,
        thickness: Math.random() * 1.0 + 1.2
    };
}

function drawMoon(time) {
    // Posición por porcentaje para que NO se oculte en móviles
    const px = 0.82; 
    const py = 0.12; 
    const cx = starCanvas.width * px;
    const cy = starCanvas.height * py;
    const R  = isMobile() ? 32 : 50; 

    // Efecto de resplandor (Glow)
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.0008);
    [
        { r: R * 2.8, a: 0.06 + 0.03 * pulse },
        { r: R * 1.9, a: 0.13 + 0.05 * pulse },
        { r: R * 1.3, a: 0.22 + 0.08 * pulse },
    ].forEach(h => {
        const hg = sCtx.createRadialGradient(cx, cy, R * 0.7, cx, cy, h.r);
        hg.addColorStop(0, `rgba(255, 240, 180, ${h.a})`);
        hg.addColorStop(1, 'rgba(255, 240, 180, 0)');
        sCtx.beginPath();
        sCtx.arc(cx, cy, h.r, 0, Math.PI * 2);
        sCtx.fillStyle = hg;
        sCtx.fill();
    });

    // Cuerpo de la Luna
    const moonGrad = sCtx.createRadialGradient(cx - R*0.22, cy - R*0.22, R*0.05, cx, cy, R);
    moonGrad.addColorStop(0, '#fffef0');
    moonGrad.addColorStop(0.3, '#fdf6c8');
    moonGrad.addColorStop(0.7, '#f5d97e');
    moonGrad.addColorStop(1, '#e8c050');
    sCtx.beginPath();
    sCtx.arc(cx, cy, R, 0, Math.PI * 2);
    sCtx.fillStyle = moonGrad;
    sCtx.fill();

    // Cráteres
    const craters = [
        { ox: 0.28, oy:-0.18, r: 0.14 },
        { ox:-0.32, oy: 0.22, r: 0.10 },
        { ox: 0.10, oy: 0.38, r: 0.08 },
        { ox:-0.18, oy:-0.35, r: 0.07 },
    ];
    craters.forEach(c => {
        sCtx.beginPath();
        sCtx.arc(cx + c.ox * R, cy + c.oy * R, c.r * R, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(160, 110, 10, 0.13)';
        sCtx.fill();
    });
}

function drawStars(time) {
    // Cielo nocturno
    const grad = sCtx.createLinearGradient(0, 0, 0, starCanvas.height);
    grad.addColorStop(0, '#06031a');
    grad.addColorStop(0.55, '#0e0826');
    grad.addColorStop(1, '#1a0d30');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);

    drawMoon(time); 

    // Estrellas parpadeantes
    stars.forEach(s => {
        const twinkleFactor = 0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.phase);
        const a = s.baseAlpha * twinkleFactor;

        if (s.depthFactor > 0.8) {
            sCtx.shadowColor = s.color;
            sCtx.shadowBlur = 6 * twinkleFactor; 
        }

        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r * s.depthFactor, 0, Math.PI * 2);
        sCtx.fillStyle = s.color;
        sCtx.globalAlpha = a; 
        sCtx.fill();
        sCtx.globalAlpha = 1;
        sCtx.shadowBlur = 0;
    });

    // Estrellas fugaces
    shootingStars.forEach((ss, idx) => {
        if (ss.delay > 0) {
            ss.delay -= 1;
            return;
        }

        ss.life++;
        const p = ss.life / ss.maxLife;
        ss.alpha = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1; 

        const ex = ss.x + Math.cos(ss.angle) * ss.speed * ss.life;
        const ey = ss.y + Math.sin(ss.angle) * ss.speed * ss.life;
        const tx = ex - Math.cos(ss.angle) * ss.len * p;
        const ty = ey - Math.sin(ss.angle) * ss.len * p;

        const g2 = sCtx.createLinearGradient(tx, ty, ex, ey);
        g2.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g2.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha * 0.9})`);

        sCtx.shadowColor = 'rgba(255, 223, 112, 0.7)';
        sCtx.shadowBlur = 8 * ss.alpha;
        sCtx.beginPath();
        sCtx.moveTo(tx, ty);
        sCtx.lineTo(ex, ey);
        sCtx.strokeStyle = g2;
        sCtx.lineWidth = ss.thickness;
        sCtx.stroke();
        sCtx.shadowBlur = 0;

        if (ss.life >= ss.maxLife) {
            shootingStars[idx] = newShootingStar(Math.random() * 5000 + 2000);
        }
    });
}

// ============================================================
//  CANVAS DEL ÁRBOL
// ============================================================
// ============================================================
//  CANVAS DEL ÁRBOL (REEMPLAZO COMPLETO)
// ============================================================
const treeCanvas = document.getElementById('treeCanvas');
const tCtx = treeCanvas.getContext('2d');

let CANVAS_W, CANVAS_H, TREE_CX, TREE_BASE_Y, CROWN_CY, CROWN_R;
let treeHearts = [];

const HEART_COLORS = [
    '#FF4D6D','#FF758F','#FF8FA3','#FFB3C1',
    '#FF9E00','#FFB700','#C9184A','#A4133C',
    '#FFCCD5','#FFF0F3','#f4a0b5','#c9a0dc',
    '#ff7eb3','#d16ba5','#f06292',
];

function getLayout() {
    const vw = window.innerWidth;
    // Ajustamos la posición (crownOffY) para que la copa no quede muy arriba
    if (vw <= 480) return { cw: 320, ch: 450, crownOffY: 0.35, crownRatio: 0.4 };
    return { cw: 600, ch: 750, crownOffY: 0.32, crownRatio: 0.38 };
}

function setupTreeCanvas() {
    const L = getLayout();
    CANVAS_W = L.cw;
    CANVAS_H = L.ch;
    treeCanvas.width = CANVAS_W;
    treeCanvas.height = CANVAS_H;

    TREE_CX = CANVAS_W * 0.5;
    CROWN_CY = CANVAS_H * L.crownOffY;
    CROWN_R = CANVAS_W * L.crownRatio;
    TREE_BASE_Y = CANVAS_H - 20;

    treeHearts = generateHeartPositions();
}

function heartShape(ctx, cx, cy, size) {
    const s = size;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s);
    ctx.bezierCurveTo(cx - s * 0.08, cy + s * 0.35, cx - s * 1.15, cy - s * 0.05, cx - s, cy - s * 0.65);
    ctx.bezierCurveTo(cx - s * 1.28, cy - s * 1.35, cx - s * 0.18, cy - s * 1.48, cx, cy - s * 0.88);
    ctx.bezierCurveTo(cx + s * 0.18, cy - s * 1.48, cx + s * 1.28, cy - s * 1.35, cx + s, cy - s * 0.65);
    ctx.bezierCurveTo(cx + s * 1.15, cy - s * 0.05, cx + s * 0.08, cy + s * 0.35, cx, cy + s);
    ctx.closePath();
}

function isInsideHeart(x, y, R) {
    const nx = x / R;
    const ny = -y / R;
    return Math.pow(nx*nx + ny*ny - 1, 3) - nx*nx*Math.pow(ny, 3) <= 0;
}

function generateHeartPositions() {
    const positions = [];
    const cx = TREE_CX;
    const cy = CROWN_CY;
    const R = CROWN_R; // Usamos el radio completo

    // --- CORRECCIÓN CLAVE ---
    // Aumentamos el 'step' para espaciar los corazones. Un valor más alto
    // significa MENOS corazones y más espacios vacíos.
    // Estaba en 6, lo subiremos a 15 (o incluso 18 si quieres más espacio)
    const step = isMobile() ? 10 : 11 

    for (let x = -R; x <= R; x += step) {
        for (let y = -R; y <= R; y += step) {
            
            // Detectamos la forma del corazón grande
            if (isInsideHeart(x, y, R * 0.85)) { // Usamos un radio de forma ligeramente menor para que los bordes sean más limpios

                // --- SEGUNDA CORRECCIÓN: ALEATORIEDAD ---
                // Para que no parezca una rejilla perfecta y sea más natural,
                // añadimos un factor de probabilidad de que el corazón se dibuje.
                if (Math.random() > 0.35) { // Un 65% de probabilidad de que aparezca, para crear huecos naturales

                    // Añadimos un offset aleatorio para romper la rejilla
                    const jitterX = (Math.random() - 0.5) * step * 1.2; 
                    const jitterY = (Math.random() - 0.5) * step * 1.2;

                    positions.push({
                        x: cx + x + jitterX,
                        y: cy + y + jitterY,
                        
                        // Hacemos que los corazones individuales sean un poco más grandes 
                        // para compensar que hay menos
                        size: Math.random() * 4 + 7, 
                        
                        color: HEART_COLORS[
                            Math.floor(Math.random() * HEART_COLORS.length)
                        ],
                        
                        rotation: (Math.random() - 0.5) * 0.3, // Más rotación aleatoria
                        delay: Math.random() * 0.6, // Mayor retraso para que aparezcan más orgánicamente
                        opacity: 0,
                        floatPhase: Math.random() * Math.PI * 2,
                        
                        // Añadimos un factor de amplitud de flotación individual mayor
                        floatAmp: Math.random() * 1.2 + 0.3
                    });
                }
            }
        }
    }
    return positions;
}

// ============================================================
//  ÁRBOL LISO Y NATURAL (SIN RAÍCES)
// ============================================================
// Función para dibujar el tronco grueso y liso, y las ramas base.

// 1. REEMPLAZA ESTA FUNCIÓN (Para un tronco limpio sin ramas)
function drawTrunkAndBranches(progress) {
    const bx = TREE_CX;
    const by = TREE_BASE_Y;
    const trunkHeight = (by - CROWN_CY) * 0.8;

    // Ancho del tronco (más recto y elegante)
    const baseWidth = isMobile() ? 14 : 20; 
    const topWidth  = isMobile() ? 10 : 16;

    const grow = Math.min(1, progress * 1.2);
    const topY = by - trunkHeight * grow;

    const grad = tCtx.createLinearGradient(bx - baseWidth, 0, bx + baseWidth, 0);
    grad.addColorStop(0, "#1a0a05");
    grad.addColorStop(0.5, "#4a2514");
    grad.addColorStop(1, "#1a0a05");

    tCtx.beginPath();
    // Base recta (sin raíces)
    tCtx.moveTo(bx - baseWidth, by);
    // Subida suave
    tCtx.quadraticCurveTo(bx - topWidth, by - trunkHeight * 0.5, bx - topWidth, topY);
    // Cima del tronco
    tCtx.lineTo(bx + topWidth, topY);
    // Bajada suave
    tCtx.quadraticCurveTo(bx + topWidth, by - trunkHeight * 0.5, bx + baseWidth, by);
    
    tCtx.closePath();
    tCtx.fillStyle = grad;
    tCtx.fill();

    // HEMOS ELIMINADO TODAS LAS LLAMADAS A drawOrganicBranch AQUÍ
}

function drawTreeHearts(progress, time) {
    treeHearts.forEach(h => {
        const localP = Math.min(1, Math.max(0, progress - h.delay) * 1.5);
        if (localP <= 0) return;

        const bounce = Math.sin(time * 0.002 + h.floatPhase) * 2;
        
        tCtx.save();
        tCtx.translate(h.x, h.y + bounce);
        tCtx.rotate(h.rotation);
        tCtx.globalAlpha = localP;
        
        heartShape(tCtx, 0, 0, h.size * localP);
        tCtx.fillStyle = h.color;
        tCtx.fill();
        tCtx.restore();
    });
}
// ============================================================
//  ÁRBOL ORGÁNICO
// ============================================================
// Función para dibujar el tronco grueso con raíces y lanzar las ramas
// ============================================================
//  ÁRBOL ORGÁNICO
// ============================================================
// Función para dibujar el tronco grueso (ahora sin raíces y más natural) y lanzar las ramas
function drawTrunkAndBranches(progress) {
            const bx = TREE_CX;
            const by = TREE_BASE_Y;

            const trunkHeight = (by - CROWN_CY) * 0.75;

            // Ajustamos el grosor para un tronco más elegante y recto
            const baseWidth = isMobile() ? 18 : 28;
            const topWidth  = isMobile() ? 12 : 18;

            const grow = Math.min(1, progress * 1.25);
            const topY = by - trunkHeight * grow;

            const grad = tCtx.createLinearGradient(bx - baseWidth, 0, bx + baseWidth, 0);
            grad.addColorStop(0, "#1a0a05");
            grad.addColorStop(0.5, "#4a2514");
            grad.addColorStop(1, "#1a0a05");

            tCtx.beginPath();

            // Base izquierda recta, sin expansiones
            tCtx.moveTo(bx - baseWidth, by);

            // Curva suave hacia arriba (lado izquierdo) - crea una textura ligeramente orgánica
            tCtx.quadraticCurveTo(
                bx - topWidth * 0.6, by - (trunkHeight * grow) * 0.5,
                bx - topWidth, topY
            );

            // Parte superior del tronco
            tCtx.lineTo(bx + topWidth, topY);

            // Curva suave hacia abajo (lado derecho)
            tCtx.quadraticCurveTo(
                bx + topWidth * 0.6, by - (trunkHeight * grow) * 0.5,
                bx + baseWidth, by
            );

            tCtx.closePath();
            tCtx.fillStyle = grad;
            tCtx.fill();

  // --------------------------------------------------------
  // LA LÓGICA DE LAS RAMAS SE MANTIENE INTACTA
  // --------------------------------------------------------
 if(progress > 0.55){
                const p = (progress - 0.55) / 0.45;

                drawOrganicBranch(
                    bx, topY, -Math.PI/2,
                    trunkHeight*0.55, topWidth*0.9, MAX_DEPTH, p, 1
                );

                drawOrganicBranch(
                    bx, topY, -Math.PI/2 - 0.5,
                    trunkHeight*0.5, topWidth*0.7, MAX_DEPTH, p, 2
                );

                drawOrganicBranch(
                    bx, topY, -Math.PI/2 + 0.5,
                    trunkHeight*0.5, topWidth*0.7, MAX_DEPTH, p, 3
                );
            }
        }

// Las ramas que se dividen solas
function drawOrganicBranch(x,y,angle,length,width,depth,progress,seed){



}
// ============================================================
//  DIBUJO DE LOS CORAZONES (LA COPA DEL ÁRBOL)
// ============================================================
function drawTreeHearts(progress, time) {
    // Si no hay corazones generados, no hace nada
    if (!treeHearts || treeHearts.length === 0) return;

    treeHearts.forEach(h => {
        // Controlamos la aparición individual de cada corazón con su propio delay
        const localP = Math.min(1, Math.max(0, progress - h.delay) * 1.5);
        
        if (localP > 0) {
            // Efecto de flotación suave (latido)
            const wobble = Math.sin(time * 0.002 + h.floatPhase) * 2;
            const scale = localP * (1 + Math.sin(time * 0.003 + h.floatPhase) * 0.05);

            tCtx.save();
            // Posicionamos el corazón
            tCtx.translate(h.x, h.y + wobble);
            tCtx.rotate(h.rotation);
            
            // Aplicamos transparencia según el progreso
            tCtx.globalAlpha = localP;
            
            // Dibujamos la forma del corazón
            heartShape(tCtx, 0, 0, h.size * scale);
            
            // Color y relleno
            tCtx.fillStyle = h.color;
            
            // Un pequeño brillo para que resalten más
            tCtx.shadowColor = h.color;
            tCtx.shadowBlur = 4 * localP;
            
            tCtx.fill();
            tCtx.restore();
        }
    });
}

// ============================================================
//  MARIPOSAS
// ============================================================
let butterflies = [];
const BF_COLORS = ['#FFB3C1','#f4a0b5','#c9a0dc','#f9c88b','#FF8FA3','#ffccd5'];

function initButterflies() {
  butterflies = [];
  const count = isMobile() ? 4 : 7;
  for (let i = 0; i < count; i++) {
    butterflies.push({
      angle:        Math.random() * Math.PI * 2,
      radiusFactor: 1.08 + Math.random() * 0.38,
      speed:        0.006 + Math.random() * 0.011,
      yOff:         (Math.random()-0.5) * CROWN_R * 0.5,
      size:         (isMobile() ? 8 : 12) + Math.random() * (isMobile() ? 5 : 8),
      phase:        Math.random() * Math.PI * 2,
      color:        BF_COLORS[Math.floor(Math.random() * BF_COLORS.length)],
    });
  }
}

// ============================================================
//  DIBUJO DE LAS MARIPOSAS (VERSIÓN DETALLADA Y COMPLEJA)
// ============================================================
function drawButterflies(time) {
    if (!butterflies || butterflies.length === 0) return;

    butterflies.forEach(b => {
        b.angle += b.speed;
        const x = TREE_CX + Math.cos(b.angle) * CROWN_R * b.radiusFactor;
        const y = CROWN_CY + b.yOff + Math.sin(time * 0.003 + b.phase) * (CROWN_R * 0.13);
        const wf = Math.sin(time * 0.01 + b.phase); // Factor de aleteo individual

        tCtx.save();
        tCtx.translate(x, y);
        tCtx.rotate(b.angle + Math.PI / 2);

        // --- CUERPO DETALLADO ---
        tCtx.fillStyle = '#3a1a1a';
        tCtx.beginPath();
        tCtx.ellipse(0, 0, 1.2, b.size * 0.46, 0, 0, Math.PI * 2);
        tCtx.fill();

        // --- ANTENAS DETALLADAS ---
        tCtx.strokeStyle = '#2a1212';
        tCtx.lineWidth = 0.5;
        tCtx.beginPath();
        tCtx.moveTo(0, -b.size * 0.4);
        tCtx.lineTo(-2, -b.size * 0.7);
        tCtx.moveTo(0, -b.size * 0.4);
        tCtx.lineTo(2, -b.size * 0.7);
        tCtx.stroke();

        // --- ALAS INTRINCADAS CON PATRONES ---
        // Aplicamos transparencia y brillo
        tCtx.globalAlpha = 0.9;
        tCtx.shadowColor = 'rgba(255, 223, 112, 0.7)'; // Brillo dorado suave
        tCtx.shadowBlur = 6 * (1 + 0.3 * Math.sin(time * 0.005 + b.phase));

        // Para crear un patrón intrincado, dibujamos la forma del ala y luego una textura
        [[ -1, -0.28, 0.50 ], [ 1, -0.28, -0.50 ]].forEach(([ sx, sy, rot ]) => {
            // Forma base del ala superior
            tCtx.beginPath();
            tCtx.fillStyle = b.color;
            tCtx.ellipse(b.size * 0.40 * Math.abs(wf) * sx, b.size * sy, b.size * 0.47, b.size * 0.66, rot, 0, Math.PI * 2);
            tCtx.fill();

            // Patrón intrincado (micro venas)
            tCtx.strokeStyle = 'rgba(20, 10, 5, 0.2)';
            tCtx.lineWidth = 0.3;
            tCtx.beginPath();
            const patternScale = b.size * 0.3;
            for (let i = -2; i <= 2; i++) {
                tCtx.moveTo(b.size * 0.40 * Math.abs(wf) * sx + i * 1, b.size * sy - patternScale);
                tCtx.lineTo(b.size * 0.40 * Math.abs(wf) * sx - i * 1, b.size * sy + patternScale);
            }
            tCtx.stroke();
        });

        [[ -1, 0.20, 0.80 ], [ 1, 0.20, -0.80 ]].forEach(([ sx, sy, rot ]) => {
            // Forma base del ala inferior
            tCtx.beginPath();
            tCtx.fillStyle = b.color;
            tCtx.ellipse(b.size * 0.30 * Math.abs(wf) * sx, b.size * sy, b.size * 0.36, b.size * 0.46, rot, 0, Math.PI * 2);
            tCtx.fill();

            // Patrón intrincado
            tCtx.strokeStyle = 'rgba(20, 10, 5, 0.2)';
            tCtx.lineWidth = 0.3;
            tCtx.beginPath();
            const patternScale = b.size * 0.25;
            for (let i = -1.5; i <= 1.5; i++) {
                tCtx.moveTo(b.size * 0.30 * Math.abs(wf) * sx + i * 0.8, b.size * sy - patternScale);
                tCtx.lineTo(b.size * 0.30 * Math.abs(wf) * sx - i * 0.8, b.size * sy + patternScale);
            }
            tCtx.stroke();
        });

        // Limpieza de estados
        tCtx.shadowBlur = 0;
        tCtx.globalAlpha = 1;
        tCtx.restore();
    });
}

// ============================================================
//  LOOP PRINCIPAL
// ============================================================
let animStartTime = null;
const GROW_DURATION  = 4000;
const HEART_DELAY    = 3200;
const HEART_DURATION = 4500;

function animate(timestamp) {
  if (!animStartTime) animStartTime = timestamp;
  const elapsed = timestamp - animStartTime;

  // 1. Limpiar lienzos
  sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  tCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // 2. Dibujar fondo
  drawStars(timestamp); 

  // 3. ¡AQUÍ ESTABA EL ERROR! Dibujamos el tronco grueso primero
  const trunkProgress = Math.min(1, elapsed / GROW_DURATION);
  
  // Llamamos a la función que hace el tronco robusto y luego lanza las ramas
  drawTrunkAndBranches(trunkProgress);

  // 4. Dibujar corazones y mariposas
  const heartP = Math.min(1, Math.max(0, elapsed - HEART_DELAY) / HEART_DURATION);
  drawTreeHearts(heartP, timestamp);

  if (trunkProgress > 0.45) drawButterflies(timestamp);

  requestAnimationFrame(animate);
}

// ============================================================
//  INTERACCIONES Y CONTADOR
// ============================================================
function updateCounter() {
  const diff = new Date() - START_DATE;
  const s = Math.floor(diff / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  document.getElementById('counter').textContent = `${d} días, ${h%24}h, ${m%60}m y ${s%60}s`;
}
setInterval(updateCounter, 1000);
updateCounter();

const burstContainer = document.getElementById('heartBurst');
const MIS_FRASES = [
  'Eres mi hogar en cualquier parte 🏠', 'La casualidad más bonita de mi vida 🍀',
  'Mi persona favorita para no hacer nada 🍵', 'Contigo todo vale la pena 💫',
  'Siempre a tu lado ✨', 'Preciosa como una estrella 🌟', 'Amo que seas tú 💖',
  'Cada momento a tu lado es mi favorito 📸', 'Tus ojos brillan más que las estrellas ✨',
  'Mi 11:11 ✨', 'Eres mi lugar feliz 🏡', 'Mi sueño hecho realidad 🌈',
  'Mi persona favorita 💖', 'Tú, solo tú 📍',
];

function spawnHearts(x, y) {
  const frase = MIS_FRASES[Math.floor(Math.random() * MIS_FRASES.length)];
  const el    = document.createElement('div');
  el.className = 'burst-heart';
  el.textContent = frase;
  Object.assign(el.style, {
    position: 'fixed', whiteSpace: 'nowrap',
    color: '#FFB3C1', fontWeight: 'bold',
    fontSize: isMobile() ? '0.88rem' : '1.08rem',
    textShadow: '0 0 8px rgba(255,255,255,0.8)',
    pointerEvents: 'none', zIndex: '100',
    left: x + 'px', top: y + 'px',
    fontFamily: "'Lato', sans-serif",
  });
  const angle = Math.PI + Math.random() * Math.PI;
  const dist  = isMobile() ? 65 + Math.random()*40 : 95 + Math.random()*55;
  el.style.setProperty('--tx', Math.cos(angle)*dist + 'px');
  el.style.setProperty('--ty', Math.sin(angle)*dist - 48 + 'px');
  el.style.setProperty('--rot', (Math.random()*18 - 9) + 'deg');
  burstContainer.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

document.addEventListener('click', e => {
  if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
  spawnHearts(e.clientX, e.clientY);
});
document.addEventListener('touchstart', e => {
  spawnHearts(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// ============================================================
//  MÁQUINA DE ESCRIBIR
// ============================================================
const fraseEspecial =
  'Para la niña más bonita...\n\n' +
  'No se trata solo de los días que han pasado,\n' +
  'sino de cada momento que hemos construido.\n' +
  'Eres mi lugar seguro y mi casualidad más linda.\n' +
  'y que terminó significando más de lo que imaginé.\n' +
  'Te quiero hoy, te querré mañana y seguiré queriéndote en cada día.\n' +
  'porque lo que siento por ti no es algo pasajero,\n' +
  'es algo que nace del corazón y crece cada vez que pienso en ti. ✨\n' ;
let indiceLetra = 0;
function escribirTexto() {
  const el = document.getElementById('texto-animado');
  if (!el || indiceLetra >= fraseEspecial.length) return;
  el.textContent += fraseEspecial.charAt(indiceLetra++);
  setTimeout(escribirTexto, 58);
}

// ============================================================
//  RESIZE & ARRANQUE
// ============================================================
let resizeTimer;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeStarCanvas();
    initStars();
    setupTreeCanvas();
    initButterflies();
  }, 130);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

resizeStarCanvas();
initStars();
setupTreeCanvas();
initButterflies();
requestAnimationFrame(animate);

window.addEventListener('load', () => {
  setTimeout(escribirTexto, 1200);
});