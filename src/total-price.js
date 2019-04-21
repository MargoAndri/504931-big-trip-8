import Component from "./component";

export default class TotalPrice extends Component {
  constructor(totalCost) {
    super();
    this._totalCost = totalCost;
  }

  get template() {
    return `
    <span>
      <p class="trip__total">Total: <span class="trip__total-cost">&euro;&nbsp;${this._totalCost}</span></p>
      </span>`.trim();
  }

  update(totalCost) {
    this._totalCost = totalCost;
  }
}
