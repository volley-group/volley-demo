import { Link, useNavigate } from '@tanstack/react-router';
import { Separator } from './ui/separator';
import { DashboardBreadcrumb } from '@/components/dashboard-breadcrumb';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { hc } from '@/lib/clients';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@clerk/clerk-react';

const userQuery = queryOptions({
  queryKey: ['user'],
  queryFn: () => hc['user'].$get().then((r) => r.json()),
});

const getInitials = (name: string): string => {
  // Handle empty or undefined name
  if (!name?.trim()) return '';

  // Check for camelCase (has no spaces but multiple capital letters)
  if (!name.includes(' ') && /^[a-z].*[A-Z]/.test(name)) {
    const firstLetter = name[0];
    const lastCapital = name.match(/[A-Z][^A-Z]*$/)?.[0]?.[0] || '';
    return `${firstLetter}${lastCapital}`.toUpperCase();
  }

  // Handle names with spaces
  const nameParts = name.trim().split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }

  // Handle single name
  return name[0].toUpperCase();
};

export function AppNavbar() {
  const { isLoading, data: user } = useQuery(userQuery);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <header className="flex h-16 items-center px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/feed" className="flex items-center transition-opacity hover:opacity-80">
              <img src="/images/braid-logo-light.svg" alt="Braid Logo" className="h-7 w-auto" />
            </Link>
            <Separator orientation="vertical" className="mx-1 h-5 opacity-30" />
            <DashboardBreadcrumb />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Link
              to="/feed"
              activeProps={{
                className: 'text-foreground bg-muted',
              }}
              inactiveProps={{
                className: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              }}
              className="relative rounded-lg px-3 py-2 font-medium transition-all duration-200 ease-in-out"
            >
              Feed
            </Link>
            <Link
              to="/config"
              activeProps={{
                className: 'text-foreground bg-muted',
              }}
              inactiveProps={{
                className: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              }}
              className="relative rounded-lg px-3 py-2 font-medium transition-all duration-200 ease-in-out"
            >
              Config
            </Link>

            <Separator orientation="vertical" className="h-8 opacity-30" />
            {isLoading ? (
              <Avatar>
                <AvatarFallback>
                  <Skeleton className="h-full w-full" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user!.avatarUrl ?? undefined} alt="@username" />
                      <AvatarFallback>{getInitials(user!.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user!.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user!.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 hover:cursor-pointer"
                    onClick={() => signOut({ redirectUrl: '/sign-in' }).then(() => navigate({ to: '/sign-in/$' }))}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </nav>
  );
}
