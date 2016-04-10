function Model() {
  this.events = {};
  this.callEvent = function(eventName, args) {
    var eventArr = this.events[eventName];
    if (!!eventArr) {
      for (var i = 0; i < eventArr.length; i++) {
        eventArr[i].call(this, args ? args : undefined);
      }
    };
  };
  this.on = function(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback.bind(this));
  };
  this.off = function(eventName) {
    if (!this.events[eventName]) return;
    this.events[eventName] = [];
  }
};
