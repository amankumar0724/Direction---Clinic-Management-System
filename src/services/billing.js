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

export class BillingService {
  constructor() {
    this.billsCollection = collection(db, 'bills');
    this.servicesCollection = collection(db, 'services');
  }

  async createBill(patientId, services, userId) {
    try {
      logger.info('Creating bill', { patientId, services }, userId);
      
      const totalAmount = services.reduce((total, service) => {
        return total + (service.price * service.quantity);
      }, 0);
      
      const bill = {
        patientId,
        services,
        totalAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: userId,
        billNumber: this.generateBillNumber()
      };
      
      const docRef = await addDoc(this.billsCollection, bill);
      
      logger.activity('Bill created successfully', { 
        billId: docRef.id, 
        patientId, 
        totalAmount 
      }, userId);
      
      return { id: docRef.id, ...bill };
    } catch (error) {
      logger.error('Failed to create bill', { error: error.message, patientId, services }, userId);
      throw error;
    }
  }

  generateBillNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BILL-${timestamp}-${random}`;
  }

  async updateBillStatus(billId, status, userId) {
    try {
      logger.info('Updating bill status', { billId, status }, userId);
      
      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: userId
      });
      
      logger.activity('Bill status updated', { billId, status }, userId);
    } catch (error) {
      logger.error('Failed to update bill status', { error: error.message, billId, status }, userId);
      throw error;
    }
  }

  async getBills(patientId = null, status = null) {
    try {
      let q = query(this.billsCollection, orderBy('createdAt', 'desc'));
      
      if (patientId && status) {
        q = query(
          this.billsCollection, 
          where('patientId', '==', patientId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      } else if (patientId) {
        q = query(
          this.billsCollection, 
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
      } else if (status) {
        q = query(
          this.billsCollection, 
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const bills = [];
      
      querySnapshot.forEach((doc) => {
        bills.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Retrieved bills', { count: bills.length, patientId, status });
      return bills;
    } catch (error) {
      logger.error('Failed to retrieve bills', { error: error.message, patientId, status });
      throw error;
    }
  }

  async getBillById(billId) {
    try {
      const billDoc = await getDoc(doc(db, 'bills', billId));
      
      if (billDoc.exists()) {
        const bill = { id: billDoc.id, ...billDoc.data() };
        logger.info('Retrieved bill by ID', { billId });
        return bill;
      } else {
        logger.warn('Bill not found', { billId });
        return null;
      }
    } catch (error) {
      logger.error('Failed to retrieve bill', { error: error.message, billId });
      throw error;
    }
  }

  async addService(serviceData, userId) {
    try {
      logger.info('Adding service', { serviceData }, userId);
      
      const service = {
        ...serviceData,
        createdAt: serverTimestamp(),
        createdBy: userId,
        status: 'active'
      };
      
      const docRef = await addDoc(this.servicesCollection, service);
      
      logger.activity('Service added successfully', { 
        serviceId: docRef.id, 
        serviceName: serviceData.name 
      }, userId);
      
      return { id: docRef.id, ...service };
    } catch (error) {
      logger.error('Failed to add service', { error: error.message, serviceData }, userId);
      throw error;
    }
  }

  async getServices() {
    try {
      const q = query(
        this.servicesCollection, 
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const services = [];
      
      querySnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() });
      });
      
      logger.info('Retrieved services', { count: services.length });
      return services;
    } catch (error) {
      logger.error('Failed to retrieve services', { error: error.message });
      throw error;
    }
  }

  async generateBillReport(startDate, endDate) {
    try {
      logger.info('Generating bill report', { startDate, endDate });
      
      const q = query(
        this.billsCollection,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bills = [];
      let totalRevenue = 0;
      
      querySnapshot.forEach((doc) => {
        const bill = { id: doc.id, ...doc.data() };
        bills.push(bill);
        if (bill.status === 'paid') {
          totalRevenue += bill.totalAmount;
        }
      });
      
      const report = {
        bills,
        totalBills: bills.length,
        totalRevenue,
        paidBills: bills.filter(b => b.status === 'paid').length,
        pendingBills: bills.filter(b => b.status === 'pending').length
      };
      
      logger.info('Bill report generated', { 
        totalBills: report.totalBills, 
        totalRevenue: report.totalRevenue 
      });
      
      return report;
    } catch (error) {
      logger.error('Failed to generate bill report', { error: error.message, startDate, endDate });
      throw error;
    }
  }
}

export const billingService = new BillingService();
export default billingService;