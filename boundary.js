class segmentBoundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.originalLength = p5.Vector.dist(this.a, this.b);

    this.noiseOffset = createVector(random(1000), random(1000));
  }
  move(t) {
    // different offset for the two vertices
    const t1 = t * 0.0025;
    const t2 = (t + 10000) * 0.0025;

    const da = createVector(
      (noise(this.noiseOffset.x + t1) - 0.5) * 2,
      (noise(this.noiseOffset.y + t1) - 0.5) * 2
    );
    const db = createVector(
      (noise(this.noiseOffset.x + t2) - 0.5) * 2,
      (noise(this.noiseOffset.y + t2) - 0.5) * 2
    );

    const newA = p5.Vector.add(this.a, da);
    const newB = p5.Vector.add(this.b, db);

    // contrain the two new positions within the margins
    newA.x = constrain(newA.x, margin, width - margin);
    newA.y = constrain(newA.y, margin, height - margin);
    newB.x = constrain(newB.x, margin, width - margin);
    newB.y = constrain(newB.y, margin, height - margin);

    // check that the length is between 1/4 and *4 the original length
    const newLength = p5.Vector.dist(newA, newB);
    if (
      newLength >= this.originalLength / 4 &&
      newLength <= this.originalLength * 4
    ) {
      this.a = newA;
      this.b = newB;
    }
  }

  show() {
    if (settings.colors.mode === "monochrome") {
      stroke(settings.colors.particles);
    } else {
      stroke(255); //if the palette is multicolored, all the boundaries must be white
    }
    strokeWeight(0.5);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
