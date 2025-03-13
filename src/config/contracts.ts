export const LOCKER_ADDRESS = "0x3f78544364c3eCcDCe4d9C89a630AEa26122829d";

export const LOCKER_ABI = [
  {
    name: "withdrawWithPenalty",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amountToWithdraw", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getAccountBalances",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "locked", type: "uint256" },
      { name: "unlocked", type: "uint256" },
    ],
  },
] as const;
