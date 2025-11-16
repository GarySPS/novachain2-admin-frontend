import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const usernames = ['User123', 'Satoshi21', 'CryptoQueen', 'ElonX', 'Whale9', 'GaryBTC', 'NovaVIP', 'Mia2025', 'TraderJoe', 'BlockMogul'];
const coins = ['BTC', 'ETH', 'SOL', 'XRP', 'TON', 'BNB'];

function randomAmount() {
  // More realistic: sometimes bigger, sometimes smaller wins
  const base = Math.random() < 0.2 ? Math.random() * 900 + 1100 : Math.random() * 250 + 100;
  return Number(base).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const generateMessage = () => {
  const user = usernames[Math.floor(Math.random() * usernames.length)];
  const coin = coins[Math.floor(Math.random() * coins.length)];
  const amount = randomAmount();
  return `${user} won $${amount} on ${coin}/USDT`;
};

export default function TradeTicker() {
  const [messages, setMessages] = useState(() => Array.from({ length: 6 }, generateMessage));
  const containerRef = useRef(null);

  // Add a new message every 3 seconds, keep 6 for smooth scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        const newMsg = generateMessage();
        return [...prev.slice(1), newMsg];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // For infinite scroll, duplicate visible messages
  const scrollMsgs = [...messages, ...messages];

  return (
    <div
      className="w-full mt-8 bg-gradient-to-r from-[#21253b]/85 via-[#181b25]/90 to-[#20253b]/85 rounded-xl shadow-lg border-t border-white/5 overflow-hidden relative px-2 py-3"
      aria-label="Live Winners Ticker"
      ref={containerRef}
    >
      <div className="overflow-hidden relative">
        <motion.div
          className="flex whitespace-nowrap gap-12"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 20,
          }}
        >
          {scrollMsgs.map((msg, i) => (
            <span
              key={i}
              className="font-semibold text-sm md:text-base text-[#FFD700] tracking-wide mr-8 flex-shrink-0 flex items-center"
              style={{
                textShadow: '0 2px 12px #181b25, 0 2px 6px #FFD70025',
                letterSpacing: 0.5,
              }}
            >
              <span className="inline-block px-2 py-1 rounded-md bg-[#222836]/70 text-[#ffd700] shadow border border-[#ffd70022] mr-2 animate-pulse"
                style={{ filter: "drop-shadow(0 0 4px #FFD700cc)" }}
              >
                🏆
              </span>
              {msg}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
