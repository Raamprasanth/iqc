const fs = require('fs');

let html = fs.readFileSync('public/frontend/admin.html', 'utf8');

const regex = /(<div class="sb-item" onclick="window\.location\.href='acceptedip\.html'">[\s\S]*?<\/div>)/;

const newLink = `
                <div class="sb-item" onclick="window.location.href='inwardip.html'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Inward IP</span>
                </div>`;

if (regex.test(html) && !html.includes("Inward IP")) {
    html = html.replace(regex, `$1\n${newLink}`);
    fs.writeFileSync('public/frontend/admin.html', html);
    console.log("Updated admin.html");
} else {
    console.log("Regex didn't match or link already exists.");
}
