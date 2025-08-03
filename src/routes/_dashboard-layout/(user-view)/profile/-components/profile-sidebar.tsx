import { FormattedMessage } from 'react-intl';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

export interface ProfileSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileSidebarProps {
  sections: ProfileSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function ProfileSidebar({
  sections,
  activeSection,
  onSectionChange
}: ProfileSidebarProps) {
  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <Button
            key={section.id}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'h-auto w-full justify-start gap-2 p-3',
              isActive && 'bg-secondary text-secondary-foreground'
            )}
            onClick={() => onSectionChange(section.id)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">
              <FormattedMessage
                id={section.title}
                defaultMessage="Section Title"
              />
            </span>
          </Button>
        );
      })}
    </div>
  );
}
