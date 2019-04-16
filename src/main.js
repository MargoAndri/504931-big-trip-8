import Event from './event.js';
import EventEdit from './event-edit.js';
import Filter from './filter.js';
import TripSorting from './trip_sorting.js';
import {moneyChart, transportChart, timeSpendChart} from "./charts";
import {filters, api, sortingList} from "./data";
import Provider from './provider.js';
import Store from './store.js';
import moment from "moment";


const EVENTS_STORE_KEY = `events-store-key`;
const eventSection = document.querySelector(`.trip-day__items`);
const filtersForm = document.querySelector(`.trip-filter`);
const sortingForm = document.querySelector(`.trip-sorting`);
const store = new Store(EVENTS_STORE_KEY, localStorage);
const provider = new Provider({api, store, generateId: () => String(Date.now())});
const onLoad = () => {
  eventSection.innerHTML = `Loading route...`;
};

const load = (isSuccess) => {
  return new Promise((res, rej) => {
    setTimeout(isSuccess ? res : rej, 5000);
  });
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

  transportChart.data.labels = Object.keys(counts);
  transportChart.data.datasets[0].data = Object.values(counts);
  transportChart.update();
};

// Статистика затрат
const moneyData = function (events) {
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
  moneyChart.data.labels = Object.keys(priceCount);
  moneyChart.data.datasets[0].data = Object.values(priceCount);
  moneyChart.update();
};

// Статистика времени
const timeData = function (events) {
  const timeCount = events.reduce((totalTimeList, event) => {
    let timeDuration = moment.duration(event.arrivalTime.diff(event.departureTime));
    if (totalTimeList[event.type] !== undefined) {
      totalTimeList[event.type].add(timeDuration);
    } else {
      totalTimeList[event.type] = timeDuration;
    }
    return totalTimeList;
  }, []);
  timeSpendChart.data.labels = Object.keys(timeCount);
  timeSpendChart.data.datasets[0].data = Object.values(timeCount);
  timeSpendChart.update();
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
      element.date = newObject.date;
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

    editEventComponent.onEscape = () => {
      eventComponent.render();
      section.replaceChild(eventComponent.element, editEventComponent.element);
      editEventComponent.unrender();
    };
  });
};

provider.getPoints(onLoad)
  .then((points) => {
    renderEvents(eventSection, points);
    renderFilters(points);
    renderSortedEvents(points);
    transportData(points);
    moneyData(points);
    timeData(points);
  });

// Фильтры
const renderFilters = function (events) {
  filters.forEach((item) => {
    const filter = new Filter(item.name, item.title);
    filter.onFilter = () => {
      const filteredEvents = events.filter(item.filter);
      renderEvents(eventSection, filteredEvents);
    };
    filtersForm.appendChild(filter.render());
  });
};

// Сортировка
const renderSortedEvents = function (events) {
  sortingList.forEach((item) => {
    const sorting = new TripSorting(item.name, item.title);
    if (typeof item.sort === `function`) {
      sorting.onSorting = () => {
        const sortedEvents = Array.from(events).sort(item.sort);
        renderEvents(eventSection, sortedEvents);
      };
    } else {
      renderEvents(eventSection, events);
    }
    sortingForm.appendChild(sorting.render());
  });
};

// Создание новой точки маршрута
const newEventButton = document.querySelector(`.trip-controls__new-event`);
const createNewEvent = function (section) {
  const object = {
    id: ``,
    type: `taxi`,
    date: ``,
    departureTime: moment(),
    arrivalTime: moment(),
    price: ``,
    checkedOffers: [],
    destination: {
      name: ``,
      pictures: [],
      description: ``
    }
  };
  const newEventEdit = new EventEdit(object);
  newEventEdit.onSubmit = (newObject) => {
    let element = {
      'id': newObject.id,
      'destination': newObject.destination,
      'date': newObject.date,
      'type': newObject.type,
      'date_from': +newObject.departureTime.format(`x`),
      'date_to': +newObject.arrivalTime.format(`x`),
      'base_price': parseInt(newObject.price, 10),
      'is_favorite': newObject.isFavorite,
      'offers': newObject.checkedOffers.map((offer) => {
        return {title: offer.name, price: offer.price, accepted: true};
      })
    };
    newEventEdit.onSaveBlock();

    load(true)
      .then(() => {
        provider.createEvent(element)
          .then((newPoint) => {
            let newEvent = new Event(newPoint);
            newEvent.render();
            section.replaceChild(newEvent.element, newEventEdit.element);
            newEventEdit.unrender();
          });
      })
      .catch(() => {
        newEventEdit.onSaveUnblock();
      });
  };
  section.insertBefore(newEventEdit.render(), section.firstChild);

  newEventEdit.onDelete = (id) => {
    newEventEdit.onDeleteBlock();
    provider.deleteEvent(id)
      .then(
          () => provider.getPoints(onLoad))
      .then((points) => {
        renderEvents(eventSection, points);
      })
      .catch(() => {
        newEventEdit.onDeleteUnblock();
      });
  };
};

newEventButton.addEventListener(`click`, function () {
  createNewEvent(eventSection);
});
