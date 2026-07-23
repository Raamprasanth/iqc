const http = require('http');

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http.get('http://localhost:5000' + url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if(res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    resolve([]);
                }
            });
        }).on('error', err => resolve([]));
    });
}

async function main() {
    const [
        inwardItems,
        acceptedIqc,
        rejectedIqc,
        rejectedPro,
        rejectedIp
    ] = await Promise.all([
        fetchUrl('/api/inward'),
        fetchUrl('/api/accepted-iqc'),
        fetchUrl('/api/rejected-iqc'),
        fetchUrl('/api/rejectedpro'),
        fetchUrl('/api/rejected-ipqc')
    ]);

    let dataSets = {
        accepted: { main: [] },
        rejected: { main: [] }
    };

    dataSets.accepted.main = [
        ...acceptedIqc.map(item => ({ ...item, stage: 'Incoming QC' }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    let extractedRejected = [];
    rejectedIqc.forEach(item => {
        if (item.itemDetails && item.itemDetails.length > 0) {
            item.itemDetails.forEach(subItem => {
                if (subItem.isReplaced) {
                    extractedRejected.push({
                        ...item,
                        quantity: subItem.qty || 1,
                        repSerialNo: subItem.repSerialNo,
                        additionalRemarks: subItem.additionalRemarks,
                        remarks: (subItem.nature || '') + (subItem.serial ? ' (SN: ' + subItem.serial + ')' : ''),
                        stage: 'Incoming QC'
                    });
                }
            });
        } else if (item.isReplaced) {
            extractedRejected.push({ ...item, stage: 'Incoming QC' });
        }
    });
    
    dataSets.accepted.main = [
        ...dataSets.accepted.main,
        ...extractedRejected
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    console.log("Accepted main length:", dataSets.accepted.main.length);
    console.log("Extracted replaced length:", extractedRejected.length);
}

main();
