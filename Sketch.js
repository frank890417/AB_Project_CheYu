// console.log(tokenData);
let projectNumber = Math.floor(parseInt(tokenData.tokenId) / 1000000);
let mintNumber = parseInt(tokenData.tokenId) % (projectNumber * 1000000);
let seed = parseInt(tokenData.hash.slice(0, 16), 16);

// Gets you an array of 32 parameters from the hash ranging from 0-255
let rawParams = setupParametersFromTokenData(tokenData);

class Random {
  constructor(seed) {
    this.seed = seed;
  }
  random() {
    return this.random_dec();
  }
  random_dec() {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    this.seed ^= this.seed << 13;
    this.seed ^= this.seed >> 17;
    this.seed ^= this.seed << 5;
    return ((this.seed < 0 ? ~this.seed + 1 : this.seed) % 1000) / 1000;
  }
  random_num(a, b) {
    if (b === undefined) {
      b = a;
      a = 0;
    }
    return a + (b - a) * this.random_dec();
  }
  random_int(a, b) {
    if (b === undefined) {
      b = a;
      a = 0;
    }
    return Math.floor(this.random_num(a, b + 1));
  }
  random_bool(p) {
    return this.random_dec() < p;
  }
  random_choice(list) {
    return list[Math.floor(this.random_num(0, list.length * 0.99))];
  }

  random_choice_weight(obj) {
    let sum = Object.values(obj).reduce((a, b) => a + b, 0);
    let steps = Object.values(obj).reduce(
      (arr, num) => {
        arr.push((arr.slice(-1) || 0) * 1 + num);
        return arr;
      },
      [0]
    );
    let ran = this.random_num(0, sum);
    let result = 0;
    for (let i = steps.length - 1; i >= 1; i--) {
      result = i - 1;
      if (ran > steps[i - 1] && ran < steps[i]) {
        break;
      }
    }
    return Object.keys(obj)[result];
  }
}

let R = new Random(seed);

class Particle {
  constructor(args) {
    let def = {
      p: createVector(0, 0),
      v: createVector(0, 0),
      a: createVector(0, 0),
      r: R.random_num(0, useParticleSize) * R.random_num(0.1, 1) + 1,
      generation: 0,
      id: int(R.random_num(0, 1000)),
      vFriction: R.random_num(0.99, 1),
      rFactor: R.random_num(0.99, 0.9995),
      area: null,
      hasFruit: R.random_num() < 0.5,
      color: "white",
      life: 500,
    };
    Object.assign(def, args);
    Object.assign(this, def);
  }
  draw() {
    mainGraphics.push();
    mainGraphics.translate(this.p);
    mainGraphics.fill(this.color);
    mainGraphics.ellipse(0, 0, this.r, this.r);

    if (R.random_dec() < 0.02) {
      let ss = R.random_num(0, 5);
      mainGraphics.noFill();
      mainGraphics.strokeWeight(2);
      mainGraphics.stroke(this.color);
      mainGraphics.ellipse(0, 0, this.r * ss, this.r * ss);
    }
    mainGraphics.pop();
  }
  update() {
    if (R.random_dec() < 0.01 && this.area) {
      this.color = R.random_choice(this.area.colors);
    }
    if (this.area) {
      // this.p.x+=cos(this.p.x*this.area.sx)/5
      // this.p.y+=sin(this.p.y*this.area.sy)/5
      this.v.x += cos((this.p.x * this.area.sx) / 10) / 10;
      this.v.y += sin((this.p.y * this.area.sy) / 10) / 10;

      // this.p.x +=noise(this.p.x*this.area.noiseX)*this.area.noiseXAmp
      // this.p.y +=noise(this.p.y*this.area.noiseY)*this.area.noiseYAmp
      // this.v.x+=this.area.gravity.x
      // this.v.y+=this.area.gravity.y
      // this.
    }
    this.v.mult(this.vFriction);

    this.r *= this.rFactor;
    this.p.add(this.v);

    this.v.add(this.a);
    this.life--;
  }
}

