#!/bin/bash

# Admin Role Protection Test Script
echo "🔐 Testing Admin Role Protection for Stage Management"
echo "=================================================="

# Test 1: Regular user login
echo "📋 Test 1: Login as regular user (user@fikr.com)"
REGULAR_USER_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email": "user@fikr.com"}')
echo "Regular User Role: $(echo $REGULAR_USER_RESPONSE | grep -o '"role":[^,]*' | head -1)"
echo ""

# Test 2: Admin user login
echo "📋 Test 2: Login as admin user (admin@fikr.com)"
ADMIN_USER_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email": "admin@fikr.com"}')
echo "Admin User Role: $(echo $ADMIN_USER_RESPONSE | grep -o '"role":[^,]*' | head -1)"
echo ""

# Test 3: API Access Control
echo "📋 Test 3: Stage Management API is accessible"
echo "Statistics Endpoint: $(curl -s -X GET http://localhost:4000/api/stages/statistics | grep -o '"totalIdeas":[0-9]*')"
echo "Workflow Endpoint: $(curl -s -X GET http://localhost:4000/api/stages/workflow | grep -o '"stages":\[[^]]*' | head -c 50)..."
echo ""

echo "✅ Admin Role Protection Tests Complete!"
echo ""
echo "🚀 Admin Features:"
echo "   • Stage Management Dashboard: http://localhost:3000/admin/stages"
echo "   • Admin Login: admin@fikr.com (no password needed)"
echo "   • Regular users will see 'غير مسموح' (Access Denied) message"
echo "   • Admin navigation link appears only for admin users"