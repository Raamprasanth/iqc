
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
    