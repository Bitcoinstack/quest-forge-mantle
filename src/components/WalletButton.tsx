import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Wallet, ChevronDown, LogOut, ExternalLink, AlertCircle } from 'lucide-react';
import { mantle } from '@/lib/wagmi';
import { motion, AnimatePresence } from 'framer-motion';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== mantle.id;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300"
            disabled={isPending}
          >
            <Wallet className="w-5 h-5" />
            {isPending ? 'Connecting...' : 'Connect Wallet'}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          {connectors.map((connector) => (
            <DropdownMenuItem
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="cursor-pointer hover:bg-secondary"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isWrongNetwork) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        <Button
          variant="destructive"
          size="lg"
          onClick={() => switchChain({ chainId: mantle.id })}
          className="gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          Switch to Mantle
        </Button>
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="gap-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono">{formatAddress(address!)}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          Connected to Mantle
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => window.open(`https://explorer.mantle.xyz/address/${address}`, '_blank')}
          className="cursor-pointer hover:bg-secondary"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Network status banner for wrong network
export function NetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== mantle.id;

  return (
    <AnimatePresence>
      {isWrongNetwork && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-destructive/20 border-b border-destructive/30 overflow-hidden"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Please switch to Mantle network to use Yield Quest RPG</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => switchChain({ chainId: mantle.id })}
              disabled={isPending}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              {isPending ? 'Switching...' : 'Switch Network'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
