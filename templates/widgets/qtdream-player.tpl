<!--TODO: 下面的id="aplayer5"需要换成类似uuid的东西，这样的话，可以支持任意多的实例了。-->
<div class="aplayer" id="aplayer5"></div>
<script>
'use strict';
var ap5;
var onLoad = function( ) {
     require( [ "qtdreamplayer" ], function ( qtdreamplayer )
     {
         qtdreamplayer.getSongsFromRadio( "{moefouAPIKey}", "{radioID}", 1, function ( err, musics )
         {
             if ( ap5 ) return;
             ap5 = new qtdreamplayer.APlayer( {
                 element: document.getElementById( "aplayer5" ),
                 narrow: false,
                 autoplay: false,
                 showlrc: false,
                 theme: "#ad7a86",
                 listmaxheight: 33 * ( ( musics && musics.length )? ( musics.length + 0 ): 0 ) + "px",
                 music: musics
                 } );
         } );
     }
};
if ( window.jQuery ) {
	onLoad( );
} else {
	window.addEventListener('load', onLoad );
}
window.addEventListener( 'unload', function ( )
{
   if ( ap5 ) ap5.pause( );
} );
</script>
