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
  CodeIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Redo2Icon,
  UnderlineIcon,
  Undo2Icon
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
import { Textarea } from '@/components/ui/textarea';
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
  // 'cms': the Mobile CMS text — H2/H3 only, no images, undo/redo and a raw
  // HTML mode (see shared/cms-html.ts for what is kept).
  variant?: 'default' | 'cms';
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

// What shared/cms-html.ts keeps: no images, headings H2/H3.
export const cmsRichTextExtensions = [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    heading: { levels: [2, 3] },
    // It appends an empty paragraph after a closing list or heading, which
    // reads as an edit and marks a just-opened form as unsaved.
    trailingNode: false,
    link: {
      openOnClick: false,
      protocols: ['http', 'https', 'mailto', 'tel'],
      // The app decides how links open; the sanitizer drops these anyway.
      HTMLAttributes: { target: null, rel: null }
    }
  })
];

const variants = {
  default: {
    extensions: richTextExtensions,
    headingLevels: [1, 2, 3, 4, 5, 6],
    images: true,
    history: false,
    htmlMode: false
  },
  cms: {
    extensions: cmsRichTextExtensions,
    headingLevels: [2, 3],
    images: false,
    // Undo/redo buttons and editing the HTML source.
    history: true,
    htmlMode: true
  }
} as const;

// Toolbar buttons are grey until hovered, then get a fill of the input token:
// muted sits too close to the editor's own surface to show, most of all on
// the dark theme. An active one keeps a darker fill still, so "on" reads
// differently from "hovered".
const toolbarHoverClassName =
  'text-muted-foreground hover:bg-input/70 hover:text-foreground dark:hover:bg-input/50';

const toolbarButtonClassName = cn(
  toggleVariants({ size: 'sm' }),
  toolbarHoverClassName,
  'aria-pressed:bg-foreground/10 aria-pressed:text-foreground aria-pressed:hover:bg-foreground/10 dark:aria-pressed:bg-foreground/15 dark:aria-pressed:hover:bg-foreground/15'
);

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
  level,
  headingLevels
}: {
  editor: Editor;
  // The current block's heading level; null for a paragraph.
  level: number | null;
  headingLevels: readonly (1 | 2 | 3 | 4 | 5 | 6)[];
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

// An empty document is reported as '' rather than '<p></p>'.
const htmlOf = (editor: Editor) => (editor.isEmpty ? '' : editor.getHTML());

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

function Toolbar({
  editor,
  variant,
  htmlMode,
  onHtmlModeChange
}: {
  editor: Editor;
  variant: (typeof variants)[keyof typeof variants];
  htmlMode: boolean;
  onHtmlModeChange: (htmlMode: boolean) => void;
}) {
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
      link: editor.isActive('link'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo()
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
      {variant.history && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolbarHoverClassName}
            aria-label={t`Undo`}
            title={t`Undo`}
            disabled={htmlMode || !active.canUndo}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2Icon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolbarHoverClassName}
            aria-label={t`Redo`}
            title={t`Redo`}
            disabled={htmlMode || !active.canRedo}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2Icon />
          </Button>
        </>
      )}
      <fieldset disabled={htmlMode} className="contents">
        <TextStyleMenu
          editor={editor}
          level={active.headingLevel}
          headingLevels={variant.headingLevels}
        />
      </fieldset>
      {toggles.map(({ label, icon: Icon, pressed, run }) => (
        <Toggle
          key={label}
          className={toolbarButtonClassName}
          aria-label={label}
          title={label}
          pressed={pressed}
          disabled={htmlMode}
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
      {variant.images && (
        <UrlControl
          label={t`Image`}
          icon={ImageIcon}
          onApply={(src) => {
            if (src) {
              editor.chain().focus().setImage({ src }).run();
            }
          }}
        />
      )}
      {variant.htmlMode && (
        <Toggle
          className={cn(toolbarButtonClassName, 'ms-auto')}
          aria-label={t`Edit HTML`}
          title={t`Edit HTML`}
          pressed={htmlMode}
          onPressedChange={onHtmlModeChange}
        >
          <CodeIcon />
        </Toggle>
      )}
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
  className,
  variant: variantName = 'default'
}: RichTextEditorProps) {
  const variant = variants[variantName];
  // Raw HTML mode: the value is edited as source. The editor picks it up
  // (and normalizes it) when switching back.
  const [htmlMode, setHtmlMode] = React.useState(false);
  // The editor's own HTML for the current value.
  const shownHtml = React.useRef<string | null>(null);
  const editor = useEditor({
    extensions: variant.extensions,
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
    // The editor rewrites stored HTML into its own form (a list item gets a
    // <p>, …) and reports that as an update. Only a change from that form is
    // an edit; otherwise a form would turn dirty just by being opened.
    onCreate: ({ editor }) => {
      shownHtml.current = htmlOf(editor);
    },
    onUpdate: ({ editor }) => {
      const html = htmlOf(editor);
      if (html !== shownHtml.current) onChange(html);
    },
    onBlur
  });

  // Follow value changes that didn't come from typing (e.g. a form reset).
  // A destroyed editor is skipped: hidden by a suspending route and shown
  // again, the component keeps it until useEditor hands over a new one.
  React.useEffect(() => {
    if (!editor || editor.isDestroyed || htmlMode) return;
    if (value !== htmlOf(editor)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    shownHtml.current = htmlOf(editor);
  }, [editor, value, htmlMode]);

  React.useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div
      data-slot="rich-text-editor"
      aria-invalid={invalid || undefined}
      className={cn(
        // Mirrors Textarea: border, focus, invalid, disabled and dark styles.
        'w-full rounded-lg border border-input bg-transparent transition-[color,box-shadow]',
        'focus-within:border-primary focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)]',
        'aria-invalid:border-danger aria-invalid:focus-within:border-danger aria-invalid:focus-within:shadow-[inset_0_0_0_1px_var(--color-danger)]',
        'dark:bg-input/30',
        disabled && 'cursor-not-allowed bg-input/50 opacity-50',
        className
      )}
    >
      {editor && (
        <Toolbar
          editor={editor}
          variant={variant}
          htmlMode={htmlMode}
          onHtmlModeChange={setHtmlMode}
        />
      )}
      {htmlMode ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-label={ariaLabel}
          spellCheck={false}
          className="max-h-96 min-h-40 rounded-none border-0 font-mono text-xs shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

export { RichTextEditor };
