"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { LOCKER_ABI, LOCKER_ADDRESS } from "@/config/contracts";
import { mainnet } from "wagmi/chains";
import { type Address } from "viem";
import FlyingHippo from "@/components/FlyingHippo";

const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

type BalanceResult = readonly [bigint, bigint];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [balances, setBalances] = useState<{
    locked: bigint;
    unlocked: bigint;
  } | null>(null);
  const [showHippo, setShowHippo] = useState(false);

  const {
    data: balanceData,
    isError: isBalanceError,
    error: balanceError,
  } = useReadContract({
    address: LOCKER_ADDRESS as Address,
    abi: LOCKER_ABI,
    functionName: "getAccountBalances",
    args: address ? [address as Address] : undefined,
    chainId: mainnet.id,
  });

  const {
    writeContract,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();
  const { data: transactionReceipt, isLoading: isWaitingForReceipt } =
    useWaitForTransactionReceipt();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging for balance data
  useEffect(() => {
    if (address) {
      console.log("Current wallet address:", address);
      console.log("Contract address:", LOCKER_ADDRESS);
      console.log("Raw balance data:", balanceData);
      if (isBalanceError) {
        console.error("Balance fetch error:", balanceError);
      }
    }
  }, [address, balanceData, isBalanceError, balanceError]);

  useEffect(() => {
    if (balanceData) {
      console.log("Processing balance data:", balanceData);
      try {
        const [locked, unlocked] = balanceData as BalanceResult;
        console.log("Raw locked value:", locked.toString());
        console.log("Raw unlocked value:", unlocked.toString());
        console.log(
          "Parsed balances - Locked:",
          locked.toString(),
          "Unlocked:",
          unlocked.toString()
        );
        setBalances({ locked, unlocked });
      } catch (error) {
        console.error("Error processing balance data:", error);
        console.error("Balance data type:", typeof balanceData);
        console.error(
          "Balance data structure:",
          JSON.stringify(balanceData, null, 2)
        );
      }
    }
  }, [balanceData]);

  const handleWithdraw = async () => {
    if (!address || !writeContract) return;
    try {
      setIsWithdrawing(true);
      writeContract({
        address: LOCKER_ADDRESS as Address,
        abi: LOCKER_ABI,
        functionName: "withdrawWithPenalty",
        args: [MAX_UINT256],
        chainId: mainnet.id,
      });
    } catch (error) {
      console.error("Error withdrawing:", error);
      window.alert(
        error instanceof Error ? error.message : "Failed to withdraw"
      );
      setIsWithdrawing(false);
    }
  };

  // Reset isWithdrawing when transaction is complete
  useEffect(() => {
    if (transactionReceipt && isWithdrawing) {
      setIsWithdrawing(false);
      setShowHippo(true);
    }
  }, [transactionReceipt, isWithdrawing]);

  // Show write errors
  useEffect(() => {
    if (isWriteError && writeError) {
      window.alert(writeError.message);
      setIsWithdrawing(false);
    }
  }, [isWriteError, writeError]);

  // Show hippo when balance becomes 0
  useEffect(() => {
    if (
      balances &&
      balances.locked.toString() === "0" &&
      balances.unlocked.toString() === "0"
    ) {
      setShowHippo(true);
    }
  }, [balances]);

  const formatBalance = (value: bigint | undefined) => {
    if (!value) return "0";
    // Display raw value without decimal conversion
    return value.toString();
  };

  const buttonClasses = "w-full";

  const hasNoBalance =
    balances &&
    balances.locked.toString() === "0" &&
    balances.unlocked.toString() === "0";

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-4">
            PRISMA Lock Breaker
          </h1>
          <p className="text-black mb-8">
            Click button to max withdraw your PRISMA from locker. Any existing
            lock will be broken.
          </p>
          <button
            disabled
            className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Loading...
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      {showHippo && <FlyingHippo />}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-4">
          PRISMA Lock Breaker
        </h1>
        <p className="text-black mb-8">
          Click button to max withdraw your PRISMA from locker. Any existing
          lock will be broken.
        </p>

        {!isConnected ? (
          <button onClick={() => open()} className={buttonClasses}>
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-black">Connected: {address}</p>
              <p className="text-black">
                Locked: {formatBalance(balances?.locked)} PRISMA
              </p>
              <p className="text-black">
                Unlocked: {formatBalance(balances?.unlocked)} PRISMA
              </p>
            </div>

            {hasNoBalance ? (
              <div className="text-center text-black text-lg">
                🎉 Congratulations! Your wallet is completely withdrawn from the
                PRISMA locker
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => void handleWithdraw()}
                  disabled={isWithdrawing || isWaitingForReceipt}
                  className={`${buttonClasses} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isWithdrawing || isWaitingForReceipt
                    ? "Processing..."
                    : "Withdraw All with Penalty"}
                </button>

                <button
                  onClick={() => disconnect()}
                  className={`${buttonClasses} w-full`}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
