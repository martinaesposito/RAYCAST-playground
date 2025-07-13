let boundaries = [];
let particles = [];

const margin = 25; //area within which both particles and boundaries will have to stay
const numParticles = 6; //inital number of particles

let font; // text

// video and finger point coordinates
let scaleFactor;
let remapCoords = [];

let pM; //selected particle
let prevPinch;
let isDragging = false; //variable that checks if that particle is being dragged

let raysBuffer; //p5 graphics to optimize rendering performance

// video
let cachedVideoSize = null,
  cachedScaleFactor = null;
let lastVideoWidth = 0,
  lastVideoHeight = 0;

///////////////////////////////
function preload() {
  font = loadFont("AVHersheySimplexLight.ttf"); //text
}

///////////////////////////////
function setup() {
  createCanvas(windowWidth * 0.8, windowHeight);
  noStroke();

  multicoloredSettings(document.getElementById("multicolored-form")); // pick the color values
  segmentSettings(document.getElementById("segments-form")); // generte boundaries

  if (settings) {
    segmentsBoundaries(settings.settings);
    particleGenerate();
  }

  // if hand exists
  if (detections.multiHandLandmarks !== undefined) {
    for (const hand of detections.multiHandLandmarks) {
      new Hand(hand);
    }
  }

  raysBuffer = createGraphics(width, height);
  raysBuffer.blendMode(ADD); // solo qui
}

///////////////////////////////

// SEGMENTS
function segmentsBoundaries(settings) {
  //apply the same logic as rays to boundaries to draw them so that they do not intersect
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
    }

    if (!intersects) {
      boundaries.push(candidate);
    }
  }
}

