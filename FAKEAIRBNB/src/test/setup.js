import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../firebase/firebaseConfig', () => {
  return {
    __esModule: true,
    default: {},   
    db: {},        
    auth: {},      
  };
});

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
  };
});

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({})),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  };
});