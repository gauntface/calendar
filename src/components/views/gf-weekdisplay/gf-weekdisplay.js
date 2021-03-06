'use strict';

/* globals moment */

(() => {
  const currentScript = document._currentScript || document.currentScript;
  const componentDoc = currentScript.ownerDocument;

  class GFWeekDisplay extends window.GauntFace.BaseView {
    attachedCallback() {

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

    getWeekDayElement(titleString, subtitleString) {
      const weekDayElement = document.createElement('div');
      weekDayElement.classList.add('weekday');

      const weekDayHeaderElement = document.createElement('header');
      weekDayElement.appendChild(weekDayHeaderElement);

      const weekdayTitleElement = document.createElement('h1');
      weekdayTitleElement.classList.add('weekday_title');
      weekdayTitleElement.textContent = titleString;
      weekDayHeaderElement.appendChild(weekdayTitleElement);

      const weekdaySubtitleElement = document.createElement('h3');
      weekdaySubtitleElement.classList.add('weekday_subtitle');
      weekdaySubtitleElement.textContent = subtitleString;
      weekDayHeaderElement.appendChild(weekdaySubtitleElement);

      return weekDayElement;
    }

    setDate(newDate) {
      if (!(newDate instanceof moment)) {
        throw new Error('setDate() expects an instance of a moment - ' +
          'i.e. setDate(moment())');
      }

      const momentWeekStartInstace = newDate
        .subtract((newDate.isoWeekday() - 1), 'days');

      for (var i = 0; i < 5; i++) {
        this.shadowRoot.appendChild(
          this.getWeekDayElement(
            momentWeekStartInstace.format('dddd'),
            momentWeekStartInstace.format('D')
          )
        );

        momentWeekStartInstace.add(1, 'day');
      }

      const sundayMoment = moment(momentWeekStartInstace).add(1, 'day');

      this.shadowRoot.appendChild(
        this.getWeekDayElement(
          'Weekend',
          momentWeekStartInstace.format('D') + ' - ' +
            sundayMoment.format('D')
        )
      );

      /**

      daysInWeek.push({
        'dayOfWeekString': 'Weekend',
        'dateString': ,
        'isToday': momentWeekStartInstace.isSame(desiredDate, 'day') ||
          sundayMoment.isSame(desiredDate, 'day')
      });**/
    }
  }

  document.registerElement('gf-weekdisplay', {
    prototype: GFWeekDisplay.prototype
  });
})();
