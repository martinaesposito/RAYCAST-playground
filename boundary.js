class segmentBoundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);

    this.noiseOffset = createVector(random(1000), random(1000));
  }
  move(t) {
    const t1 = t * 0.0025;
    const t2 = (t + 10000) * 0.0025; //creo uno shift così da dare due noise leggermente diversi al primo e al secondo punto

    this.a = p5.Vector.add(
      this.a,
      createVector(
        (noise(this.noiseOffset.x + t1) - 0.5) * 2,
        (noise(this.noiseOffset.y + t1) - 0.5) * 2
      )
    );

    this.b = p5.Vector.add(
      this.b,
      createVector(
        (noise(this.noiseOffset.x + t2) - 0.5) * 2,
        (noise(this.noiseOffset.y + t2) - 0.5) * 2
      )
    );

    // Limito i punti entro i margini della canvas
    this.a.x = constrain(this.a.x, margin, width - margin);
    this.a.y = constrain(this.a.y, margin, height - margin);
    this.b.x = constrain(this.b.x, margin, width - margin);
    this.b.y = constrain(this.b.y, margin, height - margin);
  }

  show() {
    stroke(255);
    strokeWeight(0.5);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
