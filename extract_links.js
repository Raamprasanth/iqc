const fs = require('fs');
const html = fs.readFileSync('public/frontend/firstrep.html', 'utf8');
const links = html.match(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g);
if(links) {
    links.forEach(l => {
        const m = l.match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
        if(m) console.log(m[1] + ' : ' + m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
    });
}
