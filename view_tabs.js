const fs = require('fs');
const lines = fs.readFileSync('public/frontend/firstrep.html', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('tabAccepted'));
if(idx !== -1) {
    for(let i = idx - 5; i < idx + 5; i++) console.log(lines[i]);
}
