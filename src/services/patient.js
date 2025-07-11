import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { logger } from './logger';

export class PatientService {
  constructor() {
    this.patientsCollection = collection(db, 'patients');
    this.visitsCollection = collection(db, 'visits');
    this.prescriptionsCollection = collection(db, 'prescriptions');
  }

  generateToken() {
    // Generate a unique token number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKN-${timestamp}-${random}`;
  }

  async addPatient(patientData, userId) {
    try {
      logger.info('Adding new patient', { patientData }, userId);
      
      const token = this.generateToken();
      const patient = {
        ...patientData,
        token,
        createdAt: serverTimestamp(),
        createdBy: userId,
        status: 'waiting'
      };
      
      const docRef = await addDoc(this.patientsCollection, patient);
      
      // Log the visit
      await this.logVisit(docRef.id, userId, 'registered');
      
      logger.activity('Patient added successfully', { 
        patientId: docRef.id, 
        token 
      }, userId);
      
      return { id: docRef.id, ...patient };
    } catch (error) {
      logger.error('Failed to add patient', { error: error.message, patientData }, userId);
      throw error;
    }
  }

  async updatePatientStatus(patientId, status, userId) {
    try {
      logger.info('Updating patient status', { patientId, status }, userId);
      
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });
      
      await this.logVisit(patientId, userId, `status_changed_to_${status}`);
      
      logger.activity('Patient status updated', { patientId, status }, userId);
    } catch (error) {
      logger.error('Failed to update patient status', { error: error.message, patientId, status }, userId);
      throw error;
    }
  }

  async getPatients(status = null) {
    try {
      let q = query(this.patientsCollection, orderBy('createdAt', 'desc'));
      
      if (status) {
        q = query(this.patientsCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      const patients = [];
      
      querySnapshot.forEach((doc) => {
        patients.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Retrieved patients', { count: patients.length, status });
      return patients;
    } catch (error) {
      logger.error('Failed to retrieve patients', { error: error.message, status });
      throw error;
    }
  }

  async getPatientById(patientId) {
    try {
      const patientDoc = await getDoc(doc(db, 'patients', patientId));
      
      if (patientDoc.exists()) {
        const patient = { id: patientDoc.id, ...patientDoc.data() };
        logger.info('Retrieved patient by ID', { patientId });
        return patient;
      } else {
        logger.warn('Patient not found', { patientId });
        return null;
      }
    } catch (error) {
      logger.error('Failed to retrieve patient', { error: error.message, patientId });
      throw error;
    }
  }

  async addPrescription(patientId, prescriptionData, doctorId) {
    try {
      logger.info('Adding prescription', { patientId, prescriptionData }, doctorId);
      
      const prescription = {
        patientId,
        doctorId,
        ...prescriptionData,
        createdAt: serverTimestamp(),
        status: 'active'
      };
      
      const docRef = await addDoc(this.prescriptionsCollection, prescription);
      
      // Update patient status
      await this.updatePatientStatus(patientId, 'prescribed', doctorId);
      
      await this.logVisit(patientId, doctorId, 'prescribed');
      
      logger.activity('Prescription added successfully', { 
        prescriptionId: docRef.id, 
        patientId 
      }, doctorId);
      
      return { id: docRef.id, ...prescription };
    } catch (error) {
      logger.error('Failed to add prescription', { error: error.message, patientId, prescriptionData }, doctorId);
      throw error;
    }
  }

  async getPrescriptions(patientId) {
    try {
      const q = query(
        this.prescriptionsCollection, 
        where('patientId', '==', patientId), 
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const prescriptions = [];
      
      querySnapshot.forEach((doc) => {
        prescriptions.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Retrieved prescriptions', { patientId, count: prescriptions.length });
      return prescriptions;
    } catch (error) {
      logger.error('Failed to retrieve prescriptions', { error: error.message, patientId });
      throw error;
    }
  }

  async logVisit(patientId, userId, action) {
    try {
      const visit = {
        patientId,
        userId,
        action,
        timestamp: serverTimestamp()
      };
      
      await addDoc(this.visitsCollection, visit);
      logger.info('Visit logged', { patientId, action }, userId);
    } catch (error) {
      logger.error('Failed to log visit', { error: error.message, patientId, action }, userId);
    }
  }

  async getPatientHistory(patientId) {
    try {
      const q = query(
        this.visitsCollection, 
        where('patientId', '==', patientId), 
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Retrieved patient history', { patientId, count: history.length });
      return history;
    } catch (error) {
      logger.error('Failed to retrieve patient history', { error: error.message, patientId });
      throw error;
    }
  }
}

export const patientService = new PatientService();
export default patientService;