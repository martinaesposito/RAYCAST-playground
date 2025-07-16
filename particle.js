class particle {
  constructor(x, y, c) {
    this.c = c;
    this.pos = createVector(x, y);
    this.rays = [];
    for (let a = 0; a < 360; a += 0.75) {
      this.rays.push(new ray(this.pos, radians(a)));
    }
    this.noiseOffset = createVector(random(1000), random(1000));
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  move(t) {
    const nScale = 0.002;
    const moveRange = 2;

    const dx = (noise(this.noiseOffset.x + t * nScale) - 0.5) * moveRange;
    const dy = (noise(this.noiseOffset.y + t * nScale + 100) - 0.5) * moveRange;

    this.pos.x += dx;
    this.pos.y += dy;

    this.pos.x = constrain(this.pos.x, margin, width - margin);
    this.pos.y = constrain(this.pos.y, margin, height - margin);
  }

  show() {
    fill(this.c);
    ellipse(this.pos.x, this.pos.y, 0.1);
  }

  highlight() {
    push();
    noStroke();
    fill(255, 50);
    ellipse(this.pos.x, this.pos.y, 25);
    pop();
  }

  cast(boundaries, pg) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity; //initialize the initial record to infinity for each boundary
      let b; //save the boundary to later generate the reflection

      for (let boundary of boundaries) {
        const pt = ray.cast(boundary); //find the closest boundary

        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
            b = boundary;
          }
        }
      }

      if (closest) {
        pg.stroke(this.c);
        pg.strokeWeight(0.1);
        pg.line(this.pos.x, this.pos.y, closest.x, closest.y);

        // REFLECTION
        if (record < 500) {
          //vector of the direction in which the ray strikes the surface
          const incidence = p5.Vector.sub(closest, this.pos).normalize();

          let normal = createVector(
            -(b.b.y - b.a.y),
            b.b.x - b.a.x
          ).normalize(); // vector perpendicular to the surface

          if (incidence.dot(normal) > 0) normal.mult(-1);
          //i need to do the scalar product after verifying the direction of the normal !!!!
          const dot = incidence.dot(normal); // calculate the ratio(dot product) between the direction of the incident ray and the normal vector perpendicular to the boundary

          // calculate the direction of the reflected ray
          const reflection = p5.Vector.sub(
            incidence,
            p5.Vector.mult(normal, 2 * dot)
          );
          // extend its length to make it visible
          const reflectedEnd = p5.Vector.add(
            closest,
            p5.Vector.mult(reflection, 1000)
          );
          alpha(0.05);

          let c = color(this.c);
          c.setAlpha(175);
          pg.stroke(c);
          pg.line(closest.x, closest.y, reflectedEnd.x, reflectedEnd.y);
        }
      }
    }
  }
}
