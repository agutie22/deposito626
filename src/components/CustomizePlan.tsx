import React, { useState } from 'react';
import './CustomizePlan.css';
import { ChefHat, Leaf, Zap, Heart } from 'lucide-react';

interface PlanOption {
    id: string;
    name: string;
    icon: React.ReactNode;
}

const PREFERENCES: PlanOption[] = [
    { id: 'chefs-choice', name: "Chef's Choice", icon: <ChefHat /> },
    { id: 'keto', name: 'Keto', icon: <Zap /> },
    { id: 'calorie-smart', name: 'Calorie Smart', icon: <Heart /> },
    { id: 'vegan', name: 'Vegan & Veggie', icon: <Leaf /> },
];

const MEAL_COUNTS = [4, 6, 8, 10, 12, 18];

const CustomizePlan: React.FC = () => {
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['chefs-choice']);
    const [mealCount, setMealCount] = useState<number>(6);

    const togglePreference = (id: string) => {
        setSelectedPreferences(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const pricePerMeal = mealCount >= 10 ? 9.99 : 11.49; // Simple volume discount
    const boxPrice = pricePerMeal * mealCount;
    const shipping = 9.99;
    const total = boxPrice + shipping;

    return (
        <section className="customize-plan-section">
            <div className="plan-container">
                <div className="plan-header">
                    <h2>Customize Your Plan</h2>
                    <p>Choose your preferences and plan size to get started.</p>
                </div>

                <div className="preference-section">
                    <h3 className="section-title">1. Pick your preferences</h3>
                    <div className="preference-grid">
                        {PREFERENCES.map(pref => (
                            <div
                                key={pref.id}
                                className={`preference-card ${selectedPreferences.includes(pref.id) ? 'selected' : ''}`}
                                onClick={() => togglePreference(pref.id)}
                            >
                                <div className="pref-icon">{pref.icon}</div>
                                <span className="pref-name">{pref.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="size-section">
                    <h3 className="section-title">2. Choose your plan size</h3>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>Number of meals per week:</p>
                    <div className="size-selector">
                        {MEAL_COUNTS.map(count => (
                            <button
                                key={count}
                                className={`size-btn ${mealCount === count ? 'active' : ''}`}
                                onClick={() => setMealCount(count)}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="order-summary">
                    <div className="summary-row">
                        <span>Box price ({mealCount} meals)</span>
                        <span>${boxPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Price per meal</span>
                        <span>${pricePerMeal}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>${shipping}</span>
                    </div>
                    <div className="summary-row" style={{ borderTop: '2px solid #ddd', paddingTop: '1rem' }}>
                        <span className="summary-total">Total Weekly</span>
                        <span className="summary-total">${total.toFixed(2)}</span>
                    </div>
                    <button className="plan-cta-btn">
                        Select This Plan
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CustomizePlan;
