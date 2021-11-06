function convertToRarity(obj) {
  let cloneObj = JSON.parse(JSON.stringify(obj));
  let sum = Object.values(obj).reduce((a, b) => a + b, 0);
  for (let key of Object.keys(obj)) {
    cloneObj[key] = ((cloneObj[key] / sum) * 100).toFixed(2) + "%";
  }
  return cloneObj;
}
