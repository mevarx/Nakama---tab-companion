

export function generateSpriteSheet(theme) {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  

  ctx.imageSmoothingEnabled = false;
  
  const colors = theme.colors;
  

  for (let row = 0; row < 8; row++) {
    const stateName = getStateNameForRow(row);
    const numFrames = getFramesForState(stateName);
    
    for (let frame = 0; frame < numFrames; frame++) {
      const dx = frame * 32;
      const dy = row * 32;
      
      drawFrame(ctx, dx, dy, stateName, frame, colors, theme.name);
    }
  }
  
  return canvas;
}

function getStateNameForRow(row) {
  const rows = ["idle", "walk_right", "walk_left", "sit", "type", "sleep", "react", "special"];
  return rows[row] || "idle";
}

function getFramesForState(state) {
  const frames = {
    idle: 4,
    walk_right: 6,
    walk_left: 6,
    sit: 2,
    type: 4,
    sleep: 3,
    react: 4,
    special: 6
  };
  return frames[state] || 4;
}


function drawFrame(ctx, dx, dy, state, frame, colors, themeName) {
  ctx.save();
  ctx.translate(dx, dy);
  

  if (state === "walk_left") {
    ctx.translate(32, 0);
    ctx.scale(-1, 1);
  }
  
  let bobY = 0;
  let legCycle = 0;
  let eyeState = "open";
  let drawLaptop = false;
  let drawZ = false;
  let drawPopcorn = false;
  let handsState = "down";
  let jumpY = 0;
  let sweatState = false;
  let bubbleState = false;
  let sparkleState = false;
  

  if (state === "idle") {
    if (frame === 2 || frame === 3) {
      bobY = 1;
    }

    if (frame === 3) {
      eyeState = "blink";
    }
  } else if (state === "walk_right" || state === "walk_left") {
    legCycle = frame % 4; // 0, 1, 2, 3
    if (frame % 2 === 1) {
      bobY = 1;
    }
  } else if (state === "sit") {
    bobY = 2;
    legCycle = 4;
    if (frame === 1) eyeState = "blink";
  } else if (state === "type") {
    bobY = 2;
    legCycle = 4;
    drawLaptop = true;
    handsState = "type";
  } else if (state === "sleep") {
    bobY = 3;
    legCycle = 4;
    eyeState = "closed";
    drawZ = true;
  } else if (state === "react") {
    eyeState = "squint";
    handsState = "wave";

    if (frame === 1 || frame === 2) {
      jumpY = -4;
    }
  } else if (state === "special") {

    if (themeName === "github") {

      bobY = (frame % 2 === 0) ? 0 : 2;
      legCycle = frame % 4;
      handsState = "wave";
      sparkleState = true;
    } else if (themeName === "claude") {

      bobY = Math.sin(frame * Math.PI / 3) * 1.5;
      eyeState = (frame % 2 === 0) ? "squint" : "open";
      sparkleState = true;
    } else if (themeName === "chatgpt") {

      bobY = 2;
      legCycle = 4;
      drawLaptop = true;
      handsState = "type";
      bubbleState = true;
    } else if (themeName === "gemini") {

      bobY = -2 + Math.sin(frame * Math.PI / 3) * 3;
      legCycle = 4;
      sparkleState = true;
    } else if (themeName === "stackoverflow") {

      bobY = 2;
      legCycle = 4;
      eyeState = "squint";
      sweatState = true;
      handsState = "facepalm";
    } else if (themeName === "youtube") {

      bobY = 2;
      legCycle = 4;
      drawPopcorn = true;
      if (frame % 2 === 1) {
        handsState = "eat";
      }
    } else if (themeName === "reddit") {

      bobY = 2;
      legCycle = 4;
      handsState = "slap";
      bubbleState = true;
    } else {

      bobY = (frame % 2 === 0) ? -1 : 1;
      handsState = "wave";
    }
  }
  

  

  if (drawZ) {
    ctx.fillStyle = "#A5B4FC";
    const zOffset = (frame * 3) % 9;
    ctx.font = "8px 'Courier New', monospace";
    ctx.fillText("z", 22, 10 - zOffset);
  }
  

  if (sweatState && frame % 2 === 0) {
    ctx.fillStyle = "#60A5FA";
    ctx.fillRect(22, 16, 2, 2);
    ctx.fillRect(23, 19, 1, 2);
  }
  

  if (sparkleState) {
    ctx.fillStyle = colors.accent;
    if (frame % 3 === 0) {
      ctx.fillRect(6, 6, 2, 2);
      ctx.fillRect(24, 20, 2, 2);
    } else if (frame % 3 === 1) {
      ctx.fillRect(26, 8, 2, 2);
      ctx.fillRect(4, 22, 2, 2);
    }
  }
  

  if (bubbleState && frame % 2 === 0) {
    ctx.fillStyle = colors.primary;
    ctx.fillRect(24, 8, 4, 4);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(25, 9, 2, 2);
  }
  

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(8, 29, 16, 2);
  

  const ox = 8;
  const oy = 8 + bobY + jumpY;
  

  ctx.fillStyle = "#334155";
  if (legCycle === 0) {

    ctx.fillRect(ox + 3, oy + 19, 3, 2);
    ctx.fillRect(ox + 10, oy + 19, 3, 2);
  } else if (legCycle === 1) {

    ctx.fillRect(ox + 4, oy + 18, 3, 2);
    ctx.fillRect(ox + 9, oy + 19, 3, 2);
  } else if (legCycle === 2) {

    ctx.fillRect(ox + 3, oy + 19, 3, 2);
    ctx.fillRect(ox + 10, oy + 18, 3, 2);
  } else if (legCycle === 3) {

    ctx.fillRect(ox + 2, oy + 19, 3, 2);
    ctx.fillRect(ox + 11, oy + 19, 3, 2);
  } else if (legCycle === 4) {

    ctx.fillRect(ox + 1, oy + 19, 5, 2);
    ctx.fillRect(ox + 10, oy + 19, 5, 2);
  }
  

  ctx.fillStyle = colors.hoodie;
  ctx.fillRect(ox + 2, oy + 10, 12, 9);
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(ox + 7, oy + 10, 2, 9);
  

  ctx.fillStyle = colors.hoodie;
  ctx.fillRect(ox + 1, oy + 0, 14, 11);
  ctx.fillRect(ox + 0, oy + 2, 16, 7);
  

  ctx.fillStyle = colors.skin;
  ctx.fillRect(ox + 3, oy + 3, 10, 7);
  

  ctx.fillStyle = colors.hair || "#334155";
  ctx.fillRect(ox + 3, oy + 2, 10, 2);
  ctx.fillRect(ox + 3, oy + 4, 2, 3);
  ctx.fillRect(ox + 11, oy + 4, 2, 3);
  

  ctx.fillStyle = colors.hair || "#334155";
  if (eyeState === "open") {
    ctx.fillRect(ox + 5, oy + 5, 2, 2);
    ctx.fillRect(ox + 9, oy + 5, 2, 2);
  } else if (eyeState === "blink") {
    ctx.fillRect(ox + 5, oy + 6, 2, 1);
    ctx.fillRect(ox + 9, oy + 6, 2, 1);
  } else if (eyeState === "squint") {

    ctx.fillRect(ox + 5, oy + 5, 2, 1);
    ctx.fillRect(ox + 9, oy + 5, 2, 1);
    ctx.fillRect(ox + 6, oy + 6, 1, 1);
    ctx.fillRect(ox + 9, oy + 6, 1, 1);
  } else if (eyeState === "closed") {

    ctx.fillRect(ox + 5, oy + 6, 2, 1);
    ctx.fillRect(ox + 9, oy + 6, 2, 1);
  }
  

  ctx.fillStyle = colors.skin;
  if (handsState === "down") {
    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 13, oy + 14, 2, 2);
  } else if (handsState === "wave") {
    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 14, oy + 8, 2, 2);
  } else if (handsState === "type") {

    ctx.fillRect(ox + 4, oy + 13 + (frame % 2), 2, 2);
    ctx.fillRect(ox + 10, oy + 13 - (frame % 2), 2, 2);
  } else if (handsState === "facepalm") {

    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 7, oy + 6, 3, 3);
  } else if (handsState === "eat") {

    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 7, oy + 8, 2, 2);
  } else if (handsState === "slap") {

    ctx.fillRect(ox + 1, oy + 14, 2, 2);
    ctx.fillRect(ox + 13, oy + 11, 3, 2);
  }
  

  if (drawLaptop) {
    ctx.fillStyle = "#94A3B8";
    ctx.fillRect(ox + 3, oy + 14, 10, 2);
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(ox + 11, oy + 9, 2, 6);

    ctx.fillStyle = "rgba(14, 165, 233, 0.4)";
    ctx.fillRect(ox + 7, oy + 8, 4, 5);
  }
  
  if (drawPopcorn) {

    ctx.fillStyle = "#EF4444";
    ctx.fillRect(ox + 11, oy + 13, 4, 5);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(ox + 12, oy + 13, 1, 5);
    ctx.fillRect(ox + 14, oy + 13, 1, 5);
    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(ox + 10, oy + 11, 5, 2);
  }
  
  ctx.restore();
}
