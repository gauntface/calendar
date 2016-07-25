'use strict';

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  const MIN_LENGTH = 1;
  const MAX_LENGTH = 5;

  class GFEditList extends window.GauntFace.BaseView {
    attachedCallback() {
      this._listElement = this.shadowRoot.querySelector('.js-list-element');
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        listItems[i].addEventListener('input', this.onInput.bind(this));
      }
    }

    createdCallback() {
      super.createdCallback();

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

      this.componentLoaded();
    }

    _clearListElements() {
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = 0; i < listItems.length; i++) {
        this._listElement.removeChild(listItems[i]);
      }
    }

    setData(newData) {
      if (typeof newData !== 'object') {
        throw new Error('setData() expects an instance of an array');
      }

      this._clearListElements();

      newData.forEach(data => {
        const newListElement = document.createElement('li');
        newListElement.addEventListener('input', this.onInput.bind(this));
        newListElement.contentEditable = true;
        newListElement.textContent = data;
        this._listElement.appendChild(newListElement);
      });

      this.updateList();
    }

    updateList() {
      const listItems = this._listElement.querySelectorAll('li');
      for (let i = listItems.length - 2; i >= 0; i--) {
        if (listItems[i].textContent.length === 0) {
          this._listElement.removeChild(listItems[i]);
        }
      }

      const numberOfElements = Math.min(MAX_LENGTH, listItems.length + 1);
      const itemsToAdd = numberOfElements - listItems.length;

      for (let i = 0; i < itemsToAdd; i++) {
        const newListElement = document.createElement('li');
        newListElement.addEventListener('input', this.onInput.bind(this));
        newListElement.contentEditable = true;
        this._listElement.appendChild(newListElement);
      }
    }

    onInput(originalEvent) {
      console.log('onInput: ', originalEvent);

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
