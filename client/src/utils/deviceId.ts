import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'wedding_device_id';
const USER_NAME_KEY = 'wedding_user_name';
const VISITOR_ID_KEY = 'wedding_visitor_id';

// Enhanced visitor ID system with persistent tracking
export const getVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    console.log('Generated new visitor ID:', visitorId);
  }
  return visitorId;
};

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

export const getUserName = (): string | null => {
  return localStorage.getItem(USER_NAME_KEY);
};

export const setUserName = (name: string): void => {
  localStorage.setItem(USER_NAME_KEY, name);
};

// Clear all visitor data (for admin/reset purposes)
export const clearVisitorData = (): void => {
  localStorage.removeItem(VISITOR_ID_KEY);
  localStorage.removeItem(DEVICE_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
};