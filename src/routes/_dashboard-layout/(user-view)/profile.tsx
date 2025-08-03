import { useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { Camera, Lock, Shield, User } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import { getUserInitials } from '@/lib/utils';

import { AvatarSection } from './profile/-components/avatar-section';
import { PasswordSection } from './profile/-components/password-section';
import { PersonalSection } from './profile/-components/personal-section';
import {
  type ProfileSection,
  ProfileSidebar
} from './profile/-components/profile-sidebar';
import { TwoFactorSection } from './profile/-components/two-factor-section';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile')({
  component: RouteComponent
});

function RouteComponent() {
  const [activeSection, setActiveSection] = useState('personal');

  // TODO: Fetch user data from API
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: null,
    twoFactorEnabled: false
  };

  const userInitials = getUserInitials(userData.firstName, userData.lastName);

  const sections: ProfileSection[] = [
    {
      id: 'personal',
      title: 'profile.sidebar.personal',
      icon: User
    },
    {
      id: 'password',
      title: 'profile.sidebar.password',
      icon: Lock
    },
    {
      id: 'avatar',
      title: 'profile.sidebar.avatar',
      icon: Camera
    },
    {
      id: 'twoFactor',
      title: 'profile.sidebar.twoFactor',
      icon: Shield
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalSection
            initialData={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email
            }}
          />
        );
      case 'avatar':
        return (
          <AvatarSection
            currentAvatar={userData.avatar}
            userInitials={userInitials}
          />
        );
      case 'password':
        return <PasswordSection />;
      case 'twoFactor':
        return <TwoFactorSection isEnabled={userData.twoFactorEnabled} />;
      default:
        return (
          <PersonalSection
            initialData={{
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email
            }}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <FormattedMessage id="breadcrumb.home" defaultMessage="Home" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <FormattedMessage id="profile.title" defaultMessage="Profile" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          <FormattedMessage id="profile.title" defaultMessage="Profile" />
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">
              <FormattedMessage
                id="profile.settings"
                defaultMessage="Settings"
              />
            </h2>
            <ProfileSidebar
              sections={sections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-2xl min-w-0 space-y-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}
