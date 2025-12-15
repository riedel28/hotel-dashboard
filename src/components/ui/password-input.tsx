'use client';

import { useLingui } from '@lingui/react/macro';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group';

function PasswordInput(props: React.ComponentProps<typeof InputGroupInput>) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useLingui();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <InputGroup>
      <InputGroupInput {...props} type={isVisible ? 'text' : 'password'} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          onClick={toggleVisibility}
          aria-label={isVisible ? t`Hide password` : t`Show password`}
          aria-pressed={isVisible}
          aria-controls={props.id || 'password'}
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
