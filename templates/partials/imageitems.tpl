<!-- BEGIN imageitems -->
<div class="imageitems col-md-3 col-xs-6">
    <div id="div_{imageitems.id}" class="image_responsive" style="background-color: {imageitems.bgColor}">
        <a href="{imageitems.titleUrl}">
            <!-- IF imageitems.hasCover -->
            <img src="{imageitems.cover}" onclick="window.href='{imageitems.titleUrl}'"></img>
            <!-- ELSE -->
            <h1 class="text-center" style="color: black">{imageitems.brief}</h1>
            <!-- ENDIF imageitems.hasCover -->
        </a>
    </div>
    <div class="title_container">
        <a class="imageitem_title" href="{imageitems.titleUrl}">{imageitems.title}</a>
        <div class="hide_on_hover" id="hover_{imageitems.id}" style="background-color: "transparent">
            <a class="imageitem_author" href="{imageitems.authorUrl}">{imageitems.author}</a>
            <div class="imageitem_popularity"><i class="fa fa-play-circle"></i>{imageitems.popularity}</div>
        </div>
    </div>
</div>

<script>
'use strict';
var onLoad = function( ) {
     $( "#div_{imageitems.id}" ).hover( function ( )
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