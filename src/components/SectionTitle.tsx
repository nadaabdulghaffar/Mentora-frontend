import React from 'react';

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-base md:text-lg lg:text-xl font-bold text-slateInk leading-snug ${className}`}>
        {children}
    </h3>
);

export default SectionTitle;
