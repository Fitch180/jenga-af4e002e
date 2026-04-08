

## Redirect Unauthenticated Users to Login for Protected Actions

**Problem**: Currently, auth guards are inconsistent across the app. Some actions redirect to `/auth`, pinning only shows a toast, and the Cart page loads even for logged-out users. The user wants all these actions to redirect to the login page.

### Changes

**1. `src/contexts/PinnedContext.tsx` — Navigate to auth on pin attempt**
- The `togglePin` function currently shows a toast when `userId` is null. Instead, it needs to navigate to `/auth?redirect=...`.
- Since this is a context (not a component with `useNavigate`), we have two options:
  - Pass a `navigate` callback into the toggle functions from the calling components, OR
  - Use `window.location` for the redirect
- Best approach: update `MerchantCard` and `ProductCard` (the callers) to check auth before calling `onPin`. This keeps the context clean and follows the existing pattern used for cart/quotation actions.

**2. `src/components/MerchantCard.tsx` — Add auth check before pin**
- Import `useAuth` and `useNavigate`
- In the pin button click handler, check if `user` exists before calling `onPin()`
- If not logged in, redirect to `/auth?redirect=...`

**3. `src/components/ProductCard.tsx` — Add auth check before pin**
- Already imports `useAuth` and `useNavigate`
- Add auth check in the pin button `onClick` handler, same pattern as existing cart/quotation guards

**4. `src/pages/Cart.tsx` — Show login prompt for unauthenticated users**
- Import `useAuth`
- Check `user` state; if not logged in, render a message with a "Login" button that navigates to `/auth?redirect=/cart`
- This replaces the empty cart or loading state for unauthenticated users

**5. `src/pages/MerchantDetail.tsx` — Add auth check on "Request Quotation" button**
- The profile-level "Request Quotation" button currently opens the dialog without checking auth
- Add auth check before `setIsDialogOpen(true)`, redirecting to `/auth?redirect=...` if not logged in

