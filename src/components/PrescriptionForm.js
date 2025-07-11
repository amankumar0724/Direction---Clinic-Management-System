import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Backdrop,
  Paper,
  Divider,
  Chip,
  FormHelperText
} from '@mui/material';
import {
  Person,
  Add,
  Delete,
  CalendarToday,
  Description,
  LocalPharmacy,
  Warning,
  CheckCircle,
  Assignment
} from '@mui/icons-material';

const PrescriptionForm = ({ patient, doctorId, onPrescriptionAdded }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    followUpDate: '',
    labTests: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sample patient data if not provided
  const samplePatient = patient || {
    id: 1,
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    token: 'A001'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
    
    // Clear medication errors
    if (errors.medications) {
      setErrors(prev => ({
        ...prev,
        medications: ''
      }));
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.symptoms.trim()) {
      newErrors.symptoms = 'Symptoms are required';
    }

    const validMedications = formData.medications.filter(med => 
      med.name && med.dosage && med.frequency && med.duration
    );

    if (validMedications.length === 0) {
      newErrors.medications = 'At least one complete medication is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const validMedications = formData.medications.filter(med => 
        med.name && med.dosage && med.frequency && med.duration
      );

      const prescriptionData = {
        ...formData,
        medications: validMedications,
        patientName: samplePatient.name,
        patientAge: samplePatient.age,
        patientGender: samplePatient.gender,
        createdAt: new Date().toISOString()
      };

      console.log('Prescription added:', prescriptionData);
      
      // Show success message
      if (onPrescriptionAdded) {
        onPrescriptionAdded();
      }
      
      // Reset form
      setFormData({
        diagnosis: '',
        symptoms: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: '',
        followUpDate: '',
        labTests: ''
      });
      
    } catch (error) {
      console.error('Failed to add prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'As needed'
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  Add Prescription
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create a new prescription for the patient
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date().toLocaleDateString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Patient Info Card */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', mr: 2 }}>
                <Person sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  {samplePatient.name}
                </Typography>
                <Box display="flex" gap={2} mt={1}>
                  <Chip label={`Age: ${samplePatient.age}`} variant="outlined" size="small" />
                  <Chip label={`Gender: ${samplePatient.gender}`} variant="outlined" size="small" />
                  <Chip label={`Token: #${samplePatient.token}`} variant="outlined" size="small" />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Prescription Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Diagnosis & Symptoms */}
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Description sx={{ color: 'error.main', mr: 2 }} />
                <Typography variant="h6" component="h3" fontWeight="bold">
                  Diagnosis & Symptoms
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Diagnosis *"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    error={!!errors.diagnosis}
                    helperText={errors.diagnosis}
                    placeholder="Enter primary diagnosis..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Symptoms *"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    error={!!errors.symptoms}
                    helperText={errors.symptoms}
                    placeholder="Describe patient symptoms..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                  <LocalPharmacy sx={{ color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    Medications
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={addMedication}
                  sx={{ textTransform: 'none' }}
                >
                  Add Medication
                </Button>
              </Box>

              {errors.medications && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.medications}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {formData.medications.map((medication, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 3, backgroundColor: '#fafafa' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Medication {index + 1}
                      </Typography>
                      {formData.medications.length > 1 && (
                        <IconButton
                          onClick={() => removeMedication(index)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Medicine Name *"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="Enter medicine name"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Dosage *"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Frequency *</InputLabel>
                          <Select
                            value={medication.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            label="Frequency *"
                          >
                            {frequencyOptions.map(option => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Duration *"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Instructions"
                          value={medication.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food, Take on empty stomach"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Assignment sx={{ color: 'success.main', mr: 2 }} />
                <Typography variant="h6" component="h3" fontWeight="bold">
                  Additional Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lab Tests Required"
                    name="labTests"
                    value={formData.labTests}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="List any lab tests required..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Follow-up Date"
                    name="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Enter any additional notes or instructions..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                  sx={{ 
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? 'Adding Prescription...' : 'Add Prescription'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box textAlign="center">
            <CircularProgress color="inherit" size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" component="h3" gutterBottom>
              Adding Prescription
            </Typography>
            <Typography variant="body2">
              Please wait while we save the prescription...
            </Typography>
          </Box>
        </Backdrop>
      </Container>
    </Box>
  );
};

export default PrescriptionForm;