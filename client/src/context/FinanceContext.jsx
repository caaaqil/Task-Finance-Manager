import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FINANCE':
      return { ...state, finance: action.payload, loading: false };
    case 'ADD_FINANCE':
      return { ...state, finance: [action.payload, ...state.finance] };
    case 'DELETE_FINANCE':
      return {
        ...state,
        finance: state.finance.filter(item => item._id !== action.payload)
      };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState = {
  finance: [],
  summary: null,
  loading: false,
  error: null
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  const fetchFinance = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get('/api/finance');
      dispatch({ type: 'SET_FINANCE', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to fetch finance data' });
    }
  };

  const fetchSummary = async (year, month) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.get('/api/finance/summary', {
        params: { year, month }
      });
      dispatch({ type: 'SET_SUMMARY', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to fetch summary' });
    }
  };

  const createFinance = async (financeData) => {
    try {
      const response = await axios.post('/api/finance', financeData);
      dispatch({ type: 'ADD_FINANCE', payload: response.data });
      // Refresh summary after adding new entry
      await fetchSummary();
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to create finance entry' });
      throw error;
    }
  };

  const deleteFinance = async (id) => {
    try {
      await axios.delete(`/api/finance/${id}`);
      dispatch({ type: 'DELETE_FINANCE', payload: id });
      // Refresh summary after deleting entry
      await fetchSummary();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || 'Failed to delete finance entry' });
      throw error;
    }
  };

  useEffect(() => {
    fetchFinance();
    fetchSummary();
  }, []);

  const value = {
    ...state,
    fetchFinance,
    fetchSummary,
    createFinance,
    deleteFinance
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

