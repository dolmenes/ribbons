var Util = require( 'util' );

var Defs = require( './lib/defs.js' );

var EMUSTBEASTRING = 'argument must be a string';
var EINVALIDEMPTY = 'invalid empty argument string';
var ENOTEXIST = "ribbon '%s' not exist";

// Tabla que relaciona los tipos soportados con los módulos que los
// implementan.
var SupportedTypes = {
  sync: './lib/sync.js'
}

// Objeto con las listas de widgets de las ribbons.
var Widgets = { };
// Objeto con todas las instancias de las ribbons.
var Instances = { };

// Función auxiliar, para comprobar que un determinado objeto es una función.
function isFunction( x ) { 'use strict';
  var getType = { };

  return x && getType.toString.call( x ) === '[object Function]';
}

// Añadimos un 'widget' a la lista de widgets del ribbon.
// ribbon -> nombre del ribbon.
// prio -> REQUISITE ^ REQUIRED ^ SUFFICIENT ^ OPTIONAL
// funct -> función a añadir, o nombre de la ribbon.
// self -> si funct es una función, argumento 'this' a pasarle.
function addWidget( ribbon, prio, funct, self ) { 'use strict';
  var functType;

  if( typeof funct === 'string' ) {
    if( funct.length < 1 )
      throw new Error( EINVALIDEMPTY );

    functType = Defs.RIBBON;
  } else {
    if( ! isFunction( funct ) )
      throw new TypeError( "'function' must be a ribbon name or a function" );

    functType = Defs.FUNCTION;
  }

  if( ! Widgets[ribbon] )
    new TypeError( Util.format( ENOTEXIST, ribbon ) );

  Widgets[ribbon].push( [ prio | functType, funct, self ] );
}

// Devuelve el tamaño de la lista de mecanismos del ribbon.
function getRibbonLength( ) { 'use strict';
  return Widgets[this.name].length;
}

// Constructor.
// name -> nombre de la ribon.
function Ribbon( name ) { 'use strict';
  Object.defineProperty( this, 'length', { get: getRibbonLength } );
  Object.defineProperty( this, 'name', { value: name } );
}
// Auxiliar. Nos devuelve el tipo de la ribbon.
Ribbon.prototype.ribbonType = function( ) { 'use strict';
  return Instances[this.name].ribbonType;
}
// Auxiliar. Devuelve las opciones al crear la ribbon.
Ribbon.prototype.options = function( ) { 'use strict';
  return Instances[name].options;
}
// Añade un requisito.
Ribbon.prototype.requisite = function( funct, self ) { 'use strict';
  addWidget( this.name, Defs.REQUISITE, funct, self );
}
Ribbon.prototype.required = function( funct, self ) { 'use strict';
  addWidget( this.name, Defs.REQUIRED, funct, self );
}
Ribbon.prototype.sufficient = function( funct, self ) { 'use strict';
  addWidget( this.name, Defs.SUFFICIENT, funct, self );
}
Ribbon.prototype.optional = function( funct, self ) { 'use strict';
  addWidget( this.name, Defs.OPTIONAL, funct, self );
}
// Arranca la ribbon y espera a su terminación.
Ribbon.prototype.wait = function( msg ) { 'use strict';
  return Instances[this.name].wait( Widgets[this.name], msg );
}
// Arranca la ribbon y nos notifica cuando termine.
Ribbon.prototype.notify = function( msg, callback, self ) {
  return Instances[this.name].notify( Widgets[this.name], msg, callback, self );
}
module.exports = {
  // Crea una ribbon. Si ya existe, se lanza una excepcion.
  createRibbon: function( name, type, opts ) { 'use strict';
    var file;

    type = type || 'sync';

    // Si la ribbon existe, lanzamos una excepción.
    if( Widgets[name] )
      throw new Error( 'ribbon already created' );

    // Obtenemos el archivo que implementa el tipo.
    file = SupportedTypes[type];
    // Si el tipo no está soportado, lanzamos una excepcion.
    if( file === undefined )
      throw new Defs.UnknownRibbonType( Util.format( 'unsupported ribbon tipe %s', type ) );

    // Creamos la instancia de la ribbon ...
    Instances[name] = require( file ).createInstance( this, opts );
    // ... y su lista de widgets.
    Widgets[name] = [ ];

    // Devolvemos el ribbon.
    return new Ribbon( name );
  },
  // Devuelve una ribbon existente, o undefined si no existe.
  openRibbon: function( name ) { 'use strict';
    // Si la ribon no existe, devolvemos 'undefined'.
    if( ! Widgets[name] )
      return;

    return new Ribbon( name );
  },
  // Ejecuta una ribbon, y espera al resultado.
  wait: function( name, msg ) { 'use strict';
    // Si la ribbon no existe, error.
    if( ! Widgets[name] )
      throw new Error( Util.format( ENOTEXIST, name.toString( ) ) );

    return Instances[name].wait( Widgets[name], msg );
  },
  // Ejecuta una ribbon, y nos notifica cuando termine.
  notify: function( name, callback, self ) {
    // Si la ribbon no existe, error.
    if( ! Widgets[name] )
      throw new Error( Util.format( ENOTEXIST, name.toString( ) ) );

    Instances[name].notify( Widgets[name], msg, callback, self );
  },
  // Para añadir widgets.
  requisite: function( ribbon, wiget, self ) {
    addWidget( ribbon, Defs.REQUISITE, widget, self );
  },
  required: function( ribbon, widget, self ) {
    addWidget( ribbon, Defs.REQUIRED, widget, self );
  },
  sufficient: function( ribbon, widget, self ) {
    addWidget( ribbon, Defs.SUFFICIENT, widget, self );
  },
  optional: function( ribbon, widget, self ) {
    addWidget( ribbon, Defs.OPTIONAL, widget, self );
  },
  // Clase base, para comprobar retornos y errores.
  RibbonClass: Ribbon,
  // Excepciones lanzadas.
  UnknownRibbon: Defs.UnknownRibbon, // La ribbon no existe.
  RibbonExist: Defs.RibbonExist, // La ribbon ya existe.
  UnknownRibbonType: Defs.UnknownRibbonType, // Tipo de ribbon no existe.
  // Uso interno, para los test de funcionamiento. No tocar.
  _isFunction: isFunction,
  _addWidget: addWidget,
  _supportedTypes: SupportedTypes,
  _instances: Instances,
  _widgets: Widgets
}
