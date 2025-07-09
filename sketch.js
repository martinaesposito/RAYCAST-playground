let b, r, p, c;
let particles = [];
let boundaries = [];
let coolors = [];
let pM = null;

const margin = 25;
const numParticles = 5;

const palette = [
  "#FF1493",
  "#FF4500",
  "#00FA9A",
  "#E6FF00",
  "#1E90FF",
  "#FF8C00",
  "#FFFFFF",
];
let font;
let textPoints = [];

let scaleFactor;
let remapCoords = [];

let prevPinch = null;
let isDragging = false;

///////////////////////////////
function preload() {
  font = loadFont("AVHersheySimplexLight.ttf");
}

function setup() {
  createCanvas((windowWidth / 5) * 4, windowHeight);
  noStroke();

  // genero i boundary
  segmentSettings(document.getElementById("segments-form"));
  if (settings) segmentsBoundaries(settings.settings);

  // genero le palline
  particleGenerate();

  // creo la mano a partire dai risultati di detection
  if (detections.multiHandLandmarks !== undefined) {
    for (const hand of detections.multiHandLandmarks) {
      new Hand(hand);
    }
  }
}

///////////////////////////////

// SEGMENTI
function segmentsBoundaries(settings) {
  if (boundaries.length > 0) boundaries = [];
  console.log(settings);
  //applico la stessa logica dei rays ai boundaries per disegnarli in modo che non si intersechino
  while (boundaries.length < settings.number) {
    let x1 = random(margin, width - margin);
    let y1 = random(margin, height - margin);
    let x2 = random(margin, width - margin);
    let y2 = random(margin, height - margin);
    let candidate = new segmentBoundary(x1, y1, x2, y2);

    let length = dist(x1, y1, x2, y2);
    if (length > settings.max || length < settings.min) continue;

    let intersects = false;
    for (let b of boundaries) {
      if (segmentIntersect(candidate.a, candidate.b, b.a, b.b)) {
        intersects = true;
        break;
      }

      //pusho i bordi della canva
      // boundaries.push(new boundary(0, 0, width, 0));
      // boundaries.push(new boundary(width, 0, width, height));
      // boundaries.push(new boundary(width, height, 0, height));
      // boundaries.push(new boundary(0, height, 0, 0));
    }

    if (!intersects) {
      boundaries.push(candidate);
    }
  }
}

// POLIGONI
function polygonBoundaries(settings) {
  if (boundaries.length > 0) boundaries = []; //se esistono già dei boundaries (es. segments) svuota l'array

  let polygonCount = 0; // Conta i poligoni generati

  while (polygonCount < settings.number) {
    const polygon = generatePolygon(
      floor(random(settings.minVertex, settings.maxVertex)), //vertici
      random(settings.minRadius, settings.maxRadius) //radius
    );
    // Controlla se il poligono si interseca con altri esistenti
    if (polygon && polygon.length > 0) {
      let intersects = false;
      for (let segment of polygon) {
        for (let existingBoundary of boundaries) {
          if (
            segmentIntersect(
              segment.a,
              segment.b,
              existingBoundary.a,
              existingBoundary.b
            )
          ) {
            intersects = true;
            break;
          }
        }
        if (intersects) break;
      }

      if (!intersects) {
        boundaries.push(...polygon);
        polygonCount++; // Incrementa il contatore dei poligoni
      }
    }
  }
}
// singolo poligono
function generatePolygon(numVertices, radius) {
  // centro
  const center = {
    x: random(margin * 2, width - margin * 2),
    y: random(margin * 2, height - margin * 2),
  };
  // vertici
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (TWO_PI / numVertices) * i;
    const x = center.x + cos(angle) * radius * random(0, 2);
    const y = center.y + sin(angle) * radius * random(0, 2);

    // Assicurati che i vertici siano dentro i margini
    if (x < margin || x > width - margin || y < margin || y > height - margin) {
      return null; // Poligono non valido
    }
    vertices.push({ x: x, y: y });
  }
  // segmenti
  const segments = [];
  for (let i = 0; i < vertices.length; i++) {
    const next = vertices[(i + 1) % vertices.length]; // Il modulo assicura che l'ultimo si connetta al primo

    segments.push(
      new segmentBoundary(vertices[i].x, vertices[i].y, next.x, next.y)
    );
  }
  return segments;
}

// TEXT
function textBoundaries(settings) {
  if (boundaries.length > 0) boundaries = [];
  console.log(settings);
  let textBounds = font.textBounds(settings.value, 0, 0, settings.size);

  // Genera i punti del testo
  let textPoints = font.textToPoints(
    settings.value,
    (width - textBounds.w) / 2,
    (height - textBounds.h) / 2 + textBounds.h,
    settings.size,
    {
      sampleFactor: 0.25,
      simplifyThreshold: 0,
    }
  );

  for (let i = 0; i < textPoints.length - 1; i++) {
    let current = textPoints[i];
    let next = textPoints[i + 1];

    let segment = new segmentBoundary(current.x, current.y, next.x, next.y);
    boundaries.push(segment);
  }
}

///////////////////////////////
function particleGenerate() {
  particles = [];
  coolors = [];

  let availableColors = [...palette];

  for (let i = 0; i < numParticles && availableColors.length > 0; i++) {
    const index = floor(random(availableColors.length));
    const c = availableColors.splice(index, 1)[0]; // ogni volta toglie il colore appena assegnato
    coolors.push(c);

    const p = new particle(
      random(margin, width - margin),
      random(margin, height - margin),
      c
    );
    particles.push(p);
  }
}
///////////////////////////////

