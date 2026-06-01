

export class CollectibleManager {
  constructor() {
    this.items = [];
    this.spawnTimer = 5000 + Math.random() * 5000;
    this.itemSize = 24;
  }

  spawn(themeConfig) {
    const type = themeConfig.collectible || "coin";

    const x = 50 + Math.random() * (window.innerWidth - 100);
    const y = 0;
    
    const floorY = window.innerHeight - this.itemSize - 15;
    
    this.items.push({
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      x: x,
      y: y,
      floorY: floorY,
      vy: 1.5 + Math.random() * 1.5,
      bobTimer: Math.random() * Math.PI,
      isCollected: false,
      fade: 1.0,
      floatY: 0,
      color: themeConfig.colors.primary,
      accentColor: themeConfig.colors.accent
    });
  }

  update(deltaTimeMs, themeConfig, companionRect, onCollect) {

    this.spawnTimer -= deltaTimeMs;
    if (this.spawnTimer <= 0) {
      this.spawn(themeConfig);
      this.spawnTimer = 8000 + Math.random() * 12000;
    }


    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      if (item.isCollected) {
        item.floatY -= 1.0;
        item.fade -= 0.05;
        if (item.fade <= 0) {
          this.items.splice(i, 1);
        }
        continue;
      }


      if (item.y < item.floorY) {
        item.y += item.vy;
        if (item.y >= item.floorY) {
          item.y = item.floorY;
        }
      } else {
        item.bobTimer += 0.05;
        item.y = item.floorY + Math.sin(item.bobTimer) * 3;
      }


      const itemRect = {
        x: item.x,
        y: item.y,
        width: this.itemSize,
        height: this.itemSize
      };

      if (
        companionRect.x < itemRect.x + itemRect.width &&
        companionRect.x + companionRect.width > itemRect.x &&
        companionRect.y < itemRect.y + itemRect.height &&
        companionRect.y + companionRect.height > itemRect.y
      ) {

        item.isCollected = true;
        onCollect(item.type);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const item of this.items) {
      ctx.save();
      ctx.translate(item.x, item.y + item.floatY);
      ctx.globalAlpha = item.fade;
      
      this.drawProceduralItem(ctx, item.type, item.color, item.accentColor);
      ctx.restore();
    }
    ctx.restore();
  }

  drawProceduralItem(ctx, type, primaryColor, accentColor) {
    ctx.imageSmoothingEnabled = false;

    if (type === "coin") {
      ctx.fillStyle = "#EAB308";
      ctx.fillRect(2, 6, 20, 12);
      ctx.fillRect(6, 2, 12, 20);
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(4, 8, 16, 8);
      ctx.fillRect(8, 4, 8, 16);
      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(6, 6, 4, 4);

      ctx.fillStyle = "#CA8A04";
      ctx.fillRect(10, 8, 4, 2);
      ctx.fillRect(10, 10, 2, 4);
      ctx.fillRect(10, 14, 4, 2);
    } 
    else if (type === "coffee") {
      ctx.fillStyle = "#A7F3D0";
      if (Math.sin(Date.now() / 150) > 0) {
        ctx.fillRect(8, 1, 2, 3);
        ctx.fillRect(13, 2, 2, 2);
      } else {
        ctx.fillRect(9, 2, 2, 2);
        ctx.fillRect(14, 1, 2, 3);
      }
      
      ctx.fillStyle = primaryColor;
      ctx.fillRect(6, 8, 12, 12);
      ctx.fillRect(8, 20, 8, 2); // base
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(5, 11, 14, 5);

      ctx.fillStyle = primaryColor;
      ctx.fillRect(18, 10, 3, 2);
      ctx.fillRect(20, 11, 2, 5);
      ctx.fillRect(18, 15, 3, 2);
    } 
    else if (type === "bubble") {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(2, 4, 20, 14);
      ctx.fillRect(4, 2, 16, 18);
      ctx.fillRect(6, 19, 3, 3);
      ctx.fillRect(5, 21, 2, 2);
      
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(4, 6, 16, 10);
      ctx.fillRect(6, 4, 12, 14);
      
      ctx.fillStyle = primaryColor;
      ctx.fillRect(7, 10, 2, 2);
      ctx.fillRect(11, 10, 2, 2);
      ctx.fillRect(15, 10, 2, 2);
    } 
    else if (type === "star") {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(11, 2, 2, 20);
      ctx.fillRect(2, 11, 20, 2);

      ctx.fillStyle = "#FBBF24";
      ctx.fillRect(8, 8, 8, 8);

      ctx.fillRect(5, 5, 14, 14);
      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(10, 10, 4, 4);
      ctx.fillRect(11, 6, 2, 12);
      ctx.fillRect(6, 11, 12, 2);
    } 
    else if (type === "wrench") {
      ctx.fillStyle = "#64748B";
      ctx.fillRect(4, 16, 4, 4);
      ctx.fillRect(6, 14, 4, 4);
      ctx.fillRect(8, 12, 4, 4);
      ctx.fillRect(10, 10, 4, 4);
      ctx.fillRect(12, 8, 4, 4);
      ctx.fillRect(14, 6, 4, 4);
      

      ctx.fillStyle = primaryColor;
      ctx.fillRect(14, 2, 8, 8);
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(18, 2, 4, 4);
      

      ctx.fillStyle = "#475569";
      ctx.fillRect(2, 20, 4, 2);
    } 
    else if (type === "badge") {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(4, 4, 16, 16);
      ctx.fillStyle = "#FFF7ED";
      ctx.fillRect(6, 6, 12, 12);

      ctx.fillStyle = primaryColor;
      ctx.fillRect(9, 8, 6, 2);
      ctx.fillRect(9, 11, 6, 2);
      ctx.fillRect(9, 14, 6, 2);
    } 
    else if (type === "popcorn") {
      ctx.fillStyle = "#EF4444";
      ctx.fillRect(6, 8, 12, 14);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(8, 8, 2, 14);
      ctx.fillRect(12, 8, 2, 14);
      ctx.fillRect(16, 8, 1, 14);
      

      ctx.fillStyle = "#FEF08A";
      ctx.fillRect(5, 5, 14, 4);
      ctx.fillStyle = "#CA8A04";
      ctx.fillRect(7, 3, 2, 2);
      ctx.fillRect(11, 4, 3, 2);
      ctx.fillRect(15, 3, 2, 2);
    } 
    else if (type === "upvote") {
      ctx.fillStyle = "#FF4500";

      ctx.fillRect(11, 2, 2, 2);
      ctx.fillRect(10, 4, 4, 2);
      ctx.fillRect(9, 6, 6, 2);
      ctx.fillRect(8, 8, 8, 2);
      ctx.fillRect(7, 10, 10, 2);
      ctx.fillRect(6, 12, 12, 2);

      ctx.fillRect(9, 14, 6, 8);
    }
  }
}
