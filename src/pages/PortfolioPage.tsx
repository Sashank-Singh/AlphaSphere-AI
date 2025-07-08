import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, TrendingUp, Calendar, DollarSign, Wallet, Clock, Settings, Shield, FileText } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, cn } from '@/lib/utils';
import { StockPositionCard, OptionPositionCard } from '@/components/PositionCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Options Trading Account Form Schema
const optionsAccountSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Address
  streetAddress: z.string().min(1, 'Street address is required'),
  unit: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  
  // Financial Information
  annualIncomeMin: z.string().min(1, 'Annual income is required'),
  annualIncomeMax: z.string().min(1, 'Annual income is required'),
  totalNetWorthMin: z.string().min(1, 'Net worth is required'),
  totalNetWorthMax: z.string().min(1, 'Net worth is required'),
  liquidNetWorthMin: z.string().min(1, 'Liquid net worth is required'),
  liquidNetWorthMax: z.string().min(1, 'Liquid net worth is required'),
  liquidityNeeds: z.string().min(1, 'Liquidity needs is required'),
  
  // Investment Experience
  investmentExperienceStocks: z.string().min(1, 'Stock experience is required'),
  investmentExperienceOptions: z.string().min(1, 'Options experience is required'),
  riskTolerance: z.string().min(1, 'Risk tolerance is required'),
  investmentObjective: z.string().min(1, 'Investment objective is required'),
  investmentTimeHorizon: z.string().min(1, 'Investment time horizon is required'),
  
  // Personal Details
  maritalStatus: z.string().min(1, 'Marital status is required'),
  numberOfDependents: z.string().min(1, 'Number of dependents is required'),
  
  // Agreements
  optionsAgreement: z.boolean().refine(val => val === true, 'You must agree to the options trading agreement'),
  riskDisclosure: z.boolean().refine(val => val === true, 'You must acknowledge the risk disclosure'),
});

