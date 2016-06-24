const seleniumAssistant = require('selenium-assistant');

const promises = [
  seleniumAssistant.downloadBrowser('chrome', 'stable'),
  seleniumAssistant.downloadBrowser('chrome', 'beta'),
  seleniumAssistant.downloadBrowser('chrome', 'unstable')
];

Promise.all(promises)
.then(function() {
  console.log('Download complete.');
});
