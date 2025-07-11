import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { logger } from './logger';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
  }

  async login(email, password) {
    try {
      logger.info('User attempting login', { email });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      this.currentUser = user;
      this.userRole = userData?.role || 'receptionist';
      
      logger.activity('User logged in successfully', { 
        userId: user.uid, 
        email: user.email, 
        role: this.userRole 
      });
      
      return { user, role: this.userRole };
    } catch (error) {
      logger.error('Login failed', { error: error.message, email });
      throw error;
    }
  }

  async register(email, password, role, additionalData = {}) {
    try {
      logger.info('User attempting registration', { email, role });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user role and additional data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role,
        createdAt: new Date(),
        ...additionalData
      });
      
      this.currentUser = user;
      this.userRole = role;
      
      logger.activity('User registered successfully', { 
        userId: user.uid, 
        email: user.email, 
        role 
      });
      
      return { user, role };
    } catch (error) {
      logger.error('Registration failed', { error: error.message, email, role });
      throw error;
    }
  }

  async logout() {
    try {
      logger.activity('User logging out', { userId: this.currentUser?.uid });
      
      await signOut(auth);
      this.currentUser = null;
      this.userRole = null;
      
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        this.currentUser = user;
        this.userRole = userData?.role || 'receptionist';
        
        callback({ user, role: this.userRole });
      } else {
        this.currentUser = null;
        this.userRole = null;
        callback(null);
      }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserRole() {
    return this.userRole;
  }
}

export const authService = new AuthService();
export default authService;