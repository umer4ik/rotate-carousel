/* TODO:
1. как должен выглядеть конфиг карусели
2. как будет происходить расчет поворота
3. как будет происходить навигация

конфиг:
нам нужен массив объектов с html
[{
  "nav": {
    "el": "div",
    "class": "nav-element",
    "html": "<span class=\"nav-title\">Nav</span>"
  },
  "item": {
    "el": "div",
    "class": "item-element",
    "html": "Hello"
  }
}]

расчет поворота
нужно указывать радиус при создании

*/
(function($) {
  var crEl = document.createElement.bind(document);
  function calcRad(r, fi) {
    var x = r * Math.cos(fi);
    var y = r * Math.sin(fi);
    return {
      x: x,
      y: y
    };
  };
  $.fn.rotateCarousel = function(options) {
    if (this.length > 1) throw new Error('To many elements for rotate carousel');
		var cfg = {};
    cfg.width = options.width || 900;
		cfg.height = options.height || 300;
    cfg.itemWidth = options.itemWidth || 50;
    var r = cfg.r = options.radius || 250;
		cfg.speed = options.speed || 4;
		cfg.autoplay = options.autoplay || false;
    var carousel = this[0];
    carousel.classList.add('rotate-carousel');
		var items = [].slice.call(carousel.children);
    $(items).addClass('rotate-carousel-item');
    var wrapper = crEl('div');
    wrapper.className = 'rotate-carousel-wrapper';
    $(wrapper).append(items);
		carousel.appendChild(wrapper);
    var circles = $(items).find('.nav').get();
		var contents = $(items).find('.content').get();
    $(circles).addClass('rotate-carousel-nav');
		$(contents).addClass('rotate-carousel-content');
		$(carousel).trigger('rotateCarouselInit', [circles[0], contents[0]]);
    $(wrapper)
      .css({
        left: $(carousel).width() / 2 + 'px',
				top: cfg.height + 'px'
      });
		var arrowNext = crEl('button');
		var arrowPrev = crEl('button');
		arrowNext.className = 'rotate-carousel-arrow rotate-carousel-arrow-next';
		arrowPrev.className = 'rotate-carousel-arrow rotate-carousel-arrow-prev';
		arrowNext.innerHTML = 'next';
		arrowPrev.innerHTML = 'prev';
		carousel.appendChild(arrowNext);
		carousel.appendChild(arrowPrev);
		var fi = Math.PI * 2;
    var step = fi/(1440/cfg.speed);
		var count = items.length;
    var st = fi / count;
		for (var i = 0; i < count; i++) {
			var coords = calcRad(r, st*i)
			$(circles[i]).css({
				left: coords.y+'px',
				top: -coords.x+'px'
			});
			circles[i].index = i;
		}
		var current = 0;
		var interval;
		var mooving = false;
		function getHighest(){
			var tops = {};
			var arr = [];
			for (var i = 0; i < count; i++) {
				tops[""+(-parseInt(getComputedStyle(circles[i]).top))]=circles[i];
				arr.push(-parseInt(getComputedStyle(circles[i]).top));
			}
			var top = Math.max.apply(null, arr);
			for (var i = 0; i < circles.length; i++) {
				if (circles[i]===tops[top]) index = i;
			}
			return {el: tops[top], index: index};
		}
		function navTo(index){
			if (index===0) return;
			if (mooving) return;
			if (interval) clearInterval(interval);
			var direction = index < 0 ? 1 : -1;
			needAngle = st*index;
			current = getHighest().index;
			var needCircle = circles[(count+current+index)%count];
			var prevCircle = circles[current];
			var prevContent = contents[current];
			var needContent = contents[(count+current+index)%count];
			$(carousel).trigger('beforeChange', [needCircle, prevCircle, needContent, prevContent]);
			var j = 0;
			var k;
			mooving = true;
			interval = setInterval(function () {
				for (var i = 0; i < count; i++) {
					var coords = calcRad(r, j+st*i);
					$(circles[(current+i)%count]).css({
						left: coords.y+'px',
						top: -coords.x+'px'
					})
				};
				j=+(j+step*direction).toFixed(10);
				if(Math.ceil(parseInt(getComputedStyle(needCircle).top))<=-250) {
					mooving = false;
					current = getHighest().index;
					$(carousel).trigger('afterChange', [needCircle, prevCircle, needContent, prevContent]);
					$(needContent).addClass('active');
					clearInterval(interval);
				}
			}, 1);
		};
		$(carousel).on('rotateNavTo', function(event, index) {
			navTo(index);
		});
		window.navTo = navTo;
		if(cfg.autoplay) {
			setInterval(function(){
				navTo(1);
			}, 2000);
		}
		$(carousel).on('click', function(e){
			var target = e.target;
			if (target === arrowNext) navTo(1);
			if (target === arrowPrev) navTo(-1);
			if (typeof target.index == 'number') {
				var index = target.index;
				var needIndex = 0;
				var dif = index-current;
				// navTo(index-current);

				if ((dif)>0) {
					if(dif<=count/2) {
						needIndex = dif;
					} else {
						needIndex = dif-count;
					}
				} else {
					if (Math.abs(dif)<count/2) {
						needIndex = -Math.abs(dif);
					} else {
						needIndex = Math.abs(Math.abs(dif)-count);
					}
				}
				navTo(needIndex);
			}
		});
		navTo(6)
  }
})(jQuery);
$(document).ready(function() {
	$('.carousel').on('rotateCarouselInit', function(e, c, t){
		$(t).addClass('active');
	});
	$('.carousel').on('afterChange', function(e, nc, pc, nt, pt){
		$(nt).addClass('active');
	});
	$('.carousel').on('beforeChange', function(e, nc, pc, nt, pt){
		$(pt).removeClass('active');
	});
  $('.carousel').rotateCarousel({
    width: 900,
    height: 300,
    radius: 250,
		itemWidth: 50,
		speed: 4,
		// autoplay: false
  });


});
