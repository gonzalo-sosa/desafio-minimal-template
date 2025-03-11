import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));

// Flight
const FlightDetailsPage = lazy(() => import('src/pages/dashboard/flight/details'));
const FlightListPage = lazy(() => import('src/pages/dashboard/flight/list'));
const FlightCreatePage = lazy(() => import('src/pages/dashboard/flight/new'));
const FlightEditPage = lazy(() => import('src/pages/dashboard/flight/edit'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'flight',
        children: [
          { element: <FlightListPage />, index: true },
          { element: <FlightCreatePage />, path: 'new' },
          { element: <FlightDetailsPage />, path: ':flightNumber' },
          { element: <FlightEditPage />, path: ':flightNumber/edit' },
          { element: <FlightDetailsPage />, path: ':flightNumber/details' },
        ],
      },
    ],
  },
];
