define( "live2DMessage", [
	"./live2d"
], function ( live2D )
{
	function renderTip(template, context) {
		var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
		return template.replace(tokenReg, function (word, slash1, token, slash2) {
			if (slash1 || slash2) {
				return word.replace('\\', '');
			}
			var variables = token.replace(/\s/g, '').split('.');
			var currentObject = context;
			var i, length, variable;
			for (i = 0, length = variables.length; i < length; ++i) {
				variable = variables[i];
				currentObject = currentObject[variable];
				if (currentObject === undefined || currentObject === null) return '';
			}
			return currentObject;
		} );
	}

	var live2DMessage =
	{
		"message_Path": "/plugins/nodebb-plugin-qtdream-homepage/live2d_scripts/",
		"live2DIsFading": false,
		"aiTalkFlag": true,
		"turingKey": "",
		"sleepTimer_": null,
		"landlordIsMoving": false,
		"landlordMoveX": 0,
		"landlordMoveY": 0,
		"landlordMoveLeft": 0,
		"landlordMoveBottom": 0,
		"hitFlag": false,
		"liveTalkTimer": null
	};

	live2DMessage.talkValTimer = function ( )
	{
		$('#live_talk').val('1');
	}

	live2DMessage.checkSleep = function ( )
	{
		var sleepStatu = sessionStorage.getItem("Sleepy");
		if (sleepStatu !== '1') {
			this.talkValTimer( );
			this.showMessage('你回来啦~', 0);
			clearInterval(this.sleepTimer_);
			this.sleepTimer_ = null;
		}
	}

	live2DMessage.onGetHitokoto = function ( result )
	{
		this.talkValTimer( );
		this.showMessage( result.hitokoto, 0 );
	};

	live2DMessage.showHitokoto = function ( )
	{
		if ( sessionStorage.getItem("Sleepy") !== "1" )
		{
			if ( !this.aiTalkFlag )
			{
				$.getJSON('https://sslapi.hitokoto.cn/',
					this.onGetHitokoto.bind( this ) );
			}
		} else {
			this.hideMessage(0);
			if ( this.sleepTimer_ == null) {
				this.sleepTimer_ = setInterval( live2DMessage.checkSleep.bind( this ), 200);
			}
			//console.log(sleepTimer_);
		}
	};

	live2DMessage.showMessage = function( text, timeout )
	{
		if (Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1) - 1];
		//console.log('showMessage', text);
		$('.message').stop();
		$('.message').html(text);
		$('.message').fadeTo(200, 1);
		//if (timeout === null) timeout = 6000;
		//hideMessage(timeout);
	};

	live2DMessage.hideMessage = function ( timeout )
	{
		//$('.message').stop().css('opacity',1);
		if (timeout === null) timeout = 6000;
		$('.message').delay(timeout).fadeTo(200, 0);
	};

	live2DMessage.setLiveTalkTimer = function ( )
	{
		this.liveTalkTimer = window.setInterval( this.showHitokoto.bind( this ), 15000 );
	};

	live2DMessage.onTipsSelectorMouseOver = function ( tipElem, tips )
	{
		var text = tips.text;
		if (Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1) - 1];
		text = renderTip( text, { text: tipElem.text( ) } );
		this.showMessage(text, 3000);
		this.talkValTimer();
		clearInterval( this.liveTalkTimer);
		this.liveTalkTimer = null;
	};

	live2DMessage.onTipsSelectorMouseOut = function ( )
	{
		this.showHitokoto( );
		if ( this.liveTalkTimer == null )
		{
			this.setLiveTalkTimer( );
		}
	};

	live2DMessage.onTipsSelectorClick = function ( tipElem, tips )
	{
		if ( this.hitFlag )
		{
			return false
		}
		this.hitFlag = true;
		setTimeout( function ( )
		{
			live2DMessage.hitFlag = false;
		}, 8000 );
		var text = tips.text;
		if (Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1) - 1];
		text = renderTip( text, { text: tipElem.text( ) } );
		this.showMessage(text, 3000);
	};

	live2DMessage.onTipsMouseOver = function (index, tips)
	{
		var tipElem = $(tips.selector);
		tipElem.mouseover( this.onTipsSelectorMouseOver.bind( this, tipElem, tips ) );
		tipElem.mouseout( this.onTipsSelectorMouseOut.bind( this ) );
	};

	live2DMessage.onTipsMouseClick = function (index, tips)
	{
		var tipElem = $(tips.selector);
		tipElem.click( this.onTipsSelectorClick.bind( this, tipElem, tips ) );
		clearInterval( this.liveTalkTimer );
		this.liveTalkTimer = null;
		if ( this.liveTalkTimer == null )
		{
			this.setLiveTalkTimer( );
		};
	};

	live2DMessage.onInitTipsSuccess = function ( result )
	{
		$.each( result.mouseover, this.onTipsMouseOver.bind( this ) );
		$.each( result.click, this.onTipsMouseClick.bind( this ) );
	};

	live2DMessage.initTips = function ( )
	{
		$.ajax( {
			cache: true,
			url: this.message_Path + 'message.json',
			dataType: "json",
			success: this.onInitTipsSuccess.bind( this )
		} );
	};

	// live2DMessage.hide = function ( )
	// {
	// 	localStorage.setItem("live2dhidden", "1");
	// }

	live2DMessage.initialize = function ( turingKey )
	{
		this.turingKey = turingKey;

		var home_Path = document.location.protocol + '//' + window.document.location.hostname + '/';
		var userAgent = window.navigator.userAgent.toLowerCase();
		var norunAI = ["android", "iphone", "ipod", "ipad", "windows phone", "mqqbrowser", "msie", "trident/7.0"];
		var norunFlag = false;


		for (var i = 0; i < norunAI.length; i++) {
			if (userAgent.indexOf(norunAI[i]) > -1) {
				norunFlag = true;
				break;
			}
		}

		if (!window.WebGLRenderingContext) {
			norunFlag = true;
		}

		if (!norunFlag) {
			this.hitFlag = false;
			this.liveTalkTimer = null;
			var re = /x/;
			re.toString = function () {
				this.showMessage('哈哈，你打开了控制台，是想要看看我的秘密吗？', 5000);
				return '';
			};

			$(document).on('copy', function () {
				live2DMessage.showMessage('你都复制了些什么呀，转载要记得加上出处哦~~', 5000);
			});

			this.initTips( );

			var text;
			if (document.referrer !== '') {
				var referrer = document.createElement('a');
				referrer.href = document.referrer;
				text = '嗨！来自 <span style="color:#0099cc;">' + referrer.hostname + '</span> 的朋友！';
				var domain = referrer.hostname.split('.')[1];
				if (domain == 'baidu') {
					text = '嗨！ 来自 百度搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
				} else if (domain == 'so') {
					text = '嗨！ 来自 360搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
				} else if (domain == 'google') {
					text = '嗨！ 来自 谷歌搜索 的朋友！<br>欢迎访问<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
				}
			} else {
				if (window.location.href == home_Path) { //主页URL判断，需要斜杠结尾
					var now = (new Date()).getHours();
					if (now > 23 || now <= 5) {
						text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？';
					} else if (now > 5 && now <= 7) {
						text = '早上好！一日之计在于晨，美好的一天就要开始了！';
					} else if (now > 7 && now <= 11) {
						text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！';
					} else if (now > 11 && now <= 14) {
						text = '中午了，工作了一个上午，现在是午餐时间！';
					} else if (now > 14 && now <= 17) {
						text = '午后很容易犯困呢，今天的运动目标完成了吗？';
					} else if (now > 17 && now <= 19) {
						text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~~';
					} else if (now > 19 && now <= 21) {
						text = '晚上好，今天过得怎么样？';
					} else if (now > 21 && now <= 23) {
						text = '已经这么晚了呀，早点休息吧，晚安~~';
					} else {
						text = '嗨~ 快来逗我玩吧！';
					}
				} else {
					text = '欢迎阅读<span style="color:#0099cc;">「 ' + document.title.split(' - ')[0] + ' 」</span>';
				}
			}
			this.showMessage(text, 12000);
			this.setLiveTalkTimer( );
		}
	};
	live2DMessage.loadLive2D = function () {
		var AIimgSrc = [
			this.message_Path + "model/histoire/histoire.1024/texture_00.png",
			this.message_Path + "model/histoire/histoire.1024/texture_01.png",
			this.message_Path + "model/histoire/histoire.1024/texture_02.png",
			this.message_Path + "model/histoire/histoire.1024/texture_03.png"
		]
		var images = [];
		var imgLength = AIimgSrc.length;
		var loadingNum = 0;
		for (var i = 0; i < imgLength; i++) {
			images[i] = new Image();
			images[i].src = AIimgSrc[i];
			images[i].onload = function () {
				loadingNum++;
				if (loadingNum === imgLength) {
					var live2dhidden = localStorage.getItem("live2dhidden");
					if (live2dhidden === "0") {
						$('#open_live2d').fadeIn(200);
					} else {
						$('#landlord').fadeIn(200);
					}
					setTimeout(function () {
						loadlive2d("live2d", live2DMessage.message_Path + "model/histoire/model.json");
					}, 1000);
					live2DMessage.initLive2D();
					images = null;
				}
			}
		}
	};

	live2DMessage.onHideButtonClicked = function ( openLive2D, landlord )
	{
		if ( this.live2DIsFading ) {
			return false;
		} else {
			this.live2DIsFading = true;
			localStorage.setItem("live2dhidden", "0");
			landlord.fadeOut( 200, "swing", function ( )
			{
				openLive2D.fadeIn( 200, "swing", function ( )
				{
					live2DMessage.live2DIsFading = false;
				} );
			} );
		}
	};

	live2DMessage.onOpenLive2D = function ( openLive2D, landlord )
	{
		if ( this.live2DIsFading ) {
			return false;
		} else {
			this.live2DIsFading = true;
			localStorage.setItem("live2dhidden", "1");
			openLive2D.fadeOut( 200, "swing", function ( )
			{
				landlord.fadeIn( 200, "swing", function ( )
				{
					live2DMessage.live2DIsFading = false;
				} );
			} );
		}
	};

	live2DMessage.onYouduButtonClicked = function ( youduButton ) {
		if ( youduButton.hasClass('doudong')) {
			var typeIs = youduButton.attr('data-type');
			$('body').removeClass(typeIs);
			youduButton.removeClass('doudong');
			youduButton.attr('data-type', '');
		} else {
			var duType = $('#duType').val();
			var duArr = duType.split(",");
			var dataType = duArr[Math.floor(Math.random() * duArr.length)];

			youduButton.addClass('doudong');
			youduButton.attr('data-type', dataType);
			$('body').addClass(dataType);
		}
	};

	live2DMessage.onShowInfoButtonClicked = function ( showInfoButton, showTalkButton )
	{
		var live_statu = $('#live_statu_val').val();
		if (live_statu == "0") {
			return;
		} else {
			$('#live_statu_val').val("0");
			$('.live_talk_input_body').fadeOut(500);
			this.aiTalkFlag = false;
			this.showHitokoto();
			showTalkButton.show();
			showInfoButton.hide();
		}
	};

	live2DMessage.onShowTalkButtonClicked = function ( showInfoButton, showTalkButton )
	{
		var live_statu = $('#live_statu_val').val();
		if (live_statu == "1") {
			return;
		} else {
			$('#live_statu_val').val("1");
			$('.live_talk_input_body').fadeIn(500);
			this.aiTalkFlag = true;
			showTalkButton.hide();
			showInfoButton.show();
		}
	};

	live2DMessage.onTalkSendButtonClicked = function ( )
	{
		var info_ = $('#AIuserText').val();
		var userid_ = $('#AIuserName').val();
		if (info_ == "") {
			live2DMessage.showMessage('写点什么吧！', 0);
			return;
		}
		if (userid_ == "") {
			live2DMessage.showMessage('聊之前请告诉我你的名字吧！', 0);
			return;
		}
		live2DMessage.showMessage('思考中~', 0);
		$.ajax({
			type: 'POST',
			url: "/turing123",
			contentType: 'application/json',
			data: JSON.stringify( {
				"info": info_,
				"userid": userid_,
				"key": live2DMessage.turingKey
			} ),
			success: function (res) {
				if (res.code !== 100000) {
					live2DMessage.talkValTimer( );
					live2DMessage.showMessage('似乎有什么错误，请和站长联系！', 0);
				} else {
					live2DMessage.talkValTimer( );
					live2DMessage.showMessage(res.text, 0);
				}
				console.log(res);
				$('#AIuserText').val("");
				sessionStorage.setItem("live2duser", userid_);
			}
		});
	};

	live2DMessage.onMusicButtonClicked = function ( live2DBGM, musicButton )
	{
		if ( musicButton.hasClass('play')) {
			live2DBGM[0].pause();
			musicButton.removeClass('play');
			sessionStorage.setItem("live2dBGM_IsPlay", '1');
		} else {
			live2DBGM[0].play();
			musicButton.addClass('play');
			sessionStorage.setItem("live2dBGM_IsPlay", '0');
		}
	};

	live2DMessage.onBGMTimeUpdate = function ( live2DBGM )
	{
		var live2dBgmPlayTimeNow = live2DBGM[0].currentTime;
		sessionStorage.setItem("live2dBGM_PlayTime", live2dBgmPlayTimeNow);
	};

	live2DMessage.onBGMEnded = function ( live2DBGM )
	{
		var listNow = parseInt(live2DBGM.attr('data-bgm'));
		listNow++;
		if (listNow > $('input[name=live2dBGM]').length - 1) {
			listNow = 0;
		}
		var listNewSrc = $('input[name=live2dBGM]').eq(listNow).val();
		sessionStorage.setItem("live2dBGM_Num", listNow);
		live2DBGM.attr('src', listNewSrc);
		live2DBGM[0].play();
		live2DBGM.attr('data-bgm', listNow);
	};

	live2DMessage.onBGMError = function ( live2DBGM, musicButton )
	{
		live2DBGM[0].pause( );
		musicButton.removeClass('play');
		this.showMessage('音乐似乎加载不出来了呢！', 0 );
	};


	live2DMessage.getEvent = function( )
	{
		return window.event || arguments.callee.caller.arguments[0];
	};

	live2DMessage.onLandlordMouseMove = function ( landlord )
	{
		if ( this.landlordIsMoving )
		{
			var ent = this.getEvent( );
			var x = this.landlordMoveLeft + ent.clientX - this.landlordMoveX;
			var y = this.landlordMoveBottom + (this.landlordMoveY - ent.clientY);
			landlord.style.left = x + "px";
			landlord.style.bottom = y + "px";
		}
	};

	live2DMessage.onLandlordMouseUp = function ( landlord, oldMouseMoveEvent, oldMouseUpEvent )
	{
		if ( this.landlordIsMoving ) {
			var historywidth = landlord.style.left;
			var historyheight = landlord.style.bottom;
			historywidth = historywidth.replace('px', '');
			historyheight = historyheight.replace('px', '');
			sessionStorage.setItem("historywidth", historywidth);
			sessionStorage.setItem("historyheight", historyheight);
			document.onmousemove = oldMouseMoveEvent;
			document.onmouseup = oldMouseUpEvent;
			this.landlordIsMoving = false;
			this.landlordMoveX = 0;
			this.landlordMoveY = 0;
			this.landlordMoveBottom = 0;
			this.landlordMoveLeft = 0;
		}
	};

	live2DMessage.onLandlordMouseDown = function ( landlord )
	{
		var ent = this.getEvent( );
		this.landlordIsMoving = true;
		this.landlordMoveX = ent.clientX;
		this.landlordMoveY = ent.clientY;
		this.landlordMoveBottom = parseInt( landlord.style.bottom);
		this.landlordMoveLeft = parseInt( landlord.style.left);
		if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
			window.getSelection().removeAllRanges();
		}
		$( document ).mousemove( this.onLandlordMouseMove.bind( this, landlord ) );
		$( document ).mouseup( this.onLandlordMouseUp
			.bind( this, landlord, document.onmousemove, document.onmouseup ) );
	}

	live2DMessage.onWindowBeforeUnload = function ( musicButton )
	{
		sessionStorage.setItem("live2dBGM_WindowClose", '0');
		if ( musicButton.hasClass('play')) {
			sessionStorage.setItem("live2dBGM_IsPlay", '0');
		}
	};

	live2DMessage.initLive2D = function ( ) {
		var openLive2D = $( "#open_live2d" );
		var landlord = $( "#landlord" );
		$('#hideButton').click( this.onHideButtonClicked.bind( this, openLive2D, landlord ) );
		openLive2D.click( this.onOpenLive2D.bind( this, openLive2D, landlord ) );
		var youduButton = $('#youduButton');
		var showInfoButton = $( "#showInfoBtn" );
		var showTalkButton = $( "#showTalkBtn" );
		youduButton.click( this.onYouduButtonClicked.bind( this, youduButton ) );
		if ( this.turingKey !== "") {
			showInfoButton.click( this.onShowInfoButtonClicked.bind( this, showInfoButton, showTalkButton ) );
			showTalkButton.click( this.onShowTalkButtonClicked.bind( this, showInfoButton, showTalkButton ) );
			$('#talk_send').click( this.onTalkSendButtonClicked.bind( this ) );
		} else {
			showInfoButton.hide( );
			showTalkButton.hide( );
		}
		//获取音乐信息初始化
		var musicButton = $('#musicButton');
		var bgmListInfo = $('input[name=live2dBGM]');
		if (bgmListInfo.length == 0) {
			musicButton.hide();
		} else {
			var live2DBGM = $( "#live2d_bgm" );
			var bgmPlayNow = parseInt(live2DBGM.attr('data-bgm'));
			var bgmPlayTime = 0;
			var live2dBGM_Num = sessionStorage.getItem("live2dBGM_Num");
			var live2dBGM_PlayTime = sessionStorage.getItem("live2dBGM_PlayTime");
			if (live2dBGM_Num) {
				if (live2dBGM_Num <= $('input[name=live2dBGM]').length - 1) {
					bgmPlayNow = parseInt(live2dBGM_Num);
				}
			}
			if (live2dBGM_PlayTime) {
				bgmPlayTime = parseInt(live2dBGM_PlayTime);
			}
			var live2dBGMSrc = bgmListInfo.eq(bgmPlayNow).val();
			live2DBGM.attr('data-bgm', bgmPlayNow);
			live2DBGM.attr('src', live2dBGMSrc);
			live2DBGM[0].currentTime = bgmPlayTime;
			live2DBGM[0].volume = 0.5;
			var live2dBGM_IsPlay = sessionStorage.getItem("live2dBGM_IsPlay");
			var live2dBGM_WindowClose = sessionStorage.getItem("live2dBGM_WindowClose");
			if (live2dBGM_IsPlay == '0' && live2dBGM_WindowClose == '0') {
				live2DBGM[0].play();
				musicButton.addClass('play');
			}
			sessionStorage.setItem("live2dBGM_WindowClose", '1');
			musicButton.click( this.onMusicButtonClicked.bind( this, live2DBGM, musicButton ) );
			$( window ).on( "beforeunload", this.onWindowBeforeUnload.bind( this, musicButton ) );
			live2DBGM.on( "timeupdate", this.onBGMTimeUpdate.bind( this, live2DBGM ) );
			live2DBGM.on( "ended", this.onBGMEnded.bind( this, live2DBGM ) );
			live2DBGM.on( "error", this.onBGMError.bind( this, live2DBGM, musicButton ) );
		}
		//获取用户名
		var live2dUser = sessionStorage.getItem("live2duser");
		if (live2dUser !== null) {
			$('#AIuserName').val(live2dUser);
		}
		//获取位置
		var landL = sessionStorage.getItem("historywidth");
		var landB = sessionStorage.getItem("historyheight");
		if (landL == null || landB == null) {
			landL = '5px'
			landB = '0px'
		}
		landlord.css('left', landL + 'px');
		landlord.css('bottom', landB + 'px');

		//移动
		landlord.mousedown( this.onLandlordMouseDown.bind( this, landlord[0] ) );
	}

	return live2DMessage;
} );
