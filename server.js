/*
 *  Copyright 2012 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var matador = require('matador')
var fs = require('fs')
var nconf = require('nconf')

app.configure(function () {
  app.set('models', __dirname + '/app/models')
  app.set('helpers', __dirname + '/app/helpers')
  app.set('views', __dirname + '/app/views')
  app.set('controllers', __dirname + '/app/controllers')
  app.set('services', __dirname + '/app/services')


  //
  // Setup nconf to use (in-order):
  //   1. Command-line arguments
  //   2. Environment variables
  //   3. A file located at 'path/to/config.json'
  //
  nconf.argv()
       .env()
       .file({ file: 'config.json' });

  app.config = nconf;
  var serviceList = ['Stream']
  var serviceStore = []

  function initServices() {
    v(serviceList).each(function (name) {
      serviceStore.push({
          name: name.toLowerCase()
        , instance: (new (require(app.set('services') + '/' + name + 'Service')))
      })
    })
  }

  function startServices() {
    v(serviceStore).each(function (service) {
      service.instance.init()
    })
  }

  initServices()
  startServices()

  // added methods

  app.getService = function (name) {
    name = name.toLowerCase()
    var service = v(serviceStore).filter(function (service) {
      if (service.name === name) {
        return true
      }
      return false
    })
    return service[0].instance
  }

  // end added code

  app.set('view engine', 'html')
  app.register('.html', matador.engine)

  app.use(matador.cookieParser())
  app.use(matador.bodyParser())
  app.use(matador.methodOverride())
  app.use(matador.static(__dirname + '/public'))
  app.set('viewPartials', matador.partials.build(app.set('views')))
})

app.configure('development', function () {
  app.use(matador.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function () {
  app.use(matador.errorHandler())
})
matador.mount(require('./app/config/routes'))

app.listen(app.config.get('server_port'))
console.log('matador running on port ' + app.config.get('server_port'))
