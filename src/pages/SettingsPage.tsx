
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, signOut } = useAuth();
  const { portfolio, resetPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [aiBudget, setAIBudget] = useState(user?.aiBudget.toString() || '1000');
  const [riskTolerance, setRiskTolerance] = useState(user?.riskTolerance || 'medium');
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const handleSaveAISettings = () => {
    const budgetNumber = parseFloat(aiBudget);
    
    if (isNaN(budgetNumber) || budgetNumber <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Please enter a valid budget amount greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (budgetNumber > portfolio.totalValue) {
      toast({
        title: "Budget Too High",
        description: "AI budget cannot exceed your total portfolio value.",
        variant: "destructive"
      });
      return;
    }
    
    updateUser({
      aiBudget: budgetNumber,
      riskTolerance: riskTolerance as 'low' | 'medium' | 'high'
    });
    
    toast({
      title: "Settings Saved",
      description: "Your AI trading settings have been updated.",
    });
  };
  
  const handleResetPortfolio = () => {
    resetPortfolio();
    setIsConfirmResetOpen(false);
  };
  
  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold">Settings</h1>
        
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Profile Section */}
      <Card className="mx-4 mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user.name} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Trading Settings */}
      <Card className="mx-4 mb-6">
        <CardHeader>
          <CardTitle>AI Trading Settings</CardTitle>
          <CardDescription>Configure how the AI makes trading decisions for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="budget">AI Trading Budget</Label>
              <div className="flex items-center mt-1.5">
                <span className="text-muted-foreground mr-2">$</span>
                <Input 
                  id="budget" 
                  type="number" 
                  value={aiBudget}
                  onChange={(e) => setAIBudget(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Maximum amount the AI can use for a single trade recommendation
              </p>
            </div>
            
            <div>
              <Label>Risk Tolerance</Label>
              <RadioGroup 
                value={riskTolerance} 
                onValueChange={setRiskTolerance}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal">Low - Conservative options with minimal risk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">Medium - Balanced risk/reward options</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">High - Aggressive options with higher potential returns</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button onClick={handleSaveAISettings}>
              Save AI Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* App Settings */}
      <Card className="mx-4 mb-6">
        <CardHeader>
          <CardTitle>App Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch id="darkMode" />
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm mb-2">
                Current Balance: <span className="font-bold">{formatCurrency(portfolio.totalValue)}</span>
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmResetOpen(true)}
                className="w-full"
              >
                Reset Portfolio to $10,000
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Logout Button */}
      <div className="px-4">
        <Button 
          variant="outline" 
          onClick={() => setIsConfirmLogoutOpen(true)}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      {/* Reset Portfolio Confirmation Dialog */}
      <Dialog open={isConfirmResetOpen} onOpenChange={setIsConfirmResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reset Portfolio
            </DialogTitle>
            <DialogDescription>
              This will reset your portfolio to $10,000 and remove all positions and transaction history.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetPortfolio}>
              Yes, Reset Portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={isConfirmLogoutOpen} onOpenChange={setIsConfirmLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? Your data will be preserved for when you log back in.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
