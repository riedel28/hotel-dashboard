import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';
import type { ProviderKind } from 'shared/types/providers';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { ProviderScreens } from './provider-screens';
import type { ProviderEntry } from './types';

interface ProviderPageProps<K extends ProviderKind> {
  kind: K;
  /** The page's name: its heading, breadcrumb and tab title. */
  title: string;
  description: ReactNode;
  pickerTitle: ReactNode;
  pickerDescription: ReactNode;
  /** Every provider of this kind, in the order the picker shows them. */
  providers: ProviderEntry<K>[];
}

/** A page under Integrations where a property is connected to a provider. */
export function ProviderPage<K extends ProviderKind>({
  title,
  description,
  ...screens
}: ProviderPageProps<K>) {
  useDocumentTitle(title);

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Trans>Integrations</Trans>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex max-w-2xl flex-col gap-1">
        <h1 className="text-xl font-semibold text-balance">{title}</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      </div>

      <ProviderScreens {...screens} />
    </div>
  );
}
