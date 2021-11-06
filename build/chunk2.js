
function setup() {
  // pixelDensity(2);
  let SZ = Math.min(WIDTH, HEIGHT);
  createCanvas(int(SZ), SZ);
  // createCanvas(windowWidth, windowHeight);
  mainGraphics = createGraphics(width, height);
  fullCanvasTexture = createGraphics(width, height);

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

/*
  Helper functions
*/

// parse parameters
function setupParametersFromTokenData(token) {
  let hashPairs = [];
  //parse hash
  for (let j = 0; j < 32; j++) {
    hashPairs.push(token.hash.slice(2 + j * 2, 4 + j * 2));
  }
  // map to 0-255
  return hashPairs.map((x) => {
    return parseInt(x, 16);
  });
}

function generateSeedFromTokenData(token) {
  return parseInt(token.hash.slice(0, 16), 16);
}

/*
  Random setup and helper functions, some of these are taken from
  @mattdesl's canvas-sketch-util Random library and adapted to work
  with this
*/

function rnd() {
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;

  let result = ((seed < 0 ? ~seed + 1 : seed) % 1000) / 1000;
  return result;
}

function range(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Expected all arguments to be numbers");
  }

  return rnd() * (max - min) + min;
}

function rangeFloor(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Expected all arguments to be numbers");
  }

  return Math.floor(range(min, max));
}

function pick(array) {
  if (array.length === 0) return undefined;
  return array[rangeFloor(0, array.length)];
}

function shuffleArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected Array, got " + typeof arr);
  }

  var rand;
  var tmp;
  var len = arr.length;
  var ret = arr.slice();
  while (len) {
    rand = Math.floor(rnd() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function sampleSize(arr, num) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected Array, got " + typeof arr);
  }

  if (arr.length < num) {
    throw new TypeError(
      "Array is has less elements than sample size, " +
        arr.length +
        " vs " +
        num
    );
  }

  let shuffled = shuffleArray(arr);

  return { samples: shuffled.slice(0, num), leftOver: shuffled.slice(num) };
}

function mapd(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

function mapParam(n, start, stop) {
  return mapd(n, 0, 255, start, stop);
}

function chooseWithParam(obj, param) {
  let useParam,
    useMax = 255;
  // console.log(param);
  if (Array.isArray(param)) {
    useParam = param.reduce((a, b) => a * 256 + b, 0);
    useMax = Math.pow(256, param.length) - 1;
  } else {
    useParam = param;
  }

  let sum = Object.values(obj).reduce((a, b) => a + b, 0);
  let steps = Object.values(obj).reduce(
    (arr, num) => {
      arr.push((arr.slice(-1) || 0) * 1 + num);
      return arr;
    },
    [0]
  );
  let ran = mapd(useParam, 0, useMax, 0, sum);

  let result = 0;
  for (let i = steps.length - 1; i >= 1; i--) {
    result = i - 1;
    if (ran > steps[i - 1] && ran < steps[i]) {
      break;
    }
  }
  return Object.keys(obj)[result];
}

function convertToRarity(obj) {
  let cloneObj = JSON.parse(JSON.stringify(obj));
  let sum = Object.values(obj).reduce((a, b) => a + b, 0);
  for (let key of Object.keys(obj)) {
    cloneObj[key] = ((cloneObj[key] / sum) * 100).toFixed(2) + "%";
  }
  return cloneObj;
}
