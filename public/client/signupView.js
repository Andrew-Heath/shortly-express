Shortly.signupView = Backbone.View.extend({
  className: 'signup',

  template: Templates['signup'],

  // events: {
  //   'submit': 'signup'
  // },

  render: function() {
    this.$el.html( this.template() );
    return this;
  }
});
