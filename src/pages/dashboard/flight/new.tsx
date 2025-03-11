import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { FlightCreateView } from 'src/sections/flight/view';

// ----------------------------------------------------------------------

const metadata = { title: `Create a new flight | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FlightCreateView />
    </>
  );
}
