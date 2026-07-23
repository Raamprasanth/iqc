const fs = require('fs');

const files = [
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/production.html',
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/inwardp.html',
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html',
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html',
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/reinwardpro.html',
    'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        // Regex to match the Shop Floor section up until the next nav-group-label (System)
        const regex = /<div class="nav-group-label">Shop Floor<\/div>[\s\S]*?(?=<div class="nav-group-label">System<\/div>)/g;
        if (html.match(regex)) {
            html = html.replace(regex, '');
            fs.writeFileSync(file, html);
            console.log('Removed Shop Floor from ' + file);
        } else {
            console.log('Shop Floor not found in ' + file);
        }
    }
});
