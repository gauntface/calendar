'use strict';

const path = require('path');
const moment = require('moment');
const express = require('express');
const seleniumAssistant = require('selenium-assistant');
const TestServer = require('sw-testing-helpers').TestServer;

require('chai').should();

function performTests(browser) {
  describe('Sign In Display', function() {
    let globalDriver;
    let testServer;
    let testUrl;

    before(function() {
      return browser.getSeleniumDriver()
      .then(driver => {
        globalDriver = driver;
        testServer = new TestServer(false);
        const expressApp = testServer.getExpressApp();
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

    it('should show the current year by default', function() {
      this.timeout(10000);
      return new Promise((resolve, reject) => {
        globalDriver.get(testUrl + '/index.html')
        .then(() => {
          return globalDriver.wait(function() {
            return globalDriver.executeScript(function() {
              if (!window.GauntFace ||
                !window.GauntFace.CalendarApp) {
                return false;
              }

              return window.GauntFace.CalendarApp.loaded;
            });
          });
        })
        .then(() => {
          return globalDriver.executeScript(function() {
            return window.GauntFace.CalendarApp._userModel.isSignedIn();
          });
        })
        .then(isSignedIn => {
          isSignedIn.should.equal(false);
        })
        .then(() => resolve())
        .thenCatch(reject);
      });
    });

    it('should only display the sign in elements', function() {
      this.timeout(10000);
      return new Promise((resolve, reject) => {
        globalDriver.get(testUrl + '/index.html')
        .then(() => {
          return globalDriver.wait(function() {
            return globalDriver.executeScript(function() {
              if (!window.GauntFace ||
                !window.GauntFace.CalendarApp) {
                return false;
              }

              return window.GauntFace.CalendarApp.loaded;
            });
          });
        })
        .then(() => {
          return globalDriver.executeScript(function() {
            return document.querySelectorAll(
              'body > *:not(script):not(iframe)').length;
          });
        })
        .then(numberOfElements => {
          numberOfElements.should.equal(2);
        })
        .then(() => resolve())
        .thenCatch(reject);
      });
    });
  });
}

const chromeBrowser = seleniumAssistant.getBrowser('chrome', 'stable');
performTests(chromeBrowser);
