'use strict';

const path = require('path');
const moment = require('moment');
const express = require('express');
const seleniumAssistant = require('selenium-assistant');
const TestServer = require('sw-testing-helpers').TestServer;

require('chai').should();

function performTests(browser) {
  describe('Calendar Display', function() {
    let globalDriver;
    let testServer;
    let testUrl;

    before(function() {
      return browser.getSeleniumDriver()
      .then(driver => {
        driver.manage().timeouts().setScriptTimeout(10000);

        globalDriver = driver;
        testServer = new TestServer(false);
        const expressApp = testServer.getExpressApp();
        expressApp.use('/third_party/', express.static(path.join(__dirname,
          '..', 'test', 'third_party')));
        expressApp.use('/', express.static(path.join(__dirname, '..', 'src')));
        return testServer.startServer(null, 8888);
      })
      .then(portNumber => {
        testUrl = `http://localhost:${portNumber}`;
      });
    });

    after(function() {
      this.timeout(5000);
      return seleniumAssistant.killWebDriver(globalDriver)
      .then(() => {
        testServer.killServer();
      });
    });

    it('should show calendar when signed in and have good defeault state', function() {
      this.timeout(10000);
      return new Promise((resolve, reject) => {
        globalDriver.get(testUrl + '/index.html?testrunner=true')
        .then(() => {
          return globalDriver.wait(function() {
            return globalDriver.executeScript(function() {
              if (!window.GauntFace ||
                !window.GauntFace.CalendarApp) {
                return false;
              }

              return true;
            });
          });
        })
        .then(() => {
          // Inject Sinon
          return globalDriver.executeAsyncScript(function(cb) {
            var scriptElement = document.createElement('script');
            scriptElement.setAttribute('src',
              '/third_party/sinon/sinon-1.17.3.js');
            scriptElement.onload = function() {
              cb();
            };
            document.body.appendChild(scriptElement);
          });
        })
        .then(() => {
          // Stub methods with Sinon
          return globalDriver.executeScript(function(cb) {
            window.sinon.stub(window.GauntFace.UserModel.prototype,
              'isSignedIn',
              function() {
                return Promise.resolve(true);
              });
          });
        })
        .then(() => {
          return globalDriver.executeScript(function() {
            window.GauntFace.CalendarApp.initialise();
          });
        })
        .then(() => {
          return globalDriver.wait(function() {
            return globalDriver.executeScript(function() {
              return window.GauntFace.CalendarApp.loaded;
            });
          });
        })
        .then(() => {
          return globalDriver.executeAsyncScript(function(cb) {
            window.GauntFace.CalendarApp._userModel.isSignedIn()
            .then(cb);
          });
        })
        .then(isSignedIn => {
          isSignedIn.should.equal(true);
        })
        .then(() => {
          return globalDriver.executeScript(function() {
            const weekInfo = document.querySelector('gf-calendar').shadowRoot.querySelector('gf-weekinfo');
            const weekDisplay = document.querySelector('gf-calendar').shadowRoot.querySelector('gf-weekdisplay');
            const dayElements = weekDisplay.shadowRoot.querySelectorAll('.weekday');
            const dayData = [];
            for (var i = 0; i < dayElements.length; i++) {
              dayData.push({
                dayName: dayElements[i].querySelector('.weekday_title').textContent,
                dayDate: dayElements[i].querySelector('.weekday_subtitle').textContent
              });
            }
            return {
              weekInfo: {
                year: weekInfo.shadowRoot.querySelector('.js-weekinfo-year').textContent,
                month: weekInfo.shadowRoot.querySelector('.js-weekinfo-month').textContent
              },
              weekDisplay: dayData
            };
          });
        })
        .then(details => {
          const momentInstance = moment();
          details.weekInfo.year.should.equal(momentInstance.year().toString());
          details.weekInfo.month.should.equal(momentInstance.format('MMMM'));

          const daysOfWeek = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Weekend'
          ];

          details.weekDisplay.forEach((dayData, index) => {
            dayData.dayName.should.equal(daysOfWeek[index]);
          });
        })
        .then(() => resolve())
        .thenCatch(reject);
      });
    });
  });
}

const chromeBrowser = seleniumAssistant.getBrowser('chrome', 'stable');
performTests(chromeBrowser);
