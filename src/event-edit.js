import Component from './component.js';
import flatpickr from 'flatpickr';
import moment from 'moment';
import {Type, destinationList, offerList} from './data.js';
import createElement from './create-element.js';

export default class EventEdit extends Component {
  constructor(data) {
    super();
    this._type = data.type;
    this._departureTime = data.departureTime;
    this._arrivalTime = data.arrivalTime;
    this._price = data.price;
    this._destination = data.destination;
    this._checkedOffers = data.checkedOffers;
    this._onSubmit = null;
    this._onDelete = null;
    this._state.isFavorite = false;
    this._onDeleteClick = this._onDeleteClick.bind(this);
    this._onSubmitClick = this._onSubmitClick.bind(this);
    this._onChangeFavorite = this._onChangeFavorite.bind(this);
    this._onChangeType = this._onChangeType.bind(this);
    this._onChangeDestination = this._onChangeDestination.bind(this);
    this._offer = offerList.reduce((acc, item) => {
      if (item.type === data.type) {
        acc = item.offers;
      }
      return acc;
    }, []);
  }

  _processForm(formData) {
    const entry = {
      destination: ``,
      type: ``,
      price: ``,
      departureTime: ``,
      arrivalTime: ``,
      offer: this._offer,
      checkedOffers: [],
    };

    const eventEditMapper = EventEdit.createMapper(entry);
    for (const pair of formData.entries()) {
      const [property, value] = pair;
      if (typeof eventEditMapper[property] === `function`) {
        eventEditMapper[property](value);
      }
    }
    return entry;
  }


  _onSubmitClick(evt) {
    evt.preventDefault();

    const formData = new FormData(this._element.querySelector(`form`));
    const newData = this._processForm(formData);
    if (typeof this._onSubmit === `function`) {
      this._onSubmit(newData);
    }
    this.update(newData);
  }

  _onDeleteClick(evt) {
    evt.preventDefault();
    if (typeof this._onDelete === `function`) {
      this._onDelete();
    }
  }

  _onChangeType(evt) {
    this._element.querySelector(`.travel-way__label`).textContent = Type[evt.target.value];
  }

