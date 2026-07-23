const fs = require('fs');
const path = require('path');

const dir = 'public/frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let changed = false;

    const sidebarHeaderRegex = /<div class="sidebar-header">[\s\S]*?<div class="sidebar-logo-mark">[\s\S]*?<\/svg>\s*<\/div>\s*<div class="sidebar-brand">SCHILLER <span>India<\/span>[\s\S]*?<\/div>\s*<\/div>/g;
    
    if (sidebarHeaderRegex.test(content)) {
        content = content.replace(sidebarHeaderRegex,
            `<div class="sidebar-header" style="display: flex; justify-content: center; align-items: center; padding: 24px 16px;">
            <img src="logo.png" alt="SCHILLER Logo" style="height: 48px; width: auto; object-fit: contain;">
        </div>`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log(`Updated ${file}`);
    }
});
console.log('All done');
