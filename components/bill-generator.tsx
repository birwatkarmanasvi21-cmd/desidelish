'use client';

import { useState } from 'react';
import { Download, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
  image?: string;
}

interface BillGeneratorProps {
  items: CartItem[];
  restaurantName?: string;
  onClearCart?: () => void;
}

export function BillGenerator({ items, restaurantName = 'FoodHub Restaurant', onClearCart }: BillGeneratorProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.05; // 5% GST
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const grandTotal = subtotal + gst + deliveryFee;

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };

  const handleDownloadPDF = async () => {
    // Browser's built-in print-to-PDF functionality
    alert('Downloading as PDF... Use your browser\'s print dialog to save as PDF');
    handlePrint();
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Bill Content */}
      <div
        id="bill-content"
        className="bg-card rounded-xl border border-border shadow-lg p-8 print:shadow-none print:border-none"
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl font-bold text-primary mb-2">DesiDelish</h1>
          <p className="text-lg font-semibold text-foreground">{restaurantName}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Date: {new Date().toLocaleDateString('en-IN')}
          </p>
          <p className="text-sm text-muted-foreground">
            Time: {new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>

        {/* Items List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 pb-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No items in cart</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 py-3 border-b border-border/50">
                  <div className="col-span-6">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.restaurantName}</p>
                  </div>
                  <div className="col-span-2 text-right text-foreground">{item.quantity}</div>
                  <div className="col-span-2 text-right text-foreground">₹{item.price}</div>
                  <div className="col-span-2 text-right font-semibold text-foreground">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-secondary/30 rounded-lg p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">CGST (2.5%)</span>
              <span className="font-medium text-foreground">₹{(subtotal * 0.025).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">SGST (2.5%)</span>
              <span className="font-medium text-foreground">₹{(subtotal * 0.025).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium text-foreground">₹{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="h-px bg-border my-3"></div>

            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-foreground">Grand Total</span>
              <span className="text-2xl font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>Thank you for your order!</p>
          <p className="mt-2">Please keep this bill for your records</p>
          <p className="mt-2 text-xs">Bill ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>

        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Bill
        </Button>

        {onClearCart && (
          <Button
            onClick={onClearCart}
            variant="destructive"
            className="flex-1 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </Button>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          #bill-content {
            max-width: 100%;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}
