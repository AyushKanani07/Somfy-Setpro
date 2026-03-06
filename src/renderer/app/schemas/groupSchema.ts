import { z } from "zod";

export const createGroupSchema = z.object({
    auto: z.boolean(),
    name: z.string().min(1, "Group name is required"),
    address: z.string().or(z.undefined()).transform((val) => val?.trim() === "" ? undefined : val),
}).superRefine((data, ctx) => {
    if (!data.auto && !data.address) {
        ctx.addIssue({
            path: ["address"],
            code: z.ZodIssueCode.custom,
            message: "Group Address is required when auto generate is off",
        });
        return;
    }

    if (data.address && !/^\d{6}$/.test(data.address)) {
        ctx.addIssue({
            path: ["address"],
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid 6-digit Group Address",
        });
    }
});

export type GroupFormValues = z.infer<typeof createGroupSchema>;