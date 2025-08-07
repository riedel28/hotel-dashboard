'use client';

import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Input } from '@/components/ui/input';

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const intl = useIntl();

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="relative">
      <Input
        {...props}
        className="pe-9"
        type={isVisible ? 'text' : 'password'}
      />
      <button
        className="text-muted-foreground/80 hover:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg outline-offset-2 transition-colors focus:z-10 focus-visible:outline-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={toggleVisibility}
        aria-label={
          isVisible
            ? intl.formatMessage({
                id: 'passwordInput.hide',
                defaultMessage: 'Hide password'
              })
            : intl.formatMessage({
                id: 'passwordInput.show',
                defaultMessage: 'Show password'
              })
        }
        aria-pressed={isVisible}
        aria-controls="password"
      >
        {isVisible ? (
          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
