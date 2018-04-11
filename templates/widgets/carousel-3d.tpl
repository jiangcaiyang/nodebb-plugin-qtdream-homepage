<div data-carousel-3d="valid">
    <!-- BEGIN htmls -->
        {htmls.value}
    <!-- END htmls -->
</div>
<script>
'use strict';
$(document).ready( function( ) {
    var found = $('div[data-carousel-3d="valid"]');
    found.Carousel3d( );
    var timerFunc = function ( )
    {
        found.Carousel3d( 'next' );
        if ( {infinite} ) setTimeout( timerFunc, {interval} );
    };
    if ( {infinite} ) setTimeout( timerFunc, {interval} );
} );
</script>
