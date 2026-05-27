# Bill Generator Component Guide

## Overview

The Bill Generator is a professional invoice component for the FoodHub food ordering application. It provides a clean, modern UI for displaying order details with automatic calculations for totals, taxes, and service fees.

## Features

- **Professional Invoice Layout**: Clean card-based design with header, items list, and summary section
- **Automatic Calculations**: Dynamically calculates subtotal, GST (5%), service fee (5%), and grand total
- **Print Functionality**: Built-in print button using browser's native print dialog
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Print Styles**: Optimized CSS for printing with hidden buttons and proper formatting
- **Item Details**: Displays item name, restaurant, quantity, price, and total
- **Currency Formatting**: All amounts displayed in Indian Rupees (₹) format
- **Bill ID**: Auto-generated unique bill ID for tracking

## Components

### 1. BillGenerator Component (`components/bill-generator.tsx`)

The main reusable component for displaying bills.

**Props:**
```typescript
interface BillGeneratorProps {
  items: CartItem[];           // Array of cart items
  restaurantName?: string;     // Restaurant/order name
  onClearCart?: () => void;   // Callback for clear button
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName: string;
  image?: string;
}
```

**Usage:**
```tsx
<BillGenerator
  items={items}
  restaurantName="Multi-Restaurant Order"
  onClearCart={() => handleClearCart()}
/>
```

### 2. Bill Page (`app/bill/page.tsx`)

Full-page bill viewer with additional information panel.

**Features:**
- Displays bill with all order details
- Shows statistics (total items, unique restaurants, order value)
- Integration with cart page
- Sample data for demonstration

**Access:**
- URL: `/bill`
- Button: "View Bill" in cart page

## Calculations

All calculations are performed automatically:

```
Subtotal = Sum of (item.price * item.quantity)
GST (5%) = Subtotal * 0.05
Service Fee (5%) = Subtotal * 0.05
Grand Total = Subtotal + GST + Service Fee
```

## Currency Conversion

Prices are stored in USD and converted to INR:
- Exchange rate: 1 USD = 83 INR
- Formula: `₹${(price * 83).toFixed(0)}`

## Customization

### Change GST/Service Fee Percentage

Edit `components/bill-generator.tsx`:

```typescript
const gst = subtotal * 0.05;           // Change 0.05 to your GST rate
const serviceFee = subtotal * 0.05;    // Change 0.05 to your service fee rate
```

### Update Restaurant Name

```tsx
<BillGenerator
  restaurantName="Your Restaurant Name"
  items={items}
/>
```

### Modify Header

Edit the header section in `components/bill-generator.tsx`:
```tsx
<h1 className="text-3xl font-bold text-primary">🍔 FoodHub</h1>
<p className="text-lg font-semibold text-foreground">{restaurantName}</p>
```

### Customize Summary Labels

Modify the summary section to change labels:
```tsx
<span className="text-muted-foreground">Your Custom Label</span>
```

## Print & PDF Functionality

### Print Bill
- Clicking "Print Bill" opens the browser print dialog
- All unnecessary elements (buttons) are hidden during print
- Optimized for A4 paper size
- Print styles defined in `@media print` CSS

### Download PDF
- Currently uses browser print-to-PDF functionality
- To enable native PDF export, install `html2pdf` package:

```bash
npm install html2pdf.js
```

Then uncomment the PDF download logic in `components/bill-generator.tsx`.

**Alternative PDF Libraries:**
- `jsPDF` + `html2canvas`: Most popular
- `pdfkit`: For Node.js backend
- `puppeteer`: Server-side PDF generation

## Styling

### Colors Used
- **Primary**: Used for branding and totals
- **Secondary**: Used for summary background
- **Accent**: Used for emphasis
- **Foreground/Background**: Default text colors

All colors come from the design token system in `app/globals.css`.

### Responsive Classes
```tsx
grid grid-cols-12    // 12-column grid layout
lg:grid-cols-3       // 3-column on large screens
max-w-2xl            // Maximum width constraint
```

## Integration with API

When backend is ready, replace mock data:

```tsx
// Before (mock data):
const [items, setItems] = useState<CartItem[]>([...]);

// After (API call):
const { data: items } = useApi('/api/cart');
```

## Troubleshooting

### Bill Not Printing

1. Check if `id="bill-content"` is present in DOM
2. Verify browser print dialog appears
3. Check browser console for JavaScript errors

### Prices Showing Incorrectly

1. Verify item prices are numbers, not strings
2. Check currency conversion formula: `(price * 83).toFixed(0)`
3. Ensure price data structure matches `CartItem` interface

### Missing Items in Bill

1. Check `items` array is not empty
2. Verify item properties match interface
3. Check console for TypeScript errors

## Future Enhancements

- [ ] Native PDF export (html2pdf integration)
- [ ] Email bill functionality
- [ ] Digital signature support
- [ ] Multiple currency support
- [ ] Custom branding/logo
- [ ] Bill history/archive
- [ ] QR code payment link
- [ ] SMS bill delivery
- [ ] Refund/return slips
- [ ] Multi-language support

## Code Examples

### Using BillGenerator in a Modal

```tsx
import { BillGenerator } from '@/components/bill-generator';
import { Dialog } from '@/components/ui/dialog';

export function BillModal({ items, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <BillGenerator items={items} />
      </DialogContent>
    </Dialog>
  );
}
```

### Using with API Data

```tsx
import { useApi } from '@/hooks/use-api';

export function OrderBill({ orderId }) {
  const { data: order, loading, error } = useApi(`/api/orders/${orderId}`);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <BillGenerator items={order.items} restaurantName={order.restaurantName} />;
}
```

## Dependencies

- React 18+
- Next.js 14+
- TailwindCSS v4
- Lucide Icons
- Shadcn UI Button component

## License

Part of FoodHub application
