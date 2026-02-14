
export interface LegalAnalysis {
  summary: string;
  immediateSteps: string[];
  legalProvisions: {
    section: string;
    description: string;
  }[];
  keyPersonnel: string[];
  documentChecklist: string[];
  policeRights: string[];
}

export enum CaseType {
  FALSE_CASE = "False Case/Allegation",
  LAND_DISPUTE = "Land & Property Dispute",
  MATRIMONIAL = "Matrimonial/Divorce",
  CRIMINAL = "Criminal/Violence",
  CYBER_CRIME = "Cyber Crime/Deepfake",
  CORRUPTION = "Corruption/Money Laundering",
  OTHER = "Other Legal Issue",
  CHILD_ABUSE = "Child Abuse/POSCO",
  HARASSMENT = "Workplace/Women Harassment",
  DOMESTIC_VIOLENCE = "Domestic Violence/Dowry",
  STEALING = "Theft/Stealing/Robbery"
}

export interface CaseSubmission {
  type: CaseType;
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface StoredAnalysis {
  id: string;
  timestamp: number;
  submission: CaseSubmission;
  analysis: LegalAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export type View = 'home' | 'library' | 'qa' | 'sections' | 'about' | 'policeFinder' | 'history';
