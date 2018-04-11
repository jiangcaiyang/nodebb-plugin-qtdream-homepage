<!-- BEGIN imageitems -->
<div class="imageitems col-md-3 col-xs-6">
    <div class="image_responsive">
        <a href="{imageitems.titleUrl}"><img src="{imageitems.cover}"></img></a>
    </div>
    <div class="title_container">
        <a class="imageitem_title" id="a_{imageitems.id}" href="{imageitems.titleUrl}">{imageitems.title}</a>
        <div class="hide_on_hover" id="hover_{imageitems.id}">
            <a class="imageitem_author" href="{imageitems.authorUrl}">{imageitems.author}</a>
            <div class="imageitem_popularity"><i class="fa fa-play-circle"></i>{imageitems.popularity}</div>
        </div>
    </div>
</div>

<script>
'use strict';
var onLoad = function( ) {
     var bgColor = $( "body" ).css( "background" );
     $( "#hover_{imageitems.id}" ).css( { "background": bgColor } );
     $( ".image_responsive" ).css( { "background": bgColor } );
     $( "#a_{imageitems.id}" ).hover( function ( )
     {
         $( "#hover_{imageitems.id}" ).addClass( "hide_on_hover_1" );
     }, function ( )
     {
         $( "#hover_{imageitems.id}" ).removeClass( "hide_on_hover_1" );
     } );
 };
if ( window.jQuery ) {
	onLoad( );
} else {
	window.addEventListener('load', onLoad );
}
</script>

<!-- END imageitems -->