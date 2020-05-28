/**
 *  Jquery fbStories 1.0
 *  https://github.com/lianglee/jquery.fbStories
 * 
 *  A UI for stories similar to facebook
 *  Licensed under the Open Source Social Network License (4.0) (Cryptographic Autonomy License version 1.0)
 *
 *  https://www.opensource-socialnetwork.org/licence/v4.0.html
 * 
 * Copyright (C) 2014-2020 SYED ARSALAN HUSSAIN SHAH arsalan@buddyexpress.net,
 * Copyright (C) 2014-2020 OPEN SOURCE SOCIAL NETWORK https://www.opensource-socialnetwork.org,
 **/
(function($) {
	var slideIndex = 1;
	var id = 0;
	var totalImages = 0;
	var sid = 0;
	var mouseOnContainer = false;
	var width = 1;

	$.fn.fbStories = function(options) {
		var settings = $.extend({
			barColor: "#F06",
			delay: 1,
			dataurl: './json.php',
			page_limit: 5,
			showAdd: true,
			addText: '&#43;',
			onShow: function(guid, url) {},
		}, options);
		var $element = this;
		if(!settings.dataurl){
				console.log('There is no data URL');
				return false;
		}
		$('body').on('mouseover', '.fbstories-container .slideshow-container', function() {
			mouseOnContainer = true;
		});
		$('body').on('mouseleave', '.fbstories-container .slideshow-container', function() {
			mouseOnContainer = false;
		});
		showProgress = function() {
			$(".fbstories-container .status-bar").hide();
			$(".fbstories-container .status-bar").progressbar({
				value: 0,
			});
			$('.fbstories-container .status-bar .ui-progressbar-value').css({
				background: settings.barColor
			});
			$(".fbstories-container .status-bar").show();

			id = setInterval(progress, (settings.delay / 100) * 1000);

			function progress() {
				if (width >= 100 && slideIndex >= totalImages) {
					clearInterval(id);
					clearInterval(sid);
				}
				if (mouseOnContainer == false) {
					if (width >= 100 && slideIndex >= totalImages) {
						clearInterval(id);
					} else {
						width++;
						$(".status-bar").progressbar({
							value: width,
						});
					}
				}
			}
		};
		//https://ourcodeworld.com/articles/read/278/how-to-split-an-array-into-chunks-of-the-same-size-easily-in-javascript
		function chunkArray(myArray, chunk_size) {
			var index = 0;
			var arrayLength = myArray.length;
			var tempArray = [];

			for (index = 0; index < arrayLength; index += chunk_size) {
				myChunk = myArray.slice(index, index + chunk_size);
				tempArray.push(myChunk);
			}
			return tempArray;
		}

		function initialize() {
			$element.prepend('<div class="fbstories-outside-container"> <div class="fbstories-items"></div> <div class="buttons"> <a class="fbstories-item-previous" href="javascript:void(0);"><</a> <a class="fbstories-item-next" href="javascript:void(0);">></a></div></div>');
			$('body').prepend('<div class="fbstories-container"> <div class="fbstories-container-inner"> </div> </div>');
			
			if(settings.showAdd){
					$('.fbstories-items').prepend('<div class="fbstories-item-add" style="float:left;"> <div class="image0th"> <a class="fbstories-add-story" href="javascript:void(0);">'+settings.addText+'</a></div></div>');	
			}
		}

		function appendThumbs() {
			$.get(settings.dataurl, function(data) {
				//make the thumbnails
				if (data[0].files && data[0].files.length > 0) {
					$thumbs = [];
					$.each(data, function() {
						$file = this['files'][0];
						$border = '';
						if ($file['viewed'] && $file['viewed'] == true) {
							$border = ' story-viewed';
						}
						$thumbs.push({
							'thumb': $file,
							'owner': this['owner'],
							'data': this,
							'border': $border,
						});
					});
					$pagination = Math.ceil($thumbs.length / settings.page_limit);
					$thumbspages = chunkArray($thumbs, settings.page_limit);
					if ($pagination == 1) {
						$('.fbstories-outside-container .buttons').hide();
					} else {
						$('.fbstories-outside-container .buttons').show();
					}
					if ($thumbspages.length > 0) {
						$count = 1;
						$thumbnails = '';
						$.each($thumbspages, function() {
							$item = '<div class="fbstories-paginate-item" id="fbstories-paginate-' + $count + '">';
							if (this.length > 0) {
								$.each(this, function() {
									$item += '<div class="fbstories-item' + this['border'] + '" data-items=\'' + JSON.stringify(this['data']) + '\'> <div class="user-image"> <img src="' + this['owner']['icon'] + '" width="32" height="32" /> </div> <div class="image0th"> <img src="' + this['thumb']['url'] + '" style="max-width:100%"> </div> <div class="user-name">' + this['owner']['fullname'] + '</div> </div>';
								});
							}
							$item += '</div>';
							$thumbnails += $item;
							$count++;
						});
						$('.fbstories-items').append($thumbnails);
						initPagination();

						$('#fbstories-paginate-1').fadeIn();
					}
				}
			});
		}

		function initPagination() {
			$.each($('.fbstories-item'), function($key) {
				$(this).attr('data-index', $key + 1);
			});
			if (!$('.fbstories-item').length < 0) {
				return false;
			}
			if ($('.fbstories-item').length) {
				$total = $('.fbstories-item').length;
				$('.fbstories-items').attr('data-total', $total);
				$('.fbstories-items').attr('data-current', 1);
				$('.fbstories-items').attr('data-pages', Math.ceil($total / settings.page_limit));

				$('#fbstories-paginate-1').fadeIn();
			}
			$('body').on('click', '.fbstories-item-next', function() {
				$pages = parseInt($('.fbstories-items').attr('data-pages'));
				$current = parseInt($('.fbstories-items').attr('data-current'));
				$next = $current + 1;
				if ($next <= $pages) {
					$('#fbstories-paginate-' + $current).hide();
					$('#fbstories-paginate-' + $next).fadeIn('slow');
					$('.fbstories-items').attr('data-current', $next);
				}
			});
			$('body').on('click', '.fbstories-item-previous', function() {
				$pages = parseInt($('.fbstories-items').attr('data-pages'));
				$current = parseInt($('.fbstories-items').attr('data-current'));
				$previous = $current - 1;
				if ($previous <= $pages && $previous > 0) {
					$('#fbstories-paginate-' + $current).hide();
					$('#fbstories-paginate-' + $previous).fadeIn('slow');
					$('.fbstories-items').attr('data-current', $previous);
				}
			});
		}

		function plusSlides(n) {
			clearInterval(id);
			width = 0;
			showSlides(slideIndex += n);
		}

		// Thumbnail image controls
		function currentSlide(n) {
			showSlides(slideIndex = n);
		}

		function showSlides(n) {
			var i;
			var slides = document.getElementsByClassName("fbstories-slides");
			if (n > slides.length) {
				//in case viewing last slide then keep it on that slide.
				slideIndex = slides.length;
			}
			if (n < 1) {
				slideIndex = 1
			}
			for (i = 0; i < slides.length; i++) {
				slides[i].style.display = "none";
			}
			$('.slideshow-container .total-images .current').text(slideIndex);
			slides[slideIndex - 1].style.display = "block";

			settings.onShow(slides[slideIndex - 1].getAttribute('data-guid'), slides[slideIndex - 1].getAttribute('data-url'));
			//set time
			$time = slides[slideIndex - 1].getAttribute('data-time');
			$('.fbstories-container .user-name-time .time').html($time);
			if (slideIndex <= totalImages) {
				showProgress();
			}
		}
		initialize();
		appendThumbs();

		$('body').on('click', '.slideshow-container .close', function() {
			width = 0;
			slideIndex = 1;
			mouseOnContainer = false;

			clearInterval(id);
			clearInterval(sid);

			$('.fbstories-container').hide();
			$('.fbstories-container-inner').html("");
		});
		$('body').on('click', '.slideshow-container .slide-button', function() {
			clearInterval(sid);
			var $index = parseInt($(this).attr('data-index'));
			plusSlides($index);
			sid = setInterval(function() {
				if (mouseOnContainer == false && width >= 100) {
					plusSlides(1);
					if (slideIndex == totalImages) {
						clearInterval(sid);
					}
				}
			}, 100);
		});

		$('body').on('click', '.fbstories-item', function() {
			slideIndex = 1;
			width = 0;
			id = 0;
			sid = 0;

			$json = JSON.parse($(this).attr('data-items'));
			if ($json['owner']['fullname']) {
				$container = '<div class="slideshow-container"> <div class="status-bar" style="display:none;"></div> <div class="close">&#10799;</div> <div class="users-information"> <div class="users-information-inner"> <div class="user-image"> <img src="' + $json['owner']['icon'] + '" width="32" height="32" /> </div> <div class="user-name-time"> <span class="name">' + $json['owner']['fullname'] + '</span> <span class="time"></span> </div> <div class="total-images"> <span class="current">1</span> <span>/</span> <span class="total">3</span> </div> </div> </div>';

				totalImages = $json['files'].length;

				$.each($json['files'], function() {
					$container += '<div class="fbstories-slides fadefbstories" data-time="' + this['time'] + '" data-url="' + this['url'] + '" data-guid="' + this['guid'] + '"> <img src="' + this['url'] + '" style="max-width:100%"> <div class="text">' + this['title'] + '</div> </div>';
				});

				$container += '<a class="prev slide-button"  data-index="-1">&#10094;</a> <a class="next slide-button" data-index="1">&#10095;</a> </div>';
				$('.fbstories-container-inner').html($container);
				$('.fbstories-container-inner .total-images .total').html($json['files'].length);

				$('.fbstories-container').show();
				showSlides(slideIndex);
			}
		});
		sid = setInterval(function() {
			if (mouseOnContainer == false && width >= 100) {
				if (slideIndex == totalImages) {
					clearInterval(sid);
				} else {
					plusSlides(1);
				}
			}
		}, 100);
		return this;
	};
}(jQuery));
