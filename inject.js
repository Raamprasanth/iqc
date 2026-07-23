const fs = require('fs');
const path = require('path');
const dir = 'public/frontend';

const code = `
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const userName = localStorage.getItem('userName');
            const userRole = localStorage.getItem('userRole');
            if (userName) {
                const nameEls = document.querySelectorAll('.sidebar-user-name');
                const avatarEls = document.querySelectorAll('.sidebar-avatar');
                const roleEls = document.querySelectorAll('.sidebar-user-role');
                
                nameEls.forEach(el => el.textContent = userName);
                
                const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                avatarEls.forEach(el => el.textContent = initials);
                
                if (userRole) {
                    const roleText = userRole.charAt(0).toUpperCase() + userRole.slice(1);
                    roleEls.forEach(el => el.textContent = roleText);
                }
            }
        });
    </script>
`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf-8');
    if (!content.includes('localStorage.getItem(\'userName\')')) {
        content = content.replace('</body>', code + '\n</body>');
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Updated ' + f);
    }
});