function draw() {
  // background(0);
  clear();
  push();
  fill(0, 225);
  rect(0, 0, width, height);
  pop();

  for (let b of boundaries) {
    b.show();
  }

  if (pM && mouseIsPressed) {
    //emissione di luce in corrispondenza del mouse
    pM.update(mouseX, mouseY);
  }

  particles.forEach((e) => {
    e.show();
    e.cast(boundaries);
  });

  if (document.getElementById("move-boundaries").checked == true) {
    for (let b of boundaries) {
      b.move(frameCount);
    }
  }

  if (document.getElementById("move-particles").checked == true) {
    for (let p of particles) {
      p.move(frameCount);
    }
  }
  //VIDEO
  if (!showCamera || !videoElement) {
    document.getElementById("capture").classList.add("hidden");
    return;
  } else {
    document.getElementById("capture").classList.remove("hidden");

    const videoMoreHorizontalThanScreen =
      videoElement.videoWidth / videoElement.videoHeight > width / height;

    //calcolo le dimensioni del video proporzionalmente alle dimensioni dello schermo
    videoSize = {
      h: videoMoreHorizontalThanScreen
        ? height
        : (width / videoElement.videoWidth) * videoElement.videoHeight,
      w: videoMoreHorizontalThanScreen
        ? (height / videoElement.videoHeight) * videoElement.videoWidth
        : width,
    };
    scaleFactor =
      videoSize.w / videoSize.h > width / height
        ? height / videoSize.h
        : width / videoSize.w;

    const offsetX = (width - videoSize.w * scaleFactor) / 2;
    const offsetY = (height - videoSize.h * scaleFactor) / 2;

    // handlandmark
    if (detections.multiHandLandmarks !== undefined) {
      for (const hand of detections.multiHandLandmarks) {
        let remapCoords = [];
        let keyPointIndex = 0; //serve per scrivere il testo - il numero di dito
        for (let i = 0; i < hand.length; i++) {
          const x = offsetX + (1 - hand[i].x) * videoSize.w * scaleFactor; //1-x per effetto specchio
          const y = offsetY + hand[i].y * videoSize.h * scaleFactor;

          fill(255);
          ellipse(x, y, 5, 5);

          // testo che identifica il numero di ciascun dito
          // push();
          // fill(175, 100);
          // translate(x, y);
          // scale(-1, 1);
          // text(keyPointIndex, 0, 0);
          // pop();
          keyPointIndex++;
          remapCoords.push({ x: x, y: y });
        }

        const angle = calculateAngle(
          remapCoords[8],
          remapCoords[5],
          remapCoords[4]
        );
        //controllo l'angolo tra pollice (4) e indice(8) per vedere se fanno pinch
        const pinchCenter = {
          x: (remapCoords[4].x + remapCoords[8].x) / 2,
          y: (remapCoords[4].y + remapCoords[8].y) / 2,
        };

        if (
          (angle !== null && angle < 20) || //se l'angolo tra le tre dita è minore di 20°
          dist(
            remapCoords[4].x, //se la distanza tra i due punti è minore di 20 px
            remapCoords[4].y,
            remapCoords[8].x,
            remapCoords[8].y
          ) <= 20
        ) {
          fill(255, 100);
          ellipse(remapCoords[8].x, remapCoords[8].y, 25, 25);
          ellipse(remapCoords[4].x, remapCoords[4].y, 25, 25);

          // Se non stai già trascinando, verifica se il pinch è vicino a una particella
          if (!isDragging) {
            for (let p of particles) {
              if (dist(pinchCenter.x, pinchCenter.y, p.pos.x, p.pos.y) <= 20) {
                pM = p;
                isDragging = true;
                prevPinch = { ...pinchCenter };
                break;
              }
            }
          } else if (pM && prevPinch) {
            const dx = pinchCenter.x - prevPinch.x;
            const dy = pinchCenter.y - prevPinch.y;
            pM.pos.x += dx;
            pM.pos.y += dy;

            prevPinch = { ...pinchCenter };
          }
        } else {
          //se esco dalla posizione di pinch
          isDragging = false;
          prevPinch = null;
        }
      }
    }
  }
}

function mousePressed() {
  if (mouseX < windowWidth * 0.8) {
    for (let p of particles) {
      if (dist(mouseX, mouseY, p.pos.x, p.pos.y) < 20) {
        pM = p;
        return;
      }
    }

    c = random(palette);
    pM = new particle(mouseX, mouseY, c);
    particles.push(pM);
  }
}

//////////////////////////////////////////
// UTILITIES
// Funzione per calcolare se due segmenti si intersecano
function segmentIntersect(a1, a2, b1, b2) {
  let den = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
  if (den === 0) return false;

  let t = ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / den;
  let u = ((a1.x - b1.x) * (a1.y - a2.y) - (a1.y - b1.y) * (a1.x - a2.x)) / den;

  return t > 0 && t < 1 && u > 0 && u < 1;
}

// Funzione per calcolare l'angolo tra tre punti
function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) {
    return null;
  }

  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;

  const dotProduct = dx1 * dx2 + dy1 * dy2; // Prodotto scalare
  const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1); // Modulo del primo vettore
  const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2); // Modulo del secondo vettore

  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  return Math.acos(cosTheta) * (180 / Math.PI); // Converti da radianti a gradi
}
