'use strict';

(() => {
  const componentDoc = document.currentScript.ownerDocument;

  class GFWeekDisplay extends HTMLElement {
    attachedCallback() {

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

    setDate(newDate) {
      if (!(newDate instanceof moment)) {
        throw new Error('setDate() expects an instance of a moment - i.e. setDate(moment())');
      }

      /**
       *
       * <div class="weekday">
       *  <header>
       *      <h1 class="weekday__title">Tuesday</h1>
       *      <h3 class="weekday__subtitle">02</h3>
       *   </header>
       * </div>
       *
       **/

      const momentWeekStartInstace = newDate
        .subtract((newDate.isoWeekday() - 1), 'days');

        var daysInWeek = [];
      for (var i = 0; i < 5; i++) {
        console.log({
          'dayOfWeekInt': momentWeekStartInstace.isoWeekday() - 1,
          'dayOfWeekString': momentWeekStartInstace.format('dddd'),
          'dateInt': momentWeekStartInstace.date(),
          'dateString': momentWeekStartInstace.format('D'),
          'isToday': momentWeekStartInstace.isSame(newDate, 'day')
        });

        const weekDayElement = document.createElement('div');
        weekDayElement.classList.add('weekday');

        const weekDayHeaderElement = document.createElement('header');
        weekDayElement.appendChild(weekDayHeaderElement);

        const weekdayTitleElement = document.createElement('h1');
        weekdayTitleElement.classList.add('weekday_title');
        weekdayTitleElement.textContent = momentWeekStartInstace.format('dddd');
        weekDayHeaderElement.appendChild(weekdayTitleElement);

        const weekdaySubtitleElement = document.createElement('h3');
        weekdaySubtitleElement.classList.add('weekday__subtitle');
        weekdaySubtitleElement.textContent = momentWeekStartInstace.format('D');
        weekDayHeaderElement.appendChild(weekdaySubtitleElement);

        this.shadowRoot.appendChild(weekDayElement);

        momentWeekStartInstace.add(1, 'day');
      }

      /** var sundayMoment = moment(momentWeekStartInstace).add(1, 'day');

      daysInWeek.push({
        'dayOfWeekString': 'Weekend',
        'dateString': momentWeekStartInstace.format(dayFormat) + ' - ' +
          sundayMoment.format(dayFormat),
        'isToday': momentWeekStartInstace.isSame(desiredDate, 'day') ||
          sundayMoment.isSame(desiredDate, 'day')
      });**/

    }
  }

  document.registerElement('gf-weekdisplay', {
    prototype: GFWeekDisplay.prototype
  });
})();
