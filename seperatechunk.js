import * as fs from "fs";
import * as child from "child_process";
var dir = "./build";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
} else {
  fs.rmdirSync(dir, {
    recursive: true,
  });
  fs.mkdirSync(dir);
}

var ResultArray;
fs.readFile("Sketch.js", "utf8", function (err, contents) {
  // console.log(contents);
  var chunks = contents.split("//%");

  chunks.forEach((chunk, chunkId) => {
    fs.writeFileSync(`${dir}/chunk${chunkId}.js`, chunk);
    child.exec(
      `minify ${dir}/chunk${chunkId}.js > ${dir}/chunk${chunkId}.min.js`,
      (error, stdout, stderr) => {
        if (error) {
        }
      }
    );
  });
});
