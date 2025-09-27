// Arabic labels and translations for statuses and stages

export const statusLabels = {
  'maswada': 'مسودة',
  'mursala': 'مُرسلة', 
  'qaid_almurajaa': 'قيد المراجعة',
  'muwafaq_alayha': 'مُوافق عليها',
  'marfuda': 'مرفوضة',
  'qaid_altanfeedh': 'قيد التنفيذ',
} as const;

export const stageLabels = {
  'muqadama': 'مُقدمة',
  'taqyeem_alaqran': 'تقييم الأقران',
  'murajaat_allajana': 'مراجعة اللجنة', 
  'dirasat_aljadwa': 'دراسة الجدوى',
  'almuwafaqa': 'الموافقة',
  'altasleem': 'التسليم',
  'altanfeedh': 'التنفيذ',
} as const;

export const statusColors = {
  'maswada': 'bg-gray-100 text-gray-800',
  'mursala': 'bg-blue-100 text-blue-800',
  'qaid_almurajaa': 'bg-yellow-100 text-yellow-800',
  'muwafaq_alayha': 'bg-green-100 text-green-800',
  'marfuda': 'bg-red-100 text-red-800',
  'qaid_altanfeedh': 'bg-purple-100 text-purple-800',
} as const;

export const stageColors = {
  'muqadama': 'bg-gray-100 text-gray-800',
  'taqyeem_alaqran': 'bg-blue-100 text-blue-800',
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800', 
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800',
  'almuwafaqa': 'bg-green-100 text-green-800',
  'altasleem': 'bg-indigo-100 text-indigo-800',
  'altanfeedh': 'bg-purple-100 text-purple-800',
} as const;

// Helper function to get Arabic label for status
export const getStatusLabel = (status: string): string => {
  return statusLabels[status as keyof typeof statusLabels] || status;
};

// Helper function to get Arabic label for stage  
export const getStageLabel = (stage: string): string => {
  return stageLabels[stage as keyof typeof stageLabels] || stage;
};

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
};

// Helper function to get stage color
export const getStageColor = (stage: string): string => {
  return stageColors[stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800';
};

// Filter options for dropdowns
export const statusFilterOptions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'maswada', label: statusLabels.maswada },
  { value: 'mursala', label: statusLabels.mursala },
  { value: 'qaid_almurajaa', label: statusLabels.qaid_almurajaa },
  { value: 'muwafaq_alayha', label: statusLabels.muwafaq_alayha },
  { value: 'marfuda', label: statusLabels.marfuda },
  { value: 'qaid_altanfeedh', label: statusLabels.qaid_altanfeedh },
];

export const stageFilterOptions = [
  { value: '', label: 'جميع المراحل' },
  { value: 'muqadama', label: stageLabels.muqadama },
  { value: 'taqyeem_alaqran', label: stageLabels.taqyeem_alaqran },
  { value: 'murajaat_allajana', label: stageLabels.murajaat_allajana },
  { value: 'dirasat_aljadwa', label: stageLabels.dirasat_aljadwa },
  { value: 'almuwafaqa', label: stageLabels.almuwafaqa },
  { value: 'altasleem', label: stageLabels.altasleem },
  { value: 'altanfeedh', label: stageLabels.altanfeedh },
];