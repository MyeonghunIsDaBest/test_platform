import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday,
  Schedule,
  VideoCall,
  Payment,
  CheckCircle,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Professional, Listing } from '../../types';

const bookingSchema = z.object({
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
  customAnswer: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  professional: Professional;
  listing: Listing;
  onSubmit?: (data: BookingFormData) => Promise<void>;
  loading?: boolean;
}

const steps = ['Select Date & Time', 'Add Details', 'Confirm & Pay'];

const BookingForm: React.FC<BookingFormProps> = ({
  open,
  onClose,
  professional,
  listing,
  onSubmit,
  loading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: '',
      time: '',
      notes: '',
      customAnswer: '',
    },
  });

  const watchedDate = watch('date');
  const watchedTime = watch('time');

  // Generate available dates (next 30 days)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = addDays(new Date(), i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };

  // Generate available times for selected date
  const getAvailableTimesForDate = (date: string) => {
    // Mock available times - replace with actual availability logic
    const times = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];
    return times;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setValue('date', date);
    setValue('time', ''); // Reset time when date changes
    setAvailableTimes(getAvailableTimesForDate(date));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      reset();
      setActiveStep(0);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleClose = () => {
    reset();
    setActiveStep(0);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Date & Time
            </Typography>
            
            {/* Date Selection */}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Choose a date:
            </Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {getAvailableDates().slice(0, 14).map((date) => (
                <Grid item xs={6} sm={4} md={3} key={date}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedDate === date ? 2 : 1,
                      borderColor: selectedDate === date ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                    onClick={() => handleDateSelect(date)}
                  >
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {format(parseISO(date), 'EEE')}
                      </Typography>
                      <Typography variant="h6">
                        {format(parseISO(date), 'dd')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(parseISO(date), 'MMM')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Time Selection */}
            {selectedDate && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Choose a time:
                </Typography>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.time}>
                      <InputLabel>Select Time</InputLabel>
                      <Select {...field} label="Select Time">
                        {availableTimes.map((time) => (
                          <MenuItem key={time} value={time}>
                            {time}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  placeholder="Tell the professional about your needs or any specific requirements..."
                  margin="normal"
                />
              )}
            />

            {/* Custom question if listing has one */}
            <Controller
              name="customAnswer"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="What specific help do you need?"
                  multiline
                  rows={2}
                  margin="normal"
                />
              )}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Your Booking
            </Typography>
            
            {/* Professional Info */}
            <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
              <Avatar src={professional.user.avatar} sx={{ width: 48, height: 48 }}>
                {professional.user.firstName[0]}{professional.user.lastName[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {professional.user.firstName} {professional.user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.title}
                </Typography>
              </Box>
            </Box>

            {/* Booking Details */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Booking Details:
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">
                  {watchedDate && format(parseISO(watchedDate), 'EEEE, MMMM dd, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Schedule fontSize="small" color="action" />
                <Typography variant="body2">
                  {watchedTime} ({listing.duration} minutes)
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <VideoCall fontSize="small" color="action" />
                <Typography variant="body2">
                  Video consultation
                </Typography>
              </Box>
            </Box>

            {/* Pricing */}
            <Box p={2} bgcolor="primary.50" borderRadius={1} mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  Service fee ({listing.duration} min)
                </Typography>
                <Typography variant="body2">
                  ₱{listing.price}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  Platform fee
                </Typography>
                <Typography variant="body2">
                  ₱{Math.round(listing.price * 0.1)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  ₱{listing.price + Math.round(listing.price * 0.1)}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              Payment will be processed from your wallet. Make sure you have sufficient balance.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <VideoCall color="primary" />
          <Typography variant="h6">
            Book Appointment
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {renderStepContent()}
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && (!watchedDate || !watchedTime)) ||
              loading
            }
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting || loading}
            startIcon={<Payment />}
          >
            {isSubmitting || loading ? 'Processing...' : 'Confirm & Pay'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BookingForm;
