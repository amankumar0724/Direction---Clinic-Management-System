import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Container,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { billingService } from '../services/billing';
import { logger } from '../services/logger';

const BillingComponent = ({ patients, userId }) => {
  const [bills, setBills] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    category: 'consultation'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadBills();
    loadServices();
  }, []);

  const loadBills = async () => {
    try {
      const billsData = await billingService.getBills();
      setBills(billsData);
    } catch (error) {
      toast.error('Failed to load bills');
      logger.error('Failed to load bills', { error: error.message });
    }
  };

  const loadServices = async () => {
    try {
      const servicesData = await billingService.getServices();
      setServices(servicesData);
    } catch (error) {
      toast.error('Failed to load services');
      logger.error('Failed to load services', { error: error.message });
    }
  };

  const handleCreateBill = async () => {
    if (!selectedPatient || selectedServices.length === 0) {
      toast.error('Please select a patient and at least one service');
      return;
    }

    setLoading(true);
    try {
      await billingService.createBill(selectedPatient, selectedServices, userId);
      toast.success('Bill created successfully');
      setSelectedPatient('');
      setSelectedServices([]);
      setShowCreateBill(false);
      loadBills();
    } catch (error) {
      toast.error('Failed to create bill');
      logger.error('Failed to create bill', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      toast.error('Please fill in service name and price');
      return;
    }

    setLoading(true);
    try {
      await billingService.addService({
        ...newService,
        price: parseFloat(newService.price)
      }, userId);
      toast.success('Service added successfully');
      setNewService({ name: '', description: '', price: '', category: 'consultation' });
      setShowAddService(false);
      loadServices();
    } catch (error) {
      toast.error('Failed to add service');
      logger.error('Failed to add service', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      setSelectedServices(selectedServices.map(s => 
        s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
      ));
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }
  };

  const handleServiceRemove = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleQuantityChange = (serviceId, quantity) => {
    if (quantity <= 0) {
      handleServiceRemove(serviceId);
    } else {
      setSelectedServices(selectedServices.map(s => 
        s.id === serviceId ? { ...s, quantity } : s
      ));
    }
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'consultation': return '👨‍⚕️';
      case 'treatment': return '🏥';
      case 'diagnostic': return '🔬';
      case 'medicine': return '💊';
      default: return '📋';
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Billing Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage bills and services
            </Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              onClick={() => setShowCreateBill(!showCreateBill)}
              startIcon={<PaymentIcon />}
            >
              {showCreateBill ? 'Cancel' : 'Create New Bill'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowAddService(!showAddService)}
              startIcon={<AddIcon />}
            >
              {showAddService ? 'Cancel' : 'Add Service'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Create Bill Form */}
      <Collapse in={showCreateBill}>
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" justifyContent="center" width={32} height={32} bgcolor="primary.light" borderRadius="50%" mr={2}>
              <ReceiptIcon color="primary" />
            </Box>
            <Typography variant="h5" component="h2">
              Create New Bill
            </Typography>
          </Box>
          
          <Box sx={{ '& > *': { mb: 3 } }}>
            {/* Patient Selection */}
            <FormControl fullWidth>
              <InputLabel>Select Patient</InputLabel>
              <Select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                label="Select Patient"
              >
                <MenuItem value="">Choose a patient...</MenuItem>
                {patients.map(patient => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name} - Token: {patient.token}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Services Selection */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Select Services</Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="consultation">Consultation</MenuItem>
                      <MenuItem value="treatment">Treatment</MenuItem>
                      <MenuItem value="diagnostic">Diagnostic</MenuItem>
                      <MenuItem value="medicine">Medicine</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {filteredServices.map(service => (
                  <Grid item xs={12} sm={6} md={4} key={service.id}>
                    <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box display="flex" alignItems="flex-start">
                            <Box mr={1} fontSize="1.5rem">{getCategoryIcon(service.category)}</Box>
                            <Box>
                              <Typography variant="h6" component="h4" gutterBottom>
                                {service.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {service.category}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            ₹{service.price}
                          </Typography>
                        </Box>
                        {service.description && (
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {service.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleServiceSelect(service)}
                        >
                          Add to Bill
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <Paper elevation={0} sx={{ bgcolor: 'grey.50', p: 2 }}>
                <Typography variant="h6" mb={2}>Selected Services</Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  {selectedServices.map(service => (
                    <Paper key={service.id} elevation={1} sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Box mr={2} fontSize="1.5rem">{getCategoryIcon(service.category)}</Box>
                          <Box>
                            <Typography variant="h6">{service.name}</Typography>
                            <Typography variant="body2" color="text.secondary">₹{service.price} each</Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box display="flex" alignItems="center" sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(service.id, service.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ px: 2, py: 1, minWidth: 40, textAlign: 'center' }}>
                              {service.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(service.id, service.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="h6" sx={{ minWidth: 60 }}>
                            ₹{service.price * service.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleServiceRemove(service.id)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ₹{getTotalAmount()}
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Action Buttons */}
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="success"
                onClick={handleCreateBill}
                disabled={loading || !selectedPatient || selectedServices.length === 0}
                sx={{ flexGrow: 1 }}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating Bill...' : 'Create Bill'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowCreateBill(false)}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Add Service Form */}
      <Collapse in={showAddService}>
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" justifyContent="center" width={32} height={32} bgcolor="success.light" borderRadius="50%" mr={2}>
              <AddIcon color="success" />
            </Box>
            <Typography variant="h5" component="h2">
              Add New Service
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                placeholder="Enter service name"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: e.target.value})}
                placeholder="0.00"
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="treatment">Treatment</MenuItem>
                  <MenuItem value="diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="medicine">Medicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                placeholder="Enter service description"
              />
            </Grid>
          </Grid>
          
          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddService}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowAddService(false)}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Recent Bills */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" mb={3}>
          Recent Bills
        </Typography>
        
        {bills.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h1" component="div" sx={{ fontSize: '4rem', mb: 2 }}>
              💰
            </Typography>
            <Typography variant="h6" gutterBottom>
              No Bills Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No bills have been created yet. Create your first bill to get started.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bills.map(bill => (
              <Grid item xs={12} sm={6} md={4} key={bill.id}>
                <Card elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Bill #{bill.billNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(bill.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        color={getStatusColor(bill.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ '& > *': { mb: 1 } }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Patient:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {patients.find(p => p.id === bill.patientId)?.name || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Services:</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {bill.services.length} items
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Total:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{bill.totalAmount}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  {bill.status !== 'paid' && (
                    <CardActions>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        onClick={() => billingService.updateBillStatus(bill.id, 'paid', userId)}
                      >
                        Mark as Paid
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default BillingComponent;