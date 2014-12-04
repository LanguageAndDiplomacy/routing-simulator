import Ember from 'ember';

// index route
export default Ember.Route.extend({
  beforeModel: function() {
    var target = 'login';
    var login = this.controllerFor('login');
    if (login.get('isLoggedIn')) {
      target = login.get('name') === 'tealsteachers' ? 'admin' : 'messages';
    }
    this.transitionTo(target);
  }
});
