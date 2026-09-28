import { Platform } from 'react-native';

// When using Android emulator, localhost points to the emulator itself.
// We need to use 10.0.2.2 to point to the host machine's localhost.
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

// For this assignment, we are hardcoding the IDs generated from our seed script
export const COMPETITION_ID = '6ab94be5b82a7b75a5ce2468';
export const MOCK_USER_ID = '6ab94be4b82a7b75a5ce2464';
