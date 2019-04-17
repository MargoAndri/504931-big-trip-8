import moment from 'moment';
import API from "./api";

const AUTHORIZATION = `Basic eo0w590ik29889z`;
const END_POINT = `https://es8-demo-srv.appspot.com/big-trip`;
const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

const Type = {
  taxi: `🚕`,
  bus: `🚌`,
  train: `🚂`,
  flight: `✈️`,
  checkin: `🏨`,
  sightseeing: `🏛️`
};

// fixme это массив, он не должен быть с большой буквы
const Filters = [
  {
    title: `Everything`,
    name: `everything`,
    filter: () => true
  },
  {
    title: `Future`,
    name: `future`,
    filter: (it) => it.departureTime > moment()
  },
  {
    title: `Past`,
    name: `past`,
    filter: (it) => it.arrivalTime < moment()
  },
];

let destinationList = [];
// fixme тут проблема работы с промисами ты никогда не знаешь, когда у тебя загрузится этот destinationList
api.getDestinations()
  .then((destinations) => {
    destinationList = destinations;
  });

// fixme тут проблема работы с промисами ты никогда не знаешь, когда у тебя загрузится этот offerList
let offerList = [];
api.getOffers()
  .then((offers) => {
    offerList = offers;
  });

export {Type, Filters, api, destinationList, offerList};
