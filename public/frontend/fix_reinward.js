const fs = require('fs');

const file = 'reinward.html';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const proRej = Number\(p\.proRej\) \|\| 0;[\s\S]*?\<td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var\(--text\);">\s*\$\{p\.items\[0\]\?\.problemSerialNo \|\| '-'\}\s*\<\/td>/, `const proRej = Number(p.proRej) || 0;
                                        const pItems = (p.items && p.items.length) ? p.items : ((p.itemDetails && p.itemDetails.length) ? p.itemDetails : [p]);
                                        const itemsJson = JSON.stringify(pItems).replace(/"/g, '&quot;');
                                        const probDesc = pItems[0]?.problemDescription || p.problemDescription || '-';
                                        const probSerial = pItems[0]?.problemSerialNo || p.problemSerialNo || '-';
                                        return \`
                                        <tr>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9;"><strong>\${p.partNo}</strong></td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">
                                                \${p.partDescription || '-'}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 500;">
                                                \${totalInwardQty > 0 ? totalInwardQty.toLocaleString('en-IN') + '' : '—'}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 500;">
                                                \${iqcRej}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 500;">
                                                \${proRej}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; text-align:right; font-weight: 600;">
                                                \${qty.toLocaleString('en-IN')}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">
                                                \${probDesc}
                                            </td>
                                            <td style="padding:8px 12px; border-bottom: 1px solid #f1f5f9; color: var(--text);">
                                                \${probSerial}
                                            </td>`);

fs.writeFileSync(file, c);
