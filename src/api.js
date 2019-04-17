import ModelEvents from './model-api.js';
const Method = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

const toJSON = (response) => {
  return response.json();
};

//fixme плохое название, сегодня у тебя одно API, а завтра шесть. Лучше сразу назови его со смыслом.
export default class API {
  constructor({endPoint, authorization}) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getPoints(onLoad) {
    onLoad();
    return this._load({url: `points`})
      .then(toJSON)
      .then(ModelEvents.parseEvents);
  }

  getDestinations() {
    return this._load({url: `destinations`})
      .then(toJSON);
  }

  getOffers() {
    return this._load({url: `offers`})
      .then(toJSON);
  }

  updateEvents(id, data) {
    return this._load({
      url: `points/${id}`,
      method: Method.PUT,
      body: JSON.stringify(data),
      headers: new Headers({'Content-Type': `application/json`})
    })
      .then(toJSON)
      .then(ModelEvents.parseEvent);
  }

  deleteEvent(id) {
    return this._load({url: `points/${id}`, method: Method.DELETE});
  }

  syncEvents(events) {
    return this._load({
      url: `points/sync`,
      method: `POST`,
      body: JSON.stringify(events),
      headers: new Headers({'Content-Type': `application/json`})
    })
      .then(toJSON);
  }

  //fixme https://medium.com/@shahata/why-i-wont-be-using-fetch-api-in-my-apps-6900e6c6fe78 почитай вот это с целью изучения того, как фетч себя иногда странно ведет и учти краевые условия.
  _load({url, method = Method.GET, body = null, headers = new Headers()}) {
    headers.append(`Authorization`, this._authorization);

    return fetch(`${this._endPoint}/${url}`, {method, body, headers})
      .then(checkStatus)
      .catch((err) => {
        throw err;
      });
  }
}
