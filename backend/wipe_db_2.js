const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const wipe = async () => {
    try {
        await mongoose.connect("mongodb+srv://supportqvs_db_user:fx58tCqbju9YSyB9@cluster1.qshoy0k.mongodb.net/iqc?appName=Cluster1", { family: 4 });
        console.log("Connected to MongoDB.");

        const collections = await mongoose.connection.db.listCollections().toArray();
        const colNames = collections.map(c => c.name);

        const keep = ['users', 'parts']; // keep user auth and part catalog
        
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
