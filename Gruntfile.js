/**
 * Copyright 2015
 * Released under the MIT license
 * laxarjs.org
 */
/*global module,__dirname,__filename */
module.exports = function( grunt ) {
   'use strict';

   var serverPort = 8002;
   var testPort = 1000 + serverPort;
   var liveReloadPort = 30000 + serverPort;

   grunt.initConfig( {
      pkg: grunt.file.readJSON( 'package.json' ),

      'laxar-configure': {
         options: {
            flows: [
               { target: 'main', src: 'application/flow/flow.json' }
            ],
            ports: {
               develop: serverPort,
               test: testPort,
               livereload: liveReloadPort
            }
         }
      },
      connect: {
         'laxar-develop': {
            options: {
               middleware: function( connect, options, middlewares ) {
                  var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                  return [ proxy ].concat( middlewares );
               }
            },
            proxies: [
               {
                  context: '/api',
                  host: 'localhost',
                  port: 1300,
                  rewrite: {
                     '^/api': '/'
                  }
               }
            ]
         }
      }
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.loadNpmTasks( 'grunt-laxar' );
   grunt.loadNpmTasks( 'grunt-connect-proxy' );

   // basic aliases
   grunt.registerTask( 'test', [ 'laxar-test' ] );
   grunt.registerTask( 'build', [ 'laxar-build' ] );
   grunt.registerTask( 'dist', [ 'laxar-dist' ] );
   grunt.registerTask( 'develop', [ 'laxar-develop' ] );
   grunt.registerTask( 'info', [ 'laxar-info' ] );

   // additional (possibly) more intuitive aliases
   grunt.registerTask( 'optimize', [ 'laxar-dist' ] );
   grunt.registerTask( 'start', [ 'configureProxies:laxar-develop', 'laxar-develop' ] );
   grunt.registerTask( 'start-no-watch', [ 'laxar-develop-no-watch' ] );

   grunt.registerTask( 'default', [ 'build', 'test' ] );
};