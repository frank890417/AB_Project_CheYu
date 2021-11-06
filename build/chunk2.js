
function setup() {
  pixelDensity(2);
  createCanvas(DIM, DIM);
  // createCanvas(windowWidth, windowHeight);
  mainGraphics = createGraphics(width, height);
  fullCanvasTexture = createGraphics(width, height);

  // mainGraphics.translate(width / 2, height / 2);
  mainGraphics.scale(DIM / DEFAULT_SIZE);
  fullCanvasTexture.scale(DIM / DEFAULT_SIZE);
  // mainGraphics.translate(-width / 2, -height / 2);
  console.log(`scale: ${DIM / DEFAULT_SIZE}`);

  console.log(DIM, DEFAULT_SIZE);
  width = DEFAULT_SIZE;
  height = DEFAULT_SIZE;
  // 300/1200
  // 2400/1200
  // mainGraphics.translate(-width / 2, -height / 2);

  let textureGridSize = 120;

  for (let i = 0; i <= width + textureGridSize * 10; i += textureGridSize) {
    for (let o = 0; o <= height + textureGridSize * 10; o += textureGridSize) {
      fullCanvasTexture.image(
        canvasTexture,
        i,
        o,
        textureGridSize,
        textureGridSize
      );
    }
  }

  background(100);

  ang = R.random_num(-0.5, 0.5);

  mainGraphics.fill(0);
  mainGraphics.rect(0, 0, width, height);

  // translate(width/2,height/2)
  // rotate(random())
  // translate(-width/2,-height/2)

  overAllTexture = createGraphics(width, height);
  overAllTexture.loadPixels();
  for (var i = 0; i < width + 50; i++) {
    for (var o = 0; o < height + 50; o++) {
      overAllTexture.set(
        i,
        o,
        color(
          200,
          noise(i / 10, (i * o) / 300) * R.random_choice([0, 0, 20, 100])
        )
      );
    }
  }
  overAllTexture.updatePixels();

  translate(width / 2, height / 2);
  rotate(ang);
  translate(-width / 2, -height / 2);

  if (useDivisionType == "Rect") {
    div(0, 0, width, height, int(R.random_num(2, 4)));
  }
  if (useDivisionType == "Ang") {
    divAng(0, width, 0, 2 * PI, int(R.random_num(2, 5)));
  }
  features.AreaCount = areas.length;

  for (var i = 0; i < useParticleCount; i++) {
    let pColor = R.random_choice(useColorSet);
    let useEmitVelocity;
    let useEmitPosition = createVector(
      useStartPosition[0] * width,
      useStartPosition[1] * height
    );
    let useR = R.random_num(0, useParticleSize) * R.random_num(0.05, 1) + 1;
    if (useEmitType == "Random") {
      useEmitVelocity = createVector(0, 1)
        .rotate(R.random_num(0, 2 * PI))
        .mult(R.random_num(2, 6));
    } else if (useEmitType == "Even") {
      useEmitVelocity = createVector(0, 1)
        .rotate(map(i, 0, useParticleCount, 0, PI))
        .mult(R.random_num(2, 6));
      useR = sin(i / 4) * 10 + 12;
    } else if (useEmitType == "LinearHorzontal") {
      useEmitVelocity = createVector(0, 1)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        map(i, 0, useParticleCount, 0, width),
        height / 2
      );
    } else if (useEmitType == "LinearVertical") {
      useEmitVelocity = createVector(1, 0)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        width / 2,
        map(i, 0, useParticleCount, 0, height)
      );
    } else if (useEmitType == "LinearSlope") {
      useEmitVelocity = createVector(1, 0)
        .rotate(sin((i / useParticleCount) * 2 * PI))
        .mult(R.random_num(2, 6));
      useEmitPosition = createVector(
        map(i, 0, useParticleCount, 0, width),
        map(i, 0, useParticleCount, 0, height)
      );
    }
    particles.push(
      new Particle({
        p: useEmitPosition,
        v: useEmitVelocity,
        r: useR,
        color: pColor,
      })
    );
  }

  mainGraphics.translate(width / 2, height / 2);
  mainGraphics.rotate(ang);
  mainGraphics.translate(-width / 2, -height / 2);
}

function draw() {
  mainGraphics.noStroke();

  particles.forEach((particle) => {
    particle.update();
    areas.forEach((area) => {
      if (area.isParticleInArea(particle)) {
        if (particle.area !== area) {
          particle.area = area;
          particle.color = R.random_choice(area.colors);
          particle.v.rotate(R.random_num(-1, 1));
          if (
            R.random_dec() < 0.1 &&
            particle.generation < 2 &&
            particle.canGenCount > 0
          ) {
            let p = new Particle({
              p: particle.p.copy(),
              v: particle.v.copy(),
              a: particle.a.copy(),
              generation: particle.generation + 1,
            });
            particle.canGenCount--;
            // console.log(p.generation)
            particles.push(p);
          }
        }
      }
    });
    particle.draw();
  });
  particles = particles.filter((p) => p.life > 0);

  image(mainGraphics, 0, 0);

  // draw canvastexture
  if (showCanvasTexture) {
    push();
    blendMode(MULTIPLY);
    image(fullCanvasTexture, 0, 0);
    pop();
  }

  // Draw Hash
  if (showHash) {
    fill(0);
    textSize(20);
    textFont("Courier");
    // select('canvas').elt.style.letterSpacing = "5px";
    textAlign(RIGHT);

    for (var textId = 0; textId < tokenData.hash.length; textId++) {
      // let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50 + noise(frameCount/50+xx/50)*100
      // let xx = textId*15+15+mouseX, yy = mouseY + sin(frameCount/50+xx/50)*50
      // let xx = textId*15+15+mouseX, yy = mouseY
      let xx = textId * 15 + 30,
        yy = height - 30;
      // for(let xx=0;xx<width;xx+=20){
      //   for(let yy=0;yy<height;yy+=20){

      areas.forEach((area) => {
        if (
          area.isParticleInArea({
            p: createVector(xx, yy),
          })
        ) {
          let ar = color(area.color);
          let b =
            0.2126 * ar._getRed() +
            0.7152 * ar._getGreen() +
            0.0722 * ar._getBlue();
          if (b > 255 / 2) {
            fill(0);
          } else {
            fill(255);
          }
        }
      });
      noStroke();

      // ellipse(xx,yy,4,4)
      // }
      // }

      text(tokenData.hash[textId], xx, yy);
    }
  }
}
let showHash = false;
function keyPressed() {
  if (key == "s") {
    save("CYW_Electriz - " + tokenData.hash + ".png");
  }
  if (key == "t") {
    showCanvasTexture = !showCanvasTexture;
  }
  if (key == " ") {
    showHash = !showHash;
  }
}

function doubleClicked() {
  showCanvasTexture = !showCanvasTexture;
}
