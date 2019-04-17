import Component from './component.js';
import {Type} from './data.js';
import moment from 'moment';

export default class Event extends Component {
  constructor(data) {
    super();
    this._id = data.id;
    this._destination = data.destination;
    this._type = data.type;
    this._date = data.date;
    this._departureTime = data.departureTime;
    this._arrivalTime = data.arrivalTime;
    this._duration = data.duration;
    this._price = data.price;
    this._checkedOffers = data.checkedOffers;
    this._onEdit = null;
  }
  get title() {
    return this._destination.name;
  }
  _onClick() {
    if (typeof this._onEdit === `function`) {
      this._onEdit();
    }
  }

  set onEdit(fn) {
    this._onEdit = fn;
  }

  get totalPrice() {
    return this._checkedOffers.reduce(function (totalPrice, current) {
      return totalPrice + current.price;
    }, this._price);
  }

  get duration() {
    let durationString = ``;
    if (this._duration.days() > 0) {
      durationString += (this._duration.days() < 10) ? `0${this._duration.days()}D ` : `${this._duration.days()}D `;
    }
    if (this._duration.hours() > 0) {
      durationString += (this._duration.hours() < 10) ? `0${this._duration.hours()}H ` : `${this._duration.hours()}H `;
    }
    durationString += (this._duration.minutes() < 10) ? `0${this._duration.minutes()}M` : `${this._duration.minutes()}M`;
    return durationString;
  }
  get template() {
    let offersList = this._checkedOffers.slice(0, 3).map((offer) => `
        <li>
          <button class="trip-point__offer">${offer.name}</button>
        </li>
      `.trim()
    );
    return `
        <article class="trip-point">
          <i class="trip-icon">${Type[this._type]}</i>
          <h3 class="trip-point__title">${this.title}</h3>
          <p class="trip-point__schedule">
            <span class="trip-point__timetable">${this._departureTime.format(`HH:mm`)} &nbsp;&mdash; ${this._arrivalTime.format(`HH:mm`)}</span>
            <span class="trip-point__duration">${this.duration}</span>
          </p>
          <p class="trip-point__price">€ ${this.totalPrice}</p>
          <ul class="trip-point__offers">
            ${offersList.join(``)}
          </ul>
        </article>
  `.trim();
  }

  // Вызов метода bind() возможен только после вызова render()
  bind() {
    this._element.addEventListener(`click`, this._onClick.bind(this));
  }

  // Вызов метода unbind() возможен только после вызова render()
  unbind() {
    this._element.removeEventListener(`click`, this._onClick);
  }

  update(data) {
    this._destination = data.destination;
    this._type = data.type;
    this._date = data.date;
    this._departureTime = data.departureTime;
    this._arrivalTime = data.arrivalTime;
    this._price = parseInt(data.price, 10);
    this._checkedOffers = data.checkedOffers;
    this._duration = moment.duration(data.arrivalTime.diff(data.departureTime));
  }
}
