import { API_URL, COMPETITION_ID, MOCK_USER_ID } from '../constants/api';

/**
 * @desc Fetches the complete competition details, including capacity, dates, and the current user's registration state.
 * @returns {Promise<Object>} The competition data and user state.
 * @throws {Error} If the network request fails or the server returns an error.
 */
export const getCompetitionDetails = async () => {
  try {
    const response = await fetch(`${API_URL}/competitions/${COMPETITION_ID}?userId=${MOCK_USER_ID}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong fetching competition details');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching competition:', error);
    throw error;
  }
};

/**
 * @desc Attempts to register the mock user for the hardcoded competition. 
 *       The backend handles capacity checks, date validation, and atomic spot reservations.
 * @returns {Promise<Object>} The registration success message and updated competition data.
 * @throws {Error} If registration fails (e.g. fully booked, already registered, deadline passed).
 */
export const registerForCompetition = async () => {
  try {
    const response = await fetch(`${API_URL}/competitions/${COMPETITION_ID}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: MOCK_USER_ID }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
