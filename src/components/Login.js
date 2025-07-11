import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { logger } from '../services/logger';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'receptionist'
  });
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userData;
      if (isSignup) {
        userData = await authService.register(
          formData.email,
          formData.password,
          formData.role
        );
        toast.success('Account created successfully!');
      } else {
        userData = await authService.login(formData.email, formData.password);
        toast.success('Login successful!');
      }

      logger.activity(isSignup ? 'User registered' : 'User logged in', {
        email: formData.email,
        role: userData.role
      });

      onLogin(userData);
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
      logger.error('Authentication error', { error: error.message, formData });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="primary"
              mb={1}
            >
              Direction Clinic
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isSignup ? 'Create your account' : 'Sign in to your account'}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              margin="normal"
              variant="outlined"
            />

            <TextField
              fullWidth
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              margin="normal"
              variant="outlined"
            />

            {isSignup && (
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isSignup ? 'Sign Up' : 'Sign In'
              )}
            </Button>

            <Box textAlign="center" mt={2}>
              <Button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                variant="text"
                color="primary"
              >
                {isSignup ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </Button>
            </Box>
          </Box>

          {/* Demo Accounts Section */}
          <Box mt={4}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" textAlign="center" mb={2}>
              Demo Accounts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Doctor
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    doctor@clinic.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    password123
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    Receptionist
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    receptionist@clinic.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    password123
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;