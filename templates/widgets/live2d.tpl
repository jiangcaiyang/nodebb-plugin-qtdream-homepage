<script>
'use strict';
(function()
{
	var onLoad = function( ) {
		if ( window.live2DMessage )
		{
		}
		else
		{
			app.parseAndTranslate( 'partials/live2d', { }, function(html)
			{
				$( "body" ).append( html );
				$( "#AIuserName" ).attr( "value", app.user.username );
				require( [ "live2DMessage" ], function ( live2DMessage )
				{
					live2DMessage.initialize( "{turing}" );
					live2DMessage.loadLive2D( );
					window.live2DMessage = live2DMessage;
				} );
			} );
		}
	};
	if ( window.jQuery ) {
		onLoad( );
	} else {
		window.addEventListener( 'load', onLoad );
	}
})();
</script>