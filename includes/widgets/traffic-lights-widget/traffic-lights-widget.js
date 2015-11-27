/**
 * Copyright 2015
 * Released under the MIT license
 * laxarjs.org
 */
define( [], function() {
   'use strict';

   var STATES = [
      'pending',
      'success',
      'warning',
      'failure',
      'errored'
   ];

   return {
      name: 'traffic-lights-widget',
      injections: [ 'axContext' ],
      create: function( context ) {
         var element;
         var indicators = [];

         var builds = [];
         var state = updateStates( builds );
         var update;

         function getIndicatorClass() {
            return STATES[ Math.floor( Math.random() * STATES.length ) ];
         }

         function delegate( event ) {
            indicators.forEach( function( indicator ) {
               if( indicator === event.target || indicator.contains( event.target ) ) {
                  indicator.childNodes[1].className = getIndicatorClass();
               }
            } );
         };

         function updateStates( builds ) {
            var state = STATES.reduce( function( state, name ) {
               state[ name ] = [];
               return state;
            }, {} );

            var builders = builds.reduce( function( builders, build, index ) {
               if( !builders.hasOwnProperty( build.name ) ) {
                  builders[ build.name ] = index;
               }
               return builders;
            }, {} );

            Object.keys( builders ).forEach( function( name ) {
               var index = builders[ name ];
               var build = builds[ index ];
               state[ build.state ].push( build );
            } );

            return state;
         }

         context.eventBus.subscribe( 'beginLifecycleRequest', function() {
            fetch( context.features.status.url )
               .then( function( response ) {
                  return response.json();
               } )
               .then( function( data ) {
                  builds = data;
                  state = updateStates( data );

                  render( element );
               } );
         } );

         function replaceChildren( element, nodes ) {
            while( element.firstChild ) {
               element.removeChild(element.firstChild);
            }
            nodes.forEach( element.appendChild, element );
         }

         function buildElement( build ) {
            var element = document.createElement( 'li' );
            var text = document.createTextNode( 'Build ' + build.state + ': ' + build.name + ' #' + build.number + '' );
            element.appendChild( text );
            return element;
         }

         function messageElement( build ) {
         }

         function bind( e ) {
            element = e;
            element.addEventListener( 'click', delegate );
            [].push.apply( indicators, element.querySelectorAll( '.indicator' ) );
         }

         function render( element ) {
            var activity = element.querySelector( '.activity ol' );
            var indicator = element.querySelector( '.indicator div' );
            var worst = 0;

            replaceChildren( activity, builds.map( buildElement ) );

            Object.keys( state ).forEach(function ( name ) {
               var builds = state[ name ];
               var index = STATES.indexOf( name );
               if( builds.length ) {
                  worst = index > worst ? index : worst;
                  element.classList.add( name );
               } else {
                  element.classList.remove( name );
               }
            } );

            indicator.className = STATES[ worst ];
         }

         return {
            renderTo: function( element ) {
               // `element` is the instantiated template of the widget, already attached to the page DOM
               bind( element );
               render( element );
               update = render.bind( null, element );
            }
         };
      }
   };
} );
