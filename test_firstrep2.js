const fs = require('fs');
let html = fs.readFileSync('c:/Users/raamp/OneDrive/Desktop/iqc/public/frontend/firstrep.html', 'utf8');

const startIndex = html.indexOf('<script>');
const endIndex = html.lastIndexOf('</script>');
const jsCode = html.substring(startIndex + 8, endIndex);

let evalCode = jsCode
    .replace(/document\.getElementById\([^)]*\)/g, "({ style: {}, classList: { toggle: ()=>{} }, appendChild: ()=>{}, addEventListener: ()=>{} })")
    .replace(/document\.createElement\([^)]*\)/g, "({ style: {}, classList: { toggle: ()=>{} }, appendChild: ()=>{} })");

evalCode = \
    let dataSets = { accepted: { main: [] }, rejected: { main: [] } };
    let activeTab = 'accepted';
    let inwardList = [];
    const searchInput = { value: '', addEventListener: ()=>{} };
    const window = { switchTab: ()=>{} };
    
    async function fetch(url) {
        if (url.includes('rejected-iqc')) {
            return { ok: true, json: async () => [{ 
                _id: '123', date: '2023-01-01T00:00:00Z', model: 'A', partNo: 'P1', 
                itemDetails: [{ qty: 1, isReplaced: true, repSerialNo: 'S1', nature: 'Bad', serial: 'S0' }] 
            }]};
        }
        return { ok: true, json: async () => [] };
    }
\ + evalCode;

try {
    eval(evalCode);
    fetchAllData().then(() => {
        console.log("Success! DataSets:", JSON.stringify(dataSets.accepted.main, null, 2));
    }).catch(e => console.error("Async Error:", e));
} catch(e) {
    console.error("Eval Error:", e);
}
