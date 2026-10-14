import './preview-html.css';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  ArrowUpRightIcon,
  BatteryFullIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOffIcon,
  SignalIcon,
  WifiIcon
} from 'lucide-react';
import * as React from 'react';
import { sanitizeCmsHtml } from 'shared/cms-html';
import { cmsChildren, cmsVisibility } from 'shared/cms-tree';
import { type CmsLocale, cmsLocales, cmsPrimaryLocale } from 'shared/types/cms';
import { toast } from 'sonner';

import { cmsImageUrl, type CmsNode } from '@/api/cms';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import { localized } from '../../-lib/cms-content';
import { appTokens, appTokenStyle } from './tokens';

type Mode = 'list' | 'page';

interface PhonePreviewProps {
  // Every node, the selected one with the editor's unsaved state applied.
  nodes: CmsNode[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  // Shown on the start screen's bar.
  homeTitle: string;
}

// A web mirror of the mobile app, not the app itself: what guests would see
// for the selected node. Its screen always follows the selection — tapping a
// row selects that node, Back selects the parent — so the preview's stack is
// the selected node's path.
export function PhonePreview({
  nodes,
  selectedId,
  onSelect,
  homeTitle
}: PhonePreviewProps) {
  const { t } = useLingui();
  const [locale, setLocale] = React.useState<CmsLocale>(cmsPrimaryLocale);
  const [mode, setMode] = React.useState<Mode>('page');
  const [showHidden, setShowHidden] = React.useState(false);

  const selected = nodes.find((node) => node.id === selectedId) ?? null;
  // A link has no page of its own; nothing selected is the start screen.
  const effectiveMode: Mode = selected?.type === 'page' ? mode : 'list';
  // The screen shown: the selected page itself, or the list it appears in.
  const screenNode =
    effectiveMode === 'page'
      ? selected
      : (nodes.find((node) => node.id === selected?.parent_id) ?? null);

  const text = (node: CmsNode, field: 'title' | 'subtitle' | 'body') =>
    localized(node.translations, locale, field).value;

  const rows = cmsChildren(nodes, screenNode?.id ?? null).filter(
    (node) => showHidden || !node.hidden || node.id === selectedId
  );

  const openRow = (node: CmsNode) => {
    onSelect(node.id);
    if (node.type === 'link') {
      const url = localized(node.translations, locale, 'url').value || node.url;
      toast.info(t`Link: ${url}`, {
        description:
          node.open_mode === 'system'
            ? t`Opens in the system browser`
            : t`Opens in the in-app browser`
      });
    }
  };

  const visibility = selected ? cmsVisibility(nodes, selected.id) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          label={t`Preview language`}
          size="sm"
          value={locale}
          onValueChange={setLocale}
          options={cmsLocales.map((value) => ({
            value,
            label: value.toUpperCase()
          }))}
        />
        <SegmentedControl
          label={t`Preview mode`}
          size="sm"
          value={effectiveMode}
          onValueChange={setMode}
          options={[
            { value: 'list', label: t`List` },
            {
              value: 'page',
              label: t`Page`,
              disabled: selected?.type !== 'page'
            }
          ]}
        />
        <div className="ms-auto flex items-center gap-2">
          <Switch
            id="cms-preview-hidden"
            size="sm"
            aria-label={t`Show hidden`}
            checked={showHidden}
            onCheckedChange={setShowHidden}
          />
          <Label htmlFor="cms-preview-hidden" className="text-xs font-normal">
            <Trans>Show hidden</Trans>
          </Label>
        </div>
      </div>

      <ScaledPhone>
        <StatusBar />
        <NavBar
          title={screenNode ? text(screenNode, 'title') : homeTitle}
          backLabel={t`Back`}
          onBack={
            selected
              ? () =>
                  onSelect(
                    effectiveMode === 'page'
                      ? selected.parent_id
                      : (screenNode?.parent_id ?? null)
                  )
              : undefined
          }
        />
        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          {visibility && visibility.state !== 'visible' && (
            <div
              role="status"
              className="flex items-center gap-2 bg-(--app-banner) px-(--app-screen) py-2 text-[13px] text-(--app-banner-text)"
            >
              <EyeOffIcon className="size-4 shrink-0" />
              {selected?.type === 'link' ? (
                <Trans>This link is hidden and not visible to guests.</Trans>
              ) : (
                <Trans>This page is hidden and not visible to guests.</Trans>
              )}
            </div>
          )}

          {effectiveMode === 'page' && screenNode && (
            <PageContent
              images={screenNode.image_ids}
              title={text(screenNode, 'title')}
              subtitle={text(screenNode, 'subtitle')}
              html={sanitizeCmsHtml(text(screenNode, 'body'))}
            />
          )}

          {rows.length > 0 && (
            <ul
              className="mx-(--app-screen) mt-(--app-section) overflow-hidden rounded-(--app-radius) bg-(--app-surface)"
              aria-label={t`Items`}
            >
              {rows.map((node) => (
                <li
                  key={node.id}
                  className="border-(--app-separator) not-last:border-b"
                >
                  <button
                    type="button"
                    onClick={() => openRow(node)}
                    className={cn(
                      'flex w-full items-center gap-3 px-(--app-screen) py-(--app-row) text-start',
                      node.id === selectedId &&
                        effectiveMode === 'list' &&
                        'bg-(--app-accent)/10',
                      node.hidden && 'opacity-40'
                    )}
                  >
                    {/* Every item shows its first image, or a grey square
                        without one. */}
                    {node.image_ids[0] ? (
                      <img
                        src={cmsImageUrl(node.image_ids[0])}
                        alt=""
                        className="size-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="size-10 shrink-0 rounded-md bg-(--app-placeholder)" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-(length:--app-body) text-(--app-text)">
                        {text(node, 'title') || '—'}
                      </span>
                      {text(node, 'subtitle') && (
                        <span className="block truncate text-(length:--app-subtitle) text-(--app-text-2)">
                          {text(node, 'subtitle')}
                        </span>
                      )}
                    </span>
                    {node.type === 'link' ? (
                      <ArrowUpRightIcon className="size-4 shrink-0 text-(--app-chevron)" />
                    ) : (
                      <ChevronRightIcon className="size-5 shrink-0 text-(--app-chevron)" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {effectiveMode === 'list' && rows.length === 0 && (
            <p className="px-(--app-screen) py-(--app-section) text-center text-(length:--app-subtitle) text-(--app-text-2)">
              <Trans>Nothing to show yet</Trans>
            </p>
          )}
        </div>
      </ScaledPhone>
    </div>
  );
}

// The iPhone frame, drawn at the app's logical size and scaled down with
// transform: scale() to the column's width.
function ScaledPhone({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const bezel = 12;
  const { width, height } = appTokens.viewport;
  const outerWidth = width + bezel * 2;
  const outerHeight = height + bezel * 2;

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(
        Math.min(1, (entry?.contentRect.width ?? outerWidth) / outerWidth)
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [outerWidth]);

  return (
    <div ref={ref} className="w-full" style={{ height: outerHeight * scale }}>
      <div
        className="origin-top-left rounded-[56px] bg-neutral-900 shadow-xl ring-1 ring-black/20 dark:ring-white/15"
        style={{
          width: outerWidth,
          height: outerHeight,
          padding: bezel,
          transform: `scale(${scale})`
        }}
      >
        <div
          className="relative flex size-full flex-col overflow-hidden rounded-[44px] bg-(--app-bg) font-(family-name:--app-font) text-(--app-text) antialiased"
          style={appTokenStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="relative flex h-[54px] shrink-0 items-center justify-between px-8 pt-3 text-[16px] font-semibold">
      <span>9:41</span>
      {/* The Dynamic Island */}
      <span className="absolute top-[11px] left-1/2 h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1.5">
        <SignalIcon className="size-4" />
        <WifiIcon className="size-4" />
        <BatteryFullIcon className="size-5" />
      </span>
    </div>
  );
}

function NavBar({
  title,
  backLabel,
  onBack
}: {
  title: string;
  backLabel: string;
  onBack?: () => void;
}) {
  return (
    <div className="grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-(--app-separator)/60 px-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-(length:--app-body) text-(--app-accent)"
        >
          <ChevronLeftIcon className="size-6" />
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <span className="max-w-[220px] truncate text-(length:--app-nav-title) font-semibold">
        {title}
      </span>
    </div>
  );
}

function PageContent({
  images,
  title,
  subtitle,
  html
}: {
  images: string[];
  title: string;
  subtitle: string;
  html: string;
}) {
  const [current, setCurrent] = React.useState(0);
  return (
    <div>
      {images.length > 0 && (
        <div className="relative">
          <div
            className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
            onScroll={(event) => {
              const el = event.currentTarget;
              setCurrent(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {images.map((id) => (
              <img
                key={id}
                src={cmsImageUrl(id)}
                alt=""
                className="aspect-[4/3] w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {images.map((id, index) => (
                <span
                  key={id}
                  className={cn(
                    'size-1.5 rounded-full bg-white',
                    index !== current && 'opacity-50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="px-(--app-screen) pt-(--app-screen)">
        <h1 className="text-(length:--app-title) leading-tight font-bold">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-(length:--app-subtitle) text-(--app-text-2)">
            {subtitle}
          </p>
        )}
        {html && (
          <div
            className="cms-preview-html mt-(--app-row)"
            // Sanitized by the same function the server applies on save.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
