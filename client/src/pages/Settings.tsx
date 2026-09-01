import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Lock, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Lock className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.username} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} defaultValue={user?.bio} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue={user?.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" defaultValue={user?.website} />
            </div>
            <Button variant="gradient" disabled={saving}>
              Save Changes
            </Button>
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
            <Button variant="gradient" disabled={saving}>
              Update Account
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-4">
            <p className="text-muted-foreground">Notification preferences coming soon...</p>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6 space-y-4">
            <p className="text-muted-foreground">Appearance settings coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
