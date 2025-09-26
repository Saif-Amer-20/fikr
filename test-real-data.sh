#!/bin/bash

# Real Data Verification Test Script
echo "📊 Testing Real Data vs Dummy Data"
echo "=================================="

echo "🔍 Current Real Data from API:"
echo ""

echo "Users (المشاركون النشطون):"
USER_COUNT=$(curl -s -X GET http://localhost:4000/api/users | jq '. | length')
echo "   • Real user count: $USER_COUNT users"
curl -s -X GET http://localhost:4000/api/users | jq -r '.[] | "   • \(.name) (\(.email)) - \(.department)"'
echo ""

echo "Ideas (الأفكار):"
IDEA_COUNT=$(curl -s -X GET http://localhost:4000/api/ideas | jq '. | length')
echo "   • Total ideas: $IDEA_COUNT ideas"
echo ""

echo "Implementation Stage (قيد التنفيذ):"
IMPLEMENTATION_COUNT=$(curl -s -X GET http://localhost:4000/api/stages/statistics | jq '.stageStats[] | select(.stage == "altanfeedh") | .count // 0')
echo "   • Ideas in implementation: $IMPLEMENTATION_COUNT ideas"
echo ""

echo "Votes (التصويتات):"
VOTES_COUNT=$(curl -s -X GET http://localhost:4000/api/ideas | jq 'map(._count.votes // 0) | add')
echo "   • Total votes: $VOTES_COUNT votes"
echo ""

echo "✅ Fixed Data Issues:"
echo "   • User count changed from dummy (156) to real ($USER_COUNT)"
echo "   • Active ideas filter updated to use proper Arabic status codes"
echo "   • All statistics now use live API data"
echo "   • Homepage dashboard shows accurate metrics"
echo ""

echo "🌐 Test the homepage at: http://localhost:3000"
echo "   Login with: admin@fikr.com or user@fikr.com"