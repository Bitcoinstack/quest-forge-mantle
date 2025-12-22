import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getQuestConfig, formatDuration } from '@/lib/questConfig';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Coins, Clock, Sparkles } from 'lucide-react';
import type { Quest } from '@/lib/contracts';

interface JoinQuestModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'input' | 'approving' | 'joining' | 'success' | 'error';

export function JoinQuestModal({ quest, isOpen, onClose, onSuccess }: JoinQuestModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<ModalStep>('input');
  const [errorMessage, setErrorMessage] = useState('');

  if (!quest) return null;

  const config = getQuestConfig(Number(quest.id));
  const minAmount = Number(quest.minAmount) / 1e18;

  const handleJoinQuest = async () => {
    const stakeAmount = parseFloat(amount);
    
    if (isNaN(stakeAmount) || stakeAmount < minAmount) {
      toast.error(`Minimum stake is ${minAmount} tokens`);
      return;
    }

    try {
      // Step 1: Approve tokens
      setStep('approving');
      
      // Simulate approval delay (replace with actual contract call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Join quest
      setStep('joining');
      
      // Simulate join delay (replace with actual contract call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setStep('success');
      toast.success('Quest joined successfully!');
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
      
    } catch (error) {
      setStep('error');
      setErrorMessage(error instanceof Error ? error.message : 'Transaction failed');
      toast.error('Failed to join quest');
    }
  };

  const handleClose = () => {
    setStep('input');
    setAmount('');
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <span>{config.icon}</span>
            {config.name}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Quest Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{formatDuration(Number(quest.minDuration))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Min Stake</p>
                    <p className="font-semibold">{minAmount.toLocaleString()} tokens</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Stake Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Min: ${minAmount}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20 bg-muted/50 border-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary"
                    onClick={() => setAmount(minAmount.toString())}
                  >
                    MAX
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: 10,000 tokens (demo)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleJoinQuest}
                  disabled={!amount || parseFloat(amount) < minAmount}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90"
                >
                  <Sparkles className="w-4 h-4" />
                  Approve & Join
                </Button>
              </div>
            </motion.div>
          )}

          {(step === 'approving' || step === 'joining') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-lg">
                  {step === 'approving' ? 'Approving tokens...' : 'Joining quest...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Please confirm the transaction in your wallet
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${step === 'approving' ? 'bg-primary animate-pulse' : 'bg-accent'}`} />
                <div className="w-8 h-0.5 bg-muted" />
                <div className={`w-3 h-3 rounded-full ${step === 'joining' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className={step === 'approving' ? 'text-primary' : 'text-accent'}>Approve</span>
                <span className={step === 'joining' ? 'text-primary' : ''}>Join Quest</span>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <CheckCircle2 className="w-16 h-16 text-accent" />
              </motion.div>
              <div className="text-center">
                <p className="font-display text-2xl font-bold gradient-text">Quest Joined!</p>
                <p className="text-muted-foreground mt-2">
                  Your adventure begins now. Return after {formatDuration(Number(quest.minDuration))} to complete.
                </p>
              </div>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 flex flex-col items-center gap-4"
            >
              <AlertCircle className="w-16 h-16 text-destructive" />
              <div className="text-center">
                <p className="font-semibold text-lg">Transaction Failed</p>
                <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
              </div>
              <Button variant="outline" onClick={() => setStep('input')}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
