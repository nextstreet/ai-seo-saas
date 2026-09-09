import type { OpportunityAction, PageType } from '@ai-seo/shared';

export interface OpportunitySignals {
  searchDemand: number;
  commercialValue: number;
  uniqueness: number;
  informationGain: number;
  cannibalizationRisk: number;
  topicFit: number;
  hasMatchingPage: boolean;
  recommendedPageType: PageType;
}

export interface OpportunityDecision {
  action: OpportunityAction;
  opportunityScore: number;
  recommendedPageType: PageType;
  reason: string;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function scoreOpportunity(signals: OpportunitySignals): OpportunityDecision {
  const positive =
    signals.searchDemand * 0.2 +
    signals.commercialValue * 0.2 +
    signals.uniqueness * 0.2 +
    signals.informationGain * 0.2 +
    signals.topicFit * 0.2;
  const opportunityScore = Math.round(clamp(positive - signals.cannibalizationRisk * 0.35));

  let action: OpportunityAction;
  if (signals.cannibalizationRisk >= 75) action = 'MERGE';
  else if (opportunityScore < 35) action = 'IGNORE';
  else if (signals.hasMatchingPage) action = 'EXPAND';
  else action = 'CREATE';

  return {
    action,
    opportunityScore,
    recommendedPageType: signals.recommendedPageType,
    reason: `${action}: score ${opportunityScore}; topic fit ${signals.topicFit}; cannibalization risk ${signals.cannibalizationRisk}.`,
  };
}
