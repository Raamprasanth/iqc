const mongoose = require('mongoose');
const xlsx = require('xlsx');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const wipeAndImport = async () => {
    try {
        await mongoose.connect("mongodb+srv://supportqvs_db_user:fx58tCqbju9YSyB9@cluster1.qshoy0k.mongodb.net/iqc?appName=Cluster1", { family: 4 });
        console.log("Connected to MongoDB.");

        const Part = require('./models/Part');

        // Delete all existing parts
        await Part.deleteMany({});
        console.log("Cleared existing parts.");

        // Read Excel
        const wb = xlsx.readFile('../models.xlsx');
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(ws);

        const newParts = [];
        let currentModel = "UNKNOWN";

        for (const row of rows) {
            // Keys have trailing spaces
            let rawModel = row['Model '] || row['Model'];
            let partNo = row['Part No.'] || row['Part No'];
            let desc = row['Part Description '] || row['Part Description'];

            if (rawModel && String(rawModel).trim() !== '') {
                currentModel = String(rawModel).trim();
            }

            if (partNo && String(partNo).trim() !== '') {
                newParts.push({
                    model: currentModel,
                    partNo: String(partNo).trim(),
                    description: desc ? String(desc).trim() : ''
                });
            }
        }

        await Part.insertMany(newParts);
        console.log(`Successfully imported ${newParts.length} parts from Excel.`);

        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

wipeAndImport();
