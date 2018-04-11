define( "qtdreamplayer", [
    "taskbar",
    "translator",
    "./APlayer"
], function ( taskbar, translator, APlayer )
{
    var player = { };

    function replaceEscapes( text )
    {
        text = text.replace( /&quot;/g, "\"" );
        text = text.replace( /&amp;/g, "&" );
        text = text.replace( /&lt;/g, "<" );
        text = text.replace( /&gt;/g, ">" );
        text = text.replace( /&nbsp;/g, " " );
        text = text.replace( /&equiv;/g, "=" );
        text = text.replace( /&amp;/g, "&" );
        return text;
    }

    player.getSongsFromRadio = function( apiKey, id, page, callback )
    {
        if ( !page ) page = 1;
        var perPage = 24;
        var url = "https://qtdream.com/moefm";
        url += "/listen/playlist?api=json&radio=" + id +
            "&perpage=" + perPage + "&page=" + page + "&api_key=" + apiKey;

        $.ajax( {
            "url": url,
            "cached": true,
            "success": function ( data )
            {
				if ( typeof data == "string" )
                {
                    data = JSON.parse( data );
                }
                var result = data;
                if ( result.error )
                {
                    callback( result.error );
                    return;
                }
                var playlist = result.response.playlist;

                // 筛选数据，保存我们需要的
                var musics = [ ];
                for ( var i in playlist )
                {
                    var item =
                    {
                        "id": playlist[i].sub_id,
                        "url": playlist[i].url,
                        "title": replaceEscapes( playlist[i].sub_title ),
                        "wiki_title": replaceEscapes( playlist[i].wiki_title ),
                        "author": replaceEscapes( playlist[i].artist ),
                        "pic": playlist[i].cover.square
                    };
                    musics.push( item );
                }
                callback( null, musics );
            },
            "error": function ( data, textStatus )
            {
                if ( data.status === 0 && textStatus === "error" )
                {
                    data.status = 500;
                }
                callback( {
                    data: data,
                    textStatus: textStatus
                } );
            }
        } );
    }

    player.APlayer = APlayer;

    return player;
} );
