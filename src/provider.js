import ModelEvents from './model-api.js';

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
    if (this._isOnline()) {
      return this._api.getPoints(onLoad)
        .then((events) => {
          events.forEach((it) => {
            this._store.setItem(it.id, it.toRAW());
          });
          return events;
        });
    } else {
      const rawEventsMap = this._store.getAll();
      const rawEvents = objectToArray(rawEventsMap);
      const events = ModelEvents.parseEvents(rawEvents);

      return Promise.resolve(events);
    }
  }

  createEvent(data) {
    if (this._isOnline()) {
      return this._api.createEvent(data)
        .then((event) => {
          this._store.setItem(event.id, event.toRAW());
          return event;
        });
    } else {
      const event = data;
      event.id = this._generateId();
      this._needSync = true;
      this._store.setItem(event.id, event);
      return Promise.resolve(ModelEvents.parseEvent(event));
    }
  }

  updateEvents(id, data) {
    if (this._isOnline()) {
      return this._api.updateEvents(id, data)
        .then((event) => {
          this._store.setItem(event.id, event.toRAW());
          return event;
        });
    } else {
      const event = data;
      this._needSync = true;
      this._store.setItem(event.id, event);
      return Promise.resolve(ModelEvents.parseEvent(event));
    }
  }

  deleteEvent(id) {
    if (this._isOnline()) {
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
    return this._api.syncEvents({data: objectToArray(this._store.getAll())});
  }

  _isOnline() {
    return window.navigator.onLine;
  }
}
