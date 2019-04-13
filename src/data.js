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

const filters = [
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
api.getDestinations()
  .then((destinations) => {
    destinationList = destinations;
  });

let offerList = [];
api.getOffers()
  .then((offers) => {
    offerList = offers;
  });

export {Type, filters, api, destinationList, offerList};
