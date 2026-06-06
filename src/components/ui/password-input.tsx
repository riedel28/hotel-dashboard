'use client';

import { useLingui } from '@lingui/react/macro';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';

function PasswordInput({
  id,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [isVisible, setIsVisible] = React.useState(false);
  const { t } = useLingui();

  const toggleVisibility = () => setIsVisible((visible) => !visible);

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        id={inputId}
        type={isVisible ? 'text' : 'password'}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          onClick={toggleVisibility}
          aria-label={isVisible ? t`Hide password` : t`Show password`}
          aria-pressed={isVisible}
          aria-controls={inputId}
          className="hover:bg-transparent"
        >
          {isVisible ? (
            <EyeOffIcon size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
