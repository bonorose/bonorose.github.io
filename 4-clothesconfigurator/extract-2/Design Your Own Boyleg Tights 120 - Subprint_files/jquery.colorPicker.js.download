var colorPicker = {
	colors: [["000000", "Black c100"], ["000723", "Dark Navy c239"], ["0d271d", "Dark Bottle c179"], ["ffaf0f", "Gold c004"], ["990000", "Dark Red c113"], ["333333", "Dark Grey"], ["131d34", "Navy c198"], ["003926", "Bottle c067"], ["ffd20a", "Gold c147"], ["cc0000", "Red c021"], ["4d4d4d", "Grey 1"], ["152e51", "Dark blue c038"], ["00653d", "Green c237"], ["fff500", "Yellow c002"], ["ff0000", "Fire c011"], ["666666", "Grey 2"], ["003cae", "Royal blue 286q"], ["00924d", "Green c060"], ["f1f500", "Fluor Yellow 3965q"], ["e73500", "Burnt Orange c217"], ["cccccc", "Silver c124"], ["1757b9", "Royal c207"], ["74bd2a", "Apple c215"], ["d9c9f2", "Light Purple c193"], ["ff6611", "Orange Fanta c007"], ["ffffff", "White c140"], ["0073d0", "Blue c243"], ["a3db4c", "Fluor Green c078"], ["8b387d", "Purple c046"], ["f75d59", "Indian Red 702q"], ["fff1c1", "fff1c1"], ["0097df", "Mid blue c128"], ["81d8d0", "Tiffany"], ["6c337a", "Purple c048"], ["ff82c0", "Light Pink c181"], ["D3AB72", "Ginger kf10"], ["99ccff", "Light Blue c098"], ["45b5aa", "Turquoise 3268q"], ["6638b6", "Purple c050"], ["ed3996", "Light Pink c026"], ["c39d87", "Light Brown c250"], ["b2d9ff", "Light Blue c095"], ["08a6c1", "Azure c165"], ["603686", "Purple 2592q"], ["dd196d", "Pink c025"], ["c49935", "Dark Gold c247"], ["99d3ff", "Baby Blue c096"], ["009daf", "Teal c137"], ["44286a", "Purple c192"], ["dc1e5d", "Pink c024"], ["c15e1b", "Ochre c232"], ["666633", "Olive cn27"], ["00778d", "Align 3272q"], ["372255", "Dark Purple c170"], ["991339", "991339"], ["432a2a", "Brown c019"], ["5f2500", "Brown c112"], ["003f5c", "003f5c"], ["5f072b", "Light Maroon c175"], ["4e152e", "Maroon c082"], ["transparent", "Transparent"]],
	palette : $('<div class="colorPicker_pallette"></div>'),
	status: 0,

	toHex : function (color) {
		if (color.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i)) {
			return (color.charAt(0) === "#") ? color : ("#" + color);
		} else if (color.match(/^(rgb|rgba)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*([,\d\s]*)\)$/)) {
			var c = ([parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10), parseInt(RegExp.$4, 10)]),
				pad = function (str) {
					if (str.length < 2) {
						for (var i = 0, len = 2 - str.length; i < len; i++) {
							str = '0' + str;
						}
					}
					return str;
				};

			if (c.length === 3) {
				var r = pad(c[0].toString(16)),
					g = pad(c[1].toString(16)),
					b = pad(c[2].toString(16));
				return '#' + r + g + b;
			}
		}
		return color;
	},

	contrastColor: function(hex) {
		hex = String(hex);
		if(hex == 'transparent') return '#c00';

		if (hex.indexOf('#') === 0) {
			hex = hex.slice(1);
		}
		// convert 3-digit hex to 6-digits.
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		if (hex.length !== 6) {
			throw new Error('Invalid HEX color '+hex);
		}

		var yiq = (parseInt(hex.slice(0, 2), 16) * 0.299) + 
			(parseInt(hex.slice(2, 4), 16) * 0.587) + 
			(parseInt(hex.slice(4, 6), 16) * 0.114);

		return yiq > 153? '#000000' : '#ffffff';
	},

	closeColor: function(color){
		if(color == 'transparent') return 'transparent';
		color = color.replace(/^#/, '');
		for(var i in colorPicker.palette.data('colors')){
			hex = colorPicker.palette.data('colors')[i][0];
			if(Math.abs(parseInt(hex, 16) - parseInt(color, 16)) < 10){
				return hex;
			}
		}
		return color;
	},

	preview : function (color, t) {
		var cn = null;
		var cc = colorPicker.closeColor(color);
		for(var i in colorPicker.palette.data('colors')){
			if(colorPicker.palette.data('colors')[i][0] == cc){
				cn = colorPicker.palette.data('colors')[i][1];
				break;
			}
		}
		t.css('background-color', color).find('span').css('color', colorPicker.contrastColor(color)).text(cn || '');
	},

	buildSwatch: function(colors){
		colorPicker.palette.data('colors', colors);
		colorPicker.palette.empty();
		for(var i in colors){
			hex = colors[i][0];
			c = colors[i][1];
			switch(hex){
				case '000000':
					cn = 'Black';
				break;
				case '000723':
					cn = 'Navy';
				break;
				default:
					cn = '&nbsp;';
				break;
			}
			swatch = $('<div class="swatch" title="'+c+'">'+cn+'</div>');
			if (hex === 'transparent') {
				swatch.addClass('transparent').text('X').data('color', 'transparent');
			} else {
				swatch.css('background-color', '#'+hex).data('color', '#'+hex);
			}
			colorPicker.palette.append(swatch);
		}
	},

	init: function(){
		colorPicker.palette.on('click', '.swatch', function(e){
			$('input', colorPicker.palette.data('ctlr')).val($(this).data('color')).data('colorName', $(this).attr('title')).trigger('change');
			colorPicker.palette.data('ctlr').trigger('click');
		}).on('mouseover', '.swatch', function(e){
			colorPicker.preview($(this).data('color'), colorPicker.palette.data('ctlr'));
		}).on('mouseout', '.swatch', function(e){
			$('input', colorPicker.palette.data('ctlr')).trigger('pickColor');
		}).hide();

		$('body').on('click', '.colorPicker_control', function(e){
			if($(this).hasClass('active')){
				$(this).removeClass('active').find('input').trigger('onHide');
				return;
			}
			$('.colorPicker_control').removeClass('active');
			$(this).addClass('active').find('input').trigger('onShow');
			colorPicker.palette.data('ctlr', $(this));
			$(this).after(colorPicker.palette.fadeIn());
		}).on('pickColor', '.colorPicker_control input', function(e){
			var me = $(this);
			var color = colorPicker.toHex(me.val() == ''? '#fff' : me.val());
			colorPicker.preview(color, me.parent());
		});
		colorPicker.status = 1;
	}
};

$.fn.colorPicker = function (colors) {
	if(colorPicker.status == 0) colorPicker.init();
	colorPicker.buildSwatch(colors || colorPicker.colors);
	return $(this).each(function(){
		var me = $(this);
		if(me.data('init')) return;
		me.data({'init': false, 'colorName': ''}).wrap('<div class="colorPicker_control" />').parent().append('<span />');
		me.trigger('pickColor').data('init', true);
	});
};
