import React from "react";
import { Layers, Users, Star, ClipboardList } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {title}
        </p>

        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-1">
        {value}
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
};

const MentorStatsSection = () => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Green */}
        <StatCard
          title="Active Programs"
          value={12}
          subtitle="+2 this month"
          icon={<Layers size={20} />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        {/* Violet */}
        <StatCard
          title="Total Mentees"
          value={45}
          subtitle="Active enrollment"
          icon={<Users size={20} />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />

        {/* Orange */}
        <StatCard
          title="Avg Rating"
          value="4.9"
          subtitle="From 128 reviews"
          icon={<Star size={20} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />

        {/* Pink (من الصورة) */}
        <StatCard
          title="Tasks Review"
          value="08"
          subtitle="Due by EOD"
          icon={<ClipboardList size={20} />}
          iconBg="bg-[#E5B2B6]/15"
          iconColor="text-[#E5B2B6]"
        />

      </div>
    </div>
  );
};

export default MentorStatsSection;