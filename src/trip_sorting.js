import Component from "./component";

export default class TripSorting extends Component {
  constructor(title, name) {
    super();
    this._title = title;
    this._name = name;
    this._onSorting = null;
    this._onSortingClick = this._onSortingClick.bind(this);
  }

  _onSortingClick() {
    if (typeof this._onSorting === `function`) {
      this._onSorting();
    }
  }

  set onSorting(fn) {
    this._onSorting = fn;
  }

  get template() {
    return `
    <span>
      <input type="radio" name="trip-sorting" id="sorting-${this._name}" value="event">
      <label class="trip-sorting__item trip-sorting__item--${this._name}" for="sorting-${this._name}">${this._title}</label>
    </span>`.trim();
  }

  bind() {
    this._element.querySelector(`#sorting-${this._name}`)
      .addEventListener(`click`, this._onSortingClick);
  }

  unbind() {
    this._element.querySelector(`#sorting-${this._name}`)
      .removeEventListener(`click`, this._onSortingClick);
  }
}
