import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Paper,
  Container,
  Stack,
  Alert
} from '@mui/material';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Pill,
  Clock,
  Activity,
  ChevronLeft,
  AlertCircle,
  Heart,
  Stethoscope
} from 'lucide-react';
import { styled } from '@mui/material/styles';

// Styled components for custom styling
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: 'none',
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    background: 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)',
    borderRadius: '50%',
    transform: 'translate(50%, -50%)',
    opacity: 0.1,
    zIndex: 0,
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'consulted':
        return { bg: '#cce5ff', color: '#004085', border: '#74b9ff' };
      case 'prescribed':
        return { bg: '#e2d5f1', color: '#6f42c1', border: '#a29bfe' };
      case 'completed':
        return { bg: '#d4edda', color: '#155724', border: '#00b894' };
      default:
        return { bg: '#e9ecef', color: '#495057', border: '#ddd' };
    }
  };

  const colors = getStatusColor(status);
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `2px solid ${colors.border}`,
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    '& .MuiChip-icon': {
      color: colors.color,
    },
  };
});

const GradientBox = styled(Box)(({ gradient, theme }) => ({
  background: gradient,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

const PatientDetails = ({ patient, onBack }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadPatientData();
  }, [patient?.id]);

  const loadPatientData = async () => {
    try {
      const [prescriptionsData, historyData] = await Promise.all([
        new Promise(resolve => setTimeout(() => resolve([
          {
            id: 1,
            diagnosis: 'Hypertension',
            symptoms: 'High blood pressure, headaches, fatigue',
            medications: [
              { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' },
              { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take after meals' }
            ],
            labTests: 'Blood pressure monitoring, Lipid profile',
            followUpDate: '2024-02-15',
            notes: 'Patient advised to maintain low sodium diet',
            createdAt: new Date('2024-01-15')
          }
        ]), 1000)),
        new Promise(resolve => setTimeout(() => resolve([
          { id: 1, action: 'patient_registered', timestamp: new Date('2024-01-15'), userId: 'user123' },
          { id: 2, action: 'status_updated', timestamp: new Date('2024-01-15'), userId: 'user123' }
        ]), 1000))
      ]);

      setPrescriptions(prescriptionsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load patient data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <Clock size={16} />;
      case 'consulted': return <User size={16} />;
      case 'prescribed': return <Pill size={16} />;
      case 'completed': return <Activity size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <CircularProgress size={60} thickness={4} />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Heart size={24} color="#f44336" />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading patient details...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={onBack}
            startIcon={<ChevronLeft size={20} />}
            sx={{
              mb: 3,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                transform: 'translateX(-4px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Back to Patient List
          </Button>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stethoscope size={32} color="#1976d2" />
            <Typography
              variant="h3"
              sx={{
                background: 'linear-gradient(45deg, #1976d2 0%, #9c27b0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
              }}
            >
              Patient Details
            </Typography>
          </Stack>
        </Box>

        {/* Patient Header Card */}
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)',
                      fontSize: '2rem',
                    }}
                  >
                    <User size={40} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      {patient.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Token: #{patient.token}
                    </Typography>
                    <StatusChip
                      status={patient.status}
                      icon={getStatusIcon(patient.status)}
                      label={patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    Registered
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatDate(patient.createdAt)}
                  </Typography>
                  {patient.updatedAt && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {formatDate(patient.updatedAt)}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Tab Navigation */}
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
                textTransform: 'none',
              },
            }}
          >
            <Tab
              icon={<FileText size={20} />}
              label="Personal Information"
              iconPosition="start"
            />
            <Tab
              icon={<Pill size={20} />}
              label={`Prescriptions (${prescriptions.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<Calendar size={20} />}
              label={`Visit History (${history.length})`}
              iconPosition="start"
            />
          </Tabs>

          <CardContent sx={{ p: 4 }}>
            {activeTab === 0 && (
              <Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} lg={6}>
                    <GradientBox gradient="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)">
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <User size={24} style={{ marginRight: 12 }} />
                        Basic Information
                      </Typography>
                      <Stack spacing={2}>
                        {[
                          { icon: User, label: 'Name', value: patient.name },
                          { icon: Calendar, label: 'Age', value: `${patient.age} years` },
                          { icon: User, label: 'Gender', value: patient.gender },
                          { icon: Phone, label: 'Phone', value: patient.phone },
                          { icon: Mail, label: 'Email', value: patient.email || 'Not provided' }
                        ].map((item, index) => (
                          <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <item.icon size={20} color="#1976d2" style={{ marginRight: 16 }} />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.label}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {item.value}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </GradientBox>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <GradientBox gradient="linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)">
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <MapPin size={24} style={{ marginRight: 12 }} />
                        Contact Information
                      </Typography>
                      <Stack spacing={2}>
                        <Paper sx={{ p: 2 }}>
                          <MapPin size={20} color="#4caf50" style={{ marginBottom: 8 }} />
                          <Typography variant="body2" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {patient.address || 'Not provided'}
                          </Typography>
                        </Paper>
                        <Paper sx={{ p: 2 }}>
                          <Phone size={20} color="#4caf50" style={{ marginBottom: 8 }} />
                          <Typography variant="body2" color="text.secondary">
                            Emergency Contact
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {patient.emergencyContact || 'Not provided'}
                          </Typography>
                        </Paper>
                      </Stack>
                    </GradientBox>
                  </Grid>
                </Grid>

                <Grid container spacing={4} sx={{ mt: 2 }}>
                  <Grid item xs={12} lg={6}>
                    <GradientBox gradient="linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)">
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Heart size={24} style={{ marginRight: 12 }} />
                        Medical History
                      </Typography>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body1">
                          {patient.medicalHistory || 'No medical history recorded'}
                        </Typography>
                      </Paper>
                    </GradientBox>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <GradientBox gradient="linear-gradient(135deg, #fff3e0 0%, #ffcc02 30%)">
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <AlertCircle size={24} style={{ marginRight: 12 }} />
                        Allergies
                      </Typography>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body1">
                          {patient.allergies || 'No known allergies'}
                        </Typography>
                      </Paper>
                    </GradientBox>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <GradientBox gradient="linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)">
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Pill size={24} style={{ marginRight: 12 }} />
                      Current Medications
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1">
                        {patient.currentMedications || 'No current medications'}
                      </Typography>
                    </Paper>
                  </GradientBox>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {prescriptions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <Pill size={48} color="#9c27b0" />
                    </Avatar>
                    <Typography variant="h5" color="text.secondary">
                      No prescriptions found for this patient.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={4}>
                    {prescriptions.map((prescription) => (
                      <Card key={prescription.id} sx={{ border: 2, borderColor: 'secondary.light', borderRadius: 2 }}>
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4 }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Pill size={24} style={{ marginRight: 12 }} />
                              Prescription
                            </Typography>
                            <Chip
                              label={formatDate(prescription.createdAt)}
                              variant="outlined"
                              color="secondary"
                            />
                          </Box>

                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                              <Alert severity="error" sx={{ height: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Diagnosis
                                </Typography>
                                <Typography variant="body2">
                                  {prescription.diagnosis}
                                </Typography>
                              </Alert>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Alert severity="warning" sx={{ height: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Symptoms
                                </Typography>
                                <Typography variant="body2">
                                  {prescription.symptoms}
                                </Typography>
                              </Alert>
                            </Grid>
                          </Grid>

                          <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                              <Pill size={24} style={{ marginRight: 12 }} />
                              Medications
                            </Typography>
                            <Stack spacing={2}>
                              {prescription.medications.map((med, index) => (
                                <Paper key={index} sx={{ p: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {med.name}
                                    </Typography>
                                    <Chip label={med.dosage} color="primary" />
                                  </Box>
                                  <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                      <Paper sx={{ p: 2, backgroundColor: 'white' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Frequency:
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                          {med.frequency}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Paper sx={{ p: 2, backgroundColor: 'white' }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Duration:
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                          {med.duration}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                  {med.instructions && (
                                    <Paper sx={{ p: 2, backgroundColor: 'white' }}>
                                      <Typography variant="body2" fontStyle="italic">
                                        {med.instructions}
                                      </Typography>
                                    </Paper>
                                  )}
                                </Paper>
                              ))}
                            </Stack>
                          </Box>

                          {prescription.labTests && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <FileText size={20} style={{ marginRight: 8 }} />
                                Lab Tests
                              </Typography>
                              <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
                                <Typography variant="body1">
                                  {prescription.labTests}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          <Grid container spacing={3}>
                            {prescription.followUpDate && (
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                                  <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Calendar size={20} style={{ marginRight: 8 }} />
                                    Follow-up Date
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {new Date(prescription.followUpDate).toLocaleDateString('en-IN')}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}

                            {prescription.notes && (
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                                  <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FileText size={20} style={{ marginRight: 8 }} />
                                    Notes
                                  </Typography>
                                  <Typography variant="body1">
                                    {prescription.notes}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                {history.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                        mx: 'auto',
                        mb: 3,
                      }}
                    >
                      <Calendar size={48} color="#1976d2" />
                    </Avatar>
                    <Typography variant="h5" color="text.secondary">
                      No visit history found for this patient.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {history.map((visit) => (
                      <Paper key={visit.id} sx={{ p: 3, border: 2, borderColor: 'primary.light' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: 'linear-gradient(45deg, #1976d2 0%, #9c27b0 100%)',
                              mr: 3,
                              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" fontWeight="bold">
                                {visit.action.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                              <Chip
                                label={formatDate(visit.timestamp)}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              User ID: {visit.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PatientDetails;