// POLIGONS
function polygonBoundaries(settings) {
  let polygonCount = 0; // num of generated poligons

  while (polygonCount < settings.number) {
    const polygon = generatePolygon(
      floor(random(settings.minVertex, settings.maxVertex)), //vertici
      random(settings.minRadius, settings.maxRadius) //radius
    );
    // checks if poligons intersects some others
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
// single poligon
function generatePolygon(numVertices, radius) {
  // center
  const center = {
    x: random(margin * 2, width - margin * 2),
    y: random(margin * 2, height - margin * 2),
  };
  // vertices
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (TWO_PI / numVertices) * i;
    const x = center.x + cos(angle) * radius * random(0, 2);
    const y = center.y + sin(angle) * radius * random(0, 2);
    // check if vertices are within the margins
    if (x < margin || x > width - margin || y < margin || y > height - margin) {
      return null;
    }
    vertices.push({ x: x, y: y });
  }
  // segments
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
  let textBounds = font.textBounds(settings.value, 0, 0, settings.size);

  let textPoints = font.textToPoints(
    settings.value,
    (width - textBounds.w) / 2,
    height / 2 + textBounds.h / 3,
    settings.size,
    {
      sampleFactor: 0.25,
    }
  );
  // similar logic to poligons
  for (let i = 0; i < textPoints.length - 1; i++) {
    let current = textPoints[i];
    let next = textPoints[i + 1];
    let d = dist(current.x, current.y, next.x, next.y);

    if (d > 15) continue; //if the distance between to points is more than 15 do not draw (trick to separate letters!)

    let segment = new segmentBoundary(current.x, current.y, next.x, next.y);
    boundaries.push(segment);
  }
}

///////////////////////////////
function particleGenerate() {
  particles = [];

  if (settings.colors.mode === "monochrome") {
    for (let i = 0; i < numParticles; i++) {
      const p = new particle(
        random(margin, width - margin),
        random(margin, height - margin),
        settings.colors.particles
      );
      particles.push(p);
    }
  } else {
    let availableColors = [...settings.colors.palette];

    for (let i = 0; i < numParticles && availableColors.length > 0; i++) {
      const index = floor(random(availableColors.length));
      const c = availableColors.splice(index, 1)[0];

      const p = new particle(
        random(margin, width - margin),
        random(margin, height - margin),
        c
      );
      particles.push(p);
    }
  }
}
///////////////////////////////

function draw() {
  background(settings.colors.background || 0);
  raysBuffer.clear();

  //VIDEO and HAND LANDMARK
  handleVideoInput();

  // BOUNDARIES
  for (let b of boundaries) {
    b.show();
  }

  // PARTICLES
  // particle following the mouse - until it's released
  if (pM && mouseIsPressed && mouseX < windowWidth * 0.8) {
    pM.update(mouseX, mouseY);
  }

  particles.forEach((p) => {
    p.cast(boundaries, raysBuffer);
    p.show();

    if (
      dist(mouseX, mouseY, p.pos.x, p.pos.y) < 25 ||
      (isDragging && p === pM)
    ) {
      p.highlight(); // select highlight
    }
  });

  // MOVE METHODS
  if (document.getElementById("move-boundaries").checked == true) {
    for (let b of boundaries) {
      b.move(frameCount);
    }
  }
  //move the particle only if it isn't pinched
  if (document.getElementById("move-particles").checked == true) {
    for (let p of particles) {
      if (isDragging && p === pM) continue;
      p.move(frameCount);
    }
  }

  // RAYS BUFFER
  image(raysBuffer, 0, 0);
}

//////////////

// VIDEO
function handleVideoInput() {
  if (!showCamera || !videoElement) {
    document.getElementById("capture").classList.add("hidden");
    return;
  }

  // update only if videosize varies
  if (
    videoElement.videoWidth !== lastVideoWidth ||
    videoElement.videoHeight !== lastVideoHeight
  ) {
    lastVideoWidth = videoElement.videoWidth;
    lastVideoHeight = videoElement.videoHeight;

    const videoMoreHorizontalThanScreen =
      videoElement.videoWidth / videoElement.videoHeight > width / height;

    cachedVideoSize = {
      h: videoMoreHorizontalThanScreen
        ? height
        : (width / videoElement.videoWidth) * videoElement.videoHeight,
      w: videoMoreHorizontalThanScreen
        ? (height / videoElement.videoHeight) * videoElement.videoWidth
        : width,
    };

    cachedScaleFactor =
      cachedVideoSize.w / cachedVideoSize.h > width / height
        ? height / cachedVideoSize.h
        : width / cachedVideoSize.w;
  }

  // HANDLANDMARK
  if (detections.multiHandLandmarks !== undefined) {
    for (const hand of detections.multiHandLandmarks) {
      let remapCoords = [];
      let keyPointIndex = 0;
      for (let i = 0; i < hand.length; i++) {
        const x = (1 - hand[i].x) * cachedVideoSize.w * cachedScaleFactor; // 1-x for mirror effect
        const y = hand[i].y * cachedVideoSize.h * cachedScaleFactor;

        fill(255);
        ellipse(x, y, 5, 5);

        // TEXT FOR HAND LANDMARKS
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
      //check the angle between thumb (4) and index finger(8) to see if they pinch
      const pinchCenter = {
        x: (remapCoords[4].x + remapCoords[8].x) / 2,
        y: (remapCoords[4].y + remapCoords[8].y) / 2,
      };

      if (
        (angle !== null && angle < 20) || //if the angle between the three fingers is less than 20°
        dist(
          remapCoords[4].x, //or if the distance between the two points is less than 20px
          remapCoords[4].y,
          remapCoords[8].x,
          remapCoords[8].y
        ) <= 20
      ) {
        noStroke();
        fill(255, 100);
        ellipse(remapCoords[8].x, remapCoords[8].y, 25, 25);
        ellipse(remapCoords[4].x, remapCoords[4].y, 25, 25);

        //if you are not already dragging, check if the pinch is near a particle
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
        isDragging = false;
        prevPinch = null;
      }
    }
  }
}

////////////////

// push new particle
function mousePressed() {
  if (mouseX < windowWidth * 0.8) {
    for (let p of particles) {
      if (dist(mouseX, mouseY, p.pos.x, p.pos.y) < 20) {
        pM = p;
        return;
      }
    }
    let newColor;
    if (settings.colors.mode === "monochrome") {
      newColor = settings.colors.particles;
    } else {
      newColor = random(settings.colors.palette);
    }

    pM = new particle(mouseX, mouseY, newColor);
    particles.push(pM);
  }
}

//////////////////////////////////////////

// UTILITIES
// function to calculate whether two segments intersect
function segmentIntersect(a1, a2, b1, b2) {
  let den = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);
  if (den === 0) return false;

  let t = ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / den;
  let u = ((a1.x - b1.x) * (a1.y - a2.y) - (a1.y - b1.y) * (a1.x - a2.x)) / den;

  return t > 0 && t < 1 && u > 0 && u < 1;
}

// function to calculate the angle between three points
function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) {
    return null;
  }

  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;

  const dotProduct = dx1 * dx2 + dy1 * dy2; // scalar product
  const magnitude1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const magnitude2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  return Math.acos(cosTheta) * (180 / Math.PI); // convert from radiants to degrees
}
