var require = {
   baseUrl: 'bower_components',
   deps: [
      'promise-polyfill',
      'fetch'
   ],
   paths: {
      // LaxarJS Core and dependencies:
      laxar: 'laxar/dist/laxar',
      requirejs: 'requirejs/require',
      text: 'requirejs-plugins/lib/text',
      json: 'requirejs-plugins/src/json',
      angular: 'angular/angular',
      'angular-route': 'angular-route/angular-route',
      'angular-sanitize': 'angular-sanitize/angular-sanitize',

      'jjv': 'jjv/lib/jjv',
      'jjve': 'jjve/jjve',

      // LaxarJS application paths:
      'laxar-path-root': '..',
      'laxar-path-layouts': '../application/layouts',
      'laxar-path-pages': '../application/pages',
      'laxar-path-flow': '../application/flow/flow.json',
      'laxar-path-widgets': '../includes/widgets',
      'laxar-path-themes': '../includes/themes',
      'laxar-path-default-theme': 'laxar-path-themes/themes/default.theme',

      // LaxarJS application modules (contents are generated):
      'laxar-application-dependencies': '../var/flows/main/dependencies',

      // Polyfills
      'promise-polyfill': 'promise-polyfill/Promise',
      'fetch': 'fetch/fetch'
   },
   packages: [
      {
         name: 'laxar-application',
         location: '..',
         main: 'init'
      }
   ],
   shim: {
      angular: {
         // use `deps: [ 'jquery' ]` if you use jquery and need a jQuery-compatible angular.element()
         deps: [],
         exports: 'angular'
      },
      'angular-mocks': {
         deps: [ 'angular' ],
         init: function( angular ) {
            'use strict';
            return angular.mock;
         }
      },
      'angular-route': {
         deps: [ 'angular' ],
         init: function( angular ) {
            'use strict';
            return angular;
         }
      },
      'angular-sanitize': {
         deps: [ 'angular' ],
         init: function( angular ) {
            'use strict';
            return angular;
         }
      },
      'fetch': {
         deps: [ 'promise-polyfill' ]
      }
   }
};
