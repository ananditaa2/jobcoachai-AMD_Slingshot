import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AnalysisData {
  readinessScore: number;
  strongSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  roadmap: { month: number; title: string; description: string }[];
  targetCompany: string;
  jobRole?: string;
}

interface AppContextType {
  resumeText: string;
  setResumeText: (text: string) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  targetCompany: string;
  setTargetCompany: (company: string) => void;
  jobRole: string;
  setJobRole: (role: string) => void;
  analysisData: AnalysisData | null;
  setAnalysisData: (data: AnalysisData | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [resumeText, setResumeText] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [targetCompany, setTargetCompany] = useState('');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AppContext.Provider value={{
      resumeText, setResumeText,
      skills, setSkills,
      targetCompany, setTargetCompany,
      jobRole, setJobRole,
      analysisData, setAnalysisData,
      isAnalyzing, setIsAnalyzing,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
