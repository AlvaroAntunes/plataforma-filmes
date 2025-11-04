import { NextResponse } from 'next/server'
import { checkEnvironmentVars, testPayPalIntegration, getPayPalTestInfo } from '@/lib/paypal-test'

export async function GET() {
  try {
    console.log('🚀 PayPal Integration Test Starting...\n')
    
    // Check environment variables
    const envCheck = checkEnvironmentVars()
    if (!envCheck) {
      getPayPalTestInfo()
      return NextResponse.json({
        success: false,
        error: 'Environment variables not configured properly',
        message: 'Check console for setup instructions'
      }, { status: 400 })
    }
    
    // Test PayPal integration
    const integrationTest = await testPayPalIntegration()
    
    if (integrationTest) {
      return NextResponse.json({
        success: true,
        message: 'PayPal integration is working correctly!',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'PayPal integration test failed',
        message: 'Check console for detailed error information'
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('❌ PayPal test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error during PayPal test',
      message: 'Check server logs for details'
    }, { status: 500 })
  }
}
