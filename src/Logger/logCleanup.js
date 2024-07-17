// logCleanup.js

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const logsDirectory = 'logs';

function cleanupLogs() {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - 7); 

  fs.readdir(logsDirectory, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
      const filePath = path.join(logsDirectory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.isFile() && stats.mtime < cutoffDate) {
          rimraf(filePath, (err) => {
            if (err) throw err;
            console.log(`Deleted old log file: ${filePath}`);
          });
        }
      });
    });
  });
}


cleanupLogs();

setInterval(cleanupLogs, 24 * 60 * 60 * 1000);