type OptionsAccountForm = z.infer<typeof optionsAccountSchema>;

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'account'>('positions');
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isOptionsEnabled, setIsOptionsEnabled] = useState(false); // This would come from user's account status
  
  const form = useForm<OptionsAccountForm>({
    resolver: zodResolver(optionsAccountSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      streetAddress: '',
      unit: '',
      city: '',
      state: '',
      postalCode: '',
      annualIncomeMin: '',
      annualIncomeMax: '',
      totalNetWorthMin: '',
      totalNetWorthMax: '',
      liquidNetWorthMin: '',
      liquidNetWorthMax: '',
      liquidityNeeds: '',
      investmentExperienceStocks: '',
      investmentExperienceOptions: '',
      riskTolerance: '',
      investmentObjective: '',
      investmentTimeHorizon: '',
      maritalStatus: '',
      numberOfDependents: '',
      optionsAgreement: false,
      riskDisclosure: false,
    },
  });
  
  const onSubmitOptionsAccount = async (data: OptionsAccountForm) => {
    try {
      // Here you would make the API call to create the options account
      console.log('Options account data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsOptionsEnabled(true);
      setIsOptionsModalOpen(false);
      
      // Show success message
      alert('Options trading has been successfully enabled on your account!');
    } catch (error) {
      console.error('Error enabling options trading:', error);
      alert('There was an error enabling options trading. Please try again.');
    }
  };
  
  // Calculate portfolio metrics
  const stockValue = portfolio.positions.reduce(
    (sum, position) => sum + (position.quantity * position.currentPrice),
    0
  );
  
  const optionsValue = portfolio.optionPositions.reduce(
    (sum, option) => sum + ((option.quantity || 0) * option.premium * 100),
    0
  );
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...portfolio.transactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full hover:bg-primary/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Portfolio</h1>
        </div>
        
        <Button variant="outline" size="sm" className="h-9">
          <Clock className="h-4 w-4 mr-2" />
          Last Updated: {new Date().toLocaleTimeString()}
        </Button>
      </div>
      
      {/* Portfolio Summary */}
      <div className="px-8 py-6">
        <Card className="overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground font-medium">
                  Total Portfolio Value
                </div>
                <div className="text-3xl font-bold tracking-tight mt-1">
                  {formatCurrency(portfolio.totalValue)}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Cash</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(portfolio.cash)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Stocks</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(stockValue)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Options</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(optionsValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <div className="px-8">
        <Tabs 
          defaultValue="positions" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'positions' | 'history' | 'account')}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList className="p-1 bg-muted/50">
              <TabsTrigger 
                value="positions"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Account
              </TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm"
              className="h-9"
              onClick={() => navigate('/search')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Trade
            </Button>
          </div>
          
          {/* Positions Tab */}
          <TabsContent value="positions">
            {portfolio.positions.length === 0 && portfolio.optionPositions.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any positions yet.<br />
                    Start trading to build your portfolio.
                  </p>
                  <Button 
                    onClick={() => navigate('/search')}
                    className="group"
                  >
                    Find Stocks to Trade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {portfolio.positions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium tracking-tight flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Stocks
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {portfolio.positions.length} Position{portfolio.positions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {portfolio.positions.map(position => (
                        <StockPositionCard key={position.id} position={position} />
                      ))}
                    </div>
                  </div>
                )}
                
                {portfolio.optionPositions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium tracking-tight flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Options
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {portfolio.optionPositions.length} Position{portfolio.optionPositions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {portfolio.optionPositions.map(option => (
                        <OptionPositionCard key={option.id} option={option} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            {sortedTransactions.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No transaction history yet.<br />
                    Your trades will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedTransactions.map(transaction => (
                  <Card key={transaction.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full",
                              transaction.type === 'buy' 
                                ? "bg-green-500/10 text-green-500" 
                                : "bg-red-500/10 text-red-500"
                            )}>
                              {transaction.type.toUpperCase()}
                            </span>
                            <span className="font-medium">{transaction.symbol}</span>
                            
                            {transaction.assetType === 'option' && transaction.optionDetails && (
                              <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                transaction.optionDetails.type === 'call' 
                                  ? "bg-green-500/10 text-green-500" 
                                  : "bg-red-500/10 text-red-500"
                              )}>
                                {transaction.optionDetails.type.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-2">
                            {transaction.date.toLocaleDateString()} at {transaction.date.toLocaleTimeString()}
                          </div>
                          
                          {transaction.assetType === 'option' && transaction.optionDetails && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ${transaction.optionDetails.strikePrice} strike, exp: {
                                transaction.optionDetails.expiryDate.toLocaleDateString()
                              }
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-lg">
                            {formatCurrency(Math.abs(transaction.total))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {transaction.quantity} × {formatCurrency(transaction.price)}
                            {transaction.assetType === 'option' ? '/contract' : '/share'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Options Trading Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Options Trading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Options Trading Status</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isOptionsEnabled 
                          ? 'Options trading is enabled on your account. You can trade Level 1-3 options.'
                          : 'Enable options trading to access advanced trading strategies and hedging tools.'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        isOptionsEnabled ? "bg-green-500" : "bg-yellow-500"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        isOptionsEnabled ? "text-green-600" : "text-yellow-600"
                      )}>
                        {isOptionsEnabled ? 'Enabled' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {!isOptionsEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Level 1-3 Trading</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Access to covered calls, cash-secured puts, and advanced strategies
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">FINRA Compliant</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Automatic approval process with full regulatory compliance
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Dialog open={isOptionsModalOpen} onOpenChange={setIsOptionsModalOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Enable Options Trading
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Enable Options Trading</DialogTitle>
                          </DialogHeader>
                          
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmitOptionsAccount)} className="space-y-6">
                              {/* Personal Information Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>First Name *</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Middle Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Last Name *</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date of Birth *</FormLabel>
                                        <FormControl>
                                          <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email Address *</FormLabel>
                                        <FormControl>
                                          <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone Number *</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="555-666-7788" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <Separator />
                              
                              {/* Address Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Address Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="md:col-span-3">
                                    <FormField
                                      control={form.control}
                                      name="streetAddress"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Street Address *</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Unit/Apt</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>City *</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>State *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="CA">California</SelectItem>
                                            <SelectItem value="NY">New York</SelectItem>
                                            <SelectItem value="TX">Texas</SelectItem>
                                            <SelectItem value="FL">Florida</SelectItem>
                                            {/* Add more states as needed */}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Postal Code *</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              
                              <Separator />
                              
                              {/* Financial Information Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Financial Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="annualIncomeMin"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Annual Income (Min) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="10000">$10,000 - $25,000</SelectItem>
                                            <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                                            <SelectItem value="50000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="100000">$100,000 - $250,000</SelectItem>
                                            <SelectItem value="250000">$250,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="annualIncomeMax"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Annual Income (Max) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="25000">$10,000 - $25,000</SelectItem>
                                            <SelectItem value="50000">$25,000 - $50,000</SelectItem>
                                            <SelectItem value="100000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="250000">$100,000 - $250,000</SelectItem>
                                            <SelectItem value="500000">$250,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="totalNetWorthMin"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Total Net Worth (Min) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="10000">$10,000 - $50,000</SelectItem>
                                            <SelectItem value="50000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="100000">$100,000 - $500,000</SelectItem>
                                            <SelectItem value="500000">$500,000 - $1,000,000</SelectItem>
                                            <SelectItem value="1000000">$1,000,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="totalNetWorthMax"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Total Net Worth (Max) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="50000">$10,000 - $50,000</SelectItem>
                                            <SelectItem value="100000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="500000">$100,000 - $500,000</SelectItem>
                                            <SelectItem value="1000000">$500,000 - $1,000,000</SelectItem>
                                            <SelectItem value="2000000">$1,000,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="liquidNetWorthMin"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Liquid Net Worth (Min) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="5000">$5,000 - $25,000</SelectItem>
                                            <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                                            <SelectItem value="50000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="100000">$100,000 - $250,000</SelectItem>
                                            <SelectItem value="250000">$250,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="liquidNetWorthMax"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Liquid Net Worth (Max) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select range" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="25000">$5,000 - $25,000</SelectItem>
                                            <SelectItem value="50000">$25,000 - $50,000</SelectItem>
                                            <SelectItem value="100000">$50,000 - $100,000</SelectItem>
                                            <SelectItem value="250000">$100,000 - $250,000</SelectItem>
                                            <SelectItem value="500000">$250,000+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="liquidityNeeds"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Liquidity Needs *</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select liquidity needs" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="does_not_matter">Does not matter</SelectItem>
                                          <SelectItem value="somewhat_important">Somewhat important</SelectItem>
                                          <SelectItem value="important">Important</SelectItem>
                                          <SelectItem value="very_important">Very important</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <Separator />
                              
                              {/* Investment Experience Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Investment Experience</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="investmentExperienceStocks"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Stock Trading Experience *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select experience" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="limited">Limited (less than 1 year)</SelectItem>
                                            <SelectItem value="good">Good (1-3 years)</SelectItem>
                                            <SelectItem value="extensive">Extensive (3-5 years)</SelectItem>
                                            <SelectItem value="over_5_years">Over 5 years</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="investmentExperienceOptions"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Options Trading Experience *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select experience" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="limited">Limited (less than 1 year)</SelectItem>
                                            <SelectItem value="good">Good (1-3 years)</SelectItem>
                                            <SelectItem value="extensive">Extensive (3-5 years)</SelectItem>
                                            <SelectItem value="over_5_years">Over 5 years</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="riskTolerance"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Risk Tolerance *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select risk tolerance" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="conservative">Conservative</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="aggressive">Aggressive</SelectItem>
                                            <SelectItem value="speculative">Speculative</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="investmentObjective"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Investment Objective *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select objective" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="growth">Growth</SelectItem>
                                            <SelectItem value="capital_preservation">Capital Preservation</SelectItem>
                                            <SelectItem value="market_speculation">Market Speculation</SelectItem>
                                            <SelectItem value="tax_minimization">Tax Minimization</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="investmentTimeHorizon"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Investment Time Horizon *</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select time horizon" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="less_than_1_year">Less than 1 year</SelectItem>
                                          <SelectItem value="1_to_3_years">1 to 3 years</SelectItem>
                                          <SelectItem value="3_to_5_years">3 to 5 years</SelectItem>
                                          <SelectItem value="5_to_10_years">5 to 10 years</SelectItem>
                                          <SelectItem value="more_than_10_years">More than 10 years</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <Separator />
                              
                              {/* Personal Details Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="maritalStatus"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Marital Status *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="SINGLE">Single</SelectItem>
                                            <SelectItem value="MARRIED">Married</SelectItem>
                                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="numberOfDependents"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Number of Dependents *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select number" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="0">0</SelectItem>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              
                              <Separator />
                              
                              {/* Agreements Section */}
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">Agreements & Disclosures</h3>
                                <div className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name="optionsAgreement"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="text-sm font-normal">
                                            I agree to the Options Trading Agreement *
                                          </FormLabel>
                                          <p className="text-xs text-muted-foreground">
                                            By checking this box, you acknowledge that you have read and agree to the terms and conditions of options trading.
                                          </p>
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="riskDisclosure"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="text-sm font-normal">
                                            I acknowledge the Options Risk Disclosure *
                                          </FormLabel>
                                          <p className="text-xs text-muted-foreground">
                                            Options trading involves substantial risk and is not suitable for all investors. You may lose more than your initial investment.
                                          </p>
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-4 pt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setIsOptionsModalOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                  {form.formState.isSubmitting ? 'Processing...' : 'Enable Options Trading'}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  
                  {isOptionsEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">Level 1-3</div>
                              <div className="text-sm text-green-700">Trading Level</div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">✓</div>
                              <div className="text-sm text-blue-700">FINRA Approved</div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">∞</div>
                              <div className="text-sm text-purple-700">Strategies Available</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Options Trading Features</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Covered calls and cash-secured puts</li>
                          <li>• Protective puts and collar strategies</li>
                          <li>• Spreads and advanced multi-leg strategies</li>
                          <li>• Real-time options market data</li>
                          <li>• Exercise and assignment management</li>
                          <li>• Risk management tools</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioPage;
