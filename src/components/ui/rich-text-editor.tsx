import { useLingui } from '@lingui/react/macro';
import Image from '@tiptap/extension-image';
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BoldIcon,
  ChevronDownIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Toggle, toggleVariants } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  // HTML. An empty document is reported as '' rather than '<p></p>'.
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  className?: string;
}

// Paragraph or heading (H1–H6), bold, italic, underline, lists, links and
// images by URL. Must stay within shared/rich-text.ts, which is also what the
// server keeps when it sanitizes — the test next to this file checks that.
export const richTextExtensions = [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: {
      openOnClick: false,
      protocols: ['http', 'https', 'mailto'],
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
    }
  }),
  Image
];

// Toolbar buttons are grey until hovered. An active one keeps the hover text
// colour on a darker grey fill, so "on" reads differently from "hovered".
const toolbarButtonClassName = cn(
  toggleVariants({ size: 'sm' }),
  'text-muted-foreground aria-pressed:bg-foreground/10 aria-pressed:text-foreground aria-pressed:hover:bg-foreground/10'
);

const headingLevels = [1, 2, 3, 4, 5, 6] as const;

// How rich text looks: headings, lists, links and images. Used by the editor
// and its style menu; apply it wherever saved rich text is rendered.
export const richTextClassName = cn(
  '[&_ol]:list-decimal [&_ol]:ps-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:ps-5',
  '[&_:is(h1,h2,h3,h4,h5,h6)]:mt-3 [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6):first-child]:mt-0',
  '[&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-sm [&_h6]:font-medium [&_h6]:text-muted-foreground',
  '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md',
  '[&_a]:text-primary [&_a]:underline'
);

// Paragraph / Heading 1–6 for the current block.
function TextStyleMenu({
  editor,
  level
}: {
  editor: Editor;
  // The current block's heading level; null for a paragraph.
  level: number | null;
}) {
  const { t } = useLingui();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label={t`Text style`}
        className={cn(
          toolbarButtonClassName,
          'w-28 justify-between px-2 text-foreground'
        )}
      >
        {level ? t`Heading ${level}` : t`Text`}
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        // Each heading is shown the way it will look in the text.
        className={cn('w-48', richTextClassName)}
        // Back to the text, not the menu button, so typing continues.
        finalFocus={() => editor.view.dom}
      >
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          {t`Text`}
        </DropdownMenuItem>
        {headingLevels.map((headingLevel) => {
          const Heading = `h${headingLevel}` as const;
          return (
            <DropdownMenuItem
              key={headingLevel}
              onClick={() =>
                editor.chain().focus().setHeading({ level: headingLevel }).run()
              }
            >
              <Heading role="presentation">{t`Heading ${headingLevel}`}</Heading>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// A bare "example.com" would otherwise become a relative URL.
function withScheme(url: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
}

interface UrlControlProps {
  label: string;
  icon: React.ComponentType;
  active?: boolean;
  // The URL to start from when the popover opens.
  getCurrentUrl?: () => string;
  // Receives the entered URL, or '' when the field was cleared.
  onApply: (url: string) => void;
}

// A toolbar button that asks for a URL in a popover (links, images).
function UrlControl({
  label,
  icon: Icon,
  active = false,
  getCurrentUrl,
  onApply
}: UrlControlProps) {
  const { t } = useLingui();
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const apply = () => {
    const trimmed = url.trim();
    onApply(trimmed && withScheme(trimmed));
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setUrl(getCurrentUrl?.() ?? '');
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger
        type="button"
        aria-label={label}
        title={label}
        aria-pressed={active}
        className={toolbarButtonClassName}
      >
        <Icon />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 flex-row gap-2 p-2">
        <Input
          autoFocus
          type="url"
          inputMode="url"
          value={url}
          placeholder="https://"
          aria-label={label}
          className="h-8"
          onChange={(event) => setUrl(event.target.value)}
          // Not a <form>: its submit would bubble to the form the editor is in.
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          // Same visible height as the field: 32px, filled to the edge.
          className="h-8 bg-clip-border"
          onClick={apply}
        >
          {url.trim() || !active ? t`Apply` : t`Remove`}
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useLingui();
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      headingLevel: editor.isActive('heading')
        ? (editor.getAttributes('heading').level as number)
        : null,
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      link: editor.isActive('link')
    })
  });

  const toggles = [
    {
      label: t`Bold`,
      icon: BoldIcon,
      pressed: active.bold,
      run: () => editor.chain().focus().toggleBold().run()
    },
    {
      label: t`Italic`,
      icon: ItalicIcon,
      pressed: active.italic,
      run: () => editor.chain().focus().toggleItalic().run()
    },
    {
      label: t`Underline`,
      icon: UnderlineIcon,
      pressed: active.underline,
      run: () => editor.chain().focus().toggleUnderline().run()
    },
    {
      label: t`Bulleted list`,
      icon: ListIcon,
      pressed: active.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run()
    },
    {
      label: t`Numbered list`,
      icon: ListOrderedIcon,
      pressed: active.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run()
    }
  ];

  return (
    <div
      role="toolbar"
      aria-label={t`Formatting`}
      className="flex flex-wrap items-center gap-0.5 border-b border-input p-1"
    >
      <TextStyleMenu editor={editor} level={active.headingLevel} />
      {toggles.map(({ label, icon: Icon, pressed, run }) => (
        <Toggle
          key={label}
          className={toolbarButtonClassName}
          aria-label={label}
          title={label}
          pressed={pressed}
          onPressedChange={run}
          // Keep the selection in the editor while clicking the toolbar.
          onMouseDown={(event) => event.preventDefault()}
        >
          <Icon />
        </Toggle>
      ))}
      <UrlControl
        label={t`Link`}
        icon={LinkIcon}
        active={active.link}
        getCurrentUrl={() => editor.getAttributes('link').href ?? ''}
        onApply={(href) => {
          const chain = editor.chain().focus().extendMarkRange('link');
          if (href) {
            chain.setLink({ href }).run();
          } else {
            chain.unsetLink().run();
          }
        }}
      />
      <UrlControl
        label={t`Image`}
        icon={ImageIcon}
        onApply={(src) => {
          if (src) {
            editor.chain().focus().setImage({ src }).run();
          }
        }}
      />
    </div>
  );
}

function RichTextEditor({
  value,
  onChange,
  onBlur,
  id,
  disabled = false,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  className
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(id && { id }),
        ...(ariaLabel && { 'aria-label': ariaLabel }),
        role: 'textbox',
        'aria-multiline': 'true',
        class: cn(
          'max-h-96 min-h-40 overflow-y-auto px-2.5 py-2 text-base outline-none md:text-sm',
          richTextClassName
        )
      }
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
    onBlur
  });

  // Follow value changes that didn't come from typing (e.g. a form reset).
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  React.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      data-slot="rich-text-editor"
      aria-invalid={invalid || undefined}
      className={cn(
        // Mirrors Textarea: border, focus, invalid, disabled and dark styles.
        'w-full rounded-lg border border-input bg-transparent transition-[color,box-shadow]',
        'focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        'aria-invalid:border-destructive aria-invalid:focus-within:border-destructive aria-invalid:focus-within:shadow-[inset_0_0_0_1px_var(--color-destructive)]',
        'dark:bg-input/30',
        disabled && 'cursor-not-allowed bg-input/50 opacity-50',
        className
      )}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

export { RichTextEditor };
