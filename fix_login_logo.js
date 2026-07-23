const fs = require('fs');

let content = fs.readFileSync('public/frontend/login.html', 'utf8');

const loginRegex = /<div class="brand-logo">[\s\S]*?<div class="logo-mark">[\s\S]*?<\/svg>\s*<\/div>\s*<div>\s*<div class="logo-text">SCHILLER <span>India<\/span><\/div>\s*<div class="logo-sub">Healthcare Operations<\/div>\s*<\/div>\s*<\/div>/;

if (loginRegex.test(content)) {
    content = content.replace(loginRegex, 
        `<div class="brand-logo" style="display: flex; justify-content: center; margin-bottom: 24px;">
            <img src="logo.png" alt="SCHILLER Logo" style="height: 64px; width: auto; object-fit: contain;">
        </div>`);
    fs.writeFileSync('public/frontend/login.html', content);
    console.log("Updated login.html");
} else {
    console.log("No match found in login.html");
}
