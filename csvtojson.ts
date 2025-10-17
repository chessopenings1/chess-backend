import fs from "fs";
import path from "path";
import readline from "readline";

const inputFile = path.resolve("lichess_db_puzzle.csv");
const outputFile = path.resolve("lichess_db_puzzle.json");

// --- Parse one CSV line (handles quotes & escaped commas) ---
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function csvToJsonStream() {
  const readStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  const writeStream = fs.createWriteStream(outputFile);
  let headers: string[] = [];
  let firstLine = true;
  let firstObject = true;

  writeStream.write("[\n");

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (firstLine) {
      headers = parseCSVLine(line);
      firstLine = false;
      continue;
    }

    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));

    if (!firstObject) writeStream.write(",\n");
    writeStream.write("  " + JSON.stringify(obj, null, 2));
    firstObject = false;
  }

  writeStream.write("\n]\n");
  writeStream.end();

  console.log(`✅ Finished: ${outputFile}`);
}

csvToJsonStream().catch(err => console.error("❌ Error:", err));
