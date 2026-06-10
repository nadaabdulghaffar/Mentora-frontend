import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface ViewAllLinkProps {
    to: string;
    text?: string;
    className?: string;
}

export const ViewAllLink: React.FC<ViewAllLinkProps> = ({ to, text = "View All", className = '' }) => (
    <Link
        to={to}
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F4F0FF] px-4 py-2 text-[14px] font-semibold text-primary transition-all hover:bg-primary hover:text-white group ${className}`}
    >
        {text}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </Link>
);

export default ViewAllLink;
