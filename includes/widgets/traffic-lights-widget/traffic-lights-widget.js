/**
 * Copyright 2015
 * Released under the MIT license
 * laxarjs.org
 */
define( [], function() {
   'use strict';

   return {
      name: 'traffic-lights-widget',
      injections: [ 'axContext' ],
      create: function( context ) {

         var indicators = [];

         function getIndicatorClass() {
            return [
               'alert',
               'progress',
               'checkmark'
            ][ Math.floor( Math.random() * 3 ) ];
         }

         function delegate( event ) {
            indicators.forEach( function( indicator ) {
               if( indicator === event.target || indicator.contains( event.target ) ) {
                  indicator.childNodes[1].className = getIndicatorClass();
               }
            } );
         };

         return {
            renderTo: function( element ) {
               element.addEventListener( 'click', delegate );
               [].push.apply( indicators, document.querySelectorAll( '.indicator', element ) );
               // `element` is the instantiated template of the widget, already attached to the page DOM
            }
         };
      }
   };
} );
