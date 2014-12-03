import Ember from 'ember';
import ajax from '../utils/ajax';

// users route
export default Ember.Route.extend({
  model: function() {
    return ajax({
      type: 'GET',
      url: '/users',
      dataType: 'json'
    });
  }
});
