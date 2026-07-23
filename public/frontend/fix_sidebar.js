const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend';

const iqcSidebar = `<nav class="sidebar-nav">
            <div class="nav-group-label">Overview</div>
            <a href="iqc.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
                Dashboard
            </a>

            <div class="nav-group-label">Material Flow</div>
            <a href="inward.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M21 12H9M14 6l7 6-7 6" />
                    <path d="M3 6v12" />
                </svg>
                Inward Register
                <span class="badge" id="iqcInwardBadge">0</span>
            </a>
            <a href="acceptediqc.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accepted
            </a>
            <a href="rejectediqc.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Rejected
                <span class="badge" id="iqcRejectedBadge">0</span>
            </a>
            <a href="reinward.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Completed
                <span class="badge" id="iqcReInwardBadge">0</span>
            </a>

            <div class="nav-group-label">System</div>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-.33-1.82L4.6 13.1a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 9a1.65 1.65 0 001-1.51V7a2 2 0 014 0v.09A1.65 1.65 0 0015 9a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019 13a1.65 1.65 0 00.33 1.82z" />
                </svg>
                Settings
            </a>
`;

const ipqcSidebar = `<nav class="sidebar-nav">
            <div class="nav-group-label">Overview</div>
            <a href="inwardip.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="9" rx="1.5" />
                    <rect x="14" y="3" width="7" height="5" rx="1.5" />
                    <rect x="14" y="12" width="7" height="9" rx="1.5" />
                    <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
                Dashboard
            </a>

            <div class="nav-group-label">Material Flow</div>
            <a href="inwardip.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M21 12H9M14 6l7 6-7 6" />
                    <path d="M3 6v12" />
                </svg>
                In-Process Register
                <span class="badge" id="ipqcInwardBadge">0</span>
            </a>
            <a href="acceptedip.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Accepted
            </a>
            <a href="rejectedip.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Rejected
                <span class="badge" id="ipqcRejectedBadge">0</span>
            </a>
            <a href="reinwardip.html" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Completed
                <span class="badge" id="ipqcReInwardBadge">0</span>
            </a>

            <div class="nav-group-label">System</div>
            <a href="#" class="sidebar-link">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-.33-1.82L4.6 13.1a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 9a1.65 1.65 0 001-1.51V7a2 2 0 014 0v.09A1.65 1.65 0 0015 9a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019 13a1.65 1.65 0 00.33 1.82z" />
                </svg>
                Settings
            </a>
`;

function fixFile(file, newSidebar) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const regex = /<nav class="sidebar-nav">[\s\S]*?<\/nav>/;
    if (regex.test(content)) {
        // Find the link for this file and add 'active' class
        const fileRegex = new RegExp('href="' + file + '" class="sidebar-link"');
        let finalSidebar = newSidebar.replace(fileRegex, 'href="' + file + '" class="sidebar-link active"');
        content = content.replace(regex, finalSidebar + "</nav>");
        
        fs.writeFileSync(filePath, content);
        console.log('Fixed', file);
    }
}

// IQC Files
['iqc.html', 'inward.html', 'acceptediqc.html', 'rejectediqc.html', 'reinward.html'].forEach(f => fixFile(f, iqcSidebar));

// IPQC Files
['inwardip.html', 'acceptedip.html', 'rejectedip.html', 'reinwardip.html'].forEach(f => fixFile(f, ipqcSidebar));
