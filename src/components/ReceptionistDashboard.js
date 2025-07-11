import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Container,
  Avatar,
  Divider
} from '@mui/material';
import {
  People,
  Schedule,
  LocalPharmacy,
  AttachMoney,
  PersonAdd,
  Receipt
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { patientService } from '../services/patient';
import { billingService } from '../services/billing';
import { logger } from '../services/logger';

import PatientRegistration from './PatientRegistration';
import PatientList from './PatientList';
import BillingComponent from './BillingComponent';
import Header from './Header';
import { auth } from '../firebase/config';

const ReceptionistDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    prescribedPatients: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadPatients();
    loadStats();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const patientsData = await patientService.getPatients();
      setPatients(patientsData);
      logger.info('Patients loaded in receptionist dashboard', { count: patientsData.length });
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
      const prescribedPatients = allPatients.filter(p => p.status === 'prescribed');
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const billReport = await billingService.generateBillReport(startOfDay, endOfDay);
      
      setStats({
        totalPatients: allPatients.length,
        waitingPatients: waitingPatients.length,
        prescribedPatients: prescribedPatients.length,
        totalRevenue: billReport.totalRevenue
      });
    } catch (error) {
      logger.error('Failed to load stats', { error: error.message });
    }
  };

  const handlePatientAdded = () => {
    loadPatients();
    loadStats();
    toast.success('Patient registered successfully!');
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

  const StatCard = ({ icon: Icon, title, value, color = 'primary' }) => (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            <Icon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h3" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header 
        user={user} 
        userRole="receptionist" 
        onLogout={handleLogout} 
      />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={People}
              title="Total Patients"
              value={stats.totalPatients}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={Schedule}
              title="Waiting Patients"
              value={stats.waitingPatients}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={LocalPharmacy}
              title="Prescribed Patients"
              value={stats.prescribedPatients}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AttachMoney}
              title="Today's Revenue"
              value={`₹${stats.totalRevenue}`}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<People />}
              label="Patient List"
              id="tab-0"
              aria-controls="tabpanel-0"
              sx={{ textTransform: 'none', fontWeight: 'medium' }}
            />
            <Tab
              icon={<PersonAdd />}
              label="Register Patient"
              id="tab-1"
              aria-controls="tabpanel-1"
              sx={{ textTransform: 'none', fontWeight: 'medium' }}
            />
            <Tab
              icon={<Receipt />}
              label="Billing"
              id="tab-2"
              aria-controls="tabpanel-2"
              sx={{ textTransform: 'none', fontWeight: 'medium' }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper elevation={2} sx={{ minHeight: '500px' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 10 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              <TabPanel value={activeTab} index={0}>
                <PatientList 
                  patients={patients} 
                  onPatientUpdate={loadPatients}
                  userRole="receptionist"
                  userId={authService.getCurrentUser()?.uid}
                />
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                <PatientRegistration 
                  onPatientAdded={handlePatientAdded}
                  userId={user.uid}
                />
              </TabPanel>
              
              <TabPanel value={activeTab} index={2}>
                <BillingComponent 
                  patients={patients}
                  userId={user.uid}
                />
              </TabPanel>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ReceptionistDashboard;