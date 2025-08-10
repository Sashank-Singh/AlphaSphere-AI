#!/usr/bin/env python3
"""
LLM Analysis Service for AlphaSphere
Provides intelligent market analysis and trading recommendations.
"""

import json
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MarketContext:
    """Market context information"""
    overall_sentiment: str
    volatility_level: str
    sector_performance: Dict[str, float]
    market_trend: str
    key_events: List[str]

@dataclass
class TradingOpportunity:
    """Trading opportunity analysis"""
    symbol: str
    opportunity_type: str  # 'momentum', 'mean_reversion', 'breakout', 'dip_buying'
    confidence: float
    reasoning: str
    risk_level: str
    time_horizon: str

@dataclass
class RiskFactor:
    """Risk factor analysis"""
    factor: str
    impact: str  # 'high', 'medium', 'low'
    description: str
    mitigation: str

@dataclass
class TradingRecommendation:
    """Trading recommendation"""
    action: str
    reasoning: str
    priority: str  # 'high', 'medium', 'low'
    timeframe: str

class LLMAnalysisService:
    """LLM-powered market analysis service"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key
        self.analysis_cache = {}
        
    def analyze_market_context(
        self, 
        symbols: List[str], 
        market_data: Dict[str, Any],
        rl_predictions: List[Dict[str, Any]]
    ) -> MarketContext:
        """Analyze overall market context"""
        
        # Analyze RL predictions
        bullish_count = sum(1 for pred in rl_predictions if pred.get('prediction', 0) > 0.3)
        bearish_count = sum(1 for pred in rl_predictions if pred.get('prediction', 0) < -0.3)
        neutral_count = len(rl_predictions) - bullish_count - bearish_count
        
        # Determine overall sentiment
        if bullish_count > bearish_count:
            sentiment = "bullish"
        elif bearish_count > bullish_count:
            sentiment = "bearish"
        else:
            sentiment = "neutral"
        
        # Analyze volatility
        volatility_level = self._analyze_volatility(market_data)
        
        # Analyze sector performance
        sector_performance = self._analyze_sector_performance(symbols, market_data)
        
        # Determine market trend
        market_trend = self._determine_market_trend(rl_predictions)
        
        # Identify key events
        key_events = self._identify_key_events(symbols, market_data)
        
        return MarketContext(
            overall_sentiment=sentiment,
            volatility_level=volatility_level,
            sector_performance=sector_performance,
            market_trend=market_trend,
            key_events=key_events
        )
    
    def identify_trading_opportunities(
        self, 
        symbols: List[str], 
        rl_predictions: List[Dict[str, Any]],
        market_data: Dict[str, Any]
    ) -> List[TradingOpportunity]:
        """Identify trading opportunities based on RL predictions and market data"""
        
        opportunities = []
        
        for prediction in rl_predictions:
            symbol = prediction.get('symbol', '')
            pred_value = prediction.get('prediction', 0)
            confidence = prediction.get('confidence', 0)
            
            if confidence > 0.7:  # High confidence threshold
                if pred_value > 0.5:
                    opportunity_type = "momentum"
                    reasoning = f"Strong bullish signal with {confidence:.1%} confidence"
                    risk_level = "medium"
                elif pred_value > 0.3:
                    opportunity_type = "dip_buying"
                    reasoning = f"Moderate bullish signal with {confidence:.1%} confidence"
                    risk_level = "low"
                elif pred_value < -0.5:
                    opportunity_type = "mean_reversion"
                    reasoning = f"Strong bearish signal with {confidence:.1%} confidence"
                    risk_level = "high"
                elif pred_value < -0.3:
                    opportunity_type = "breakout"
                    reasoning = f"Moderate bearish signal with {confidence:.1%} confidence"
                    risk_level = "medium"
                else:
                    continue
                
                opportunities.append(TradingOpportunity(
                    symbol=symbol,
                    opportunity_type=opportunity_type,
                    confidence=confidence,
                    reasoning=reasoning,
                    risk_level=risk_level,
                    time_horizon="1-3 days"
                ))
        
        return opportunities
    
    def identify_risk_factors(
        self, 
        symbols: List[str], 
        market_data: Dict[str, Any],
        rl_predictions: List[Dict[str, Any]]
    ) -> List[RiskFactor]:
        """Identify potential risk factors"""
        
        risk_factors = []
        
        # Market volatility risk
        volatility = self._analyze_volatility(market_data)
        if volatility == "high":
            risk_factors.append(RiskFactor(
                factor="High Market Volatility",
                impact="high",
                description="Elevated market volatility increases trading risk",
                mitigation="Use smaller position sizes and tighter stop-losses"
            ))
        
        # Concentration risk
        if len(symbols) < 5:
            risk_factors.append(RiskFactor(
                factor="Portfolio Concentration",
                impact="medium",
                description="Limited diversification increases portfolio risk",
                mitigation="Consider adding more positions across different sectors"
            ))
        
        # Prediction confidence risk
        low_confidence_count = sum(1 for pred in rl_predictions if pred.get('confidence', 0) < 0.6)
        if low_confidence_count > len(rl_predictions) * 0.5:
            risk_factors.append(RiskFactor(
                factor="Low Prediction Confidence",
                impact="medium",
                description="Many predictions have low confidence levels",
                mitigation="Wait for higher confidence signals or reduce position sizes"
            ))
        
        # Sector concentration risk
        sector_analysis = self._analyze_sector_concentration(symbols)
        if sector_analysis.get('max_sector_weight', 0) > 0.4:
            risk_factors.append(RiskFactor(
                factor="Sector Concentration",
                impact="medium",
                description="High concentration in single sector",
                mitigation="Diversify across multiple sectors"
            ))
        
        return risk_factors
    
    def generate_recommendations(
        self, 
        market_context: MarketContext,
        opportunities: List[TradingOpportunity],
        risk_factors: List[RiskFactor]
    ) -> List[TradingRecommendation]:
        """Generate trading recommendations"""
        
        recommendations = []
        
        # Portfolio diversification recommendation
        if len(opportunities) > 3:
            recommendations.append(TradingRecommendation(
                action="Diversify portfolio across multiple opportunities",
                reasoning="Multiple high-confidence signals available",
                priority="high",
                timeframe="immediate"
            ))
        
        # Risk management recommendation
        high_risk_factors = [rf for rf in risk_factors if rf.impact == "high"]
        if high_risk_factors:
            recommendations.append(TradingRecommendation(
                action="Implement strict risk management",
                reasoning=f"{len(high_risk_factors)} high-impact risk factors identified",
                priority="high",
                timeframe="immediate"
            ))
        
        # Position sizing recommendation
        if market_context.volatility_level == "high":
            recommendations.append(TradingRecommendation(
                action="Reduce position sizes due to high volatility",
                reasoning="Market volatility is elevated",
                priority="medium",
                timeframe="ongoing"
            ))
        
        # Market timing recommendation
        if market_context.overall_sentiment == "bearish":
            recommendations.append(TradingRecommendation(
                action="Consider defensive positioning",
                reasoning="Overall market sentiment is bearish",
                priority="medium",
                timeframe="1-2 weeks"
            ))
        
        return recommendations
    
    def generate_comprehensive_analysis(
        self,
        symbols: List[str],
        market_data: Dict[str, Any],
        rl_predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive market analysis"""
        
        # Analyze market context
        market_context = self.analyze_market_context(symbols, market_data, rl_predictions)
        
        # Identify opportunities
        opportunities = self.identify_trading_opportunities(symbols, rl_predictions, market_data)
        
        # Identify risks
        risk_factors = self.identify_risk_factors(symbols, market_data, rl_predictions)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(market_context, opportunities, risk_factors)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(market_context, opportunities, risk_factors)
        
        return {
            "market_context": market_context.overall_sentiment,
            "opportunities": [opp.symbol for opp in opportunities],
            "risk_factors": [rf.factor for rf in risk_factors],
            "recommendations": [rec.action for rec in recommendations],
            "reasoning": reasoning,
            "timestamp": datetime.now().isoformat(),
            "detailed_analysis": {
                "market_context": {
                    "sentiment": market_context.overall_sentiment,
                    "volatility": market_context.volatility_level,
                    "trend": market_context.market_trend,
                    "key_events": market_context.key_events
                },
                "opportunities": [
                    {
                        "symbol": opp.symbol,
                        "type": opp.opportunity_type,
                        "confidence": opp.confidence,
                        "reasoning": opp.reasoning,
                        "risk_level": opp.risk_level
                    } for opp in opportunities
                ],
                "risk_factors": [
                    {
                        "factor": rf.factor,
                        "impact": rf.impact,
                        "description": rf.description,
                        "mitigation": rf.mitigation
                    } for rf in risk_factors
                ],
                "recommendations": [
                    {
                        "action": rec.action,
                        "reasoning": rec.reasoning,
                        "priority": rec.priority,
                        "timeframe": rec.timeframe
                    } for rec in recommendations
                ]
            }
        }
    
    def _analyze_volatility(self, market_data: Dict[str, Any]) -> str:
        """Analyze market volatility"""
        # Simplified volatility analysis
        return "medium"  # Placeholder
    
    def _analyze_sector_performance(self, symbols: List[str], market_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze sector performance"""
        # Simplified sector analysis
        sectors = ["Technology", "Healthcare", "Finance", "Consumer", "Energy"]
        return {sector: np.random.uniform(-0.1, 0.1) for sector in sectors}
    
    def _determine_market_trend(self, rl_predictions: List[Dict[str, Any]]) -> str:
        """Determine overall market trend"""
        avg_prediction = np.mean([pred.get('prediction', 0) for pred in rl_predictions])
        
        if avg_prediction > 0.2:
            return "uptrend"
        elif avg_prediction < -0.2:
            return "downtrend"
        else:
            return "sideways"
    
    def _identify_key_events(self, symbols: List[str], market_data: Dict[str, Any]) -> List[str]:
        """Identify key market events"""
        return [
            "Earnings season approaching",
            "Fed meeting scheduled",
            "Economic data releases this week"
        ]
    
    def _analyze_sector_concentration(self, symbols: List[str]) -> Dict[str, float]:
        """Analyze sector concentration"""
        # Simplified sector analysis
        return {"max_sector_weight": 0.3}
    
    def _generate_reasoning(
        self, 
        market_context: MarketContext,
        opportunities: List[TradingOpportunity],
        risk_factors: List[RiskFactor]
    ) -> str:
        """Generate comprehensive reasoning"""
        
        reasoning_parts = []
        
        # Market context
        reasoning_parts.append(
            f"Market analysis shows {market_context.overall_sentiment} sentiment "
            f"with {market_context.volatility_level} volatility levels."
        )
        
        # Opportunities
        if opportunities:
            high_conf_opps = [opp for opp in opportunities if opp.confidence > 0.8]
            reasoning_parts.append(
                f"Identified {len(opportunities)} trading opportunities, "
                f"including {len(high_conf_opps)} high-confidence signals."
            )
        
        # Risk factors
        if risk_factors:
            high_risk_count = len([rf for rf in risk_factors if rf.impact == "high"])
            reasoning_parts.append(
                f"Identified {len(risk_factors)} risk factors, "
                f"including {high_risk_count} high-impact risks."
            )
        
        # Overall assessment
        if market_context.overall_sentiment == "bullish" and len(opportunities) > 2:
            reasoning_parts.append("Overall assessment suggests favorable trading conditions with multiple opportunities.")
        elif market_context.overall_sentiment == "bearish":
            reasoning_parts.append("Market conditions suggest caution and defensive positioning.")
        else:
            reasoning_parts.append("Mixed market conditions require careful position selection and risk management.")
        
        return " ".join(reasoning_parts)

# Global instance
llm_analysis_service = LLMAnalysisService() 