'use strict';

/**
 * Loads a HTML import and the returning Promise
 * resolves once the import has loaded.
 *
 * @param  {String} importPath The URL to set the import href to.
 * @return {Promise}           A Promise which resolves when the import
 *                             is loaded.
 */
function loadHTMLImport(importPath) {
  return new Promise(resolve => {
    let link = document.createElement('link');
    link.setAttribute('rel', 'import');
    link.setAttribute('href', importPath);
    link.onload = function() {
      resolve();
    };
    document.body.appendChild(link);
  });
}

window.GauntFace = window.GauntFace || {};
window.GauntFace.loadHTMLImport = window.GauntFace.loadHTMLImport ||
  loadHTMLImport;
