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
    var _this = this;
    return Ember.RSVP.hash({
      connections: ajax({ type: 'GET', url: '/connections', dataType: 'json' }),
      users: ajax({ type: 'GET', url: '/users', dataType: 'json' })
    }).then(function(models) {
      _this.set('users', models.users);
      return models.connections;
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('users', this.get('users'));
  }
});
