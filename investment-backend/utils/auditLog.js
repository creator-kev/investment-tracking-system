const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'audit.log');

async function log(entry) {
  const logEntry = `${new Date().toISOString()} - ${JSON.stringify(entry)}\n`;
  // Append log entry to audit.log file asynchronously
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write audit log:', err);
    }
  });
}

module.exports = {
  log
};
