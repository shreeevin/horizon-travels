import React from 'react';

interface CompartmentProps {
    children: React.ReactNode;
    hasMargin?: boolean;
}

const Compartment: React.FC<CompartmentProps> = ({ children, hasMargin = true }) => {
    return (
        <div
            className={`max-w-6xl mx-auto ${hasMargin ? 'px-4' : ''}`}
        >
            {children}
        </div>
    );
};

export { Compartment };
