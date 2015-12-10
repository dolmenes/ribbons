var Util = require( 'util' );

// Excepcion lanzada al intentar abrir una ribbon que no existe.
function UnknownRibbon( ) {
}
Util.inherits( UnknownRibbon, Error );

// Excepción lanzada al intentar crear una ribbon que ya existe.
function RibbonExist( ) {
}
Util.inherits( RibbonExist, Error );

// Excepción lanzada al intentar crear una ribbon con un tipo que no existe.
function UnknownRibbonType( ) {
}
Util.inherits( UnknownRibbonType, Error );

module.exports = {
  FUNCTION: 0,
  RIBBON: 1,
  REQUISITE: 2,
  REQIRED: 4,
  SUFFICIENT: 8,
  OPTIONAL: 16,
  UnknownRibbon: UnknownRibbon,
  RibbonExist: RibbonExist,
  UnknownRibbonType: UnknownRibbonType
}
