const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

dotenv.config({ path: '.env' });

const wipe = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log("Connected to MongoDB.");

        const collections = await mongoose.connection.db.listCollections().toArray();
        const colNames = collections.map(c => c.name);

        const keep = ['users', 'parts'];
        
        for (const col of colNames) {
            if (!keep.includes(col)) {
                console.log(`Dropping collection: ${col}`);
                await mongoose.connection.db.collection(col).drop();
            } else {
                console.log(`Keeping collection: ${col}`);
            }
        }
        console.log("All transactional collections dropped successfully.");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

wipe();
