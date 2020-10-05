//Helper functions
//Checks to see if point d is in the circumcircle of the triangle abc (abc need to be ccw)
function InCircle(a, b, c, d) {
  if (!ccw(a, b, c)) {
    let temp = a;
    a = c;
    c = temp;
  }
  let ax = a.x;
  let ay = a.y;
  let bx = b.x;
  let by = b.y;
  let cx = c.x;
  let cy = c.y;
  let dx = d.x;
  let dy = d.y;
  let ax_ = ax-dx;
  let ay_ = ay-dy;
  let bx_ = bx-dx;
  let by_ = by-dy;
  let cx_ = cx-dx;
  let cy_ = cy-dy;
  return (
      (ax_*ax_ + ay_*ay_) * (bx_*cy_-cx_*by_) -
      (bx_*bx_ + by_*by_) * (ax_*cy_-cx_*ay_) +
      (cx_*cx_ + cy_*cy_) * (ax_*by_-bx_*ay_)
  ) > 0;
}

//Checks to see if abc are ccw
function ccw (a, b, c) {
  let ax = a.x;
  let ay = a.y;
  let bx = b.x;
  let by = b.y;
  let cx = c.x;
  let cy = c.y;
  return (bx - ax)*(cy - ay)-(cx - ax)*(by - ay) > 0;
}

//Gets the circumcenter of triangle abc
function circumcenter(a, b, c) 
{ 
  let cx = c.x; 
  let cy = c.y; 
  let ax = a.x - cx; 
  let ay = a.y - cy; 
  let bx = b.x - cx; 
  let by = b.y - cy; 
 
  let denom = 2 * det(ax, ay, bx, by); 
  let numx = det(ay, ax * ax + ay * ay, by, bx * bx + by * by); 
  let numy = det(ax, ax * ax + ay * ay, bx, bx * bx + by * by); 
 
  let ccx = cx - numx / denom; 
  let ccy = cy + numy / denom; 
 
  return createVector(ccx, ccy); 
}

//Determinant of 2x2 matrix
function det(m00, m01, m10, m11) 
{ 
  return m00 * m11 - m01 * m10; 
}

var points = new Array(0);      // User-selected points
var triangles = new Array(0);   // Triangles
var circles = false;            // Turn circumcircles off/on
var voronoi = false;            // Switch between voronoi/delaunay
var fast = true;                // Much faster if this is turned on
var noiseVal = false;           // Turn noise off/on
var addPointOnCursor = true;    // Add point on the cursor

var c1;
var c2;
var c3;
var c4;
var b1;
var numberOfPointsAdded = 0;

function setup() {
  createCanvas(750, 450);
  background(0,0,0);
  points.push(createVector(100, 100));
  points.push(createVector(500, 200));
  points.push(createVector(300, 300));
  numberOfPointsAdded += 3;
  points.push(createVector(mouseX, mouseY));
  
  c1 = new Checkbox(700, 75, 20, 20);
  c1.pressed = true;
  voronoi = true;
  c2 = new Checkbox(700, 125, 20, 20);
  c3 = new Checkbox(700, 175, 20, 20);
  c4 = new Checkbox(700, 225, 20, 20);
  c4.pressed = true;
  addPointOnCursor = true;
  b1 = new Button(587.5, 325, 120, 40);
}

