"use client";

import React, { useState, useEffect, use } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  History,
  Loader2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { clsx } from "clsx";
import toast, { Toaster } from "react-hot-toast";

const WalletPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [MinWithdrawAmnt, setMinWithdrawAmnt] = useState<number>();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async (page = 1) => {
    setLoading(true);
    try {
      // First fetch transactions
      // const res = await authFetch(`/dropshipper/wallet?page=${page}`);
      // const data = await res.json();
      // if (data.data) {
      //     setTransactions(data.data);
      //     setMeta(data);
      // }
      const withdrawalHistory = await authFetch(
        `/dropshipper/withdrawals-history`
      );
      const withdrawalData = await withdrawalHistory.json();
      //   console.log("Withdrawal History:", withdrawalData);
      if (withdrawalData.data) {
        setTransactions(withdrawalData.data);
        setMeta(withdrawalData.data);
      }
      // Also fetch stats to get current balance (profit)
      const statsRes = await authFetch("/dropshipper/stats");
      const statsData = await statsRes.json();
      //   console.log("Stats Data:", statsData);
      if (statsData.data) {
        setBalance(statsData.data.total_profit);
        setDueAmount(statsData.data.due_amount);
        setMinWithdrawAmnt(statsData.data.minimum_withdrawal_amount);
      }
    } catch (err) {
      console.error("Failed to fetch wallet data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWidthrawal = async () => {
    // Implement withdrawal logic here
    try {
      const response = await authFetch("/dropshipper/withdrawal-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("Withdrawal Response:", data);
        toast.success("Withdrawal request submitted successfully!");
        setIsWithdrawOpen(false);
      } else {
        const errorData = await response.json();
        alert(
          "Failed to submit withdrawal request: " +
            (errorData.message || "Unknown error")
        );
      }
    } catch (error) {
      alert(
        "An error occurred while submitting withdrawal request: " 
      );
    }
    // console.log("Withdraw:");
    setIsWithdrawOpen(false);
  };

  const checkIfWithdrawalAllowed = () => {
    // console.log("Checking withdrawal eligibility for amount:", withdrawAmount);
    // toast.success('Withdrawal request submitted successfully!');
    // console.log(typeof MinWithdrawAmnt);
    const amount = parseFloat(withdrawAmount);
    if (MinWithdrawAmnt !== undefined && balance < MinWithdrawAmnt) {
      toast.error(`Minimum withdrawal amount is ${MinWithdrawAmnt} ৳.`);
      return false;
    }
    // if (amount > balance) {
    //     alert('You cannot withdraw more than your available balance.');
    //     return false;
    // }
    setIsWithdrawOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Wallet Header Card */}
      <div className="grid  md:grid-cols-3 gap-6">
        {/* dropshippper wallet */}
        <div className="md:col-span-1 bg-green-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Wallet size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 opacity-80">
              <CreditCard size={20} />
              <span className="font-black text-xs uppercase tracking-[0.2em]">
                Total Earnings
              </span>
            </div>
            <h1 className="text-6xl font-black mb-10 flex items-baseline gap-4">
              <span className="text-4xl opacity-60">৳</span>
              {balance?.toLocaleString()}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => checkIfWithdrawalAllowed()}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-50 transition-all active:scale-95"
              >
                Withdraw Funds
              </button>
              <button className="bg-blue-500/30 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-500/40 transition-all">
                Wallet Settings
              </button>
            </div>
            <p className="mt-2 text-md">
              Minimum withdrawal Amount:{MinWithdrawAmnt}{" "}
              <span className=" opacity-60">৳</span>
            </p>
          </div>
        </div>

        {/* valokichu wallet */}
        <div className="md:col-span-1 bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Wallet size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 opacity-80">
              <CreditCard size={20} />
              <span className="font-black text-xs uppercase tracking-[0.2em]">
                Due Amount
              </span>
            </div>
            <h1 className="text-6xl font-black mb-10 flex items-baseline gap-4">
              <span className="text-4xl opacity-60">৳</span>
              {dueAmount?.toLocaleString()}
            </h1>
            {/* <div className="flex gap-4">
                            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                                Withdraw Funds
                            </button>
                            <button className="bg-blue-500/30 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-500/40 transition-all">
                                Wallet Settings
                            </button>
                        </div> */}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 w-fit mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">
              Withdrawals
            </h3>
            <p className="text-3xl font-black text-gray-900">৳ 0.00</p>
          </div>
          <div className="pt-6 border-t border-gray-100 mt-6">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-400 uppercase tracking-widest">
                Available now
              </span>
              <span className="text-emerald-500">100%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-50 rounded-2xl text-gray-600">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Transaction History
            </h2>
            <p className="text-gray-500 font-medium italic">
              Detailed record of all commissions and withdrawals
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">
              Fetching Transactions...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              No Transactions
            </h3>
            <p className="text-gray-500 font-medium">
              Your earnings will appear here as orders are fulfilled.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center justify-between p-6 bg-gray-50 hover:bg-white rounded-3xl border-2 border-transparent hover:border-gray-100 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={clsx(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors",
                      tx.type === "credit"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {tx.type === "credit" ? (
                      <ArrowDownRight size={24} />
                    ) : (
                      <ArrowUpRight size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">
                      {tx.description ||
                        (tx.type === "credit"
                          ? "Commission Earned"
                          : "Withdrawal")}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {new Date(tx.created_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={clsx(
                      "text-xl font-black",
                      tx.type === "credit"
                        ? "text-emerald-600"
                        : "text-gray-900"
                    )}
                  >
                    {tx.type === "credit" ? "+" : "-"} ৳{" "}
                    {parseFloat(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Status: {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-4">
            <button
              onClick={() => fetchWalletData(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="px-8 py-3 rounded-2xl text-xs font-black bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {[...Array(meta.last_page)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchWalletData(i + 1)}
                  className={clsx(
                    "w-10 h-10 rounded-xl text-xs font-black transition-all",
                    meta.current_page === i + 1
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchWalletData(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="px-8 py-3 rounded-2xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-all uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        )}

        {/* modal */}
        {isWithdrawOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              onClick={() => setIsWithdrawOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            ></div>

            {/* Modal Box */}
            <div className="relative w-[92%] max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in">
              <h2 className="text-xl font-black text-gray-900 mb-4">
                Withdraw Funds
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Enter amount you want to withdraw
              </p>

              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsWithdrawOpen(false)}
                  className="w-1/2 py-3 rounded-2xl bg-gray-100 text-gray-700 font-black hover:bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    // console.log("Withdraw:", withdrawAmount);
                    handleWidthrawal();
                  }}
                  className="w-1/2 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default WalletPage;
