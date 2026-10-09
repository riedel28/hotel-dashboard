import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type PropertyOption,
  propertyOptionSchema
} from 'shared/types/properties';

/** Every solution a Property can have, in display order. */
export const propertyOptions = propertyOptionSchema.options;

export const propertyOptionLabels: Record<PropertyOption, MessageDescriptor> = {
  mobile_app_native: msg`Mobile App (Native)`,
  mobile_app_pwa: msg`Mobile App (PWA)`,
  checkin_kiosk_app: msg`Check-in Kiosk App`,
  tv_guest_directory: msg`TV Guest Directory`,
  meldeschein_app: msg`Meldeschein App (iPad)`,
  rsx_api: msg`RSX API`,
  messaging_email: msg`Messaging: Email`,
  messaging_sms: msg`Messaging: SMS`,
  messaging_whatsapp: msg`Messaging: WhatsApp`
};
