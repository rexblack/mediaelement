(function($) {
	
	$.extend(mejs.MepDefaults, {
		forcePluginFullScreen: false
	});
	
	$.extend(MediaElementPlayer.prototype, {
		
		isFullScreen: false,
		
		docStyleOverflow: null,
		
		buildfullscreen: function(player, controls, layers, media) {

			if (!player.isVideo)
				return;
				
			// native events
			if (mejs.MediaFeatures.hasNativeFullScreen) {
				player.container.bind('webkitfullscreenchange', function(e) {
				
					if (document.webkitIsFullScreen) {
						// reset the controls once we are fully in full screen
						player.setControlsSize();
					} else {				
						// when a user presses ESC
						// make sure to put the player back into place								
						player.exitFullScreen();				
					}
				});
			}

			var 			
				normalHeight = 0,
				normalWidth = 0,
				container = player.container,						
				fullscreenBtn = 
					$('<div class="mejs-button mejs-fullscreen-button"><button type="button"></button></div>')
					.appendTo(controls)
					.click(function() {
						var isFullScreen = (mejs.MediaFeatures.hasNativeFullScreen) ?
										document.webkitIsFullScreen :
										player.isFullScreen;													
						
						if (isFullScreen) {
							player.exitFullScreen();
						} else {						
							player.enterFullScreen();
						}
					});
			
			player.fullscreenBtn = fullscreenBtn;

			
			$(window).bind('resize',function (e) {
				player.setControlsSize();
			});		

			$(document).bind('keydown',function (e) {
				if (player.isFullScreen && e.keyCode == 27) {
					player.exitFullScreen();
				}
			});
				
		},
		enterFullScreen: function() {
			
			var t = this;
			
			// firefox can't adjust plugin sizes without resetting :(
			if (t.media.pluginType !== 'native' && (mejs.MediaFeatures.isFirefox || t.options.forcePluginFullScreen)) {
				t.media.setFullscreen(true);
				//player.isFullScreen = true;
				return;
			}		
			
			// attempt to set fullscreen
			if (mejs.MediaFeatures.hasNativeFullScreen) {
				t.container[0].webkitRequestFullScreen();									
			}
								
			// store overflow 
			docStyleOverflow = document.documentElement.style.overflow;
			// set it to not show scroll bars so 100% will work
			document.documentElement.style.overflow = 'hidden';				
		
			// store
			normalHeight = t.container.height();
			normalWidth = t.container.width();

			// make full size
			t.container
				.addClass('mejs-container-fullscreen')
				.width('100%')
				.height('100%')
				.css('z-index', 1000);
				//.css({position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, overflow: 'hidden', width: '100%', height: '100%', 'z-index': 1000});				
				
			if (t.pluginType === 'native') {
				t.$media
					.width('100%')
					.height('100%');
			} else {
				t.container.find('object embed')
					.width('100%')
					.height('100%');
				t.media.setVideoSize($(window).width(),$(window).height());
			}
			
			t.layers.children('div')
				.width('100%')
				.height('100%');

			t.fullscreenBtn
				.removeClass('mejs-fullscreen')
				.addClass('mejs-unfullscreen');

			t.setControlsSize();
			t.isFullScreen = true;
		},
		
		exitFullScreen: function() {
			
			var t = this;		
		
			// firefox can't adjust plugins
			if (t.media.pluginType !== 'native' && mejs.MediaFeatures.isFirefox) {				
				t.media.setFullscreen(false);
				//player.isFullScreen = false;
				return;
			}		
		
			// come outo of native fullscreen
			if (mejs.MediaFeatures.hasNativeFullScreen && document.webkitIsFullScreen) {							
				document.webkitCancelFullScreen();									
			}	

			// restore scroll bars to document
			document.documentElement.style.overflow = docStyleOverflow;					
				
			t.container
				.removeClass('mejs-container-fullscreen')
				.width(normalWidth)
				.height(normalHeight)
				.css('z-index', 1);
				//.css({position: '', left: '', top: '', right: '', bottom: '', overflow: 'inherit', width: normalWidth + 'px', height: normalHeight + 'px', 'z-index': 1});
			
			if (t.pluginType === 'native') {
				t.$media
					.width(normalWidth)
					.height(normalHeight);
			} else {
				t.container.find('object embed')
					.width(normalWidth)
					.height(normalHeight);
					
				t.media.setVideoSize(normalWidth, normalHeight);
			}				

			t.layers.children('div')
				.width(normalWidth)
				.height(normalHeight);

			t.fullscreenBtn
				.removeClass('mejs-unfullscreen')
				.addClass('mejs-fullscreen');

			t.setControlsSize();
			t.isFullScreen = false;
		}	
	});

})(mejs.$);