let overAllTexture;
let canvasTexture;
let mapColorsToArr = (str) => str.split("-").map((a) => "#" + a);
let colors = {
  Paper: {
    weight: 100,
    value: mapColorsToArr("222-666-999-aaa-ccc-eee-fff-080808"),
  },
  Kimono: {
    weight: 100,
    value: mapColorsToArr("fff-f24-fae8eb-f6caca-e4c2c6-cd9fcc-0a014f"),
  },
  Sea: {
    weight: 100,
    value: mapColorsToArr("e63946-f1faee-a8dadc-457b9d-1d3557"),
  },
  Confetti: {
    weight: 100,
    value: mapColorsToArr("201e1f-ff4000-faaa8d-feefdd-50b2c0"),
  },
  Vine: {
    weight: 100,
    value: mapColorsToArr("fff-222-545454-69747c-6baa75-84dd63-cbff4d"),
  },
  Festival: {
    weight: 100,
    value: mapColorsToArr("12355b-420039-d72638-ffffff-ff570a"),
  },
  Lolipop: {
    weight: 100,
    value: mapColorsToArr("ff499e-d264b6-a480cf-779be7-49b6ff-fff-000"),
  },
  Eastern: {
    weight: 100,
    value: mapColorsToArr("333745-e63462-fe5f55-c7efcf-eef5db"),
  },
  Beans: {
    weight: 100,
    value: mapColorsToArr("fb6107-f3de2c-7cb518-5c8001-fbb02d-fff-111"),
  },
  MonoChrome: {
    weight: 100,
    value: mapColorsToArr("000-fff-333"),
  },
  Mint: {
    weight: 100,
    value: mapColorsToArr("000-fff-333-00ffbb"),
  },
  Taxi: {
    weight: 100,
    value: mapColorsToArr("000-fff-333-fff719"),
  },
};
let startPositions = {
  Center: [0.5, 0.5],
  CornerLT: [0.2, 0.2],
  CornerRT: [0.8, 0.2],
  CornerLB: [0.2, 0.8],
  CornerRB: [0.8, 0.8],
};
let particleCounts = {
  Less: {
    weight: 2,
    value: 100,
  },
  Medium: {
    weight: 5,
    value: 120,
  },
  More: {
    weight: 1,
    value: 140,
  },
};
let particleSizes = {
  XS: {
    weight: 2,
    value: 25,
  },
  S: {
    weight: 5,
    value: 40,
  },
  M: {
    weight: 5,
    value: 55,
  },
  L: {
    weight: 4,
    value: 70,
  },
};
let useStartPosition;
let useParticleCount;
let useColorSet;
let useParticleSize;
let mainGraphics;
let areas = [];

//---------
let mapListToWeightedKeys = (list) => {
  return Object.entries(list)
    .filter((pair) => pair[0])
    .reduce((obj, arr) => {
      obj[arr[0]] = arr[1]?.weight || 1;
      return obj;
    }, {});
};
let allFeatureList = {
  Color: mapListToWeightedKeys(colors),
  StartPosition: mapListToWeightedKeys(startPositions),
  ParticleCount: mapListToWeightedKeys(particleCounts),
  ParticleSize: mapListToWeightedKeys(particleSizes),
  // RailType: {
  //   Sine: 20,
  //   Triangle: 5,
  //   Square: 5,
  // },
};
// features.RailType = R.random_choice_weight(allFeatureList.RailType);

//------------------------------

function getValueOfList(list, key) {
  return list[key]?.value || list[key];
}

function renderFeatures() {
  features.Color = R.random_choice_weight(allFeatureList.Color);
  useColorSet = getValueOfList(colors, features.Color);

  features.StartPosition = R.random_choice_weight(allFeatureList.StartPosition);
  useStartPosition = getValueOfList(startPositions, features.StartPosition);

  features.ParticleCount = R.random_choice_weight(allFeatureList.ParticleCount);
  useParticleCount = getValueOfList(particleCounts, features.ParticleCount);

  features.ParticleSize = R.random_choice_weight(allFeatureList.ParticleSize);
  useParticleSize = getValueOfList(particleSizes, features.ParticleSize);
}

function preload() {
  renderFeatures();
  canvasTexture = loadImage("canvas.jpeg");
}

