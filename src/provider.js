import ModelEvent from './model-api.js';

const objectToArray = (object) => {
  return Object.keys(object).map((id) => object[id]);
};

export default class Provider {
  constructor({api, store, generateId}) {
    this._api = api;
    this._store = store;
    this._generateId = generateId;
    this._needSync = false;
  }

  getPoints(onLoad) {
    if (Provider.isOnline()) {
      return this._api.getPoints(onLoad)
        .then((events) => {
          events.forEach((it) => {
            this._store.setItem(it.id, it.toRaw());
          });
          return events;
        });
    } else {
      const rawEventsMap = this._store.getAll();
      const rawEvents = objectToArray(rawEventsMap);
      const events = ModelEvent.parseEvents(rawEvents);

      return Promise.resolve(events);
    }
  }

  createEvent(data) {
    if (Provider.isOnline()) {
      return this._api.createEvent(data)
        .then((event) => {
          this._store.setItem(event.id, event.toRaw());
          return event;
        });
    } else {
      const event = data;
      event.id = this._generateId();
      this._needSync = true;
      this._store.setItem(event.id, event);
      return Promise.resolve(ModelEvent.parseEvent(event));
    }
  }

  updateEvents(id, data) {
    if (Provider.isOnline()) {
      return this._api.updateEvents(id, data)
        .then((event) => {
          this._store.setItem(event.id, event.toRaw());
          return event;
        });
    } else {
      const event = data;
      this._needSync = true;
      this._store.setItem(event.id, event);
      return Promise.resolve(ModelEvent.parseEvent(event));
    }
  }

  deleteEvent(id) {
    if (Provider.isOnline()) {
      return this._api.deleteEvent(id)
        .then(() => {
          this._store.removeItem(id);
        });
    } else {
      this._needSync = true;
      this._store.removeItem(id);
      return Promise.resolve(true);
    }
  }

  syncEvents() {
    if (this._needSync) {
      this._api.syncEvents(objectToArray(this._store.getAll()));
    }
  }

  static isOnline() {
    return window.navigator.onLine;
  }
}
