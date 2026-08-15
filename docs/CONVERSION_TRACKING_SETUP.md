# Conversion Tracking Setup

This website now exposes analytics-ready conversion events through `window.dataLayer`.

Analytics collection is not active until a real Google Tag Manager container, GA4 Measurement ID, or equivalent analytics platform is configured. The current implementation only pushes structured events into `dataLayer`.

## Events

### `quote_form_start`

Triggered once when a visitor first interacts with the WhatsApp quote form.

Parameters:

- `page_path`
- `page_language`
- `preselected_service`

### `quote_form_validation_error`

Triggered when the quote form submission is blocked by required-field validation.

Parameters:

- `page_path`
- `page_language`
- `error_field_count`

### `quote_whatsapp_open`

Triggered immediately before the generated WhatsApp quote URL is opened after a valid form submission.

Parameters:

- `page_path`
- `page_language`
- `service_type`
- `property_type`
- `preferred_timing`
- `photos_ready`
- `form_location`

This should be marked as the primary GA4 key event later.

### `whatsapp_click`

Triggered when a visitor clicks an existing direct WhatsApp link.

Parameters:

- `page_path`
- `page_language`

### `phone_click`

Triggered when a visitor clicks an existing phone link or desktop phone-copy action.

Parameters:

- `page_path`
- `page_language`

## Privacy

The event layer intentionally does not send personally identifiable information.

Do not send these values to analytics:

- name
- phone number
- email
- exact address or district entered by the visitor
- task description
- access information
- generated WhatsApp message

## Later GTM Or GA4 Setup

1. Add the real GTM container or GA4 tag to the site.
2. In GTM, create Custom Event triggers for each event name above.
3. Map the safe event parameters as custom dimensions if needed.
4. Mark `quote_whatsapp_open` as the primary key event/conversion in GA4.
5. Keep direct `whatsapp_click` and `phone_click` as supporting engagement events.
