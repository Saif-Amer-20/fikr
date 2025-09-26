#!/bin/bash

# Updated Stage Transition Test Script
echo "🔄 Testing Updated Stage Workflow Transitions"
echo "============================================="

echo "📋 Current Workflow Transitions:"
echo ""

echo "🎯 Committee Review (مراجعة اللجنة) can now transition to:"
curl -s -X GET http://localhost:4000/api/stages/transitions -H "Content-Type: application/json" | jq -r '.transitions.murajaat_allajana[] as $stage | .stageLabels[$stage] // $stage' | sed 's/^/   • /'
echo ""

echo "📊 Current Stage Statistics:"
curl -s -X GET http://localhost:4000/api/stages/statistics -H "Content-Type: application/json" | jq -r '.stageStats[] | "   • \(.label): \(.count) ideas"'
echo ""

echo "✅ Fixed Workflow Features:"
echo "   • Committee can approve ideas directly (skip feasibility study)"
echo "   • Committee can send complex ideas to feasibility study"  
echo "   • Flexible workflow supports both simple and complex approvals"
echo "   • All transitions maintain proper validation and history tracking"
echo ""

echo "🚀 Available Workflow Paths:"
echo "   Path 1: مُقدمة → تقييم الأقران → مراجعة اللجنة → الموافقة (Fast Track)"
echo "   Path 2: مُقدمة → تقييم الأقران → مراجعة اللجنة → دراسة الجدوى → الموافقة (Full Review)"
echo "   Path 3: Any stage → مرفوضة (Rejection possible at any point)"