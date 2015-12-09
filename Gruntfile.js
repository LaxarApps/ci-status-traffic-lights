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
      cfg: grunt.file.readJSON( 'config.json' ),

      'laxar-configure': {
         options: {
            flows: [
               { target: 'main', src: 'application/flow/flow.json' }
            ],
            ports: {
               develop: serverPort,
               test: testPort,
               livereload: liveReloadPort
            },
            userTasks: {
               'build-flow': [ 'laxar-sass' ]
            }
         }
      },
      connect: {
         'laxar-develop': {
            options: {
               middleware: function( connect, options, middlewares ) {
                  var compression = require('compression');
                  var relay = require('ci-relay');
                  var config = grunt.config.get('cfg');

                  return [ compression(), relay.config(config) ].concat( middlewares );
               }
            }
         }
      },
      sass: {
         options: {
            sourceMap: true
         },
         main: {
            files: [ {
               expand: true,
               src: [
                  'includes/themes/*.theme/scss/*.scss',
                  'includes/widgets/**/*.theme/scss/*.scss'
               ],
               rename: function (dest, src) {
                  return src.replace(/\/scss\/(.*)\.scss$/, '/css/$1.css');
               }
            } ]
         }
      }
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Unfortunately, grunt-laxar hijacks the files setting, effectively overriding anything configured
    * with grunt.initConfig(), so we can't call sass directly. Instead, we hook up this intermediate step
    * that does nothing except calling sass with the users configuration.
    */
   grunt.registerMultiTask( 'laxar-sass', 'Because grunt-laxar is annoying', function () {
      this.files;
      grunt.task.run( 'sass:' + this.target );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.loadNpmTasks( 'grunt-laxar' );
   grunt.loadNpmTasks( 'grunt-sass' );

   // basic aliases
   grunt.registerTask( 'test', [ 'laxar-test' ] );
   grunt.registerTask( 'build', [ 'laxar-build' ] );
   grunt.registerTask( 'dist', [ 'laxar-dist' ] );
   grunt.registerTask( 'develop', [ 'laxar-develop' ] );
   grunt.registerTask( 'info', [ 'laxar-info' ] );

   // additional (possibly) more intuitive aliases
   grunt.registerTask( 'optimize', [ 'laxar-dist' ] );
   grunt.registerTask( 'start', [ 'laxar-develop' ] );
   grunt.registerTask( 'start-no-watch', [ 'laxar-develop-no-watch' ] );

   grunt.registerTask( 'default', [ 'build', 'test' ] );
};
