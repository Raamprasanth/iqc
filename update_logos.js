const fs = require('fs');
const path = require('path');

const dir = 'public/frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let changed = false;

    if (file === 'index.html') {
        // Topbar
        const topbarRegex = /<div class="nav-logo-mark">[\s\S]*?<\/svg>\s*<\/div>\s*<span class="nav-brand">SCHILLER <span>India<\/span><\/span>/;
        if (topbarRegex.test(content)) {
            content = content.replace(topbarRegex, 
                `<div style="display: flex; align-items: center; justify-content: center;">
                <img src="logo.png" alt="SCHILLER Logo" style="height: 40px; width: auto; object-fit: contain;">
            </div>`);
            changed = true;
        }
        
        // Footer
        const footerRegex = /<div class="nav-logo-mark">[\s\S]*?<\/svg>\s*<\/div>\s*<span class="nav-brand" style="font-size:1rem;">SCHILLER <span>India<\/span><\/span>/;
        if (footerRegex.test(content)) {
            content = content.replace(footerRegex,
                `<div style="display: flex; align-items: center; justify-content: center;">
                <img src="logo.png" alt="SCHILLER Logo" style="height: 32px; width: auto; object-fit: contain;">
            </div>`);
            changed = true;
        }
    } else if (file === 'login.html') {
        const loginRegex = /<div class="logo-container">[\s\S]*?<div class="logo-icon">[\s\S]*?<\/svg>\s*<\/div>\s*<div>\s*<div class="logo-text">SCHILLER <span>India<\/span><\/div>\s*<div class="logo-sub">Healthcare Operations<\/div>\s*<\/div>\s*<\/div>/;
        if (loginRegex.test(content)) {
            content = content.replace(loginRegex, 
                `<div class="logo-container" style="display: flex; justify-content: center; margin-bottom: 24px;">
                <img src="logo.png" alt="SCHILLER Logo" style="height: 64px; width: auto; object-fit: contain;">
            </div>`);
            changed = true;
        }
    } else {
        // Sidebars
        const sidebarRegex = /<div class="sb-brand">[\s\S]*?<\/svg>\s*<\/div>\s*<div class="sb-brand-text">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
        if (sidebarRegex.test(content)) {
            content = content.replace(sidebarRegex,
                `<div class="sb-brand" style="display: flex; justify-content: center; align-items: center; padding: 24px 16px;">
                <img src="logo.png" alt="SCHILLER Logo" style="height: 48px; width: auto; object-fit: contain;">
            </div>`);
            changed = true;
        } else {
            // Some files might have slightly different format (maybe missing sub or formatting)
            const fallbackRegex = /<div class="sb-brand">[\s\S]*?<\/div>\s*<nav class="sb-nav">/;
            if (fallbackRegex.test(content)) {
                content = content.replace(fallbackRegex,
                    `<div class="sb-brand" style="display: flex; justify-content: center; align-items: center; padding: 24px 16px;">
                <img src="logo.png" alt="SCHILLER Logo" style="height: 48px; width: auto; object-fit: contain;">
            </div>
            <nav class="sb-nav">`);
                changed = true;
            }
        }
    }

    if (changed) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log(`Updated ${file}`);
    }
});
console.log('All done');
