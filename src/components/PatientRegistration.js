import React, { useState } from 'react';
import { patientService } from '../services/patient';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Favorite as HeartIcon,
  Warning as AlertIcon,
  Medication as PillIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon
} from '@mui/icons-material';

// Styled components
const RootContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
}));

const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
}));

const HeaderAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  background: 'rgba(255,255,255,0.2)',
  margin: '0 auto 16px',
  fontSize: '2rem',
}));

const FormCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
  '& .MuiInputLabel-asterisk': {
    color: theme.palette.error.main,
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  border: 'none',
  padding: theme.spacing(2, 4),
  borderRadius: 8,
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 10px 4px rgba(33, 203, 243, 0.3)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const PatientRegistration = ({ onPatientAdded, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validate required fields
    if (!formData.name || !formData.age || !formData.gender || !formData.phone) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Save to Firestore
    await patientService.addPatient(formData, userId);

    // Reset form
    setFormData({
      name: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: ''
    });

    if (onPatientAdded) onPatientAdded();
    setSuccess('Patient registered successfully!');
    setTimeout(() => setSuccess(''), 3000);

  } catch (error) {
    setError('Failed to register patient: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <RootContainer>
      <Container maxWidth="lg">
        {/* Header */}
        <HeaderCard elevation={0}>
          <HeaderContent>
            <HeaderAvatar>
              <PersonIcon fontSize="large" />
            </HeaderAvatar>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Patient Registration
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Add a new patient to the system
            </Typography>
          </HeaderContent>
        </HeaderCard>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Main Form */}
        <FormCard>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <SectionHeader>
              <PersonIcon sx={{ color: '#2196F3', fontSize: 28 }} />
              <SectionTitle>Personal Information</SectionTitle>
            </SectionHeader>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  required
                  variant="outlined"
                  inputProps={{ min: 1, max: 120 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="">Select gender</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </StyledTextField>
              </Grid>
            </Grid>

            {/* Contact Information Section */}
            <SectionHeader>
              <PhoneIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
              <SectionTitle>Contact Information</SectionTitle>
            </SectionHeader>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact number"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  variant="outlined"
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Medical Information Section */}
            <SectionHeader>
              <HeartIcon sx={{ color: '#F44336', fontSize: 28 }} />
              <SectionTitle>Medical Information</SectionTitle>
            </SectionHeader>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Medical History"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  placeholder="Enter medical history"
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Current Medications"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  placeholder="Enter current medications"
                  variant="outlined"
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <PillIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Enter known allergies"
                  variant="outlined"
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <AlertIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box sx={{ pt: 3, display: 'flex', justifyContent: 'center' }}>
              <SubmitButton
                type="submit"
                disabled={loading}
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonIcon />}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Registering Patient...' : 'Register Patient'}
              </SubmitButton>
            </Box>
          </Box>
        </FormCard>
      </Container>
    </RootContainer>
  );
};

export default PatientRegistration;