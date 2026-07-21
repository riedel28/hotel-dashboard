import { CheckIcon, CopyIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

type CopyButtonProps = Omit<ButtonProps, 'children' | 'onClick'> & {
  copiedLabel?: string;
  copyLabel?: string;
  text: string;
};

function CopyButton({
  copiedLabel = 'Copied to clipboard',
  copyLabel = 'Copy to clipboard',
  size = 'icon-sm',
  text,
  type = 'button',
  variant = 'ghost',
  ...props
}: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard();
  const Icon = copied ? CheckIcon : CopyIcon;

  return (
    <Button
      aria-label={copied ? copiedLabel : copyLabel}
      size={size}
      type={type}
      variant={variant}
      onClick={() => copy(text)}
      className="group hover:bg-transparent!"
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'size-3.5 text-muted-foreground group-hover:text-foreground',
          copied &&
            'text-emerald-600 group-hover:text-emerald-600 dark:text-emerald-300'
        )}
      />
    </Button>
  );
}

export { CopyButton };
