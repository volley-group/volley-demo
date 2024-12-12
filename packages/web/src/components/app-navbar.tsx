import { Link } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";

export function AppNavbar() {
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
                className: "text-foreground bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              }}
              className="relative rounded-lg px-3 py-2 font-medium transition-all duration-200 ease-in-out"
            >
              Feed
            </Link>
            <Link
              to="/config"
              activeProps={{
                className: "text-foreground bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              }}
              className="relative rounded-lg px-3 py-2 font-medium transition-all duration-200 ease-in-out"
            >
              Config
            </Link>

            <Separator orientation="vertical" className="h-8 opacity-30" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@username" />
                    <AvatarFallback>HD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Henry Dowling</p>
                    <p className="text-xs leading-none text-muted-foreground">henry@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </nav>
  );
}
