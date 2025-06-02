import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon, 
  ShoppingCartIcon, 
  TagIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button } from '@e3d/shared';
import { cn } from '../../utils/cn';

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  current?: boolean;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: TagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Customers', href: '/admin/customers', icon: UserGroupIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Marketing', href: '/admin/marketing', icon: ShoppingBagIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Update navigation current state based on current route
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: router.pathname === item.href || router.pathname.startsWith(`${item.href}/`),
  }));

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [router.pathname, isDesktop]);

  // Set default collapsed state based on screen size
  useEffect(() => {
    setCollapsed(!isDesktop);
  }, [isDesktop]);

  // Toggle sidebar collapse state (desktop only)
  const toggleCollapsed = () => {
    if (isDesktop) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !isDesktop && (
        <div 
          className="fixed inset-0 z-40 bg-neutral-900/50 transition-opacity"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="3D E-commerce"
            />
            <span className="ml-2 text-lg font-semibold text-neutral-900">Admin</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {updatedNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                    item.current
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-6 w-6",
                      item.current ? "text-primary-700" : "text-neutral-500 group-hover:text-neutral-700"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <div className={cn(
          "flex flex-col border-r border-neutral-200 bg-white",
          collapsed ? "w-16" : "w-64"
        )}>
          <div className={cn(
            "flex items-center h-16 flex-shrink-0 px-4 border-b border-neutral-200",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="3D E-commerce"
                />
                <span className="ml-2 text-lg font-semibold text-neutral-900">Admin</span>
              </div>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 py-4 px-2">
              <ul className="space-y-1">
                {updatedNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center py-2 rounded-md",
                        collapsed ? "px-2 justify-center" : "px-3",
                        item.current
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                      )}
                      aria-current={item.current ? "page" : undefined}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0 h-6 w-6",
                          collapsed ? "" : "mr-3",
                          item.current ? "text-primary-700" : "text-neutral-500 group-hover:text-neutral-700"
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="relative z-10 flex-shrink-0 h-16 bg-white shadow-sm flex">
          <button
            type="button"
            className="lg:hidden px-4 text-neutral-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="max-w-2xl w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative text-neutral-500 focus-within:text-neutral-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full bg-white border border-neutral-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:text-neutral-900 focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-600 focus:border-primary-600 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification button */}
              <button
                type="button"
                className="p-1 rounded-full text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                aria-label="View notifications"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
                {/* Dropdown menu, show/hide based on menu state */}
                {/* Dropdown implementation would go here */}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
