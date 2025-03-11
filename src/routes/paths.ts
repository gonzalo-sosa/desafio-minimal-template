const MOCK_ID = Math.floor(Date.now() * Math.random());

// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,

    flight: {
      root: `${ROOTS.DASHBOARD}/flight`,
      new: `${ROOTS.DASHBOARD}/flight/new`,
      details: (flightNumber: string) => `${ROOTS.DASHBOARD}/flight/${flightNumber}`,
      edit: (flightNumber: string) => `${ROOTS.DASHBOARD}/flight/${flightNumber}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/flight/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/flight/${MOCK_ID}/edit`,
      },
    },
  },
  // FLIGHT
  flight: {
    root: `${ROOTS.DASHBOARD}/flight`,
    details: (flightNumber: string) => `${ROOTS.DASHBOARD}/flight/${flightNumber}`,
    demo: { details: `/flight/${MOCK_ID}` },
  },
};
