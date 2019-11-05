(function($){
	var field = null;
	var map = null;
	var marker = {};
	var lat = null;
	var lng = null;
	var geocoder = 	new google.maps.Geocoder();
	var helpers = {
        /**
         * Disable or enable a form element (mainly buttons)
         * @param {DOMElement} $el The element to disable/enable
         * @param {boolean} disable If set to true, then the $el will become disabled, false (or not passed in) enables it
         */
		toggleFieldState: function ($el, disable) {
			if ($el && $el.length) {
				if (disable) {
					$el.attr('disabled', 'disabled');
				} else {
					$el.removeAttr('disabled');
				}
			}
		}
	};

	function addresslocationField(){
		map =  new google.maps.Map($('div.field-addresslocation div.map')[0], {
			center: new google.maps.LatLng(0,0),
			zoom: 1,
			MapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false
		});

		field = $('div.field-addresslocation');
		lat = field.find('input.latitude');
		lng = field.find('input.longitude');

		if(lat.val() && lng.val()){
			var latlng = new google.maps.LatLng(lat.val(), lng.val());
			map.setCenter(latlng);
			//map.setZoom(16);
			SetMarker(latlng);
			helpers.toggleFieldState(field.find('div.locate input[name="locate"]'), true);
		}
		else{
			helpers.toggleFieldState(field.find('div.locate input[name="clear"]'), true);
		}

		field.find('div.locate input[name="clear"]').click(function(ev){

			ev.preventDefault();

			var fields = field.find('input.street, input.city, input.region, input.postal-code, input.country, input.latitude, input.longitude');

			fields.val('');

			marker.setMap(null);
			map.setCenter(new google.maps.LatLng(0,0));
			map.setZoom(1);

			field.find('div.locate input[name="locate"]').removeAttr('disabled');

		});

		field.find('div.locate input[name="locate"]').click(function(ev){

			//Reassign field to stop mime warning/error
			var field = $('div.field-addresslocation');
			var button = $(this);

			var button_value = button.val();
			button.val('Geocoding...').attr('disabled', 'disabled');
			button.parent('label').find('i').remove();

			ev.preventDefault();

			var street = field.find('input.street').val(),
				city = field.find('input.city').val(),
				region = field.find('input.region').val(),
				postalcode = field.find('input.postal input').val(),
				country = field.find('input.country').val();

			var address = '';
			if(street) address += street;
			if(city) address += ', ' + city;
			if(region) address += ', ' + region;
			if(postalcode) address += ', ' + postalcode;
			if(country) address += ', ' + country;

			GeocodeAddress(address, function(result){
				button.val(button_value);
				SetMarker(result.geometry.location);
			}, function(){
				button.val(button_value).removeAttr('disabled');
				button.parent('label').append('<i>Address not found</i>')
			});
		});

		field.on('focus', 'input[type=text]', function(ev){
			var $btn = field.find('div.locate input[name="locate"]')
			if ($btn.attr('disabled')) {
				helpers.toggleFieldState($btn);
			}

		});
	}
	function GeocodeAddress(address, success, fail){
		geocoder.geocode({"address":address}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				success(results[0]);
			}else{
				fail();
			}
		});
	}

	function SetLatLng(latlng){
		field = $('div.field-addresslocation');
		lat = field.find('input.latitude');
		lng = field.find('input.longitude');
		lat.val(latlng.lat().toFixed(7));
		lng.val(latlng.lng().toFixed(7));
	}

	function SetMarker(latlng){
		if($.isEmptyObject(marker)){
			marker = new google.maps.Marker({
				"clickable": false,
				"draggable": true,
				"position": latlng,
				"animation": google.maps.Animation.DROP,
				"map": map
			})
		}
		else{
			marker.setPosition(latlng);
			marker.setMap(map);
		}

		map.setZoom(15);
		map.setCenter(marker.getPosition());
		SetLatLng(latlng);

		google.maps.event.addListener(marker, "dragend", function(){
			SetLatLng(marker.getPosition());
			map.setCenter(marker.getPosition());
		});
	}

	$(document).ready(function(){
		addresslocationField();
	});
})(jQuery);
