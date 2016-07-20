'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFEditList extends HTMLElement {
    attachedCallback() {
      this._listElement = this.shadowRoot.querySelector('.js-list-element');
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        listItems[i].addEventListener('input', this.onInput.bind(this));
      }
    }

    createdCallback() {
      if ('attachShow' in this) {
        const root = this.attachShadow({mode: 'open'});
        const template = componentDoc.querySelector('template');
        root.appendChild(template.content.cloneNode(true));
      } else {
        const root = this.createShadowRoot();
        const template = componentDoc.querySelector('template');
        const clone = document.importNode(template.content, true);
        root.appendChild(clone);
      }
    }

    setData(newData) {
      if (typeof newData !== 'object') {
        throw new Error('setData() expects an instance of an array');
      }

      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        this._listElement.removeChild(listItems[i]);
      }

      let newLength = 1;
      if (newData && newData.length > 0) {
        newData.forEach(data => {
          const newListElement = document.createElement('li');
          newListElement.addEventListener('input', this.onInput.bind(this));
          newListElement.contentEditable = true;
          newListElement.textContent = data;
          this._listElement.appendChild(newListElement);
        });

        newLength = newData.length + 1;
      }

      this.setNumberOfEntries(newLength);
    }

    setNumberOfEntries(newNumber) {
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        const text = listItems[i].textContent;
        if (text.length === 0) {
          this._listElement.removeChild(listItems[i]);
        }
      }

      while (this._listElement.querySelectorAll('li').length < newNumber) {
        const newListElement = document.createElement('li');
        newListElement.addEventListener('input', this.onInput.bind(this));
        newListElement.contentEditable = true;
        this._listElement.appendChild(newListElement);
      }
    }

    onInput(originalEvent) {
      const listOfText = [];
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        listOfText.push(listItems[i].textContent);
      }
      const event = new CustomEvent('list-change', {detail: listOfText});
      this.dispatchEvent(event);
    }
  }

  document.registerElement('gf-edit-list', {
    prototype: GFEditList.prototype
  });
})();
