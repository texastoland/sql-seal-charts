const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../../../../obsidianPlayground/My\ Vault/test_data.csv');
const TOTAL_RECORDS = 50;
const UPDATE_INTERVAL = 1 * 1000; // 10 seconds

// Generate dates starting from today
function generateDates() {
    const dates = [];
    const today = new Date();
    
    for(let i = 0; i < TOTAL_RECORDS; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
    }
    
    return dates;
}

// Generate random values between 1 and 100
function generateValues() {
    return Array(TOTAL_RECORDS).fill(0)
        .map(() => Math.floor(Math.random() * 100) + 1);
}

// Create CSV content
function createCSV(dates, values, values2) {
    const headers = ['date', 'value1', 'value2'];
    const rows = dates.map((date, index) => `${date},${values[index]},${values2[index]}`);
    return [headers.join(','), ...rows].join('\n');
}

// Main function to update data
function updateData() {
    const dates = generateDates();
    const values = generateValues();
    const values2 = generateValues()
    const csvContent = createCSV(dates, values, values2);
    
    fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');
    console.log(`Data updated at ${new Date().toLocaleTimeString()}`);
}

// Initial update
updateData();

// Schedule updates
setInterval(updateData, UPDATE_INTERVAL);

console.log(`Data generator started. Writing to ${OUTPUT_FILE}`);