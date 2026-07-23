const fs = require('fs');
const content = fs.readFileSync('public/frontend/iqc.html', 'utf8');
const brandIndex = content.indexOf('sb-brand');
console.log(content.substring(brandIndex - 20, brandIndex + 400));
