//Helper functions
//Checks to see if point d is in the circumcircle of the triangle abc (abc need to be ccw)
boolean InCircle(PVector a, PVector b, PVector c, PVector d) {
  if (!ccw(a, b, c)) {
    PVector temp = a;
    a = c;
    c = temp;
  }
  float ax = a.x;
  float ay = a.y;
  float bx = b.x;
  float by = b.y;
  float cx = c.x;
  float cy = c.y;
  float dx = d.x;
  float dy = d.y;
  float ax_ = ax-dx;
  float ay_ = ay-dy;
  float bx_ = bx-dx;
  float by_ = by-dy;
  float cx_ = cx-dx;
  float cy_ = cy-dy;
  return (
      (ax_*ax_ + ay_*ay_) * (bx_*cy_-cx_*by_) -
      (bx_*bx_ + by_*by_) * (ax_*cy_-cx_*ay_) +
      (cx_*cx_ + cy_*cy_) * (ax_*by_-bx_*ay_)
  ) > 0;
}

//Checks to see if abc are ccw
boolean ccw (PVector a, PVector b, PVector c) {
  float ax = a.x;
  float ay = a.y;
  float bx = b.x;
  float by = b.y;
  float cx = c.x;
  float cy = c.y;
  return (bx - ax)*(cy - ay)-(cx - ax)*(by - ay) > 0;
}

//Gets the circumcenter of triangle abc
PVector circumcenter(PVector a, PVector b, PVector c) 
{ 
  float cx = c.x; 
  float cy = c.y; 
  float ax = a.x - cx; 
  float ay = a.y - cy; 
  float bx = b.x - cx; 
  float by = b.y - cy; 
 
  float denom = 2 * det(ax, ay, bx, by); 
  float numx = det(ay, ax * ax + ay * ay, by, bx * bx + by * by); 
  float numy = det(ax, ax * ax + ay * ay, bx, bx * bx + by * by); 
 
  float ccx = cx - numx / denom; 
  float ccy = cy + numy / denom; 
 
  return new PVector(ccx, ccy); 
}

//Determinant of 2x2 matrix
float det(float m00, float m01, float m10, float m11) 
{ 
  return m00 * m11 - m01 * m10; 
}

ArrayList<PVector> points = new ArrayList<PVector>();      // User-selected points
ArrayList<Triangle> triangles = new ArrayList<Triangle>(); // Triangles
boolean circles = false;                                   // Turn circumcircles off/on
boolean voronoi = false;                                   // Switch between voronoi/delaunay
boolean fast = true;                                       // Much faster if this is turned on
boolean noise = false;                                     // Turn noise off/on

void setup() {
  size(500, 500);
  background(0,0,0);
  points.add(new PVector(mouseX, mouseY));
}

