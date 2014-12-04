import Ember from 'ember';
import ajax from '../utils/ajax';

// admin route
export default Ember.Route.extend({
  beforeModel: function() {
    var login = this.controllerFor('login');
    if (login.get('isLoggedIn') && login.get('name') === 'tealsteachers') {
      return;
    }
    this.transitionTo('login');
  },
  model: function() {
    return ajax({
      type: 'GET',
      url: '/connections',
      dataType: 'json'
    });
  }
});
