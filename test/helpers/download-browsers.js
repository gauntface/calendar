const seleniumAssistant = require('selenium-assistant');

const promises = [
  seleniumAssistant.downloadBrowser('chrome', 'stable', true)
];

Promise.all(promises)
.then(function() {
  console.log('Download complete.');
});
