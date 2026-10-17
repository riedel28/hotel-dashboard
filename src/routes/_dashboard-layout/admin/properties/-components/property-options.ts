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

interface PropertyOptionGroup {
  key: string;
  /** Headed groups get a checkbox for the whole group; the rest stand alone. */
  label?: MessageDescriptor;
  /** Each option with its label inside the group, shorter than the full one. */
  options: { id: PropertyOption; label: MessageDescriptor }[];
}

/** The solutions as the property form lists them: related ones together. */
export const propertyOptionGroups: PropertyOptionGroup[] = [
  {
    key: 'mobile-app',
    label: msg`Mobile App`,
    options: [
      { id: 'mobile_app_native', label: msg`Native` },
      { id: 'mobile_app_pwa', label: msg`PWA` }
    ]
  },
  {
    key: 'apps',
    options: (
      [
        'checkin_kiosk_app',
        'meldeschein_app',
        'tv_guest_directory',
        'rsx_api'
      ] as const
    ).map((id) => ({ id, label: propertyOptionLabels[id] }))
  },
  {
    key: 'messaging',
    label: msg`Messaging`,
    options: [
      { id: 'messaging_email', label: msg`Email` },
      { id: 'messaging_sms', label: msg`SMS` },
      { id: 'messaging_whatsapp', label: msg`WhatsApp` }
    ]
  }
];
