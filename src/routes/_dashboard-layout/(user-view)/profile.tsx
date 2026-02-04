import { Trans } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { Camera, Lock, Shield, User, Users } from 'lucide-react';

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
import { TwoFactorSection } from './profile/-components/2fa-section';
import { AvatarSection } from './profile/-components/avatar-section';
import { PasswordSection } from './profile/-components/password-section';
import { PersonalSection } from './profile/-components/personal-section';
import { RolesSection } from './profile/-components/roles-section';

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
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Profile</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          <Trans>Profile</Trans>
        </h1>
      </div>

      <Tabs defaultValue="personal" orientation="horizontal" className="w-full">
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
                  <Trans>Personal</Trans>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <Trans>Password</Trans>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <Trans>Roles</Trans>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="avatar"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <Trans>Avatar</Trans>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="twoFactor"
                className="h-auto w-full justify-start gap-2 p-2.5"
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  <Trans>Two Factor</Trans>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="max-w-2xl min-w-0">
            <TabsContent value="personal" className="mt-0">
              <PersonalSection />
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
              <RolesSection initialRoles={[1]} />
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
