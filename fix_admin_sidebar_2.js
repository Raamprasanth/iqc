const fs = require('fs');
let html = fs.readFileSync('public/frontend/admin.html', 'utf8');

const regex = /(<div class="sb-item active" onclick="navigate\('user-management', this\)">[\s\S]*?<\/div>)\s*(<div class="sb-section-label">System<\/div>)/;

const newLink = `
                <div class="sb-item" onclick="window.location.href='acceptedip.html'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span>Inward Admin</span>
                </div>
`;

if (regex.test(html)) {
    html = html.replace(regex, `$1\n${newLink}\n$2`);
    fs.writeFileSync('public/frontend/admin.html', html);
    console.log("Updated admin.html");
} else {
    console.log("Regex didn't match.");
}