function draw() {
  background(0, 0, 0);
  
  noFill();
  stroke(255, 255, 255);
  strokeWeight(3);
  
  if (addPointOnCursor) {
    if (points.length > numberOfPointsAdded) {
      points.pop();
    }
    let cursorTooCloseToPoint = false;
    for (let i = 0; i < points.length; i++) {
      if (dist(points[i].x, points[i].y, mouseX, mouseY) < 2) {
        cursorTooCloseToPoint = true;
        break;
      }
    }
    if (!cursorTooCloseToPoint) {
      points.push(createVector(mouseX, mouseY));
    }
  }
  else {
    while (points.length > numberOfPointsAdded) {
      points.pop();
    }
  }
  for (let i = 0; i < points.length; i++) {
    let v = points[i];
    let nX = pow(noise(i), 0.5)*2;
	let nY = pow(noise(2*i), 0.5)*2;
    //Turn noise off
    if (!noiseVal) {
      nX = 0;
	  nY = 0;
    }
    let signX = random(0, 1) < 0.5 ? 1 : -1;
	let signY = random(0, 1) < 0.5 ? 1 : -1;
    nX *= signX;
	nY *= signY;
    points[i] = createVector(v.x + nX, v.y + nY);
    point(v.x, v.y);
  }
  
  //Draw delaunay triangulation
  for (let i = 0; i < points.length; i++) {
    for (let j = i+1; j < points.length; j++) {
      for (let k = j+1; k < points.length; k++) {
        let isTriangle = true;
        let ip = points[i];
        let jp = points[j];
        let kp = points[k];
        for (let a = 0; a < points.length; a++) {
          if (a == i || a == j || a == k) continue;
          if (InCircle(ip, jp, kp, points[a])) {
             isTriangle = false;
             break;
          }
        }
        if (isTriangle) {
          let c = circumcenter(ip, jp, kp);
          if (!voronoi) {
            stroke(255, 255, 255);
            //stroke(255, 0, 0);
            line(ip.x, ip.y, jp.x, jp.y);
            line(ip.x, ip.y, kp.x, kp.y);
            line(kp.x, kp.y, jp.x, jp.y);
          }
          //can remove
          else {
            triangles.push(new Triangle(ip, jp, kp));
          }
          if (circles) {
            stroke(255, 0, 0);
            point(c.x, c.y);
            circle(c.x, c.y, 2 * dist(c.x, c.y, ip.x, ip.y));
          }
        }
      }
    }
  }
  stroke(255, 255, 255);
  
  //Voronoi generation from delaunay triangles
  if (voronoi) {
    for(let i = 0; i < points.length; i++) {
      let p = points[i];
      //can remove
      point(p.x, p.y);
    }
    //Fast method
    if (fast) {
      for (let i = 0; i < triangles.length; i++) {
        let t1 = triangles[i];
        let c = circumcenter(t1.v1, t1.v2, t1.v3);
        
        //--First side--
        //Angle in triangle
        let vector_1 = createVector(t1.v1.x - t1.v3.x, t1.v1.y - t1.v3.y);
        let vector_2 = createVector(t1.v2.x - t1.v3.x, t1.v2.y - t1.v3.y);
        let angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        //Angle in adjacent triangle
        let other = ThirdPoint(t1.v1, t1.v2, t1.v3);
        //If triangle is on the edge, extend line to edge
        if (other == null) {
          //Find which side of the edge the point is on
          let side;
          if (t1.v2.x < t1.v1.x) {
            side = (t1.v2.x - t1.v1.x) * (t1.v3.y - t1.v1.y) - (t1.v2.y - t1.v1.y) * (t1.v3.x - t1.v1.x);
          }
          else {
            side = (t1.v1.x - t1.v2.x) * (t1.v3.y - t1.v2.y) - (t1.v1.y - t1.v2.y) * (t1.v3.x - t1.v2.x);
          }
          //Draw extending lines
          if (side > 0) {
            let slope = (t1.v2.x - t1.v1.x)/(t1.v2.y - t1.v1.y);
            slope = -1/slope;
            line((height + 10 - c.y) * slope + c.x, height + 10, c.x, c.y);
          }
          else if (side < 0) {
            let slope = (t1.v2.x - t1.v1.x)/(t1.v2.y - t1.v1.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = createVector(t1.v1.x - other.x, t1.v1.y - other.y);
          vector_2 = createVector(t1.v2.x - other.x, t1.v2.y - other.y);
          let other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v1.x + t1.v2.x)/2, (t1.v1.y + t1.v2.y)/2, c.x, c.y);
          }
          else {
            let other_c = circumcenter(t1.v1, t1.v2, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
        
        //--Second side--
        vector_1 = createVector(t1.v3.x - t1.v1.x, t1.v3.y - t1.v1.y);
        vector_2 = createVector(t1.v2.x - t1.v1.x, t1.v2.y - t1.v1.y);
        angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        
        other = ThirdPoint(t1.v2, t1.v3, t1.v1);
        if (other == null) {
          //Find which side of the edge the point is on
          let side;
          if (t1.v2.x < t1.v3.x) {
            side = (t1.v2.x - t1.v3.x) * (t1.v1.y - t1.v3.y) - (t1.v2.y - t1.v3.y) * (t1.v1.x - t1.v3.x);
          }
          else {
            side = (t1.v3.x - t1.v2.x) * (t1.v1.y - t1.v2.y) - (t1.v3.y - t1.v2.y) * (t1.v1.x - t1.v2.x);
          }
          //Draw extending lines
          if (side > 0) {
            let slope = (t1.v2.x - t1.v3.x)/(t1.v2.y - t1.v3.y);
            slope = -1/slope;
            line((height + 10 - c.y) * slope + c.x, height + 10, c.x, c.y);
          }
          else if (side < 0) {
            let slope = (t1.v2.x - t1.v3.x)/(t1.v2.y - t1.v3.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = createVector(t1.v3.x - other.x, t1.v3.y - other.y);
          vector_2 = createVector(t1.v2.x - other.x, t1.v2.y - other.y);
          let other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v3.x + t1.v2.x)/2, (t1.v3.y + t1.v2.y)/2, c.x, c.y);
          }
          else {
            let other_c = circumcenter(t1.v3, t1.v2, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
        
        //--Third side--
        vector_1 = createVector(t1.v1.x - t1.v2.x, t1.v1.y - t1.v2.y);
        vector_2 = createVector(t1.v3.x - t1.v2.x, t1.v3.y - t1.v2.y);
        angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        
        other = ThirdPoint(t1.v1, t1.v3, t1.v2);
        if (other == null) {
          //Find which side of the edge the point is on
          let side;
          if (t1.v3.x < t1.v1.x) {
            side = (t1.v3.x - t1.v1.x) * (t1.v2.y - t1.v1.y) - (t1.v3.y - t1.v1.y) * (t1.v2.x - t1.v1.x);
          }
          else {
            side = (t1.v1.x - t1.v3.x) * (t1.v2.y - t1.v3.y) - (t1.v1.y - t1.v3.y) * (t1.v2.x - t1.v3.x);
          }
          //Draw extending lines
          if (side > 0) {
            let slope = (t1.v3.x - t1.v1.x)/(t1.v3.y - t1.v1.y);
            slope = -1/slope;
            line((height + 10 - c.y) * slope + c.x, height + 10, c.x, c.y);
          }
          else if (side < 0) {
            let slope = (t1.v3.x - t1.v1.x)/(t1.v3.y - t1.v1.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = createVector(t1.v1.x - other.x, t1.v1.y - other.y);
          vector_2 = createVector(t1.v3.x - other.x, t1.v3.y - other.y);
          let other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v1.x + t1.v3.x)/2, (t1.v1.y + t1.v3.y)/2, c.x, c.y);
          }
          else {
            let other_c = circumcenter(t1.v1, t1.v3, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
      }
    }
    //Slow method
    else {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          for (let i = 0; i < points.length; i++) {
            let one = points[i];
            let d1 = dist(x, y, one.x, one.y);
            let minD2 = 1000000;
            let minMouse = 1000000;
            if (dist(mouseX, mouseY, one.x, one.y) < minMouse) {
              minMouse = dist(mouseX, mouseY, one.x, one.y);
            }
            for (let j = 0; j < points.length; j++) {
              if (j == i) {
                continue;
              }
              let two = points[j];
              let d2 = dist(x, y, two.x, two.y);
              if (d2 < minD2) {
                minD2 = d2;
              }
            }
            if (abs(d1 - minD2) < min(0.5, minMouse/80)) {
              point(x, y);
            }
          }
        }
      }
    }
  }
  triangles = new Array(0);
  
  //Interface
  noStroke();
  fill(100, 100, 100);
  rect(550, 0, width, height);
  
  fill(255, 255, 255);
  textSize(20);
  text("Voronoi?", 570, 90);
  fill(0, 0, 0);
  c1.update();
  c1.display();
  
  fill(255, 255, 255);
  textSize(20);
  text("Circles?", 570, 140);
  fill(0, 0, 0);
  c2.update();
  c2.display();
  
  fill(255, 255, 255);
  textSize(20);
  text("Noise?", 570, 190);
  fill(0, 0, 0);
  c3.update();
  c3.display();
  
  fill(255, 255, 255);
  textSize(20);
  text("Cursor Point?", 570, 240);
  fill(0, 0, 0);
  c4.update();
  c4.display();
  
  fill(255, 255, 255);
  b1.update();
  b1.display();
  fill(0, 0, 0);
  textSize(20);
  text("Clear Points", 593, 350);
}

//Finds third point of a triangle in the delaunay triangulation, given two points and one point it will NOT return
function ThirdPoint(a, b, no) {
  for (let q = 0; q < triangles.length; q++) {
    let t = triangles[q];
    let i = t.v1;
    let j = t.v2;
    let k = t.v3;
    if (a.equals(i) && b.equals(j) && !no.equals(k)) {
      return k;
    }
    else if (a.equals(j) && b.equals(i) && !no.equals(k)) {
      return k;
    }
    else if (a.equals(i) && b.equals(k) && !no.equals(j)) {
      return j;
    }
    else if (a.equals(k) && b.equals(i) && !no.equals(j)) {
      return j;
    }
    else if (a.equals(j) && b.equals(k) && !no.equals(i)) {
      return i;
    }
    else if (a.equals(j) && b.equals(k) && !no.equals(i)) {
      return i;
    }
  }
  return null;
}

//Callback when the user clicks at (x, y)
function mousePressed() {
  if (mouseX < 550 && mouseY < height) {
    //Slow method blows up without this
    if (!fast) {
      let canAdd = true;
      for(let i = 0; i < points.length - 1; i++) {
        let v = points[i];
        if (dist(mouseX, mouseY, v.x, v.y) < 1) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) {
        points.push(createVector(mouseX, mouseY));
        numberOfPointsAdded++;
      }
    }
    else {
      points.push(createVector(mouseX, mouseY));
      numberOfPointsAdded++;
    }
  }
}

function mouseReleased() {
  c1.tryClick();
  c2.tryClick();
  c3.tryClick();
  c4.tryClick();
  
  voronoi = c1.pressed;
  circles = c2.pressed;
  noiseVal = c3.pressed;
  addPointOnCursor = c4.pressed;
  
  b1.tryClick();
  if (b1.pressed) {
    points = new Array(0);
    numberOfPointsAdded = 0;
  }
}

//Triangle class stores three PVectors
class Triangle {
  constructor(a, b, c) {
    this.v1 = a;
    this.v2 = b;
    this.v3 = c;
  }
}
