class Button {
  float rectX, rectY;          // Position of square button
  float rectXSize, rectYSize;  // Diameter of rect
  boolean rectOver = false;
  boolean pressed = false;
  
  Button (float xb, float yb, float xSize, float ySize) {
    rectX = xb;
    rectY = yb;
    rectXSize = xSize;
    rectYSize = ySize;
  }
  
  void update() {
    if (overEvent(rectX, rectY, rectXSize, rectYSize)) {
      rectOver = true;
    }
    else {
      rectOver = false;
    }
    /*
    if (mousePressed && rectOver) {
      //pressed = true;
    }*/
    if (!mousePressed) {
      pressed = false;
    }
  }
  
  void tryClick() {
    if (rectOver) {
      pressed = true;
    }
  }
  
  void display() {
    noStroke();
    if (rectOver) {
      fill(50, 50, 50);
    } 
    else {
      fill(255, 255, 255);
    }
    rect(rectX, rectY, rectXSize, rectYSize);
  }
  
  boolean overEvent(float x, float y, float width, float height)  {
    if (mouseX >= x && mouseX <= x+width && 
        mouseY >= y && mouseY <= y+height) {
      return true;
    } else {
      return false;
    }
  }
}
