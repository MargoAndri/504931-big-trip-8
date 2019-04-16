// const CACHE_NAME = `BIG_TRIP`;
//
// self.addEventListener(`install`, (evt) => {
//   console.log(`sw, install`, evt);
//   evt.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         return cache.addAll([
//           `./`,
//           `./index.html`,
//           `./statistic.html`,
//           `./trip.html`,
//           `./bundle.js`,
//           `./img/star.svg`,
//           `./img/star--check.svg`,
//           `./css/flatpickr.css`,
//           `./css/main.css`,
//           `./css/normalize.css`
//         ])
//       })
//   );
// });
//
// self.addEventListener(`activate`, (evt) => {
//   console.log(`sw, activate`, evt);
// });
//
// self.addEventListener(`fetch`, (evt) => {
//   evt.respondWith(
//     caches.match(evt.request)
//       .then((response) => {
//         console.log(`Find in cache`, response);
//         return response ? response : fetch(evt.request);
//       })
//       .catch((error) => {
//         throw error;
//       })
//   );
// });
