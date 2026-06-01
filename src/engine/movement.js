

export class CompanionMovement {
  constructor(scale = 2, speed = 1) {
    this.x = 100;
    this.y = window.innerHeight - 80;
    this.vx = 0.8;
    this.vy = 0;
    this.gravity = 0.5;
    this.direction = "right";
    this.isDragging = false;
    this.isFalling = false;
    this.scale = scale;
    this.speed = speed;
    this.frameSize = 32;
    this.characterSize = this.frameSize * this.scale;
    

    this.floorY = window.innerHeight - this.characterSize;
  }

  updateSettings(scale, speed) {
    this.scale = scale;
    this.speed = speed;
    this.characterSize = this.frameSize * this.scale;
    this.floorY = window.innerHeight - this.characterSize;
  }

  startDragging() {
    this.isDragging = true;
    this.isFalling = false;
    this.vx = 0;
    this.vy = 0;
  }

  stopDragging(releaseVx = 0, releaseVy = 0) {
    this.isDragging = false;
    this.isFalling = true;
    this.vx = releaseVx;
    this.vy = releaseVy;
  }

  setPosition(x, y) {
    this.x = Math.max(0, Math.min(x, window.innerWidth - this.characterSize));
    this.y = y;
  }

  update(currentState, stateMachine) {
    this.floorY = window.innerHeight - this.characterSize - 10;
    
    if (this.isDragging) {
      return;
    }


    if (this.y < this.floorY) {
      this.isFalling = true;
      this.vy += this.gravity;
      this.y += this.vy;
      

      this.x += this.vx * this.speed;


      if (this.x >= window.innerWidth - this.characterSize) {
        this.x = window.innerWidth - this.characterSize;
        this.vx = -Math.abs(this.vx) * 0.6;
        this.direction = "left";
      } else if (this.x <= 0) {
        this.x = 0;
        this.vx = Math.abs(this.vx) * 0.6;
        this.direction = "right";
      }


      if (this.y >= this.floorY) {
        this.y = this.floorY;
        this.vy = 0;
        this.isFalling = false;
        

        stateMachine.transitionTo("react", 1000);
        this.vx = this.direction === "right" ? 0.8 : -0.8;
      }
      return;
    }


    if (currentState === "walk") {
      this.vx = this.direction === "right" ? 0.8 : -0.8;
      this.x += this.vx * this.speed;


      if (this.x >= window.innerWidth - this.characterSize) {
        this.x = window.innerWidth - this.characterSize;
        this.direction = "left";
        this.vx = -0.8;
      } else if (this.x <= 0) {
        this.x = 0;
        this.direction = "right";
        this.vx = 0.8;
      }
    } else {
      this.vx = 0;
    }
  }
}
