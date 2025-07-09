class particle {
  constructor(x, y, c) {
    this.c = c;
    this.pos = createVector(x, y);
    this.rays = [];
    for (let a = 0; a < 360; a += 0.5) {
      //creo un raggio ogni 10 degrees
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
    ellipse(this.pos.x, this.pos.y, 1);
    for (let ray of this.rays) {
      ray.show();
    }
  }

  show() {
    fill(this.c);
    ellipse(this.pos.x, this.pos.y, 1);
    for (let ray of this.rays) {
      ray.show();
    }
  }

  cast(boundaries) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity; //inizializzo il record iniziale a infinito per ciascun boundary

      for (let boundary of boundaries) {
        //trovo il closest boundary
        const pt = ray.cast(boundary);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }

      if (closest) {
        strokeWeight(0.2);
        stroke(this.c);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }
}
