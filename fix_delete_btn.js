const fs = require('fs');

let html = fs.readFileSync('public/frontend/inwardip.html', 'utf8');

const targetStr = '<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">${p.description || \'-\'}</td>';
const replacementStr = `<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">\${p.description || '-'}</td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:center;"><button onclick="deletePart('\${p._id}')" style="background:transparent; color:var(--red); border:1px solid var(--red); padding:2px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Delete</button></td>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replacementStr);
    fs.writeFileSync('public/frontend/inwardip.html', html);
    console.log("Replaced successfully.");
} else {
    console.log("Could not find string.");
}
