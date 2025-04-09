import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  DollarSign,
  Coins,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Schema for the purchase form
const purchaseFormSchema = z.object({
  usdAmount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a number",
    })
    .refine(val => parseFloat(val) >= 0, {
      message: "Amount must be positive",
    })
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

// Define predefined amounts
const predefinedAmounts = ["5.00", "10.00", "20.00", "50.00", "100.00"];

export default function CurrencyPurchase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [showPayPalButton, setShowPayPalButton] = useState(false);

  // Define types for API responses
  type CurrencySettings = {
    id: number;
    enabled: boolean;
    currencyName: string;
    exchangeRate: string;
    minPurchase: string;
    maxPurchase: string;
    paypalEmail: string;
    paypalClientId: string;
    paypalSecret: string;
    lastUpdated: Date;
  };

  type Transaction = {
    id: number;
    userId: number;
    amount: string;
    usdAmount: string;
    status: string;
    paymentProcessor: string;
    paymentId: string | null;
    createdAt: Date;
    completedAt: Date | null;
  };

  // Get currency settings
  const { 
    data: currencySettings, 
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: settingsError
  } = useQuery<CurrencySettings>({
    queryKey: ["/api/currency/settings"],
    enabled: true,
    // Initialize with default settings if response is empty
    placeholderData: {
      id: 1,
      enabled: false,
      currencyName: 'Grid Coins',
      exchangeRate: '250',
      minPurchase: '5.00',
      maxPurchase: '100.00',
      paypalEmail: '',
      paypalClientId: '',
      paypalSecret: '',
      lastUpdated: new Date()
    }
  });

  // Get user's transaction history
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions
  } = useQuery<Transaction[]>({
    queryKey: ["/api/currency/transactions"],
    enabled: true,
    placeholderData: [],
  });

  // Form initialization
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      usdAmount: "10.00"
    },
  });

  // Handle purchase creation
  const purchaseMutation = useMutation({
    mutationFn: async (data: PurchaseFormValues) => {
      const response = await apiRequest("POST", "/api/currency/purchase", data);
      return response.json();
    },
    onSuccess: (data) => {
      setTransactionId(data.transaction.id);
      setShowPayPalButton(true);
      queryClient.invalidateQueries({ queryKey: ["/api/currency/transactions"] });
      toast({
        title: "Purchase initialized",
        description: `Your purchase of ${data.paymentInfo.gridAmount} ${data.paymentInfo.currencyName} is ready for payment.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating purchase",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle purchase completion (this would integrate with PayPal SDK in a real app)
  const completePurchaseMutation = useMutation({
    mutationFn: async (data: { transactionId: number }) => {
      // Simulate a PayPal payment completion webhook call
      const response = await apiRequest("POST", "/api/currency/paypal-webhook", {
        transactionId: data.transactionId,
        paypalTransactionId: "PAYPAL-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        status: "completed"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShowPayPalButton(false);
      setTransactionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/currency/transactions"] });
      toast({
        title: "Purchase completed",
        description: "Your currency purchase was successful!",
      });
      form.reset({ usdAmount: "10.00" });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseFormValues) => {
    purchaseMutation.mutate(data);
  };

  const handlePayPalPayment = () => {
    if (transactionId) {
      completePurchaseMutation.mutate({ transactionId });
    }
  };

  // If currency features are disabled, show a message
  if (currencySettings && !currencySettings.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grid Currency</CardTitle>
          <CardDescription>Purchase grid currency with PayPal</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Currency Purchases Disabled</AlertTitle>
            <AlertDescription>
              The grid owner has disabled currency purchases at this time. Please check back later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoadingSettings || isLoadingTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grid Currency</CardTitle>
          <CardDescription>Purchase grid currency with PayPal</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (isErrorSettings || isErrorTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grid Currency</CardTitle>
          <CardDescription>Purchase grid currency with PayPal</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Currency Information</AlertTitle>
            <AlertDescription>
              {settingsError instanceof Error ? settingsError.message : "An unexpected error occurred."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          {currencySettings?.currencyName || "Grid Currency"}
        </CardTitle>
        <CardDescription>Purchase grid currency with PayPal</CardDescription>
      </CardHeader>
      <CardContent>
        {!showPayPalButton ? (
          <>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="usdAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                {...field}
                                className="pl-10"
                                type="number"
                                step="0.01"
                                min={parseFloat(currencySettings?.minPurchase || "5.00")}
                                max={parseFloat(currencySettings?.maxPurchase || "100.00")}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Min: ${currencySettings?.minPurchase} / Max: ${currencySettings?.maxPurchase}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-wrap gap-2">
                      {predefinedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => form.setValue("usdAmount", amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-md bg-secondary/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Exchange Rate:</span>
                        <span className="font-medium">
                          ${1.00} = {currencySettings?.exchangeRate} {currencySettings?.currencyName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">You'll Receive:</span>
                        <span className="text-lg font-semibold">
                          {(parseFloat(form.getValues().usdAmount || "0") * 
                           parseFloat(currencySettings?.exchangeRate || "0")).toLocaleString()} {currencySettings?.currencyName}
                        </span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full mt-2"
                      disabled={purchaseMutation.isPending}
                    >
                      {purchaseMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue to Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="w-full md:w-1/2">
                <h3 className="font-medium mb-3">Transaction History</h3>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-3 border rounded-md text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{transaction.amount} {currencySettings?.currencyName}</span>
                          <span className={`capitalize ${
                            transaction.status === 'completed' ? 'text-green-500' :
                            transaction.status === 'pending' ? 'text-amber-500' :
                            transaction.status === 'failed' ? 'text-red-500' : ''
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>${transaction.usdAmount}</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed rounded-md text-center text-muted-foreground">
                    <p>No transaction history yet</p>
                    <p className="text-sm mt-1">Your purchases will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 border rounded-md">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Complete Your Payment</h3>
              <p className="text-muted-foreground">
                Please complete your payment to receive your grid currency
              </p>
            </div>
            
            {/* This would be replaced with an actual PayPal Button SDK in a real implementation */}
            <div className="my-6">
              <Button 
                className="w-full h-12 bg-[#0070ba] hover:bg-[#003087] text-white"
                onClick={handlePayPalPayment}
                disabled={completePurchaseMutation.isPending}
              >
                {completePurchaseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg 
                      className="h-5 w-5 mr-2" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M20.0744 7.42C20.3944 5.94 20.0744 4.92 19.1644 4.02C18.1644 3.02 16.3344 2.62 14.0944 2.62H6.17444C5.77444 2.62 5.41444 2.96 5.35444 3.36L3.27444 18.06C3.23444 18.38 3.47444 18.68 3.79444 18.68H7.39444L7.17444 20.06C7.13444 20.34 7.35444 20.6 7.63444 20.6H10.7944C11.1544 20.6 11.4744 20.3 11.5344 19.94L11.5744 19.78L12.1144 16.38L12.1644 16.18C12.2244 15.82 12.5344 15.52 12.8944 15.52H13.3744C16.0944 15.52 18.1544 14.2 18.6544 11.04C18.8544 9.74 18.7344 8.64 18.0944 7.86C17.8544 7.58 17.5544 7.38 17.2144 7.24" 
                        fill="white"
                      />
                      <path 
                        d="M17.1344 7.22001C17.0344 7.18001 16.9344 7.16001 16.8244 7.12001C16.7144 7.10001 16.6044 7.08001 16.4944 7.06001C16.0344 7.00001 15.5244 6.98001 14.9744 6.98001H9.57444C9.47444 6.98001 9.37444 7.00001 9.29444 7.04001C9.09444 7.12001 8.93444 7.28001 8.89444 7.50001L7.89444 13.60L7.73444 14.66C7.79444 14.26 8.13444 13.92 8.53444 13.92H10.5944C14.4944 13.92 17.3944 12.06 18.0944 7.52001C18.1144 7.44001 18.1144 7.36001 18.1344 7.28001C17.9744 7.26001 17.8144 7.24001 17.6544 7.22001C17.4944 7.22001 17.3144 7.22001 17.1344 7.22001Z" 
                        fill="white"
                      />
                      <path 
                        d="M8.89443 7.5C8.93443 7.28 9.09443 7.12 9.29443 7.06C9.37443 7.02 9.47443 7 9.57443 7H14.9744C15.5244 7 16.0344 7.02 16.4944 7.08C16.6044 7.1 16.7144 7.12 16.8244 7.14C16.9344 7.16 17.0344 7.18 17.1344 7.22C17.3144 7.24 17.4944 7.26 17.6544 7.28C17.8144 7.3 17.9744 7.32 18.1344 7.36C18.1544 7.2 18.1544 7.02 18.1144 6.84C17.8144 4.42 15.9144 3.62 13.4144 3.62H6.61443C6.21443 3.62 5.85443 3.96 5.79443 4.36L3.27443 20.98C3.21443 21.36 3.49443 21.7 3.87443 21.7H7.65443L8.69443 14.66L8.89443 7.5Z" 
                        fill="white"
                      />
                    </svg>
                    Pay with PayPal
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPayPalButton(false);
                  setTransactionId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center">
          <svg 
            className="h-4 w-4 mr-1 text-[#0070ba]" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M20.0744 7.42C20.3944 5.94 20.0744 4.92 19.1644 4.02C18.1644 3.02 16.3344 2.62 14.0944 2.62H6.17444C5.77444 2.62 5.41444 2.96 5.35444 3.36L3.27444 18.06C3.23444 18.38 3.47444 18.68 3.79444 18.68H7.39444L7.17444 20.06C7.13444 20.34 7.35444 20.6 7.63444 20.6H10.7944C11.1544 20.6 11.4744 20.3 11.5344 19.94L11.5744 19.78L12.1144 16.38L12.1644 16.18C12.2244 15.82 12.5344 15.52 12.8944 15.52H13.3744C16.0944 15.52 18.1544 14.2 18.6544 11.04C18.8544 9.74 18.7344 8.64 18.0944 7.86C17.8544 7.58 17.5544 7.38 17.2144 7.24" 
              fill="currentColor"
            />
          </svg>
          Payments processed securely through PayPal
        </div>
      </CardFooter>
    </Card>
  );
}