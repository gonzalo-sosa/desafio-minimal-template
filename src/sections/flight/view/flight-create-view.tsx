import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FlightNewEditForm } from '../flight-new-edit-form';

// ----------------------------------------------------------------------

export function FlightCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new flight"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Flight', href: paths.dashboard.flight.root },
          { name: 'New flight' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FlightNewEditForm />
    </DashboardContent>
  );
}
