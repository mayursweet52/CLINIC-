const fs = require('fs');
const lines = fs.readFileSync('C:/Users/mayur/.gemini/antigravity/brain/ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (let l of lines) {
  if (l.includes('TUKDA 2: Clinic Admin Flow') && l.includes('"type":"USER_INPUT"')) {
    const data = JSON.parse(l);
    fs.writeFileSync('tukda2.txt', data.content);
    break;
  }
}
