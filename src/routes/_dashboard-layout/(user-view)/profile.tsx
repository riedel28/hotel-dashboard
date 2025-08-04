import { createFileRoute } from '@tanstack/react-router';
import { Camera, Lock, Shield, User, Users } from 'lucide-react';
import { FormattedMessage } from 'react-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getUserInitials } from '@/lib/utils';

import { AvatarSection } from './profile/-components/avatar-section';
import { PasswordSection } from './profile/-components/password-section';
import { PersonalSection } from './profile/-components/personal-section';
import { RolesSection } from './profile/-components/roles-section';
import { TwoFactorSection } from './profile/-components/two-factor-section';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/profile')({
  component: RouteComponent
});

function RouteComponent() {
  // TODO: Fetch user data from API
  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: null,
    twoFactorEnabled: false
  };

  const userInitials = getUserInitials(userData.firstName, userData.lastName);

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

      <Tabs defaultValue="personal" className="w-full">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Navigation */}
          <div className="space-y-4">
            <TabsList
              variant="button"
              className="h-auto w-full flex-col bg-transparent py-2"
            >
              <TabsTrigger
                value="personal"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="profile.sidebar.personal"
                    defaultMessage="Personal"
                  />
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="profile.sidebar.password"
                    defaultMessage="Password"
                  />
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="profile.sidebar.roles"
                    defaultMessage="Roles"
                  />
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="avatar"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="profile.sidebar.avatar"
                    defaultMessage="Avatar"
                  />
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="twoFactor"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <FormattedMessage
                    id="profile.sidebar.twoFactor"
                    defaultMessage="Two Factor"
                  />
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="max-w-2xl min-w-0">
            <TabsContent value="personal" className="mt-0">
              <PersonalSection
                initialData={{
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  email: userData.email
                }}
              />
            </TabsContent>
            <TabsContent value="avatar" className="mt-0">
              <AvatarSection
                currentAvatar={userData.avatar}
                userInitials={userInitials}
              />
            </TabsContent>
            <TabsContent value="password" className="mt-0">
              <PasswordSection />
            </TabsContent>
            <TabsContent value="roles" className="mt-0">
              <RolesSection initialRoles={['administrators']} />
            </TabsContent>
            <TabsContent value="twoFactor" className="mt-0">
              <TwoFactorSection isEnabled={userData.twoFactorEnabled} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
