const fs = require('fs');
let html = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');

html = html.replace(
    /document\.getElementById\('kpiLots'\)\.textContent = totalLots;/,
    "if (document.getElementById('kpiLots')) document.getElementById('kpiLots').textContent = totalLots;"
);
html = html.replace(
    /document\.getElementById\('kpiParts'\)\.textContent = totalPartLines;/,
    "if (document.getElementById('kpiParts')) document.getElementById('kpiParts').textContent = totalPartLines;"
);

fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', html);
console.log('Fixed KPI null references in firstrep.html');
