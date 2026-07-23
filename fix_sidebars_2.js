const fs = require('fs');

function updateSidebars() {
    let adminHtml = fs.readFileSync('public/frontend/admin.html', 'utf8');
    adminHtml = adminHtml.replace('<span>Inward IP</span>', '<span>Models</span>');
    fs.writeFileSync('public/frontend/admin.html', adminHtml);

    const match = adminHtml.match(/<aside class="sidebar(.*?)"([\s\S]*?)>[\s\S]*?<\/aside>/);
    if (!match) {
        console.error("Could not find sidebar in admin.html");
        return;
    }
    const adminSidebar = match[0];
    
    // acceptedip.html
    let acceptedHtml = fs.readFileSync('public/frontend/acceptedip.html', 'utf8');
    acceptedHtml = acceptedHtml.replace(/<aside class="sidebar(.*?)"([\s\S]*?)>[\s\S]*?<\/aside>/, adminSidebar);
    // adjust active link for acceptedip
    acceptedHtml = acceptedHtml.replace(/<div class="sb-item active" onclick="navigate\('user-management', this\)">/, '<div class="sb-item" onclick="window.location.href=\'admin.html\'">');
    acceptedHtml = acceptedHtml.replace(/<div class="sb-item" onclick="window\.location\.href='acceptedip\.html'">/, '<div class="sb-item active" onclick="window.location.href=\'acceptedip.html\'">');
    fs.writeFileSync('public/frontend/acceptedip.html', acceptedHtml);
    
    // inwardip.html
    let inwardipHtml = fs.readFileSync('public/frontend/inwardip.html', 'utf8');
    inwardipHtml = inwardipHtml.replace(/<aside class="sidebar(.*?)"([\s\S]*?)>[\s\S]*?<\/aside>/, adminSidebar);
    // adjust active link for inwardip
    inwardipHtml = inwardipHtml.replace(/<div class="sb-item active" onclick="navigate\('user-management', this\)">/, '<div class="sb-item" onclick="window.location.href=\'admin.html\'">');
    inwardipHtml = inwardipHtml.replace(/<div class="sb-item" onclick="window\.location\.href='inwardip\.html'">/, '<div class="sb-item active" onclick="window.location.href=\'inwardip.html\'">');
    // For inwardip, if it was already updated to inwardip in previous step, replace that
    inwardipHtml = inwardipHtml.replace(/<div class="sb-item active" onclick="window\.location\.href='acceptedip\.html'">/, '<div class="sb-item" onclick="window.location.href=\'acceptedip.html\'">');

    // also replace Master Parts Catalog to Models
    inwardipHtml = inwardipHtml.replace(/<title>.*?<\/title>/, '<title>Models — SCHILLER Healthcare India</title>');
    inwardipHtml = inwardipHtml.replace(/<h1>Master Parts Catalog<\/h1>/, '<h1>Models</h1>');
    inwardipHtml = inwardipHtml.replace(/<h2>Models &amp; Parts Catalog<\/h2>/, '<h2>Models Catalog</h2>');
    
    fs.writeFileSync('public/frontend/inwardip.html', inwardipHtml);
    
    console.log("Sidebars updated successfully!");
}

updateSidebars();
