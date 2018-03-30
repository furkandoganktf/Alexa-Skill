
export class Analytics {
  constructor() {
    console.log('Analytics constructor');
  }

  /**
   *
   * Start analytics
   *
   * @memberOf Analytics
   */
  start() {
    console.log('starting Anaytics');
  }

  /**
   *
   *
   * @param {string} name
   * @param {Object} payload
   *
   * @memberOf Analytics
   */
  event(name, payload) {
    console.log('custom event', name, payload);
  }
}
