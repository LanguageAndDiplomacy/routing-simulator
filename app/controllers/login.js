import Ember from 'ember';

// login controller
export default Ember.Controller.extend({
  name: null,
  isLoggedIn: false,
  completeLogin: function() {
    this.set('isLoggedIn', true);
    this.transitionToRoute('index');
  },
  actions: {
    login: function() {
      var name = this.get('name');
      if (name) {
        var payload = JSON.stringify({id: name});
        var _this = this;
        Ember.$.ajax({
          type: 'POST',
          url: '/users',
          data: payload,
          processData: false,
          contentType: 'application/json',
          success: this.completeLogin.bind(this),
          error: function(xhr) {
            if (xhr.status === 409) {
              _this.completeLogin();
              return;
            }
            console.log('error logging in');
          }
        });
      }
    }
  }
});
