const mongoose = require('mongoose');
const dotenv = require('dotenv');
const xlsx = require('xlsx');
const path = require('path');
const dns = require('dns');
const Part = require('../models/Part');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedParts = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('MongoDB Connected');

        console.log('Clearing existing parts...');
        await Part.deleteMany({});

        console.log('Reading Excel file...');
        const workbook = xlsx.readFile(path.join(__dirname, '../../models.xlsx'));
        const parts = [];

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
            let currentModel = null;
            for (const row of data) {
                const keys = Object.keys(row);
                const modelKey = keys.find(k => k.trim().toLowerCase() === 'model');
                const partNoKey = keys.find(k => k.trim().toLowerCase() === 'part no.');
                const descKey = keys.find(k => k.trim().toLowerCase() === 'part description');

                if (modelKey && row[modelKey]) {
                    currentModel = row[modelKey].trim();
                }

                if (partNoKey && descKey && row[partNoKey] && row[descKey]) {
                    parts.push({
                        model: currentModel || sheetName.trim(),
                        partNo: String(row[partNoKey]).trim(),
                        description: String(row[descKey]).trim()
                    });
                }
            }
        }

        console.log(`Found ${parts.length} parts in Excel. Inserting...`);
        await Part.insertMany(parts);
        console.log('Seed successful!');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedParts();