  _onChangeFavorite() {
    this._state.isFavorite = !this._state.isFavorite;
    const formData = new FormData(this._element.querySelector(`form`));
    const newData = this._processForm(formData);
    this.update(newData);
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  _onChangeDestination() {
    const formData = new FormData(this._element.querySelector(`form`));
    const newData = this._processForm(formData);
    this.update(newData);
    this.unbind();
    this._partialUpdate();
    this.bind();
  }

  _partialUpdate() {
    let newElement = createElement(this.template);
    this._element.innerHTML = newElement.innerHTML;
  }

  set onSubmit(fn) {
    this._onSubmit = fn;
  }

  set onDelete(fn) {
    this._onDelete = fn;
  }

  get title() {
    return this._destination.name;
  }

  get template() {
    let destinations = destinationList.map((destination) => `
      <option value="${destination.name}"></option>
    `.trim()
    );
    let destinationImageList = this._destination.pictures.map((picture) => `
    <img src="${picture.src}" alt="${picture.description}" class="point__destination-image">`
      .trim()
    );
    let offers = this._offer.map((offer) =>
      `<input class="point__offers-input visually-hidden" type="checkbox" id="${offer.name}" name="offer" value="${offer.name}" ${this._checkedOffers.find((item) => item.name === offer.name) !== undefined && `checked`}>
          <label for="${offer.name}" class="point__offers-label">
          <span class="point__offer-service">${offer.name}</span> + €<span class="point__offer-price">${offer.price}</span>
       </label>`.trim()
    );
    return `
    <article class="point">
      <form action="" method="get">
        <header class="point__header">
          <label class="point__date">
            choose day
            <input class="point__input" type="text" placeholder="MAR 18" name="day">
          </label>
    
          <div class="travel-way">
            <label class="travel-way__label" for="travel-way__toggle">${Type[this._type]}️</label>
    
            <input type="checkbox" class="travel-way__toggle visually-hidden" id="travel-way__toggle">
    
            <div class="travel-way__select">
              <div class="travel-way__select-group">
                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-taxi" name="type" value="taxi" ${this._type === `taxi` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-taxi">🚕 taxi</label>

                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-bus" name="type" value="bus" ${this._type === `bus` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-bus">🚌 bus</label>

                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-train" name="type" value="train" ${this._type === `train` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-train">🚂 train</label>

                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-flight" name="type" value="flight" ${this._type === `flight` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-flight">✈️ flight</label>
              </div>

              <div class="travel-way__select-group">
                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-check-in" name="type" value="checkin" ${this._type === `checkin` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-check-in">🏨 check-in</label>

                <input class="travel-way__select-input visually-hidden" type="radio" id="travel-way-sightseeing" name="type" value="sightseeing" ${this._type === `sightseeing` && `checked`}>
                <label class="travel-way__select-label" for="travel-way-sightseeing">🏛 sightseeing</label>
              </div>
            </div>
          </div>

          <div class="point__destination-wrap">
            <label class="point__destination-label" for="destination"></label>
            <input class="point__destination-input" list="destination-select" id="destination" value="${this.title}" name="destination">
            <datalist id="destination-select">
              ${destinations.join(``)}
            </datalist>
          </div>

          <div class="point__time">
            choose time
            <input class="point__input" type="text" value="${this._departureTime.format(`YYYY-MM-DD HH:mm`)}" name="start" placeholder="${this._departureTime}">
            <input class="point__input" type="text" value="${this._arrivalTime.format(`YYYY-MM-DD HH:mm`)}" name="end" placeholder="${this._arrivalTime}">
          </div>

          <label class="point__price">
            write price
            <span class="point__price-currency">€</span>
            <input class="point__input" type="text" value="${this._price}" name="price">
          </label>

          <div class="point__buttons">
            <button class="point__button point__button--save" type="submit">Save</button>
            <button class="point__button" type="reset">Delete</button>
          </div>

          <div class="paint__favorite-wrap">
            <input type="checkbox" class="point__favorite-input visually-hidden" id="favorite" name="favorite" ${this._state.isFavorite && `checked`}>
            <label class="point__favorite" for="favorite">favorite</label>
          </div>
        </header>

        <section class="point__details">
          <section class="point__offers">
            <h3 class="point__details-title">offers</h3>

            <div class="point__offers-wrap">
             ${offers.join(``)}
            </div>

          </section>
          <section class="point__destination">
            <h3 class="point__details-title">Destination</h3>
            <p class="point__destination-text">${this._destination.description}</p>
            <div class="point__destination-images">${destinationImageList.join(``)}
            </div>
          </section>
          <input type="hidden" class="point__total-price" name="total-price" value="">
        </section>
      </form>
  </article>
    `.trim();
  };

  // Вызов метода bind() возможен только после вызова render()
  bind() {
    this._element.querySelector(`form`)
      .addEventListener(`submit`, this._onSubmitClick);
    this._element.querySelector(`button[type="reset"]`)
      .addEventListener(`click`, this._onDeleteClick);
    this.element.querySelector(`.point__favorite-input`)
      .addEventListener(`click`, this._onChangeFavorite);
    this.element.querySelectorAll(`input[name="type"]`).forEach((radio) => {
      radio.addEventListener(`change`, this._onChangeType);
    });
    this.element.querySelector(`.point__destination-input`).addEventListener(`change`, this._onChangeDestination);
    let timeStart = this._element.querySelector(`input[name='start']`);
    flatpickr(timeStart, {enableTime: true, dateFormat: `Y-m-d H:i`});

    let timeEnd = this._element.querySelector(`input[name='end']`);
    flatpickr(timeEnd, {enableTime: true, dateFormat: `Y-m-d H:i`});
  }

  // Вызов метода unbind() возможен только после вызова render()
  unbind() {
    this._element.querySelector(`form`)
      .removeEventListener(`submit`, this._onSubmitClick);
    this._element.querySelector(`button[type="reset"]`)
      .removeEventListener(`click`, this._onDeleteClick);
    this.element.querySelector(`.point__favorite-input`)
      .removeEventListener(`click`, this._onChangeFavorite);
    this.element.querySelectorAll(`input[name="type"]`).forEach((radio) => {
      radio.removeEventListener(`change`, this._onChangeType);
    });
    this.element.querySelector(`.point__destination-input`).removeEventListener(`change`, this._onChangeDestination);
  }

  update(data) {
    this._destination = data.destination;
    this._type = data.type;
    this._price = data.price;
    this._arrivalTime = data.arrivalTime;
    this._departureTime = data.departureTime;
    this._checkedOffers = data.checkedOffers;
  }

  static createMapper(target) {
    return {
      type: (value) => {
        target.type = value;
      },
      destination: (value) => {
        for (let item of destinationList) {
          if (item.name === value) {
            target.destination = item;
          }
        }
      },
      price: (value) => {
        target.price = value;
      },
      offer: (value) => {
        let checkedOffer = target.offer.find((item) => item.name === value);
        target.checkedOffers.push(checkedOffer);
      },
      start: (value) => {
        target.departureTime = moment(value);
      },
      end: (value) => {
        target.arrivalTime = moment(value);
      }
    };
  }
};
