import { z } from "zod";

export const keypadFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    key_count: z.enum(["6", "8"]).refine(
        (val) => val === "6" || val === "8",
        { message: "Key count is required" }
    )
});

export type KeypadFormValues = z.infer<typeof keypadFormSchema>;
