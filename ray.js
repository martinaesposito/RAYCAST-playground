class ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  setDir(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show(c) {
    stroke(c);
    push();
    translate(this.pos.x, this.pos.y); //traslo al punto di origine
    line(0, 0, this.dir.x, this.dir.y); //i multiply the rayf or ten so that it's visible
    pop();
  }

  cast(boundary) {
    //two parameters t => 0<t<1 and u => u>0

    let x1 = boundary.a.x;
    let x2 = boundary.b.x;
    let y1 = boundary.a.y;
    let y2 = boundary.b.y;
    let x3 = this.pos.x;
    let x4 = this.pos.x + this.dir.x;
    let y3 = this.pos.y;
    let y4 = this.pos.y + this.dir.y;

    let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    //if they are parallel
    if (den == 0) {
      return;
    }

    let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t < 1 && t > 0 && u > 0) {
      let pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}
