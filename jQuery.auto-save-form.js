(function ($) {
	$.fn.autoSaveForm = function (options) {
		var settings = $.extend({
			timeout: 1000,
			fieldEvents : 'change keyup propertychange input',
			fieldSelector: ":input:not(input[type=submit]):not(input[type=button])",
			url: null
		}, options); //TODO edit options

		var initForm = function ($form) {
			var timeoutId = 0;
			var fields = $form.find(settings.fieldSelector);
			$(fields).on(settings.fieldEvents, function (evt) {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(function() {
					save($form)
				}, settings.timeout);
			});
		};

		var sleep = function (milliseconds) {
			var start = new Date().getTime();
			for (var i = 0; i < 1e7; i++) {
				if ((new Date().getTime() - start) > milliseconds){
					break;
				}
			}
		};

		var save = function ($form) {
			$.ajax({
				url: settings.url ? settings.url : $form.attr('action'),
				type: $form.attr('method'),
				data: $form.serialize() + '&isAjax=1', // serializes the form's elements.
				beforeSend: function (xhr) {
					// Let them know we are saving
					var ret = $form.triggerHandler('beforeSave.autoSaveForm', [$form, xhr]);
					if (ret === false) {
						return false;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					if (jqXHR.status === 0) {
						sleep(500);
					}
					$form.trigger('saveError.autoSaveForm', [$form, jqXHR, textStatus, errorThrown]);
				},
				success: function (data, textStatus, jqXHR) {
					$form.trigger('saveSuccess.autoSaveForm', [$form, data, textStatus, jqXHR]);
				},
			});
		};

		return this.each(function (elem) {
			var $form = $(this);
			if (!$form.is('form')) {
				return;
			}

			$form.submit(function (e) {
				save();
				e.preventDefault();
			});

			// Add a custom events
			$form.on('save.autoSaveForm', function () { save($form); });
			initForm($form);
		});
	};
}(jQuery));
