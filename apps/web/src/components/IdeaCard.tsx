import Link from 'next/link';

interface IdeaCardProps {
  id: number;
  title: string;
  summary: string;
  status: string;
  stage: string;
}

const statusColors = {
  'maswada': 'bg-gray-100 text-gray-800',
  'mursala': 'bg-blue-100 text-blue-800',
  'qaid_almurajaa': 'bg-yellow-100 text-yellow-800',
  'muwafaq_alayha': 'bg-green-100 text-green-800',
  'marfuda': 'bg-red-100 text-red-800',
  'qaid_altanfeedh': 'bg-purple-100 text-purple-800',
};

const stageColors = {
  'muqadama': 'bg-blue-100 text-blue-800',
  'taqyeem_alaqran': 'bg-indigo-100 text-indigo-800',
  'murajaat_allajana': 'bg-yellow-100 text-yellow-800',
  'dirasat_aljadwa': 'bg-orange-100 text-orange-800',
  'almuwafaqa': 'bg-green-100 text-green-800',
  'altasleem': 'bg-purple-100 text-purple-800',
  'altanfeedh': 'bg-emerald-100 text-emerald-800',
};

const statusLabels = {
  'maswada': 'مسودة',
  'mursala': 'مُرسلة',
  'qaid_almurajaa': 'قيد المراجعة',
  'muwafaq_alayha': 'مُوافق عليها',
  'marfuda': 'مرفوضة',
  'qaid_altanfeedh': 'قيد التنفيذ',
};

const stageLabels = {
  'muqadama': 'مُقدمة',
  'taqyeem_alaqran': 'تقييم الأقران',
  'murajaat_allajana': 'مراجعة اللجنة',
  'dirasat_aljadwa': 'دراسة الجدوى',
  'almuwafaqa': 'الموافقة',
  'altasleem': 'التسليم',
  'altanfeedh': 'التنفيذ',
};

export default function IdeaCard({ id, title, summary, status, stage }: IdeaCardProps) {
  return (
    <Link href={`/ideas/${id}`} className="block bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition">
      <h3 className="font-semibold text-xl mb-2 line-clamp-2">{title}</h3>
      <p className="text-sm text-gray-700 line-clamp-3 mb-4">{summary}</p>
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-200'}`}>
          {statusLabels[status as keyof typeof statusLabels] || status}
        </span>
        <span className={`px-2 py-1 rounded-full ${stageColors[stage as keyof typeof stageColors] || 'bg-gray-200'}`}>
          {stageLabels[stage as keyof typeof stageLabels] || stage}
        </span>
      </div>
    </Link>
  );
}