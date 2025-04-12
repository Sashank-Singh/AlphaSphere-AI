
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  X, 
  ChevronRight,
  Check,
  BarChart2,
  LineChart,
  PieChart,
  ChartPie,
  ArrowRight,
  RefreshCcw,
  Lightbulb,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolio } from '@/context/PortfolioContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

interface EnhancedSphereAIProps {
  className?: string;
}

type AnalysisType = 'portfolio' | 'market' | 'stock';
type ActionType = 'analyze' | 'optimize' | 'allocate';
type AnalysisStatus = 'idle' | 'analyzing' | 'complete' | 'approved' | 'declined';

interface AnalysisStep {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
}

interface AnalysisTask {
  id: string;
  type: AnalysisType;
  action: ActionType;
  target: string;
  status: AnalysisStatus;
  steps: AnalysisStep[];
  result?: string;
  recommendation?: string;
}

const EnhancedSphereAI: React.FC<EnhancedSphereAIProps> = ({ className }) => {
  const { portfolio } = usePortfolio();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTask, setCurrentTask] = useState<AnalysisTask | null>(null);
  const [taskHistory, setTaskHistory] = useState<AnalysisTask[]>([]);
  
  const toggleOpen = () => setIsOpen(prev => !prev);
  const toggleExpanded = () => setIsExpanded(prev => !prev);
  
  // Generate a new analysis task
  const startAnalysis = (type: AnalysisType, action: ActionType, target: string) => {
    // Reset any existing task
    if (currentTask) {
      setTaskHistory(prev => [...prev, currentTask]);
    }
    
    // Create steps based on task type
    const steps = generateSteps(type, action);
    
    const newTask: AnalysisTask = {
      id: `task-${Date.now()}`,
      type,
      action,
      target,
      status: 'analyzing',
      steps
    };
    
    setCurrentTask(newTask);
    setIsExpanded(true);
    
    // Simulate progression through analysis steps
    simulateAnalysisProgress(newTask);
  };
  
  // Helper to generate appropriate steps based on task type
  const generateSteps = (type: AnalysisType, action: ActionType): AnalysisStep[] => {
    if (type === 'portfolio') {
      if (action === 'analyze') {
        return [
          { title: 'Analyzing risk exposure', description: 'Calculating sector-based risk metrics', status: 'pending' },
          { title: 'Evaluating diversification', description: 'Comparing against optimal allocation models', status: 'pending' },
          { title: 'Checking performance', description: 'Benchmarking against market indices', status: 'pending' },
        ];
      } else if (action === 'optimize') {
        return [
          { title: 'Portfolio variance analysis', description: 'Calculating correlation coefficients', status: 'pending' },
          { title: 'Return optimization', description: 'Applying efficient frontier model', status: 'pending' },
          { title: 'Risk-adjusted allocation', description: 'Generating optimal weight distribution', status: 'pending' },
        ];
      } else {
        return [
          { title: 'Current allocation analysis', description: 'Identifying imbalances in current holdings', status: 'pending' },
          { title: 'Sector rebalancing', description: 'Calculating target sector weights', status: 'pending' },
          { title: 'Position adjustment plan', description: 'Determining specific trades to rebalance', status: 'pending' },
        ];
      }
    } else if (type === 'market') {
      return [
        { title: 'Analyzing market trends', description: 'Reviewing recent index movements', status: 'pending' },
        { title: 'Sector rotation analysis', description: 'Identifying sector momentum shifts', status: 'pending' },
        { title: 'Market sentiment scan', description: 'Aggregating news and social sentiment', status: 'pending' },
      ];
    } else {
      return [
        { title: 'Technical analysis', description: 'Identifying chart patterns and indicators', status: 'pending' },
        { title: 'News sentiment scan', description: 'Analyzing recent news impact', status: 'pending' },
        { title: 'Earnings projection', description: 'Evaluating upcoming earnings expectations', status: 'pending' },
      ];
    }
  };
  
  // Simulate step-by-step analysis progression
  const simulateAnalysisProgress = (task: AnalysisTask) => {
    const totalSteps = task.steps.length;
    let currentStepIndex = 0;
    
    const processStep = () => {
      if (currentStepIndex < totalSteps) {
        const updatedSteps = [...task.steps];
        updatedSteps[currentStepIndex].status = 'active';
        
        setCurrentTask({
          ...task,
          steps: updatedSteps
        });
        
        // After a delay, mark this step as complete and move to next
        setTimeout(() => {
          const updatedSteps = [...task.steps];
          updatedSteps[currentStepIndex].status = 'complete';
          currentStepIndex++;
          
          if (currentStepIndex < totalSteps) {
            setCurrentTask({
              ...task,
              steps: updatedSteps
            });
            processStep();
          } else {
            // All steps complete
            setCurrentTask({
              ...task,
              steps: updatedSteps,
              status: 'complete',
              result: generateResult(task.type, task.action),
              recommendation: generateRecommendation(task.type, task.action)
            });
          }
        }, 1500);
      }
    };
    
    // Start processing the first step
    processStep();
  };
  
  // Generate a result based on analysis type
  const generateResult = (type: AnalysisType, action: ActionType): string => {
    if (type === 'portfolio') {
      if (action === 'analyze') {
        return 'Portfolio has moderate risk profile with 68% correlation to market movements. Diversification score: 7.2/10.';
      } else if (action === 'optimize') {
        return 'Optimal portfolio configuration identified with potential to increase risk-adjusted return by 12%.';
      } else {
        return 'Current allocation is overweight in technology (42%) and underweight in healthcare (8%).';
      }
    } else if (type === 'market') {
      return 'Market indicators suggest defensive positioning with 65% probability of increased volatility over next 2 weeks.';
    } else {
      return 'Technical indicators show bullish divergence. Recent sentiment shows 78% positive coverage.';
    }
  };
  
  // Generate a recommendation based on analysis type
  const generateRecommendation = (type: AnalysisType, action: ActionType): string => {
    if (type === 'portfolio') {
      if (action === 'analyze') {
        return 'Consider reducing technology exposure by 15% to improve diversification score.';
      } else if (action === 'optimize') {
        return 'Rebalance by adding positions in consumer staples and healthcare sectors.';
      } else {
        return 'Adjust holdings to target: Tech 30%, Healthcare 18%, Financials 15%, Consumer 12%, Other 25%.';
      }
    } else if (type === 'market') {
      return 'Consider increasing cash position by 10% and implementing hedges against volatility.';
    } else {
      return 'Consider establishing a position with 20% of normal position size and scaling in over 2 weeks.';
    }
  };
  
  // Handle approval of recommendations
  const handleApprove = () => {
    if (!currentTask) return;
    
    toast({
      title: "Recommendation approved",
      description: `${currentTask.action.charAt(0).toUpperCase() + currentTask.action.slice(1)} action for ${currentTask.target} will be implemented.`,
    });
    
    setCurrentTask({
      ...currentTask,
      status: 'approved'
    });
    
    // After a short delay, move the task to history and reset
    setTimeout(() => {
      setTaskHistory(prev => [...prev, {...currentTask, status: 'approved'}]);
      setCurrentTask(null);
    }, 2000);
  };
  
  // Handle declining of recommendations
  const handleDecline = () => {
    if (!currentTask) return;
    
    toast({
      title: "Recommendation declined",
      description: "You can revisit this recommendation later if needed.",
      variant: "destructive"
    });
    
    setCurrentTask({
      ...currentTask,
      status: 'declined'
    });
    
    // After a short delay, move the task to history and reset
    setTimeout(() => {
      setTaskHistory(prev => [...prev, {...currentTask, status: 'declined'}]);
      setCurrentTask(null);
    }, 2000);
  };
  
  // Quick action buttons for different analysis types
  const quickActions = [
    { 
      type: 'portfolio' as AnalysisType, 
      action: 'analyze' as ActionType, 
      target: 'Portfolio', 
      icon: <BarChart2 className="h-3 w-3" />, 
      label: 'Analyze Portfolio' 
    },
    { 
      type: 'portfolio' as AnalysisType, 
      action: 'optimize' as ActionType, 
      target: 'Portfolio', 
      icon: <LineChart className="h-3 w-3" />, 
      label: 'Optimize Portfolio' 
    },
    { 
      type: 'portfolio' as AnalysisType, 
      action: 'allocate' as ActionType, 
      target: 'Portfolio', 
      icon: <PieChart className="h-3 w-3" />, 
      label: 'Allocate Assets' 
    },
    { 
      type: 'market' as AnalysisType, 
      action: 'analyze' as ActionType, 
      target: 'Market', 
      icon: <BrainCircuit className="h-3 w-3" />, 
      label: 'Analyze Market' 
    }
  ];
  
  // Status badge component
  const StatusBadge: React.FC<{status: AnalysisStatus}> = ({status}) => {
    switch(status) {
      case 'analyzing':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Analyzing</Badge>;
      case 'complete':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Action Required</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Declined</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2",
        className
      )}
    >
      {isOpen && (
        <Card className={cn(
          "w-[320px] shadow-lg border-primary/20 transition-all duration-300 ease-in-out",
          isExpanded ? "h-96" : "h-auto",
          currentTask ? "border-primary/30" : "border-gray-800/50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-1 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="flex gap-1">
                {currentTask && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0" 
                    onClick={toggleExpanded}
                  >
                    {isExpanded ? 
                      <ChevronRight className="h-3.5 w-3.5" /> : 
                      <ArrowRight className="h-3.5 w-3.5" />
                    }
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={toggleOpen}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Interface when there's no current task */}
            {!currentTask && (
              <div className="mt-3 space-y-3">
                <div className="text-xs text-muted-foreground">
                  Select an action to begin:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <Button 
                      key={i}
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 justify-start"
                      onClick={() => startAnalysis(action.type, action.action, action.target)}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
                
                {taskHistory.length > 0 && (
                  <div className="border-t border-border pt-2 mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Recent Actions</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0" 
                        onClick={() => setTaskHistory([])}
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {taskHistory.slice(-3).map((task, i) => (
                        <div 
                          key={i} 
                          className="text-xs p-1.5 rounded bg-muted/30 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">
                              {task.action.charAt(0).toUpperCase() + task.action.slice(1)} {task.target}
                            </div>
                            <div className="text-muted-foreground text-[10px] truncate max-w-[200px]">
                              {task.recommendation}
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Interface when there is an active task */}
            {currentTask && (
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">
                      {currentTask.action.charAt(0).toUpperCase() + currentTask.action.slice(1)} {currentTask.target}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currentTask.type === 'portfolio' ? "Analyzing your holdings" : 
                       currentTask.type === 'market' ? "Analyzing market conditions" : 
                       "Analyzing stock data"}
                    </div>
                  </div>
                  <StatusBadge status={currentTask.status} />
                </div>
                
                {isExpanded && (
                  <div className="space-y-3 pt-1">
                    {/* Progress steps */}
                    <div className="space-y-2.5">
                      {currentTask.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className={cn(
                            "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0",
                            step.status === 'pending' ? "border border-muted-foreground/30" :
                            step.status === 'active' ? "bg-blue-500/20 text-blue-500" :
                            "bg-green-500/20 text-green-500"
                          )}>
                            {step.status === 'complete' && (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            {step.status === 'active' && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className={cn(
                              "text-xs font-medium",
                              step.status === 'pending' ? "text-muted-foreground" :
                              step.status === 'active' ? "text-blue-500" : ""
                            )}>
                              {step.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {step.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Results and recommendations */}
                    {currentTask.status === 'complete' && (
                      <div className="space-y-2 pt-1">
                        <div className="space-y-1 border-l-2 border-primary/30 pl-3">
                          <div className="text-xs font-medium">Analysis Result</div>
                          <p className="text-xs">{currentTask.result}</p>
                        </div>
                        
                        <div className="space-y-1 border-l-2 border-green-500/30 pl-3">
                          <div className="text-xs font-medium flex items-center gap-1">
                            <Lightbulb className="h-3 w-3 text-green-500" />
                            <span>Recommendation</span>
                          </div>
                          <p className="text-xs">{currentTask.recommendation}</p>
                        </div>
                        
                        <div className="flex justify-between gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 border-destructive/50 hover:bg-destructive/10"
                            onClick={handleDecline}
                          >
                            Decline
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1 h-8"
                            onClick={handleApprove}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Floating button to open assistant */}
      <Button 
        className={cn(
          "rounded-full h-12 w-12 shadow-lg p-0",
          isOpen ? "bg-primary/90 hover:bg-primary/70" : "bg-primary"
        )}
        onClick={toggleOpen}
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default EnhancedSphereAI;
