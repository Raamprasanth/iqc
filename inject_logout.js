const fs = require('fs');
const path = require('path');
const dir = 'public/frontend';

const extraCode = `
        const footEls = document.querySelectorAll('.sidebar-foot');
        footEls.forEach(foot => {
            if (!foot.querySelector('.logout-btn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.className = 'logout-btn';
                logoutBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>';
                logoutBtn.style.cssText = 'margin-left: auto; background: none; border: none; color: #aab8c4; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s;';
                logoutBtn.title = 'Logout';
                logoutBtn.addEventListener('mouseover', () => logoutBtn.style.color = '#ef4444');
                logoutBtn.addEventListener('mouseout', () => logoutBtn.style.color = '#aab8c4');
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    window.location.href = 'login.html';
                });
                
                // Ensure foot layout works with margin-left: auto
                foot.style.display = 'flex';
                foot.style.alignItems = 'center';
                foot.appendChild(logoutBtn);
            }
        });
    });
</script>`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf-8');
    
    // Only inject if it doesn't already have the logout-btn string
    if (content.includes('localStorage.getItem(\'userName\')') && !content.includes('.logout-btn')) {
        content = content.replace('    });\n</script>', extraCode);
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Added logout button to ' + f);
    }
});
