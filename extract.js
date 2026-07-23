const fs = require('fs');
const html = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');

const matches = html.match(/<script>([\s\S]*?)<\/script>/g);
if (matches) {
    matches.forEach((m, i) => {
        const js = m.replace(/<\/?script>/g, '');
        fs.writeFileSync('script_' + i + '.js', js);
        console.log('Extracted script_' + i + '.js');
    });
}
