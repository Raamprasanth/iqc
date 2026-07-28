const mongoose = require('mongoose');
const RejectedIqc = require('./models/RejectedIqc');
const Rejectedpro = require('./models/Rejectedpro');
const Rejectedip = require('./models/Rejectedip');
mongoose.connect('mongodb://localhost:27017/iqc_db')
.then(async () => {
    const iqc = await RejectedIqc.find({ sentToReInward: true, reInwarded: { $ne: true } }).lean();
    console.log('IQC count:', iqc.length);
    if(iqc.length > 0) console.log(iqc[0]);
    process.exit(0);
});
