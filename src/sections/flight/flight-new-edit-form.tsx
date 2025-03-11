import type { IFlightItem } from 'src/types/flight';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import {
  FLIGHT_SORT_OPTIONS,
  FLIGHT_TAXES_OPTIONS,
  FLIGHT_NUMBER_OPTIONS,
  FLIGHT_STATUS_OPTIONS,
  FLIGHT_AIRLINE_OPTIONS,
  FLIGHT_COUNTRY_OPTIONS,
  FLIGHT_DELAYED_OPTIONS,
  FLIGHT_QUANTITY_OPTIONS,
  FLIGHT_PRICE_RANGE_OPTIONS,
} from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewFlightSchemaType = zod.infer<typeof NewFlightSchema>;

export const NewFlightSchema = zod.object({
  flightNumber: zod
    .string({ required_error: 'Flight number is required!' })
    .min(6, { message: 'Flight number must be at least 6 characters' })
    .max(8, { message: 'Flight number must be less than 8 characters' })
    .regex(/^[0-9]{1}[A-Z]{1}[0-9]{4,6}$|^[A-Z]{2}[0-9]{4,6}$/, {
      message: 'Invalid flight number format!',
    }),
  arrivalTime: zod
    .date()
    .or(zod.string().datetime())
    .refine((date) => new Date(date) > new Date(), {
      message: 'Arrival time must be in the future',
    }),
  airline: zod
    .string({ required_error: 'Airline is required!' })
    .min(3, { message: 'Airline is required!' })
    .max(300, {
      message: 'Airline must be less than 300 characters',
    }),
  delayed: zod.boolean(),
  price: schemaHelper.nullableInput(
    zod.number({ coerce: true }).min(1, { message: 'Price must be at least $1!' }),
    { message: 'Price is required!' }
  ),
  capacity: schemaHelper.nullableInput(
    zod.number({ coerce: true }).min(1, { message: 'Capacity must be at least 1!' }),
    { message: 'Capacity is required!' }
  ),
  countryFrom: zod
    .string({ required_error: 'Country from is required!' })
    .min(2, { message: 'Country from is required!' }),
  countryDestination: zod
    .string({ required_error: 'Country destination is required!' })
    .min(2, { message: 'Country destination is required!' }),
  taxes: zod.number({ coerce: true }).nullable(),
});

// ----------------------------------------------------------------------

type Props = {
  currentFlight?: IFlightItem;
};

export function FlightNewEditForm({ currentFlight }: Props) {
  const router = useRouter();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const defaultValues: NewFlightSchemaType = {
    flightNumber: currentFlight?.flightNumber || '',
    arrivalTime: currentFlight?.arrivalTime || new Date(),
    airline: currentFlight?.airline || FLIGHT_AIRLINE_OPTIONS[0].value,
    delayed: currentFlight?.delayed || false,
    price: currentFlight?.price || null,
    capacity: currentFlight?.capacity || null,
    countryFrom: currentFlight?.countryFrom || FLIGHT_COUNTRY_OPTIONS[0].value,
    countryDestination: currentFlight?.countryDestination || FLIGHT_COUNTRY_OPTIONS[1].value,
    taxes: currentFlight?.taxes || 0,
  };

  const methods = useForm<NewFlightSchemaType>({
    resolver: zodResolver(NewFlightSchema),
    defaultValues,
    values: currentFlight,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const totalPrice = values.price ?? 0 * (1 + (values.taxes ?? 0) / 100);

  const onSubmit = handleSubmit(async (data) => {
    const updatedData = {
      ...data,
      taxes: includeTaxes ? defaultValues.taxes : data.taxes,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentFlight ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.flight.root);
      console.info('DATA', updatedData);
    } catch (error) {
      console.error(error);
    }
  });

  const handleSubmitWithConfirmation = () => {
    if (currentFlight) {
      if (window.confirm('Are you sure you want to update this flight?')) {
        onSubmit();
      }
    } else {
      onSubmit();
    }
  };

  const handleChangeIncludeTaxes = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = () => (
    <Card>
      <CardHeader title="Details" subheader="Flight Number" sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="flightNumber"
          label="Flight Number"
          slotProps={{
            input: {
              endAdornment: (
                <Tooltip title="Format: 4M1234, AU3441, or AO123456">
                  <Iconify icon="eva:info-outline" width={16} sx={{ ml: 1 }} />
                </Tooltip>
              ),
            },
          }}
        />

        <Field.Autocomplete
          name="airline"
          label="Airline"
          options={FLIGHT_AIRLINE_OPTIONS}
          isOptionEqualToValue={(option, value) => option.value === value}
        />
      </Stack>
    </Card>
  );

  const renderProperties = () => (
    <Card>
      <CardHeader title="Properties" subheader="Additional attributes..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          sx={{
            rowGap: 3,
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
          }}
        >
          <Field.Text
            name="capacity"
            label="Capacity (passengers)"
            placeholder="0"
            type="number"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Field.Autocomplete
            name="countryFrom"
            label="Country from"
            options={FLIGHT_COUNTRY_OPTIONS}
            isOptionEqualToValue={(option, value) => option.value === value}
          />

          <Field.Autocomplete
            name="countryDestination"
            label="Country destination"
            options={FLIGHT_COUNTRY_OPTIONS}
            isOptionEqualToValue={(option, value) => option.value === value}
          />

          <Field.DatePicker name="arrivalTime" label="Arrival Time" />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(watch('delayed'))}
                onChange={(event) => setValue('delayed', event.target.checked)}
              />
            }
            label="Delayed"
          />

          <FormControlLabel
            control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
            label="Include Taxes"
          />
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Stack>
    </Card>
  );

  const renderPricing = () => (
    <Card>
      <CardHeader title="Pricing" subheader="Price related inputs" sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="price"
          label="Regular price"
          placeholder="0.00"
          type="number"
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.75 }}>
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    $
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ typography: 'body1', color: 'text.secondary', mt: 1 }}>
          Total Price (incl. taxes): {fCurrency(totalPrice)}
        </Box>

        <FormControlLabel
          control={
            <Switch id="toggle-taxes" checked={includeTaxes} onChange={handleChangeIncludeTaxes} />
          }
          label="Price includes taxes"
        />

        {!includeTaxes && (
          <Field.Text
            name="taxes"
            label="Tax (%)"
            placeholder="0.00"
            type="number"
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.75 }}>
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </Stack>
    </Card>
  );

  const renderActions = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        label="Publish"
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <LoadingButton
        type="submit"
        variant="contained"
        size="large"
        loading={isSubmitting}
        onClick={handleSubmitWithConfirmation}
      >
        {!currentFlight ? 'Create flight' : 'Save changes'}
      </LoadingButton>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={handleSubmitWithConfirmation}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {renderProperties()}
        {renderPricing()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
