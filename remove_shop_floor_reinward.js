const fs = require('fs');
const file = 'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/reinwardpro.html';
let html = fs.readFileSync(file, 'utf8');
const regex = /<div class="nav-group-label">Shop Floor<\/div>[\s\S]*?(?=<\/nav>)/g;
if (html.match(regex)) {
    html = html.replace(regex, '');
    fs.writeFileSync(file, html);
    console.log('Removed Shop Floor from ' + file);
} else {
    console.log('Shop Floor not found in ' + file);
}
