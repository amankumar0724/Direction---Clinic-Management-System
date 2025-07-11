import React, { useState } from 'react';
import { patientService } from '../services/patient';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Avatar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Paper,
  Backdrop,
  CircularProgress,
  Container,
  Stack,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';

const PatientList = ({ patients, onPatientUpdate, onPatientSelect, userRole, userId}) => {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample patients data for demonstration
  const dataPatients = patients || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'warning';
      case 'consulted': return 'info';
      case 'prescribed': return 'secondary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return <ScheduleIcon sx={{ fontSize: 16 }} />;
      case 'consulted': return <PersonIcon sx={{ fontSize: 16 }} />;
      case 'prescribed': return <TimelineIcon sx={{ fontSize: 16 }} />;
      case 'completed': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      default: return <ScheduleIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'consulted': return 'Consulted';
      case 'prescribed': return 'Prescribed';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleStatusChange = async (patientId, newStatus) => {
  setLoading(true);
  try {
    await patientService.updatePatientStatus(patientId, newStatus, userId); // <-- actual update
    onPatientUpdate && onPatientUpdate(); // optional UI refresh
  } catch (error) {
    console.error('Failed to update patient status', error);
  } finally {
    setLoading(false);
  }
};



  const filteredPatients = dataPatients.filter(patient => {
    const matchesFilter = filter === 'all' || patient.status === filter;
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

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

  const getFilterCount = (status) => {
    return dataPatients.filter(p => status === 'all' || p.status === status).length;
  };

  const filterButtons = [
    { key: 'all', label: 'All', color: 'primary' },
    { key: 'waiting', label: 'Waiting', color: 'warning' },
    { key: 'consulted', label: 'Consulted', color: 'info' },
    { key: 'prescribed', label: 'Prescribed', color: 'secondary' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary">
                Patient Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Manage and track patient appointments
              </Typography>
            </Box>
            <Paper
              elevation={1}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                backgroundColor: 'white'
              }}
            >
              <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>
                {dataPatients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              placeholder="Search patients by name, token, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filterButtons.map((button) => (
                <Button
                  key={button.key}
                  variant={filter === button.key ? 'contained' : 'outlined'}
                  color={filter === button.key ? button.color : 'inherit'}
                  onClick={() => setFilter(button.key)}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    fontWeight: 'medium'
                  }}
                >
                  {button.label} ({getFilterCount(button.key)})
                </Button>
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Patient Grid */}
        <Grid container spacing={3}>
          {filteredPatients.length === 0 ? (
            <Grid item xs={12}>
              <Paper
                elevation={1}
                sx={{
                  py: 8,
                  textAlign: 'center',
                  backgroundColor: 'white'
                }}
              >
                <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No patients found for the selected filter.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredPatients.map((patient) => (
              <Grid item xs={12} md={6} lg={4} key={patient.id}>
                <Card
                  elevation={1}
                  sx={{
                    height: '100%',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Patient Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="text.primary">
                            {patient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            Token: #{patient.token}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(patient.status)}
                        label={getStatusText(patient.status)}
                        color={getStatusColor(patient.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Patient Details */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mr: 1 }}>
                          Age:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {patient.age} years
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mr: 1 }}>
                          Gender:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {patient.gender}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mr: 1 }}>
                          Phone:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {patient.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mr: 1 }}>
                          Registered:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {formatDate(patient.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                      {userRole === 'doctor' && (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => onPatientSelect && onPatientSelect(patient)}
                            size="small"
                            sx={{ flex: 1 }}
                          >
                            View Details
                          </Button>
                          {patient.status === 'waiting' && (
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleStatusChange(patient.id, 'consulted')}
                              disabled={loading}
                              size="small"
                            >
                              Consult
                            </Button>
                          )}
                        </>
                      )}
                      
                      {userRole === 'receptionist' && (
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={patient.status}
                            label="Status"
                            onChange={(e) => handleStatusChange(patient.id, e.target.value)}
                            disabled={loading}
                          >
                            <MenuItem value="waiting">Waiting</MenuItem>
                            <MenuItem value="consulted">Consulted</MenuItem>
                            <MenuItem value="prescribed">Prescribed</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          open={loading}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              color: 'text.primary'
            }}
          >
            <CircularProgress color="primary" sx={{ mr: 2 }} />
            <Typography variant="body1">
              Updating patient status...
            </Typography>
          </Paper>
        </Backdrop>
      </Container>
    </Box>
  );
};

export default PatientList;