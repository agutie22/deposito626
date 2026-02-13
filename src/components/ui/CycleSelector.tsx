import React from 'react';
import '../OrderMenu.css'; // Keep using the same CSS for now to maintain consistency

interface CycleSelectorProps {
    label: string;
    options: string[];
    selected: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

export const CycleSelector: React.FC<CycleSelectorProps> = ({ label, options, selected, onSelect, disabled }) => {
    const handleNext = () => {
        if (disabled || options.length === 0) return;
        // Haptic feedback for "drunk proof" tactile response
        if (navigator.vibrate) navigator.vibrate(10);

        const currentIndex = options.indexOf(selected);
        const nextIndex = (currentIndex + 1) % options.length;
        onSelect(options[nextIndex]);
    };

    return (
        <button
            className="cycle-pill"
            onClick={handleNext}
            disabled={disabled}
            type="button"
        >
            <span className="cycle-pill-label">{label}</span>
            <span className="cycle-pill-value">{selected}</span>
        </button>
    );
};
