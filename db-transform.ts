import fs from "fs";
import slugify from "slugify";
import streamJsonPkg from "stream-json";
import streamArrayPkg from "stream-json/streamers/StreamArray.js";

// Destructure CommonJS exports
const { parser } = streamJsonPkg;
const { streamArray } = streamArrayPkg;

const inputFile = "openings.json";
const outputFile = "openings-1.json";

async function transformJson() {
  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  const pipeline = readStream.pipe(parser()).pipe(streamArray());

  writeStream.write("[\n");
  let first = true;
  let count = 0;

  for await (const { value } of pipeline) {
    // ✅ Example transformation logic:
    // (Modify this part for your actual needs)
    value.moves_list = JSON.parse(value.moves_list.replace(/'/g, '"'));
    for (let i = 0; i < value.moves_list.length; i++) {
        value.moves_list[i] = value.moves_list[i].includes(".") ? value.moves_list[i].split(".")[1] : value.moves_list[i];
    }
    delete value[""]
    delete value["ECO"]
    delete value["Last Played"]
    delete value["White_Wins"]
    delete value["Black_Wins"]
    delete value["White_odds"]
    for (const key in value) {
        if (/^move.*[bw]$/.test(key)) {
            delete value[key];
        }
    }
    value.slug = slugify(value.Opening).toLowerCase();
    value.tags = value.Opening.split(",").map(tag => tag.trim());
    if (!first) writeStream.write(",\n");
    writeStream.write("  " + JSON.stringify(value, null, 2));

    first = false;
    count++;
  }

  writeStream.write("\n]\n");
  writeStream.end();

  console.log(`✅ Processed and saved ${count} records to ${outputFile}`);
}

transformJson().catch(err => console.error("❌ Error:", err));
