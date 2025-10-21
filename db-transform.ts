import axios from "axios";
import fs from "fs";
import slugify from "slugify";
import streamJsonPkg from "stream-json";
import streamArrayPkg from "stream-json/streamers/StreamArray.js";

// Destructure CommonJS exports
const { parser } = streamJsonPkg;
const { streamArray } = streamArrayPkg;

const inputFile = "lichess_db_puzzle.json";
const outputFile = "lichess_db_puzzle-1.json";

async function transformJson() {
  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  const pipeline = readStream.pipe(parser()).pipe(streamArray());

  writeStream.write("[\n");
  let first = true;
  let count = 0;

  for await (const { value } of pipeline) {
    if (first) console.log(value);

    value.isOpening = value.OpeningTags == "" ? false : true;
    value.Themes = value.Themes.split(",").map(theme => theme.trim());

    if (value.isOpening) {
      console.log(value.OpeningTags);
      const openings = value.OpeningTags.split(" ");
      const openingName = openings[openings.length - 1];
      const openingSlug = slugify(openingName, { lower: true }).replaceAll("_", "-");
      console.log(openingSlug);
      const opening = await axios.get(`https://api.chess.com/openings/slug/${openingSlug}`);
      console.log(opening.data);
    }

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
