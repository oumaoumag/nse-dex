import React, { ReactNode } from 'react';
import { WalletProvider } from '../contexts/WalletContext';

interface WalletLayoutProps {
  children: ReactNode;
}

const WalletLayout: React.FC<WalletLayoutProps> = ({ children }) => {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
};

export default WalletLayout; 