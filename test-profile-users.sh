#!/bin/bash

# Profile and User Management Test Script
echo "👤 Testing Profile & User Management Features"
echo "============================================="

echo "🔍 New Features Added:"
echo ""

echo "📋 Profile Page (/profile):"
echo "   • Personal profile information display"
echo "   • User statistics and metrics"
echo "   • User's ideas list with status/stage info"
echo "   • Engagement statistics (votes, comments)"
echo "   • Interactive tabs for different sections"
echo "   • Available for: All authenticated users"
echo ""

echo "🛠️ Admin User Management (/admin/users):"
echo "   • Complete user list with detailed information"
echo "   • User statistics dashboard (6 key metrics)"
echo "   • User filtering and search functionality"
echo "   • Role management (assign admin/regular roles)"
echo "   • User status management (active/inactive)"
echo "   • User registration date tracking"
echo "   • Available for: Admin users only"
echo ""

echo "🌐 Navigation Links Added:"
echo "   • 'الملف الشخصي' (Profile) - All users"
echo "   • 'إدارة المستخدمين' (User Management) - Admin only"
echo "   • Both desktop and mobile navigation updated"
echo ""

echo "📊 Current System Data:"
USER_COUNT=$(curl -s -X GET http://localhost:4000/api/users | jq '. | length')
echo "   • Total users: $USER_COUNT"
echo "   • Regular users: $(curl -s -X GET http://localhost:4000/api/users | jq 'map(select(.role == null)) | length')"
echo "   • Admin users: $(curl -s -X GET http://localhost:4000/api/users | jq 'map(select(.role.name == "admin")) | length // 0')"
echo ""

echo "🚀 Test URLs:"
echo "   • Profile Page: http://localhost:3000/profile"
echo "   • User Management: http://localhost:3000/admin/users"
echo "   • Home Page: http://localhost:3000"
echo ""

echo "💡 How to Test:"
echo "   1. Login with user@fikr.com - Access profile page"
echo "   2. Login with admin@fikr.com - Access both profile and user management"
echo "   3. Navigate using header menu links"
echo "   4. Test user role updates and status changes (admin only)"
echo "   5. Verify profile statistics and idea listings"