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
    console.log(this.c);
    ellipse(this.pos.x, this.pos.y, 0.1);
    // for (let ray of this.rays) {
    //   ray.show(this.c);
    // }
  }

  cast(boundaries) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity; //inizializzo il record iniziale a infinito per ciascun boundary
      let b; //salvo il boundary colpito per generare successivamente la riflessione

      for (let boundary of boundaries) {
        const pt = ray.cast(boundary); //trovo il closest boundary

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
        strokeWeight(0.1);
        stroke(this.c);
        line(this.pos.x, this.pos.y, closest.x, closest.y); //vettore incidente alla superficie

        // calcolo la riflessione

        const incidence = p5.Vector.sub(closest, this.pos).normalize();

        let normal = createVector(-(b.b.y - b.a.y), b.b.x - b.a.x).normalize(); // vettore perpendicolare alla superficie colpita
        const dot = incidence.dot(normal); //vettore della direzione con cui il raggio colpisce la superficie
        const reflection = p5.Vector.sub(
          //calcolo il vettore corrispondente alla riflessione - per cui sottraggo al vettore incidenza un vettore
          incidence,
          p5.Vector.mult(normal, 2 * dot)
        );

        // Estendi riflesso per disegnarlo
        const reflectedEnd = p5.Vector.add(
          closest,
          p5.Vector.mult(reflection, 1000)
        ); // lunghezza riflesso
        alpha(0.05);
        line(closest.x, closest.y, reflectedEnd.x, reflectedEnd.y);
      }
    }
  }
}
