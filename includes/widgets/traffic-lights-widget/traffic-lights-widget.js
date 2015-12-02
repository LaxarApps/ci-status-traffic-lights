/**
 * Copyright 2015
 * Released under the MIT license
 * laxarjs.org
 */
define( [], function() {
   'use strict';

   var UNKNOWN = 'unknown';
   var PENDING = 'pending';
   var FAILURE = 'failure';
   var STATES = [
      UNKNOWN,
      'success',
      'warning',
      FAILURE,
      'errored',
      PENDING
   ];
   var EXPANDED = 'expanded';
   var POLL_INTERVAL = 10000;

   return {
      name: 'traffic-lights-widget',
      injections: [ 'axContext' ],
      create: function( context ) {
         var timeout;
         var element;

         var builds = [];
         var messages = [];
         var state = updateStates( builds );

         function updateStates( builds ) {
            var state = STATES.reduce( function( state, name ) {
               state[ name ] = [];
               return state;
            }, {} );

            var builders = builds.reduce( function( builders, build, index ) {
               if( build.state === PENDING ) {
                  state[ PENDING ].push( build );
               } else if( !builders.hasOwnProperty( build.name ) ) {
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
            function poll() {
               return update().then( function() {
                  if( requestAnimationFrame ) {
                     return new Promise( function( resolve, reject ) {
                        requestAnimationFrame( function() {
                           if( element ) {
                              render();
                           }
                           resolve();
                        } );
                     } );
                  } else {
                     return render();
                  }
               } ).then( function() {
                  timeout = setTimeout( poll, POLL_INTERVAL );
               } );
            }

            poll();
         } );

         context.eventBus.subscribe( 'endLifecycleRequest', function() {
            clearTimeout( timeout );
         } );

         function replaceChildren( element, nodes ) {
            while( element.firstChild ) {
               element.removeChild(element.firstChild);
            }
            nodes.forEach( element.appendChild, element );
         }

         function buildLink( build ) {
            var element = document.createElement( 'a' );
            var text = document.createTextNode( build.name + ' #' + build.number );
            element.href = build.html_url;
            element.appendChild( text );
            return element;
         }

         function buildElement( build ) {
            var element = document.createElement( 'li' );
            var link = buildLink( build );
            var text = [
               document.createTextNode( 'Build ' + build.state + ': ' ),
               link
            ];
            element.appendChild( text[ 0 ] );
            element.appendChild( text[ 1 ] );
            return element;
         }

         function messageElement( build ) {
            var element = document.createElement( 'div' );
            var link = buildLink( build );
            var text;

            element.className = 'message';

            switch( build.state ) {
               case 'pending':
                  text = [
                     document.createTextNode( 'Currently building ' ),
                     link
                  ];
                  break;
               case 'success':
                  text = [
                     link,
                     document.createTextNode( ' succeeded' )
                  ];
                  break;
               case 'warning':
                  text = [
                     document.createTextNode( 'Warnings during build ' ),
                     link
                  ];
                  break;
               case 'failure':
                  text = [
                     link,
                     document.createTextNode( ' failed' )
                  ];
                  break;
               default:
                  return null;
            }
            text.forEach( element.appendChild, element );
            return element;
         }

         function textMessageElement( text ) {
            var element = document.createElement( 'div' );
            element.className = 'message';
            element.appendChild( document.createTextNode( text ) );
            return element;
         }

         function init( e ) {
            element = e;
            element.querySelector( '.v-fade' ).addEventListener( 'click', function( event ) {
               if( element.classList.contains( EXPANDED ) ) {
                  element.classList.remove( EXPANDED );
               } else {
                  element.classList.add( EXPANDED );
               }
            } );
         }

         function update() {
            return fetch( context.features.status.url )
               .then( function( response ) {
                  if( response.status !== 200 ) {
                     return Promise.reject();
                  }
                  return response.json();
               } )
               .then( function( data ) {
                  builds = data;
                  state = updateStates( data );
               }, function() {
                  builds = [];
                  state = updateStates( [] );
                  messages.push( textMessageElement( 'Failed updating build status.' ) );
               } );
         }

         function render() {
            var indicator = element.querySelector( '.indicator div' );
            var activity = element.querySelector( '.activity' );
            var message = activity.querySelector( '.message' );
            var list = activity.querySelector( 'ol' );
            var worst = 0;

            replaceChildren( list, builds.map( buildElement ) );

            Object.keys( state ).forEach( function ( name ) {
               var builds = state[ name ];
               var index = STATES.indexOf( name );
               if( builds.length ) {
                  worst = index > worst ? index : worst;
                  element.classList.add( name );
               } else {
                  element.classList.remove( name );
               }
            } );

            if( message ) {
               activity.removeChild( message );
            }

            if( STATES[ worst ] === UNKNOWN ) {
               indicator.className = messages.length ? FAILURE : PENDING;
               element.classList.add( PENDING );
               messages.push( textMessageElement( 'Fetching build status…' ) );
            } else {
               indicator.className = STATES[ worst ];

               message = messageElement( state[ STATES[ worst ] ][ 0 ] );
               if( message ) {
                  messages.push( message );
               }
            }
            message = messages.shift();
            if( message ) {
               activity.insertBefore( message, list );
            }
         }

         return {
            renderTo: function( element ) {
               // `element` is the instantiated template of the widget, already attached to the page DOM
               init( element );
               render();
            }
         };
      }
   };
} );
