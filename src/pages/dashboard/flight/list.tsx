import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { FlightListView } from 'src/sections/flight/view';

// ----------------------------------------------------------------------

const metadata = { title: `Flight list | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FlightListView />
    </>
  );
}
