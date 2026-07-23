const fs = require('fs');

let rej = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html', 'utf8');
rej = rej.replace('            }, 600);\n        }\n        }\n\n        async function acceptSubItem', '            }, 600);\n        }\n\n        async function acceptSubItem');
fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/rejectedpro.html', rej, 'utf8');
console.log('Fixed rejectedpro.html');

let acc = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', 'utf8');
const docTypeIdx = acc.lastIndexOf('<!DOCTYPE html>');
if (docTypeIdx > 0 && docTypeIdx !== acc.indexOf('<!DOCTYPE html>')) {
    acc = acc.substring(0, docTypeIdx);
    fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', acc, 'utf8');
    console.log('Fixed acceptedpro.html');
}
