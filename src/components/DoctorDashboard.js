import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { patientService } from '../services/patient';
import { logger } from '../services/logger';

// Material-UI imports
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  List as ListIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';

import PatientList from './PatientList';
import PrescriptionForm from './PrescriptionForm';
import PatientDetails from './PatientDetails.js';
import Header from './Header';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const WelcomeSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  color: 'white',
}));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  opacity: 0.9,
  fontWeight: 300,
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
  },
}));

const StatIconWrapper = styled(Box)(({ theme, bgcolor }) => ({
  width: 60,
  height: 60,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor,
  marginRight: theme.spacing(2),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  margin: 0,
  color: '#1a1a1a',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#666',
  fontWeight: 500,
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
}));

const TabContent = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  minHeight: 400,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  color: '#666',
}));

const DoctorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    consultedPatients: 0,
    prescribedPatients: 0
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadPatients();
    loadStats();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const patientsData = await patientService.getPatients();
      setPatients(patientsData);
      logger.info('Patients loaded in doctor dashboard', { count: patientsData.length });
    } catch (error) {
      toast.error('Failed to load patients');
      logger.error('Failed to load patients in dashboard', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const allPatients = await patientService.getPatients();
      const waitingPatients = allPatients.filter(p => p.status === 'waiting');
      const consultedPatients = allPatients.filter(p => p.status === 'consulted');
      const prescribedPatients = allPatients.filter(p => p.status === 'prescribed');
      
      setStats({
        totalPatients: allPatients.length,
        waitingPatients: waitingPatients.length,
        consultedPatients: consultedPatients.length,
        prescribedPatients: prescribedPatients.length
      });
    } catch (error) {
      logger.error('Failed to load stats', { error: error.message });
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setActiveTab(1);
  };

  const handlePrescriptionAdded = () => {
    loadPatients();
    loadStats();
    toast.success('Prescription added successfully!');
    setActiveTab(0);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const StatCard = ({ icon, value, label, color = '#2196f3' }) => (
    <StatsCard>
      <CardContent>
        <Box display="flex" alignItems="center">
          <StatIconWrapper bgcolor={`${color}20`}>
            <Box component="span" sx={{ fontSize: '1.5rem', color }}>
              {icon}
            </Box>
          </StatIconWrapper>
          <Box>
            <StatValue>{value}</StatValue>
            <StatLabel>{label}</StatLabel>
          </Box>
        </Box>
      </CardContent>
    </StatsCard>
  );

  const getTabValue = () => {
    if (!selectedPatient) return 0;
    return activeTab;
  };

  return (
    <DashboardContainer>
      <Header 
        user={user} 
        userRole="doctor" 
        onLogout={handleLogout} 
      />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeTitle variant="h2">
            Welcome back, Dr. {user?.displayName || 'Doctor'}
          </WelcomeTitle>
          <WelcomeSubtitle variant="h6">
            Manage your patients and prescriptions efficiently
          </WelcomeSubtitle>
        </WelcomeSection>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={<PeopleIcon />}
              value={stats.totalPatients} 
              label="Total Patients" 
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={<ScheduleIcon />}
              value={stats.waitingPatients} 
              label="Waiting Patients" 
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={<MedicalIcon />}
              value={stats.consultedPatients} 
              label="Consulted Today" 
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={<MedicationIcon />}
              value={stats.prescribedPatients} 
              label="Prescribed Today" 
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <TabsContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Tabs 
              value={getTabValue()} 
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                },
              }}
            >
              <Tab 
                icon={<ListIcon />} 
                label="Patient List" 
                iconPosition="start"
              />
              {selectedPatient && (
                <Tab 
                  icon={<PersonIcon />} 
                  label="Patient Details" 
                  iconPosition="start"
                />
              )}
              {selectedPatient && (
                <Tab 
                  icon={<AddIcon />} 
                  label="Add Prescription" 
                  iconPosition="start"
                />
              )}
            </Tabs>
            
            {selectedPatient && (
              <Chip
                avatar={<Avatar sx={{ bgcolor: '#667eea' }}>P</Avatar>}
                label={`Selected: ${selectedPatient.name}`}
                variant="outlined"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        </TabsContainer>

        {/* Tab Content */}
        <TabContent>
          {loading ? (
            <LoadingContainer>
              <CircularProgress size={40} sx={{ mb: 2, color: '#667eea' }} />
              <Typography variant="body1" color="textSecondary">
                Loading patients...
              </Typography>
            </LoadingContainer>
          ) : (
            <>
              {activeTab === 0 && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <PatientList 
                    patients={patients} 
                    onPatientUpdate={loadPatients}
                    onPatientSelect={handlePatientSelect}
                    userRole="doctor"
                  />
                </Box>
              )}
              
              {activeTab === 1 && selectedPatient && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <PatientDetails 
                    patient={selectedPatient}
                    onBack={() => setActiveTab(0)}
                  />
                </Box>
              )}
              
              {activeTab === 2 && selectedPatient && (
                <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <PrescriptionForm 
                    patient={selectedPatient}
                    doctorId={user.uid}
                    onPrescriptionAdded={handlePrescriptionAdded}
                  />
                </Box>
              )}
            </>
          )}
        </TabContent>
      </Container>
    </DashboardContainer>
  );
};

export default DoctorDashboard;