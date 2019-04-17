
import moment from 'moment';

export default class ModelEvents {
  constructor(data) {
    this.id = data[`id`];
    this.destination = data[`destination`];
    this.type = data[`type`].replace(`-`, ``);
    this.departureTime = moment(data[`date_from`]);
    this.arrivalTime = moment(data[`date_to`]);
    this.price = data[`base_price`];
    this.isFavorite = Boolean(data[`is_favorite`]);
    this.checkedOffers = data.offers.filter((element) => element.accepted).map((element) => {
      return {name: element.title, price: element.price};
    });
  }

  toRAW() {
    return {
      'id': this.id,
      'destination': this.destination,
      'type': this.type,
      'date_from': +this.departureTime.format(`x`),
      'date_to': +this.arrivalTime.format(`x`),
      'base_price': this.price,
      'is_favorite': this.isFavorite,
      'offers': this.checkedOffers.map((element) => {
        return {title: element.name, price: element.price, accepted: true};
      })
    };
  }

  static parseEvent(data) {
    return new ModelEvents(data);
  }

  static parseEvents(data) {
    return data.map(ModelEvents.parseEvent);
  }
}

