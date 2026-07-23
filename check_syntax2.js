const fs = require('fs');
const content = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>');
const jsCode = content.substring(scriptStart + 8, scriptEnd);
fs.writeFileSync('firstrep_extracted2.js', jsCode);
