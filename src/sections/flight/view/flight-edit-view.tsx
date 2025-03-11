import type { IFlightItem } from 'src/types/flight';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FlightNewEditForm } from '../flight-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  flight?: IFlightItem;
};

export function FlightEditView({ flight }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.flight.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Flight', href: paths.dashboard.flight.root },
          { name: flight?.flightNumber },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FlightNewEditForm currentFlight={flight} />
    </DashboardContent>
  );
}