function div(x, y, w, h, z) {
  if (R.random_dec() < 0.5 + z / 8 && z > 0) {
    let ratio = R.random_num(0.2, 0.8);
    if (R.random_dec() < 0.3) {
      let ww = w * ratio;
      div(x, y, ww, h, z - 1);
      div(x + ww, y, w - ww, h, z - 1);
    } else {
      let hh = h * ratio;
      div(x, y, w, hh, z - 1);
      div(x, y + hh, w, h - hh, z - 1);
    }
  } else {
    let newArea = {
      x,
      y,
      w,
      h,
      sx: R.random_num(0, 2),
      sy: R.random_num(0, 2),
      noiseX: R.random_num(0, 100),
      noiseY: R.random_num(0, 1000),
      noiseXAmp: R.random_num(-5, 5),
      noiseYAmp: R.random_num(-5, 5),
      gravity: createVector(R.random_num(-0.1, 0.1), R.random_num(-0.1, 0.1)),
      colors: useColorSet,
      id: int(R.random_num(0, 100000)),
    };
    mainGraphics.noStroke();
    areas.push(newArea);
    mainGraphics.fill(R.random_choice(newArea.colors));
    mainGraphics.rect(x, y, w, h);
  }
}

function divAng(stR, edR, stAng, edAng, d, colors) {
  if (random() < 0.2) {
    colors = random([colors1, colors2]);
  }
  push();
  if (random() < 0.3) {
    d -= 1;
    // return
  }
  let ratio = random(0.3, 0.7);
  if (d > 0) {
    if (random() < 0.35) {
      let splitNum = random([2, 2, 2, 2, 2, 3]);
      for (var o = 1; o <= splitNum; o++) {
        divAng(
          stR,
          edR,
          stAng + ((o - 1) * (edAng - stAng)) / splitNum,
          stAng + (o * (edAng - stAng)) / splitNum,
          d - 1
        );
      }
      // divAng(stR,edR,
      // 			 stAng,
      // 			 stAng+ratio*(edAng-stAng),d-1)
      // divAng(stR,edR,
      // 			 stAng+ratio*(edAng-stAng),
      // 			 edAng,d-1)
    } else {
      divAng(stR, stR + ratio * (edR - stR), stAng, edAng, d - 1);
      divAng(stR + ratio * (edR - stR), edR, stAng, edAng, d - 1);
    }
  }
  pop();
}

let particles = [];
let ang;
function setup() {
  pixelDensity(2);
  createCanvas(1200, 1200);
  mainGraphics = createGraphics(width, height);
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

  div(0, 0, width, height, int(R.random_num(2, 5)));
  for (var i = 0; i < useParticleCount; i++) {
    let pColor = R.random_choice(useColorSet);
    particles.push(
      new Particle({
        p: createVector(
          useStartPosition[0] * width,
          useStartPosition[1] * height
        ),
        v: createVector(0, 1)
          .rotate(R.random_num(0, 2 * PI))
          .mult(5),
        color: pColor,
      })
    );
  }

  mainGraphics.translate(width / 2, height / 2);
  mainGraphics.rotate(ang);
  mainGraphics.translate(-width / 2, -height / 2);
}

let checkParticleInArea = (area, p) => {
  let rectCheckFunc = (area, p) =>
    p.p.x > area.x &&
    p.p.x < area.x + area.w &&
    p.p.y > area.y &&
    p.p.y < area.y + area.h;
  let checkFunc = area.checkFunc || rectCheckFunc;

  return checkFunc(area, p);
};

function draw() {
  mainGraphics.noStroke();

  // 	if (mouseIsPressed){
  // 		particles.push(new Particle({
  // 			p: createVector(mouseX,mouseY),
  // 			v: p5.Vector.random2D().mult(5),
  // 			color: random(colors)
  // 		}))
  // 	}

  particles.forEach((particle) => {
    particle.update();
    areas.forEach((area) => {
      if (checkParticleInArea(area, particle)) {
        if (particle.area !== area) {
          particle.area = area;
          particle.color = R.random_choice(area.colors);
          particle.v.rotate(R.random_num(-1, 1));
          if (R.random_dec() < 0.1 && particle.generation < 5) {
            let p = new Particle({
              p: particle.p.copy(),
              v: particle.v.copy(),
              a: particle.a.copy(),
              generation: particle.generation + 1,
            });
            particles.push(p);
          }
        }
      }
    });
    particle.draw();
  });
  particles = particles.filter((p) => p.life > 0);

  image(mainGraphics, 0, 0);

  // push();
  // blendMode(MULTIPLY);
  // image(canvasTexture, 0, 0, 1920 * 1.15, 1080 * 1.15);
  // pop();
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
