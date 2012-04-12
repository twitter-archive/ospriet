module.exports = Class(function(){
  this.config = app.getConfig()
})
  .methods ({
    getModel: function (name) {
      if (app.set('modelCache')[name]) return app.set('modelCache')[name]
      return (app.set('modelCache')[name] = new (require(app.set('models') + '/' + name + 'Model')))
    }
  })