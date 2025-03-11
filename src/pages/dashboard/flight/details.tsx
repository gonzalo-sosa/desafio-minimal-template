import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetFlight } from 'src/actions/flight';

import { FlightDetailsView } from 'src/sections/flight/view';

// ----------------------------------------------------------------------

const metadata = { title: `Flight details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { flight, flightLoading, flightError } = useGetFlight(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FlightDetailsView flight={flight} loading={flightLoading} error={flightError} />
    </>
  );
}
