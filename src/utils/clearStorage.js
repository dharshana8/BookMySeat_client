// Clear all localStorage data
export function clearAllStorage() {
  localStorage.removeItem('bb_auth_user');
  localStorage.removeItem('bb_bookings');
  console.log('✅ Frontend storage cleared');
}

// Run immediately when imported
clearAllStorage();