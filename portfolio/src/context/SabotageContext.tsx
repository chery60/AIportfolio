import { createContext, useContext, useState, type ReactNode } from 'react';

interface SabotageContextType {
    isSabotaged: boolean;
    toggleSabotage: () => void;
    setSabotage: (value: boolean) => void;
}

const SabotageContext = createContext<SabotageContextType | undefined>(undefined);

export function SabotageProvider({ children }: { children: ReactNode }) {
    const [isSabotaged, setIsSabotaged] = useState(false);

    const toggleSabotage = () => setIsSabotaged((prev) => !prev);
    const setSabotage = (value: boolean) => setIsSabotaged(value);

    return (
        <SabotageContext.Provider value={{ isSabotaged, toggleSabotage, setSabotage }}>
            {children}
        </SabotageContext.Provider>
    );
}

export function useSabotage() {
    const context = useContext(SabotageContext);
    if (context === undefined) {
        throw new Error('useSabotage must be used within a SabotageProvider');
    }
    return context;
}
