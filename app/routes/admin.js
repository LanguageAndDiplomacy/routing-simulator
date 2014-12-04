import Ember from 'ember';

// admin route
export default Ember.Route.extend({
  beforeModel: function() {
    var login = this.controllerFor('login');
    if (login.get('isLoggedIn') && login.get('name') === 'tealsteachers') {
      return;
    }
    this.transitionTo('login');
  }
});
