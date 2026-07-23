require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('rejectedpros').updateMany(
        { source: { $exists: false } },
        { $set: { source: 'inwardp', 'isReplaced': false } }
    );
    // Also fix any where source is ''
    const res2 = await db.collection('rejectedpros').updateMany(
        { source: '' },
        { $set: { source: 'inwardp' } }
    );
    console.log('Updated existing records:', res.modifiedCount, res2.modifiedCount);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
