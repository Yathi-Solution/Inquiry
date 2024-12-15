"use client";

import { AirVent, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Define roles
const ROLES = {
  SUPER_ADMIN: 1,
  LOCATION_MANAGER: 2,
  SALESPERSON: 3
};

interface NavItem {
  href: string;
  label: string;
  isButton?: boolean;
  onClick?: () => void;
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const items: NavItem[] = [];

    if (user) {
      console.log("Current user:", user);
      
      // Common items for all authenticated users
      items.push({ href: "/profile", label: "Profile" });

      // Check if user is super admin (you might need to adjust this condition based on your user object)
      if (user.name.includes('SuperAdmin')) {  // Temporary solution based on name
        console.log("Is super admin");
        items.push(
          { href: "/dashboard", label: "Dashboard" },
          { href: "/register", label: "Register" }
        );
      }

      // Add logout button
      items.push({
        href: "#",
        label: "Logout",
        isButton: true,
        onClick: () => {
          logout();
          router.push('/login');
        }
      });
    } else {
      items.push({ 
        href: "/login", 
        label: "Sign In", 
        isButton: true,
        onClick: () => router.push('/login')
      });
    }

    console.log("Final nav items:", items);
    return items;
  };

  const navItems = getNavItems();

  // Add this helper function
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  // Update the desktop navigation links
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <AirVent className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">
              Sales<span className="text-red-600">Tracker</span>
            </span>
          </Link>

          {/* Update Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) =>
              item.isButton ? (
                <Button 
                  key={item.href} 
                  variant="default" 
                  size="sm"
                  onClick={item.onClick}
                  asChild={!item.onClick}
                >
                  {item.onClick ? (
                    <div onClick={item.onClick}>{item.label}</div>
                  ) : (
                    <Link href={item.href}>{item.label}</Link>
                  )}
                </Button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative text-sm font-medium transition-colors hover:text-primary
                    ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}
                    group
                  `}
                >
                  {item.label}
                  <span className={`
                    absolute inset-x-0 -bottom-2 h-0.5 bg-primary transform origin-left
                    transition-transform duration-200 ease-out
                    ${isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
                  `} />
                </Link>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Update Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  Sales<span className="text-red-600">Tracker</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-4">
                {navItems.map((item) =>
                  item.isButton ? (
                    <Button 
                      key={item.href} 
                      variant="default" 
                      size="sm"
                      onClick={item.onClick}
                      asChild={!item.onClick}
                    >
                      {item.onClick ? (
                        item.label
                      ) : (
                        <Link href={item.href}>{item.label}</Link>
                      )}
                    </Button>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        text-sm font-medium transition-colors
                        ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
                      `}
                    >
                      {item.label}
                    </Link>
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
