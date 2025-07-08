export const learningModulesData = {
  stock_basics: {
    title: 'Stock Market 101',
    description: 'Grasp the fundamentals of stocks and markets.',
    lessons: [
      {
        type: 'text',
        title: 'Welcome to the Stock Market!',
        content: `The stock market is where investors connect to buy and sell investments — most commonly, stocks, which are shares of ownership in a public company. When you buy a company's stock, you're purchasing a small piece of that company, called a share.`,
      },
      {
        type: 'text',
        title: 'Why Do Companies Issue Stock?',
        content: `Companies sell shares to raise money to fund operations, expand, or pay off debt. For investors, buying stock is a way to potentially grow their money and outpace inflation over time.`,
      },
      {
        type: 'flashcard_grid',
        title: 'Key Terms to Know',
        cards: [
          { front: 'Stock', back: 'A share of ownership in a publicly-traded company.' },
          { front: 'Ticker Symbol', back: 'A unique series of letters assigned to a security for trading purposes (e.g., AAPL for Apple).' },
          { front: 'Exchange', back: 'A marketplace where securities, commodities, derivatives and other financial instruments are traded (e.g., NYSE, NASDAQ).' },
          { front: 'Bull Market', back: 'A market in which share prices are rising, encouraging buying.' },
          { front: 'Bear Market', back: 'A market in which prices are falling, encouraging selling.' },
          { front: 'Dividend', back: 'A sum of money paid regularly by a company to its shareholders out of its profits.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Test Your Knowledge',
        quiz: {
          question: 'What does a ticker symbol like "TSLA" represent?',
          options: [
            'The company\'s full name',
            'A unique identifier for trading the stock',
            'The stock\'s current price',
            'The exchange it trades on',
          ],
          correctAnswer: 1,
          explanation: 'A ticker symbol is a unique shorthand used to identify a company\'s stock on an exchange, like TSLA for Tesla.',
        },
      },
    ],
  },
  options_intro: {
    title: 'Introduction to Options',
    description: 'Discover the world of call and put options.',
    lessons: [
       {
        type: 'text',
        title: 'What Are Options?',
        content: `An option is a contract that gives the buyer the right, but not the obligation, to buy or sell an underlying asset (like a stock) at a specific price on or before a certain date. Think of it as a down payment on a future transaction, giving you the "option" to proceed.`,
      },
      {
        type: 'flashcard_grid',
        title: 'Core Concepts of Options',
        cards: [
          { front: 'Call Option', back: 'Gives you the right to BUY a stock at a set price. You buy calls when you believe the stock price will go UP.' },
          { front: 'Put Option', back: 'Gives you the right to SELL a stock at a set price. You buy puts when you believe the stock price will go DOWN.' },
          { front: 'Strike Price', back: 'The set price at which you can buy or sell the stock. This is specified in the options contract.' },
          { front: 'Expiration Date', back: 'The date by which you must exercise your option. After this date, the contract is worthless.' },
          { front: 'Premium', back: 'The price you pay to purchase the options contract. It\'s the cost of having the "option".' },
          { front: 'In the Money (ITM)', back: 'An option that would be profitable to exercise. For calls, the stock price is above the strike. For puts, it\'s below.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Check Your Understanding',
        quiz: {
          question: 'If you believe a stock\'s price is going to rise significantly, which type of option would you buy?',
          options: [
            'A Put Option',
            'A Call Option',
            'A Strike Option',
            'A Premium Option',
          ],
          correctAnswer: 1,
          explanation: 'A Call Option gives you the right to buy a stock at a specific price, so it becomes more valuable as the stock price rises.',
        },
      },
    ]
  },
  chart_reading: {
    title: 'Reading Stock Charts',
    description: 'Learn to analyze charts and spot trends.',
    lessons: [
       {
        type: 'text',
        title: 'The Language of the Market',
        content: `Stock charts are the visual language of the financial markets. They plot the price of a stock over a period of time, allowing you to see patterns, trends, and key price levels at a glance. Mastering them is a fundamental skill for any trader.`,
      },
      {
        type: 'flashcard_grid',
        title: 'Chart Components',
        cards: [
          { front: 'Candlestick', back: 'Shows the high, low, open, and closing prices for a specific period. The "body" is colored to show if the price went up or down.' },
          { front: 'Volume', back: 'The number of shares traded during a period. High volume can indicate strong interest at a certain price level.' },
          { front: 'Support', back: 'A price level where a downtrend can be expected to pause due to a concentration of demand. Think of it as a floor.' },
          { front: 'Resistance', back: 'A price level where an uptrend can be expected to pause temporarily, due to a concentration of supply. Think of it as a ceiling.' },
          { front: 'Moving Average (MA)', back: 'A constantly updated average price over a specific time period. It helps smooth out price action and identify the trend direction.' },
          { front: 'Trendline', back: 'A line drawn over pivot highs or under pivot lows to show the prevailing direction of price. It can act as support or resistance.' },
        ],
      },
       {
        type: 'quiz',
        title: 'Chart Challenge',
        quiz: {
          question: 'What does a "support" level on a stock chart represent?',
          options: [
            'A price ceiling the stock struggles to break through',
            'The average price over the last 50 days',
            'A price floor where buying pressure tends to stop a price drop',
            'The total number of shares traded',
          ],
          correctAnswer: 2,
          explanation: 'Support is a price level where demand is thought to be strong enough to prevent the price from falling further, acting as a floor.',
        },
      },
    ]
  },
  risk_management: {
    title: 'Managing Risk',
    description: 'Strategies to protect your investments.',
    lessons: [
       {
        type: 'text',
        title: 'Protecting Your Capital',
        content: `Successful investing isn't just about picking winners; it's about not losing everything when you're wrong. Risk management is the set of rules and strategies you use to protect your downside and ensure you can keep trading for the long term.`,
      },
      {
        type: 'flashcard_grid',
        title: 'Essential Risk Tools',
        cards: [
          { front: 'Diversification', back: 'Spreading your investments across various assets or sectors to reduce the impact of a poor performance in any single one. "Don\'t put all your eggs in one basket."' },
          { front: 'Stop-Loss Order', back: 'An order placed with a broker to automatically sell a stock when it reaches a certain price. This is designed to limit an investor\'s loss.' },
          { front: 'Position Sizing', back: 'Deciding how much of your portfolio to invest in a single trade. Proper sizing ensures no single trade can wipe out your account.' },
          { front: 'Risk/Reward Ratio', back: 'Comparing the potential profit of a trade to its potential loss. Many traders aim for a ratio of at least 1:2, meaning the potential profit is double the potential loss.' },
          { front: 'Asset Allocation', back: 'The strategy of dividing your portfolio among different asset categories, such as stocks, bonds, and cash.' },
          { front: 'Hedging', back: 'Making an investment to reduce the risk of adverse price movements in an asset. Options are often used for hedging.' },
        ],
      },
       {
        type: 'quiz',
        title: 'Safety First Quiz',
        quiz: {
          question: 'What is the primary purpose of a stop-loss order?',
          options: [
            'To guarantee a profit on a trade',
            'To automatically limit your potential loss on a position',
            'To buy more shares when the price drops',
            'To receive a dividend payment',
          ],
          correctAnswer: 1,
          explanation: 'A stop-loss order is a crucial risk management tool that automatically sells your position at a predetermined price to prevent further losses.',
        },
      },
    ]
  },
  trading_sim: {
    title: 'Paper Trading Simulator',
    description: 'Practice trading with virtual money, risk-free.',
    lessons: [
       {
        type: 'text',
        title: 'Practice Makes Perfect',
        content: `The Paper Trading Simulator lets you practice buying and selling stocks and options using virtual money. It's the perfect way to test new strategies, learn the mechanics of trading, and build confidence without risking any real capital.`,
      },
      {
        type: 'text',
        title: 'How It Works',
        content: `Your paper trading account is separate from your real portfolio. Use it to place market orders, set limit orders, and build a virtual portfolio. All data is real-time, so you get an authentic trading experience. When you're ready, you can switch back to your real account.`,
      },
       {
        type: 'button',
        title: 'Launch Simulator',
        content: `There's no better way to learn than by doing. Head over to the Trading page and toggle on the "Simulator" mode to start paper trading now!`,
        path: '/trading?mode=simulator',
      },
    ]
  }
}; 