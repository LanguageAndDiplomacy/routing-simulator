import Ember from 'ember';

// index route
export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('login').get('isLoggedIn')) {
      this.transitionTo('login');
    } else {
      this.transitionTo('messages');
    }
  }
});
