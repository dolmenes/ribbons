var Defs = require( './defs.js' );

function Sync( library, options ) { 'use strict';
  this.library = library;
  this.options = options;
  this.ribbonType = 'Sync';
}
// Ejecuta un widget función.
Sync.prototype.execFunction = function( msg, funct, self) { 'use strict';
  return funct.call( self, msg );
}
// Ejecuta un widget que es una ribbon.
Sync.prototype.execRibbon = function( msg, ribbon ) { 'use strict';
  return this.container.wait( ribbon, msg );
}
// Ejecuta un widget, y devuelve el resultado.
Sync.prototype.exec = function( widget, msg ) { 'use strict';
  return widget[0] & Defs.RIBBON ?
         this.execRibbon( widget[1], msg ) :
         this.execFunction( widget[1], widget[2], msg );
}
// Arranca la ribbon, y espera hasta que finalice.
Sync.prototype.wait = function( list, msg ) { 'use strict';
  var failure = false; // true si algún widget required falla.
  var idx = 0;
  var errors = [ ];
  var curr = list[idx];
  var result, prio;

  for( ; curr; curr = list[++ idx] ) {
    prio = curr[0] & Defs.REQUISITE & Defs.REQUIRED & Defs.SUFFICIENT & Defs.OPTIONAL;
    result = curr[0] & Defs.RIBBON ?
             this.execRibbon( msg, curr[1] ) :
             this.execFunction( msg, curr[1], curr[2] );

    // Si la prioridad era OPTIONAL, no hay que comprobar posibles errores.
    // Seguimos con el bucle.
    if( prio & Defs.OPTIONAL )
      continue;

    // Comprobamos si hay errores.
    if( result ) {
      // Guardamos el error.
      errors.push( result );

      // Si era un requisito, salimos ya.
      if( prio & Defs.REQUISITE )
        return errors;

      // Dejamos constancia del error.
      failure = true;
    } else {
      // Si era SUFFICIENT, y no había errores anteriores, salimos del bucle.
      if( ( prio & Defs.SUFFICIENT ) && ( ! failure ) )
        break;
    }
  } // for.

  // Si no hubo errores, devolvemos undefined.
  // Si hubo errores, devolvemos la lista de los mismos.
  return errors.length ? errors : undefined;
}
// Arranca la ribbon, y llamará a la función callback cuando termine.
Sync.prototype.notify = function( list, msg, callback, self ) { 'use strict';
  result = this.wait( list, msg );
  callback.call( self, result, msg );
}

module.exports = {
  createInstance: function( lib, opts ) {
    return new Sync( lib, opts );
  }
}
