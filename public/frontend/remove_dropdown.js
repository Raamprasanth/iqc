const fs = require('fs');

function removeDropdown(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove list="remarksList" from the modal-nature input
    if (content.includes('list="remarksList"')) {
        content = content.replace(/list="remarksList"\s*/g, '');
        console.log("Removed dropdown from", file);
    } else {
        console.log("Could not find list='remarksList' in", file);
    }

    fs.writeFileSync(file, content);
}

removeDropdown('inward.html');
removeDropdown('inwardp.html');
console.log("Done");
