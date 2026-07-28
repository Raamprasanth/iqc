const fs = require('fs');
const files = ['public/frontend/inward.html', 'public/frontend/inwardp.html'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Normalizing line endings to make replacement easier
  content = content.replace(/\r\n/g, '\n');
  
  const searchRegex = /<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">\s*<thead>\s*<tr>\s*<th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid var\(--fog\); font-size: 0\.8rem; color: var\(--steel\);">Nature of Problem<\/th>\s*<th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid var\(--fog\); font-size: 0\.8rem; color: var\(--steel\);">Serial No<\/th>\s*<th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid var\(--fog\); font-size: 0\.8rem; color: var\(--steel\);">Spare Required<\/th>\s*<th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid var\(--fog\); font-size: 0\.8rem; color: var\(--steel\);">Quantity<\/th>\s*<th><\/th>\s*<\/tr>\s*<\/thead>\s*<tbody id="remarksModalBody">\s*<\/tbody>\s*<\/table>/g;
        
  const replace = `<div style="max-height: 50vh; overflow-y: auto; margin-bottom: 16px; border: 1px solid var(--fog); border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--fog); font-size: 0.8rem; color: var(--steel);">Nature of Problem</th>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--fog); font-size: 0.8rem; color: var(--steel);">Serial No</th>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--fog); font-size: 0.8rem; color: var(--steel);">Spare Required</th>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--fog); font-size: 0.8rem; color: var(--steel);">Quantity</th>
                        <th style="padding: 8px; border-bottom: 1px solid var(--fog);"></th>
                    </tr>
                </thead>
                <tbody id="remarksModalBody">
                </tbody>
            </table>
        </div>`;

  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replace);
    fs.writeFileSync(file, content);
    console.log('Successfully updated ' + file);
  } else {
    console.log('Could not find search block in ' + file);
  }
}
