const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(__dirname, 'status.txt');

fs.writeFile(statusFilePath, '', (err) => {
    if (err) {
        console.error(`Error clearing the file: ${err}`);
    } else {
        console.log('Status file content cleared.');
    }
});