void draw() {
  background(0, 0, 0);
  noFill();
  stroke(255, 255, 255);
  strokeWeight(5);
  points.remove(points.size() - 1);
  points.add(new PVector(mouseX, mouseY));
  for (int i = 0; i < points.size(); i++) {
    PVector v = points.get(i);
    float n = pow(noise(i), 0.5)*2;
    //Turn noise off
    if (!noise) {
      n = 0;
    }
    float sign = random(0, 1) < 0.5 ? 1 : -1;
    n *= sign;
    points.set(i, new PVector(v.x + n, v.y + n));
    point(v.x, v.y);
  }
  
  //Draw delaunay triangulation
  for (int i = 0; i < points.size(); i++) {
    for (int j = i+1; j < points.size(); j++) {
      for (int k = j+1; k < points.size(); k++) {
        boolean isTriangle = true;
        PVector ip = points.get(i);
        PVector jp = points.get(j);
        PVector kp = points.get(k);
        for (int a = 0; a < points.size(); a++) {
          if (a == i || a == j || a == k) continue;
          if (InCircle(ip, jp, kp, points.get(a))) {
             isTriangle = false;
             break;
          }
        }
        if (isTriangle) {
          PVector c = circumcenter(ip, jp, kp);
          if (!voronoi) {
            stroke(255, 255, 255);
            line(ip.x, ip.y, jp.x, jp.y);
            line(ip.x, ip.y, kp.x, kp.y);
            line(kp.x, kp.y, jp.x, jp.y);
          }
          else {
            triangles.add(new Triangle(ip, jp, kp));
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
    //Fast method
    if (fast) {
      for (int i = 0; i < triangles.size(); i++) {
        Triangle t1 = triangles.get(i);
        PVector c = circumcenter(t1.v1, t1.v2, t1.v3);
        
        //--First side--
        //Angle in triangle
        PVector vector_1 = new PVector(t1.v1.x - t1.v3.x, t1.v1.y - t1.v3.y);
        PVector vector_2 = new PVector(t1.v2.x - t1.v3.x, t1.v2.y - t1.v3.y);
        float angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        //Angle in adjacent triangle
        PVector other = ThirdPoint(t1.v1, t1.v2, t1.v3);
        //If triangle is on the edge, extend line to edge
        if (other == null) {
          //Find which side of the edge the point is on
          float side;
          if (t1.v2.x < t1.v1.x) {
            side = (t1.v2.x - t1.v1.x) * (t1.v3.y - t1.v1.y) - (t1.v2.y - t1.v1.y) * (t1.v3.x - t1.v1.x);
          }
          else {
            side = (t1.v1.x - t1.v2.x) * (t1.v3.y - t1.v2.y) - (t1.v1.y - t1.v2.y) * (t1.v3.x - t1.v2.x);
          }
          //Draw extending lines
          if (side > 0) {
            float slope = (t1.v2.x - t1.v1.x)/(t1.v2.y - t1.v1.y);
            slope = -1/slope;
            line((510 - c.y) * slope + c.x, 510, c.x, c.y);
          }
          else if (side < 0) {
            float slope = (t1.v2.x - t1.v1.x)/(t1.v2.y - t1.v1.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = new PVector(t1.v1.x - other.x, t1.v1.y - other.y);
          vector_2 = new PVector(t1.v2.x - other.x, t1.v2.y - other.y);
          float other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v1.x + t1.v2.x)/2, (t1.v1.y + t1.v2.y)/2, c.x, c.y);
          }
          else {
            PVector other_c = circumcenter(t1.v1, t1.v2, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
        
        //--Second side--
        vector_1 = new PVector(t1.v3.x - t1.v1.x, t1.v3.y - t1.v1.y);
        vector_2 = new PVector(t1.v2.x - t1.v1.x, t1.v2.y - t1.v1.y);
        angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        
        other = ThirdPoint(t1.v2, t1.v3, t1.v1);
        if (other == null) {
          //Find which side of the edge the point is on
          float side;
          if (t1.v2.x < t1.v3.x) {
            side = (t1.v2.x - t1.v3.x) * (t1.v1.y - t1.v3.y) - (t1.v2.y - t1.v3.y) * (t1.v1.x - t1.v3.x);
          }
          else {
            side = (t1.v3.x - t1.v2.x) * (t1.v1.y - t1.v2.y) - (t1.v3.y - t1.v2.y) * (t1.v1.x - t1.v2.x);
          }
          //Draw extending lines
          if (side > 0) {
            float slope = (t1.v2.x - t1.v3.x)/(t1.v2.y - t1.v3.y);
            slope = -1/slope;
            line((510 - c.y) * slope + c.x, 510, c.x, c.y);
          }
          else if (side < 0) {
            float slope = (t1.v2.x - t1.v3.x)/(t1.v2.y - t1.v3.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = new PVector(t1.v3.x - other.x, t1.v3.y - other.y);
          vector_2 = new PVector(t1.v2.x - other.x, t1.v2.y - other.y);
          float other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v3.x + t1.v2.x)/2, (t1.v3.y + t1.v2.y)/2, c.x, c.y);
          }
          else {
            PVector other_c = circumcenter(t1.v3, t1.v2, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
        
        //--Third side--
        vector_1 = new PVector(t1.v1.x - t1.v2.x, t1.v1.y - t1.v2.y);
        vector_2 = new PVector(t1.v3.x - t1.v2.x, t1.v3.y - t1.v2.y);
        angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
        
        other = ThirdPoint(t1.v1, t1.v3, t1.v2);
        if (other == null) {
          //Find which side of the edge the point is on
          float side;
          if (t1.v3.x < t1.v1.x) {
            side = (t1.v3.x - t1.v1.x) * (t1.v2.y - t1.v1.y) - (t1.v3.y - t1.v1.y) * (t1.v2.x - t1.v1.x);
          }
          else {
            side = (t1.v1.x - t1.v3.x) * (t1.v2.y - t1.v3.y) - (t1.v1.y - t1.v3.y) * (t1.v2.x - t1.v3.x);
          }
          //Draw extending lines
          if (side > 0) {
            float slope = (t1.v3.x - t1.v1.x)/(t1.v3.y - t1.v1.y);
            slope = -1/slope;
            line((510 - c.y) * slope + c.x, 510, c.x, c.y);
          }
          else if (side < 0) {
            float slope = (t1.v3.x - t1.v1.x)/(t1.v3.y - t1.v1.y);
            slope = -1/slope;
            line((-10 - c.y) * slope + c.x, -10, c.x, c.y);
          }
        }
        else {
          vector_1 = new PVector(t1.v1.x - other.x, t1.v1.y - other.y);
          vector_2 = new PVector(t1.v3.x - other.x, t1.v3.y - other.y);
          float other_angle = abs(atan2(det(vector_1.x, vector_1.y, vector_2.x, vector_2.y), vector_1.dot(vector_2)));
          if (angle <= PI/2 && other_angle <= PI/2) {
            line((t1.v1.x + t1.v3.x)/2, (t1.v1.y + t1.v3.y)/2, c.x, c.y);
          }
          else {
            PVector other_c = circumcenter(t1.v1, t1.v3, other);
            line(c.x, c.y, other_c.x, other_c.y);
          }
        }
      }
    }
    //Slow method
    else {
      for (int x = 0; x < 500; x++) {
      for (int y = 0; y < 500; y++) {
        for (int i = 0; i < points.size(); i++) {
          PVector one = points.get(i);
          float d1 = dist(x, y, one.x, one.y);
          float minD2 = 1000000;
          float minMouse = 1000000;
          if (dist(mouseX, mouseY, one.x, one.y) < minMouse) {
            minMouse = dist(mouseX, mouseY, one.x, one.y);
          }
          for (int j = 0; j < points.size(); j++) {
            if (j == i) {
              continue;
            }
            PVector two = points.get(j);
            float d2 = dist(x, y, two.x, two.y);
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
  triangles.clear();
}

//Finds third point of a triangle in the delaunay triangulation, given two points and one point it will NOT return
PVector ThirdPoint(PVector a, PVector b, PVector no) {
  for (int q = 0; q < triangles.size(); q++) {
    Triangle t = triangles.get(q);
    PVector i = t.v1;
    PVector j = t.v2;
    PVector k = t.v3;
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
void mousePressed() {
  //Slow method blows up without this
  if (!fast) {
    boolean canAdd = true;
    for(int i = 0; i < points.size() - 1; i++) {
      PVector v = points.get(i);
      if (dist(mouseX, mouseY, v.x, v.y) < 1) {
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
      points.add(new PVector(mouseX, mouseY));
    }
  }
  else {
    points.add(new PVector(mouseX, mouseY));
  }
}

void keyPressed() {
  if (keyCode == 67) {
    circles = !circles;
  }
  else if (keyCode == 86) {
    voronoi = !voronoi;
  }
  else if (keyCode == 70) {
    fast = !fast;
  }
  else if (keyCode == 78) {
    noise = !noise;
  }
}

//Triangle class stores three PVectors
class Triangle {
  public PVector v1;
  public PVector v2;
  public PVector v3;
  public Triangle (PVector a, PVector b, PVector c) {
    v1 = a;
    v2 = b;
    v3 = c;
  }
}
