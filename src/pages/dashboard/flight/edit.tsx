import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetFlight } from 'src/actions/flight';

import { FlightEditView } from 'src/sections/flight/view';

// ----------------------------------------------------------------------

const metadata = { title: `Flight edit | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const { flight } = useGetFlight(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FlightEditView flight={flight} />
    </>
  );
}
