import Event from './event.js';
import EventEdit from './event-edit.js';
import Filter from './filter.js';
import {moneyChart, transportChart} from "./charts";
import {Filters, api} from "./data";
import Provider from './provider.js';
import Store from './store.js';

const EVENTS_STORE_KEY = `events-store-key`;
const eventSection = document.querySelector(`.trip-day__items`);
const filtersForm = document.querySelector(`.trip-filter`);
const store = new Store(EVENTS_STORE_KEY, localStorage);
const provider = new Provider(api, store);
const onLoad = () => {
  eventSection.innerHTML = `Loading route...`;
};

window.addEventListener(`offline`, () => {
  document.title = `${document.title}[OFFLINE]`;
});
window.addEventListener(`online`, () => {
  document.title = document.title.split(`[OFFLINE]`)[0];
  provider.syncEvents();
});

// Статистика транспорта
const transportData = function (events) {
  const eventTypes = events.map((item) => item.type);

  const filteredTransportTypes = eventTypes.filter((it) => it !== `checkin` && it !== `sightseeing`);
  const counts = filteredTransportTypes.reduce((arr, current) => {
    if (arr[current] !== undefined) {
      arr[current]++;
    } else {
      arr[current] = 1;
    }
    return arr;
  }, []);

  transportChart.data.labels = [...new Set(filteredTransportTypes)];
  transportChart.data.datasets[0].data = Object.values(counts);
  transportChart.update();
};


// Статистика затрат
const moneyData = function (events) {
  const eventTypes = events.map((item) => item.type);
  moneyChart.data.labels = [...new Set(eventTypes)];
  const priceCount = events.reduce((totalPrices, event) => {
    let price = event.checkedOffers.reduce(function (totalPrice, current) {
      return totalPrice + current.price;
    }, event.price);
    if (totalPrices[event.type] !== undefined) {
      totalPrices[event.type] += price;
    } else {
      totalPrices[event.type] = price;
    }
    return totalPrices;
  }, []);
  moneyChart.data.datasets[0].data = Object.values(priceCount);
  moneyChart.update();
};

/**
 * @param {Element} section
 * @param {Array} arr
 */
const renderEvents = function (section, arr) {
  section.innerHTML = ``;

  arr.forEach(function (element) {
    const eventComponent = new Event(element);
    const editEventComponent = new EventEdit(element);
    section.appendChild(eventComponent.render());

    eventComponent.onEdit = () => {
      editEventComponent.render();
      section.replaceChild(editEventComponent.element, eventComponent.element);
      eventComponent.unrender();
    };

    editEventComponent.onSubmit = (newObject) => {
      element.destination = newObject.destination;
      element.type = newObject.type;
      element.departureTime = newObject.departureTime;
      element.arrivalTime = newObject.arrivalTime;
      element.price = parseInt(newObject.price, 10);
      element.checkedOffers = newObject.checkedOffers;
      editEventComponent.onSaveBlock();

      load(true)
        .then(() => {
          provider.updateEvents(element.id, element.toRAW())
            .then((newPoint) => {
              eventComponent.update(newPoint);
              eventComponent.render();
              section.replaceChild(eventComponent.element, editEventComponent.element);
              editEventComponent.unrender();
            });
        })
        .catch(() => {
          editEventComponent.onSaveUnblock();
        });
    };

    editEventComponent.onDelete = (id) => {
      editEventComponent.onDeleteBlock();
      provider.deleteEvent(id)
        .then(
            () => provider.getPoints(onLoad))
        .then((points) => {
          renderEvents(eventSection, points);
        })
        .catch(() => {
          editEventComponent.onDeleteUnblock();
        });
    };
  });
};

const load = (isSuccess) => {
  return new Promise((res, rej) => {
    setTimeout(isSuccess ? res : rej, 5000);
  });
};

provider.getPoints(onLoad)
  .then((points) => {
    renderEvents(eventSection, points);
    renderFilters(points);
    transportData(points);
    moneyData(points);
  });

// Фильтры
const renderFilters = function (events) {
  Filters.forEach((item) => {
    const filter = new Filter(item.name, item.title);
    filter.onFilter = () => {
      const filteredEvents = events.filter(item.filter);
      renderEvents(eventSection, filteredEvents);
    };
    filtersForm.appendChild(filter.render());
  });
};

