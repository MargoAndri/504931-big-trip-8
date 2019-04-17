import moment from 'moment';
import TripPointsApi from "./tripPointsApi";

const ECS_KEY_CODE = `Escape`;
const AUTHORIZATION = `Basic eo0w590ik29889z`;
const END_POINT = `https://es8-demo-srv.appspot.com/big-trip`;
const api = new TripPointsApi({endPoint: END_POINT, authorization: AUTHORIZATION});

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

const sortingList = [
  {
    title: `Event`,
    name: `event`,
    sort: () => true,
  },
  {
    title: `Time`,
    name: `time`,
    sort: (a, b) => {
      if (a.duration > b.duration) {
        return -1;
      }
      if (a.duration < b.duration) {
        return 1;
      }
      return 0;
    }
  },
  {
    title: `Price`,
    name: `price`,
    sort: (a, b) => {
      if (a.totalPrice > b.totalPrice) {
        return -1;
      }
      if (a.totalPrice < b.totalPrice) {
        return 1;
      }
      return 0;
    }
  }
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

export {Type, filters, api, destinationList, offerList, ECS_KEY_CODE, sortingList};
