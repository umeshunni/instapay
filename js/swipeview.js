/*!
 * SwipeView v0.3 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
var SwipeView = (function(){
	var hasTouch = 'ontouchstart' in window,
		resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize',
		startEvent = hasTouch ? 'touchstart' : 'mousedown',
		moveEvent = hasTouch ? 'touchmove' : 'mousemove',
		endEvent = hasTouch ? 'touchend' : 'mouseup',
		cancelEvent = hasTouch ? 'touchcancel' : 'mouseup',
		
//		isImage = function (value) { return /.(jpg|jpeg|png|gif|svg|pdf)(\?.*)?$/.test(value); },

		SwipeView = function (el, options) {
			var i, l, j,
				element,
				page,
				count = 0;

			this.wrapper = document.querySelector(el);
			this.options = {
				pages: [],
				snapThreshold: null
			}
		
			// User defined options
			for (i in options) this.options[i] = options[i];
			
			this.wrapper.style.overflow = 'hidden';
			this.wrapper.style.position = 'relative';
			
			this.masterPages = [];
			
			div = document.createElement('div');
			div.style.cssText = 'position:relative;top:0;height:100%;width:100%;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);-webkit-transition-timining-function:ease-out';
			this.wrapper.appendChild(div);
			this.slider = div;

			this.refreshSize();

			for (i=0, l=this.options.pages.length; i<l; i++) {
				for (j in this.options.pages[i]) {
					this.options.pages[i][j].className = this.options.pages[i][j].className ? this.options.pages[i][j].className + ' swipeviewElement' + count : 'swipeviewElement' + count;
					count++;
				}
				count = 0;
			}

			for (i=0; i<3; i++) {
				div = document.createElement('div');
				div.style.cssText = '-webkit-transform:translateZ(0);position:absolute;top:0;height:100%;width:100%;left:' + (i-1)*100 + '%';
				if (!div.dataset) div.dataset = {};
				div.dataset.pageIndex = i;
				div.dataset.upcomingPageIndex = div.dataset.pageIndex;

				page = i==0 ? this.options.pages.length-1 : i-1;
				for (l in this.options.pages[page]) {
					element = document.createElement(l);
					for (j in this.options.pages[page][l]) {
						element[j] = this.options.pages[page][l][j];
					}

					div.appendChild(element);
				}

				this.slider.appendChild(div);
				this.masterPages.push(div);
			}

			window.addEventListener(resizeEvent, this, false);
			this.wrapper.addEventListener(startEvent, this, false);
			this.wrapper.addEventListener(moveEvent, this, false);
			this.wrapper.addEventListener(endEvent, this, false);
			this.slider.addEventListener('webkitTransitionEnd', this, false);

/*			if (!hasTouch) {
				this.wrapper.addEventListener('mouseout', this, false);
			}*/
		};
	
	SwipeView.prototype = {
		currentMasterPage: 1,
		x: 0,
		page: 0,
		image: 0,

		destroy: function () {
			// Remove the event listeners
			window.removeEventListener(resizeEvent, this, false);
			this.wrapper.removeEventListener(startEvent, this, false);
			this.wrapper.removeEventListener(moveEvent, this, false);
			this.wrapper.removeEventListener(endEvent, this, false);
			this.slider.removeEventListener('webkitTransitionEnd', this, false);

/*			if (!hasTouch) {
				this.wrapper.removeEventListener('mouseout', this, false);
			}*/
		},

		handleEvent: function (e) {
			switch (e.type) {
				case startEvent:
					this.__start(e);
					break;
				case moveEvent:
					this.__move(e);
					break;
				case cancelEvent:
				case endEvent:
					this.__end(e);
					break;
				case resizeEvent:
				 	this.__resize();
					break;
				case 'webkitTransitionEnd':
					if (e.target == this.slider) this.__flip();
					break;
			}
		},
		
		refreshSize: function () {
			this.wrapperWidth = this.wrapper.clientWidth;
			this.wrapperHeight = this.wrapper.clientHeight;
			this.pageWidth = this.wrapperWidth;
			this.maxX = -2 * this.pageWidth + this.wrapperWidth;
			this.snapThreshold = this.options.snapThreshold === null
				? Math.round(this.pageWidth * .15)
				: /%/.test(this.options.snapThreshold)
					? Math.round(this.pageWidth * this.options.snapThreshold.replace('%', '') / 100)
					: this.options.snapThreshold;
		},
		
		__pos: function (x) {
			this.x = x;
			this.slider.style.webkitTransform = 'translate3d(' + x + 'px,0,0)';
		},

		__resize: function () {
			this.refreshSize();
			this.slider.style.webkitTransitionDuration = '0';
			this.__pos(-this.page * this.pageWidth);
		},

		__start: function (e) {
			e.preventDefault();

			if (this.initiated) return;
			
			var point = hasTouch ? e.touches[0] : e;
			
			this.initiated = true;
			this.moved = false;
			this.startX = point.pageX;
			this.startY = point.pageY;
			this.pointX = point.pageX;
			this.directionX = 0;
			
/*			var matrix = getComputedStyle(this.slider, null).webkitTransform.replace(/[^0-9-.,]/g, '').split(',');
			this.x = matrix[4] * 1;*/

			this.slider.style.webkitTransitionDuration = '0';
			
			this.__event('start');
		},
		
		__move: function (e) {
			if (!this.initiated) return;

			var point = hasTouch ? e.touches[0] : e,
				deltaX = point.pageX - this.pointX,
				newX = this.x + deltaX;

			this.moved = true;
			this.pointX = point.pageX;
			this.directionX = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;

/*			if (newX > 0 || newX < this.maxX) {
				newX = this.x + (deltaX / 2);
			}*/

			this.__pos(newX);
		},
		
		__end: function (e) {
			if (!this.initiated) return;
			
			var point = hasTouch ? e.changedTouches[0] : e,
				pageFlip,
				pageFlipIndex,
				newX;

			this.initiated = false;
			
			if (!this.moved) return;

			// Check if we exceeded the snap threshold
			if (Math.abs(point.pageX - this.startX) < this.snapThreshold) {
				this.slider.style.webkitTransitionDuration = '300ms';
				this.__pos(-this.page * this.pageWidth);
				return;
			}
			
			// Flip the page
			if (this.directionX > 0) {
				this.page = -Math.ceil(this.x / this.pageWidth);
				this.currentMasterPage = (this.page + 1) - Math.floor((this.page + 1) / 3) * 3;

				pageFlip = this.currentMasterPage - 1;
				pageFlip = pageFlip < 0 ? 2 : pageFlip;
				this.masterPages[pageFlip].style.left = this.page * 100 - 100 + '%';

				pageFlipIndex = this.page - 1;
			} else {
				this.page = -Math.floor(this.x / this.pageWidth);
				this.currentMasterPage = (this.page + 1) - Math.floor((this.page + 1) / 3) * 3;

				pageFlip = this.currentMasterPage + 1;
				pageFlip = pageFlip > 2 ? 0 : pageFlip;
				this.masterPages[pageFlip].style.left = this.page * 100 + 100 + '%';

				pageFlipIndex = this.page + 1;
			}

			this.masterPages[pageFlip].className = 'swipeview-loading';
			pageFlipIndex = pageFlipIndex - Math.floor(pageFlipIndex / this.options.pages.length) * this.options.pages.length;
			this.masterPages[pageFlip].dataset.upcomingPageIndex = pageFlipIndex;		// Index to be loaded when the user stops swiping

			this.slider.style.webkitTransitionDuration = '500ms';
			
			newX = -this.page * this.pageWidth;

			if (this.x == newX) this.__flip();		// If we swiped all the way long to the next page (extremely rare but still)
			else this.__pos(newX);
		},
		
		__flip: function () {
			var el,
				newIndex,
				i, l,
				j, k,
				count;

			for (i=0, l=this.masterPages.length; i<l; i++) {
				this.masterPages[i].className = '';
				newIndex = this.masterPages[i].dataset.upcomingPageIndex;

				if (newIndex != this.masterPages[i].dataset.pageIndex) {
					this.masterPages[i].dataset.pageIndex = newIndex;
					count = 0;

					for (j in this.options.pages[newIndex]) {			// Parse all page elements
						el = this.masterPages[i].querySelector('.swipeviewElement' + count);

						for (k in this.options.pages[newIndex][j]) {	// Parse all element attributes
							el[k] = this.options.pages[newIndex][j][k];
						}
						count++
					}
				}
			}
		},
		
		__event: function (type) {
			var //i,
				ev = document.createEvent("Event");
			
			ev.initEvent('swipeview-' + type, true, true);

//			for (i in parms) ev[i] = parms[i];

			this.wrapper.dispatchEvent(ev);
		}
	};

	return SwipeView;
})();