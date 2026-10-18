import { create } from "zustand";

/** Query param that opens the billing dialog, e.g. links from /pricing. */
export const BILLING_DIALOG_PARAM = "upgrade";

/** Marks a dashboard URL carrying a payment provider's return params. */
export const PAYMENT_RESULT_PARAM = "paymentResult";

interface BillingDialogState {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const useBillingDialog = create<BillingDialogState>((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
}));
