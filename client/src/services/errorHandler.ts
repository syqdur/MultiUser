// Firebase error handler to prevent crashes and provide fallbacks
export const handleFirebaseError = (error: any, operation: string) => {
  console.warn(`Firebase ${operation} failed:`, error);
  
  // Check for specific error types
  if (error?.code === 'permission-denied') {
    console.warn('Permission denied - Firebase rules need to be deployed');
    return null;
  }
  
  if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
    console.warn('Firebase internal error - likely due to missing rules deployment');
    return null;
  }
  
  // For other errors, log but don't crash
  return null;
};

// Safe wrapper for Firebase operations
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    handleFirebaseError(error, operationName);
    return fallback;
  }
};