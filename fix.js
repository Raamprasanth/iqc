const fs = require('fs');
const lines = fs.readFileSync('public/frontend/rejectediqc.html', 'utf8').split('\n');
const newLines = [];
lines.forEach((line, idx) => {
    if(idx === 1381) {
        newLines.push('                                    `).join(\'\')}');
        newLines.push('                                </tbody>');
        newLines.push('                            </table>');
        newLines.push('                        </div>');
        newLines.push('                    </td>');
        newLines.push('                </tr>');
        newLines.push('                `;');
        newLines.push('            });');
        newLines.push('            tableBody.innerHTML = html;');
        newLines.push('        }');
        newLines.push('');
        newLines.push('        window.toggleSubRow = function (id) {');
        newLines.push('            const el = document.getElementById(id);');
        newLines.push('            el.style.display = el.style.display === \'none\' ? \'table-row\' : \'none\';');
        newLines.push(line);
    } else {
        newLines.push(line);
    }
});
fs.writeFileSync('public/frontend/rejectediqc.html', newLines.join('\n'));
console.log('Done!');
