const fs = require('fs').promises;
const path = require('path');

/**
 * Simple SRT parser.
 * Expects blocks separated by blank lines, with:
 *  - An optional index on the first line.
 *  - A timestamp on the second line in the format "hh:mm:ss,ms --> hh:mm:ss,ms"
 *  - One or more lines of subtitle text.
 */
function parseSRT(data) {
  const blocks = data.split(/\n\s*\n/);
  const subtitles = [];

  blocks.forEach((block) => {
    const lines = block.split('\n').filter((line) => line.trim() !== '');
    if (lines.length >= 3) {
      const timeString = lines[1].trim();
      const [start, end] = timeString.split(' --> ');

      const toSeconds = (t) => {
        const [h, m, s] = t.split(':');
        const [sec, ms] = s.split(',');
        return (
          parseInt(h, 10) * 3600 +
          parseInt(m, 10) * 60 +
          parseInt(sec, 10) +
          parseInt(ms, 10) / 1000
        );
      };

      const startTime = toSeconds(start);
      const endTime = toSeconds(end);
      const text = lines.slice(2).join(' ').trim();
      subtitles.push({ startTime, endTime, text });
    }
  });

  return subtitles;
}

// Custom comparator: 1, 1v, 2, 2v, ...
function subtitlesKeyComparator(a, b) {
  const ma = a.match(/^(\d+)(v)?$/);
  const mb = b.match(/^(\d+)(v)?$/);

  const aIsPair = !!ma;
  const bIsPair = !!mb;

  // If both are of the numeric[/v] form
  if (aIsPair && bIsPair) {
    const aNum = Number(ma[1]);
    const bNum = Number(mb[1]);

    if (aNum !== bNum) {
      return aNum - bNum;
    }

    // Same base number: plain before 'v'
    const aHasV = !!ma[2]; // 'v' or undefined
    const bHasV = !!mb[2];

    if (aHasV === bHasV) return 0;
    return aHasV ? 1 : -1; // e.g. "1" < "1v"
  }

  // If one is numeric[/v] and the other is not, numeric[/v] comes first
  if (aIsPair && !bIsPair) return -1;
  if (!aIsPair && bIsPair) return 1;

  // Fallback: regular lexicographic
  return a.localeCompare(b, 'en', { numeric: true });
}

async function createSubtitlesJson() {
  const subtitlesDir = path.join(__dirname, '../utils/subtitles');
  const outputPath = path.join(__dirname, 'subtitles.json');

  // Load existing JSON if present
  let result = {};
  try {
    const existing = await fs.readFile(outputPath, 'utf8');
    try {
      result = JSON.parse(existing);
      console.log('Loaded existing subtitles.json for update.');
    } catch (parseErr) {
      console.warn(
        'Existing subtitles.json is invalid JSON. It will be overwritten.',
        parseErr
      );
      result = {};
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('subtitles.json not found. A new one will be created.');
      result = {};
    } else {
      throw err;
    }
  }

  // Update from .txt files
  const files = await fs.readdir(subtitlesDir);

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(subtitlesDir, file);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const parsedSubtitles = parseSRT(data);
        const fileKey = file.replace('.txt', '');
        result[fileKey] = parsedSubtitles;
        console.log(`Parsed and updated subtitles for key "${fileKey}" from ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }

  // Sort keys with the custom comparator
  const sortedKeys = Object.keys(result).sort(subtitlesKeyComparator);

  const sortedResult = {};
  for (const key of sortedKeys) {
    sortedResult[key] = result[key];
  }

  await fs.writeFile(outputPath, JSON.stringify(sortedResult, null, 2), 'utf8');
  console.log(`Subtitles JSON updated at ${outputPath}`);
}

createSubtitlesJson().catch((error) => {
  console.error('An error occurred:', error);
});
