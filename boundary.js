const nScale = 0.005;
const moveRange = 2;

class segmentBoundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);

    this.noiseOffset = createVector(random(1000), random(1000));
  }
  move(t) {
    this.a.x += (noise(this.noiseOffset.x + t * nScale) - 0.5) * moveRange;
    this.a.y += (noise(this.noiseOffset.y + t * nScale) - 0.5) * moveRange;
    this.b.x += (noise(this.noiseOffset.x + t * nScale) - 0.5) * moveRange;
    this.b.y += (noise(this.noiseOffset.y + t * nScale) - 0.5) * moveRange;

    // Limiti agli spostamenti
    this.a.x = constrain(this.a.x, margin, width - margin);
    this.a.y = constrain(this.a.y, margin, height - margin);
    this.b.x = constrain(this.b.x, margin, width - margin);
    this.b.y = constrain(this.b.y, margin, height - margin);
  }

  show() {
    stroke(255);
    stroke(255);
    strokeWeight(1);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
