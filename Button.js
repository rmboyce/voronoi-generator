class Button {
  constructor(xb, yb, xSize, ySize) {
    this.rectX = xb;
    this.rectY = yb;
    this.rectXSize = xSize;
    this.rectYSize = ySize;
    this.rectOver = false;
    this.pressed = false;
  }
  
  update() {
    if (this.overEvent(this.rectX, this.rectY, this.rectXSize, this.rectYSize)) {
      this.rectOver = true;
    }
    else {
      this.rectOver = false;
    }
    if (!mouseIsPressed) {
      this.pressed = false;
    }
  }
  
  tryClick() {
    if (this.rectOver) {
      this.pressed = true;
    }
  }
  
  display() {
    noStroke();
    if (this.rectOver) {
      fill(50, 50, 50);
    } 
    else {
      fill(255, 255, 255);
    }
    rect(this.rectX, this.rectY, this.rectXSize, this.rectYSize);
  }
  
  overEvent(x, y, width, height)  {
    if (mouseX >= x && mouseX <= x+width && 
        mouseY >= y && mouseY <= y+height) {
      return true;
    } else {
      return false;
    }
  }
}
