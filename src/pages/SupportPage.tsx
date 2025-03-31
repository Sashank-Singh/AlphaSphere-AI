import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, MessageCircle, Book, Mail, Phone } from 'lucide-react';

const SupportPage: React.FC = () => {
  const faqs = [
    {
      question: "How do I start trading?",
      answer: "To start trading, first complete your account verification and deposit funds. Then, you can use our platform to research stocks, analyze market trends, and execute trades."
    },
    {
      question: "What are the trading fees?",
      answer: "Our platform offers commission-free trading for stocks and ETFs. However, regulatory fees and margin rates may apply for certain types of trades."
    },
    {
      question: "How does the AI trading assistant work?",
      answer: "Our AI trading assistant analyzes market data, trends, and your portfolio to provide personalized trading recommendations. It uses advanced algorithms to identify potential opportunities while managing risk."
    },
    {
      question: "How can I manage my risk?",
      answer: "We recommend using stop-loss orders, diversifying your portfolio, and following our risk management guidelines. Our platform also provides risk analysis tools and alerts."
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>Browse our guides and tutorials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Get help via email</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Other ways to reach us</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Phone Support</div>
              <div className="text-sm text-muted-foreground">1-800-TRADING (Mon-Fri, 9AM-5PM EST)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">support@tradesimply.com</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage; 