const fs = require('fs');

const js = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/test_acceptedpro.js', 'utf8');
const docIdx = js.indexOf('<!DOCTYPE html>');

// This is the NEW js logic we wrote earlier (fetchEntries + groupEntries)
const newJsLogic = js.substring(0, docIdx);

// This is the original HTML (but it's missing the bottom tags because of the regex match)
let originalHtml = js.substring(docIdx);

// Replace the old js logic with the new js logic
// In the original HTML, the old js logic starts after 'let entries = [];' and ends before 'function searchEntries'
// Wait, `groupEntries` does not have `function searchEntries` after it. It has `function renderTable`!
const startReplace = originalHtml.indexOf('let entries = [];');
const endReplace = originalHtml.indexOf('function renderTable');

const before = originalHtml.substring(0, startReplace);
const after = originalHtml.substring(endReplace);

let finalHtml = before + newJsLogic + after;

// Now append the missing tags
finalHtml += `
    </script>


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

</body>

</html>
`;

// Also fix the renderTable property names in finalHtml: m.totalQuantity -> m.totalQty and m.qty -> m.acceptedQty
finalHtml = finalHtml.replace("Number(m.totalQuantity).toLocaleString('en-IN')", "Number(m.totalQty).toLocaleString('en-IN')");
finalHtml = finalHtml.replace("Number(m.qty).toLocaleString('en-IN')", "Number(m.acceptedQty).toLocaleString('en-IN')");
finalHtml = finalHtml.replace("const grouped = groupEntries(filtered);", "const grouped = groupEntries(filtered, rejectedEntries);");

fs.writeFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/acceptedpro.html', finalHtml, 'utf8');
console.log('Restored and fixed acceptedpro.html!');
