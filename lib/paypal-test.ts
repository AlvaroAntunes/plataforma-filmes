import { checkPayPalConfig, createPayPalOrder } from './paypal'

// Test PayPal configuration
export const testPayPalIntegration = async () => {
  console.log('🔍 Testing PayPal Integration...')
  
  // 1. Check configuration
  console.log('1. Checking PayPal configuration...')
  const isConfigured = checkPayPalConfig()
  
  if (!isConfigured) {
    console.error('❌ PayPal not configured properly')
    console.log('Please check your .env file for:')
    console.log('- PAYPAL_CLIENT_ID')
    console.log('- PAYPAL_CLIENT_SECRET') 
    console.log('- PAYPAL_BUSINESS_EMAIL (for standard payments)')
    return false
  }
  
  console.log('✅ PayPal configuration is valid')
  
  // 2. Test order creation
  console.log('2. Testing order creation...')
  try {
    const testOrderData = {
      filmId: 'test-film-123',
      userId: 'test-user-456', 
      amount: 9.99,
      email: 'test@example.com',
      title: 'Test Film'
    }
    
    const order = await createPayPalOrder(testOrderData)
    console.log('✅ Test order created successfully:', order.orderId)
    console.log('🔗 Approval URL:', order.approvalUrl)
    return true
    
  } catch (error: any) {
    console.error('❌ Failed to create test order:', error.message)
    
    if (error.message.includes('AUTHENTICATION_FAILURE')) {
      console.log('💡 This likely means your PayPal credentials are incorrect')
    }
    if (error.message.includes('INVALID_REQUEST')) {
      console.log('💡 This likely means there\'s an issue with the request format')
    }
    
    return false
  }
}

// Get PayPal test accounts info
export const getPayPalTestInfo = () => {
  console.log('\n📝 PayPal Integration Guide:')
  console.log('1. Go to https://developer.paypal.com/')
  console.log('2. Login with your PayPal account')
  console.log('3. Go to "My Apps & Credentials"')
  console.log('4. Create a new app or use existing one')
  console.log('5. Copy Client ID and Client Secret to .env')
  console.log('6. For testing, use sandbox accounts from PayPal Developer')
  console.log('\n🧪 For testing payments:')
  console.log('- Use sandbox buyer account: sb-xxxxx@personal.example.com')
  console.log('- Password provided by PayPal Developer Dashboard')
  console.log('\n💰 Test card numbers (Sandbox only):')
  console.log('- Visa: 4111111111111111')
  console.log('- MasterCard: 5555555555554444')
  console.log('- American Express: 378282246310005')
}

// Environment check
export const checkEnvironmentVars = () => {
  console.log('🔍 Checking environment variables...')
  
  const required = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET', 
    'PAYPAL_BUSINESS_EMAIL',
    'NEXT_PUBLIC_BASE_URL'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    return false
  }
  
  console.log('✅ All required environment variables are set')
  
  // Check if using placeholder values
  if (process.env.PAYPAL_CLIENT_ID?.includes('seu_client_id')) {
    console.warn('⚠️  You are still using placeholder PayPal Client ID')
    return false
  }
  
  if (process.env.PAYPAL_CLIENT_SECRET?.includes('seu_client_secret')) {
    console.warn('⚠️  You are still using placeholder PayPal Client Secret')
    return false
  }
  
  return true
}
