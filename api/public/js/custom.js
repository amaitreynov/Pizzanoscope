;(function($) {
	"use strict";
	var HAINTHEME = HAINTHEME || {};
	var previousScroll = 0;

	//== Check if element exist
	//
	$.fn.exists = function(callback) {
		var args = [].slice.call(arguments, 1);
		if (this.length) {
			callback.call(this, args);
		}
		return this;
	};

	//===== Header area
	//
	HAINTHEME.navbar = function() {
		//** Mega menu
		//
		var megaMenuEffect = function() {
			$('#ht-main-nav li.mega-menu').each(function() {
				$(this).on({
					mouseenter: function(e) {
						$(this).addClass('active');
						$(this).find('ul').first()
							.css({display:"block"})
							.stop()
							.animate(
							{
								opacity: 1
							},
							{
								duration: 300
							}
						);
					},
					mouseleave: function(e) {
						$(this).removeClass('active');
						$(this).find('ul').first()
							.stop()
							.animate(
							{
								opacity: 0
							},
							{
								duration: 300,
								complete : function() {
									$(this).css({display:"none"});
								}
							}
						);
					}
				});
			});
		};
		//** Dropdown menu
		//
		var dropdownMenuEffect = function() {
			$('#ht-main-nav li.dropdown-menu').each(function() {
				$(this).on({
					mouseenter: function(e) {
						$(this).addClass('active');
						$(this).find('ul').first()
							.css({display:"block"})
							.stop()
							.animate(
							{
								opacity: 1
							},
							{
								duration: 300
							}
						);
					},
					mouseleave: function(e) {
						$(this).removeClass('active');
						$(this).find('ul').first()
							.stop()
							.animate(
							{
								opacity: 0
							},
							{
								duration: 300,
								complete : function() {
									$(this).css({display:"none"});
								}
							}
						);
					}
				});
				$(this).find('ul').first().find('li').on({
					mouseenter: function(e) {
						$(this).addClass('active');
						$(this).find('ul').first()
							.css({display:"block"})
							.stop()
							.animate(
							{
								opacity: 1
							},
							{
								duration: 300
							}
						);
					},
					mouseleave: function(e) {
						$(this).removeClass('active');
						$(this).find('ul').first()
							.stop()
							.animate(
							{
								opacity: 0
							},
							{
								duration: 300,
								complete : function() {
									$(this).css({display:"none"});
								}
							}
						);
					}
				})
			});
		};
		//** Mobile nav
		//
		var mobileNav = function() {
			$('.mobile-control-toggle button.mobile-nav-toggle').on('click', function(e){
				if (!$('.mobile-nav').hasClass('is-open')) {
					$('.mobile-nav').addClass('is-open');
					$('body').addClass('mobile-menu-is-open');
					$(this).addClass('is-open');
				} else {
					$('.mobile-nav').removeClass('is-open');
					$('body').removeClass('mobile-menu-is-open');
					$(this).removeClass('is-open');
				}
				e.stopPropagation();
			});
		};
		//** Mobile submenu
		//
		var mobileSubNav = function() {
			$('.mobile-nav').find('.sub-menu-toggle').on('click', function(e){
				var subMenu = $(this).parent().find('ul').first();
				var thisLi = $(this).parent();
				if ( subMenu.css('display') != 'block' ) {
					subMenu.css('display','block');
					thisLi.addClass('is-open');
				} else {
					subMenu.css('display','none');
					thisLi.removeClass('is-open');
				}
				e.stopPropagation();
			});
		}
		//** Touch anywhere to close
		//
		var anywhereClose = function() {
			$(document).on('click', function() {
				// Close search form desktop
				var inputText = $('.main-nav-control-toggles').find('input');
				if (inputText.hasClass('is-visible')) {
					inputText.removeClass('is-visible');
					inputText.animate(
						{
							width: 0,
							opacity: 0
						},
						{
							duration: 300
						}
					);
					$('.ct-search').find('button').removeClass('is-active');
				}
				// Close mobile nav
				var mobileMenu = $('.mobile-nav');
				if (mobileMenu.hasClass('is-open')) {
					$('body').removeClass('mobile-menu-is-open');
					$('.mobile-nav').removeClass('is-open');
					$('.mobile-control-toggle button.mobile-nav-toggle').removeClass('is-open');
				}
			});
		};
		//** Stop propagation for anywhere close
		//
		var clearPropagation = function() {
			var mobileNav = $('.mobile-nav');
			var searchForm = $('.ct-search input');
			$(mobileNav, searchForm).on('click', function(e){
				e.stopPropagation();
			});
		};
		//** Invoking
		//
		megaMenuEffect();
		dropdownMenuEffect();
		mobileNav();
		mobileSubNav();
		anywhereClose();
		clearPropagation();
	};

	HAINTHEME.lightbox = function() {
		// Lightbox Gallery
		$('.ht-lightbox-gallery').exists(function(){
			var idCounter = 1;
			var child = $(this).data('child');
			$('.ht-lightbox-gallery').each(function(){
				var galleryId = 'ht-lightbox-gallery-' + idCounter;
				idCounter++;
				$(this).find(child).each(function() {
					$(this)
						.addClass('ht-lightbox')
						.attr('data-lightbox-gallery', galleryId)
					;
				})
			});
		});
	};

	HAINTHEME.navScrollTop = function() {
		
	};

	HAINTHEME.parallaxGen = function() {
		$('[data-ht-parallax]').each(function() {
			var dataMove = $(this).attr("data-ht-parallax");
			var dataAttrFrom, dataFrom, dataAttrTo, dataTo;
			if($(this).is('#ht-top-area')) {
				var height = $(this).outerHeight();
				dataAttrFrom = 'data-0';
				dataFrom = 'background-position:0px 0px';
				dataAttrTo = 'data-' + height;
				dataTo = 'background-position: 0px ' + dataMove + 'px';
			} else {
				dataAttrFrom = 'data-bottom-top';
				dataFrom = 'background-position: 0px -' + dataMove + 'px';
				dataAttrTo = 'data-top-bottom';
				dataTo = 'background-position:0px 0px';
			}
			$(this).attr(dataAttrFrom,dataFrom).attr(dataAttrTo,dataTo);
		});
	};
	
	HAINTHEME.others = function() {
		$('.ht-accordion').each(function() {
			var $this = $(this);
			$(this).find('.panel-heading').on('click', function() {
				$this.find('.panel-heading').removeClass('current');
				$(this).addClass('current');
			})
		});

		$('.entry-ingredient').find('tr').on('click', function() {
			$(this).toggleClass('is-done');
		});

		$('.action-share').each(function() {
			$(this).on({
				mouseenter: function(e) {
					if( $(window).width() >= 768 ) {
						$( this ).find( ".entry-social" )
							.css({ display:"block" })
							.stop()
							.animate(
								{
									opacity: 1,
									top: '-60'
								},
								{
									duration: 300
								}
						);
					}
				},
				mouseleave: function(e) {
					if( $( window ).width() >= 768 ) {
						$( this ).find( ".entry-social" )
						.stop()
						.animate(
							{
								opacity: 0,
								top: '-40'
							},
							{
								duration: 300,
								complete : function() {
									$( this ).css({ display:"none" });
								}
							}
						);
					}
				}
			});
		});
	};

	$(document).ready( function() {
		$('html').removeClass('no-js');
		
		HAINTHEME.navbar();
		HAINTHEME.lightbox();
		HAINTHEME.parallaxGen();
		HAINTHEME.others();

	});

	$(window)
		.on( 'scroll', function() {
			if ($('.ht-main-navbar').hasClass('scroll-up-nav')) {
				var currentScroll = $(this).scrollTop();
				// Down
				if (currentScroll > previousScroll) {
					$('.ht-main-navbar').addClass('is-scroll-up');
				}
				// Up
				else {
					$('.ht-main-navbar').removeClass('is-scroll-up');
				}
				previousScroll = currentScroll;
			};
		});

})(jQuery); // EOF