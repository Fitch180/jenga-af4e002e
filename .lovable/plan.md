

## Add Document Upload to Merchant Profile Quotation Form

**Problem**: The "Request Quotation" button on the merchant profile page uses a simple inline dialog without document upload support, while the `QuotationRequestDialog` component (used in product cards) already has full document upload capability.

**Solution**: Replace the inline quotation dialog in `MerchantDetail.tsx` with the reusable `QuotationRequestDialog` component.

### Changes

**File: `src/pages/MerchantDetail.tsx`**

1. Import `QuotationRequestDialog` component
2. Replace the inline `<Dialog>` block (lines 310–357) with:
   - A simple `<Button>` that sets `isDialogOpen = true`
   - A `<QuotationRequestDialog>` component rendered below, passing `merchant.id`, `merchant.business_name`, and a generic product name like "General Inquiry"
3. Remove the now-unused `quotationItems`, `quotationRequest`, and `handleSendQuotation` state/logic since the dialog component handles everything internally

This ensures both the product card and merchant profile quotation buttons use the same form with document upload support.

