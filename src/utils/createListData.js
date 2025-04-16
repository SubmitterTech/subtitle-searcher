// utils/createSubtitlesJson.js

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
  // Split on blank lines
  const blocks = data.split(/\n\s*\n/);
  const subtitles = [];

  blocks.forEach((block) => {
    const lines = block.split('\n').filter((line) => line.trim() !== '');
    if (lines.length >= 3) {
      // Assume the first line is an index (which we ignore)
      // The second line is the timestamp.
      const timeString = lines[1].trim();
      const [start, end] = timeString.split(' --> ');
      const toSeconds = (t) => {
        const [h, m, s] = t.split(':');
        const [sec, ms] = s.split(',');
        return parseInt(h, 10) * 3600 +
               parseInt(m, 10) * 60 +
               parseInt(sec, 10) +
               parseInt(ms, 10) / 1000;
      };
      const startTime = toSeconds(start);
      const endTime = toSeconds(end);
      // Join remaining lines as a single subtitle text
      const text = lines.slice(2).join(' ').trim();
      subtitles.push({ startTime, endTime, text });
    }
  });

  return subtitles;
}

async function createSubtitlesJson() {
  // Adjust the path to your subtitles directory as needed.
  const subtitlesDir = path.join(__dirname, '../utils/subtitles');
  const files = await fs.readdir(subtitlesDir);
  const result = {};

  // Process each .txt file (named like 1.txt, 2.txt, etc.)
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(subtitlesDir, file);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const parsedSubtitles = parseSRT(data);
        // Use the file name (without extension) as key (e.g., "1")
        const fileKey = file.replace('.txt', '');
        result[fileKey] = parsedSubtitles;
        console.log(`Parsed subtitles from ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }

  // Write the resulting JSON to subtitles.json in the utils directory
  const outputPath = path.join(__dirname, 'subtitles.json');
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Subtitles JSON saved to ${outputPath}`);
}

createSubtitlesJson().catch((error) => {
  console.error('An error occurred:', error);
});
