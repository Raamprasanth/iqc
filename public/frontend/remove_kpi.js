const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let kpiIndex = content.indexOf('<div class="kpi-grid">');
    while (kpiIndex !== -1) {
        // Find the closing div for this kpi-grid
        let depth = 1;
        let pos = kpiIndex + '<div class="kpi-grid">'.length;
        
        while (depth > 0 && pos < content.length) {
            const nextDivOpen = content.indexOf('<div', pos);
            const nextDivClose = content.indexOf('</div', pos);
            
            if (nextDivClose === -1) {
                break; // Should not happen in well-formed HTML
            }
            
            if (nextDivOpen !== -1 && nextDivOpen < nextDivClose) {
                depth++;
                pos = nextDivOpen + 4;
            } else {
                depth--;
                pos = nextDivClose + 6;
            }
        }
        
        // Remove the block
        content = content.substring(0, kpiIndex) + content.substring(pos);
        
        // Look for the next one
        kpiIndex = content.indexOf('<div class="kpi-grid">');
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Processed', file);
});
