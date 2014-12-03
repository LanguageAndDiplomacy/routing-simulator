import Ember from 'ember';
import ajax from '../utils/ajax';

export default Ember.Route.extend({
  beforeModel: function() {
    var login = this.controllerFor('login');
    if (!login.get('isLoggedIn')) {
      this.transitionTo('login');
    }
  },
  model: function() {
    var _this = this;
    var name = this.controllerFor('login').get('name');
    var msgs = ajax({
      type: 'GET',
      url: '/users/' + name + '/messages',
      dataType: 'json'
    });
    var conns = ajax({
      type: 'GET',
      url: '/connections?related-to=' + name,
      dataType: 'json'
    });
    var p = Ember.RSVP.hash({msgs: msgs, conns: conns});
    return p.then(function(hash) {
      _this.set('connections', hash.conns);
      return hash.msgs;
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('connections', this.get('connections'));
  }
});
