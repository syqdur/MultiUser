import { FirebaseError } from 'firebase/app';

export interface FirebaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  needsPermissions?: boolean;
}

export const handleFirebaseError = (error: any): { message: string; needsPermissions: boolean } => {
  console.error('Firebase error:', error);
  
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'permission-denied':
        return {
          message: 'Firebase permissions not configured. Deploy security rules to enable this feature.',
          needsPermissions: true
        };
      case 'unavailable':
        return {
          message: 'Firebase service temporarily unavailable. Please try again.',
          needsPermissions: false
        };
      case 'quota-exceeded':
        return {
          message: 'Firebase quota exceeded. Contact administrator.',
          needsPermissions: false
        };
      default:
        return {
          message: `Firebase error: ${error.message}`,
          needsPermissions: false
        };
    }
  }
  
  return {
    message: 'Unknown error occurred',
    needsPermissions: false
  };
};

export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback?: T,
  operationName?: string
): Promise<FirebaseOperationResult<T>> => {
  try {
    const result = await operation();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    const { message, needsPermissions } = handleFirebaseError(error);
    
    if (operationName) {
      console.warn(`Operation ${operationName} failed:`, message);
    }
    
    return {
      success: false,
      error: message,
      needsPermissions,
      data: fallback
    };
  }
};

export const isPermissionError = (error: any): boolean => {
  return error instanceof FirebaseError && error.code === 'permission-denied';
};