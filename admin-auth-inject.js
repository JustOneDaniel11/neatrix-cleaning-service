// Script to inject admin authentication in the browser console
// This should be run in the browser console when the admin dashboard is open

console.log('🔐 Starting admin authentication...');

// Get the Supabase client from the window (if available)
const getSupabaseClient = () => {
  // Try to get from window.supabase first
  if (window.supabase) {
    return window.supabase;
  }
  
  // If not available, create a new client
  const { createClient } = window.supabase || {};
  if (createClient) {
    return createClient(
      'https://hrkpbuenwejwspjrfgkd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3BidWVud2Vqd3NwanJmZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDg4OTQsImV4cCI6MjA3NDI4NDg5NH0.SA3o1vA1xUF-HK4aHFOEaCIrchq-_-4oX6uwji2ygHk'
    );
  }
  
  return null;
};

const authenticateAdmin = async () => {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ Supabase client not found');
      return;
    }

    console.log('🔑 Attempting to sign in as admin...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'contactneatrix@gmail.com',
      password: 'RelaxwithDan_11_123456@JustYou'
    });

    if (error) {
      console.error('❌ Authentication error:', error);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('👤 User:', data.user.email);
    console.log('🎫 Session:', data.session ? 'Active' : 'None');
    
    // Refresh the page to update the authentication state
    console.log('🔄 Refreshing page to update authentication state...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
};

// Run the authentication
authenticateAdmin();

console.log('📝 To manually test stage progression after authentication:');
console.log('1. Wait for page to reload');
console.log('2. Navigate to the Order Tracking section');
console.log('3. Click "Move to Next Stage" button');
console.log('4. Check browser console for logs');