require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const coll of collections) {
        const query = { 
            $or: [
                { model: { $regex: /^eg$/i } }, 
                { partNo: { $regex: /^eg$/i } }
            ] 
        };
        const items = await db.collection(coll.name).find(query).toArray();
        if (items.length > 0) {
            console.log('Found in', coll.name);
            console.dir(items);
            await db.collection(coll.name).deleteMany(query);
            console.log('Deleted from', coll.name);
        }
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
