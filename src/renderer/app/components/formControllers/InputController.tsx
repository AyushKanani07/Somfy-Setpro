import * as React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import ErrorMessage from "../sharedComponent/ErrorMessage";

export interface InputControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<"input">, "name" | "defaultValue"> {
  name: TName;
  control: Control<TFieldValues>;
  label?: string;
  description?: string;
  errorMessage?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

const InputController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  description,
  errorMessage,
  containerClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  className,
  disabled,
  required,
  ...props
}: InputControllerProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-2", containerClassName)}>
          {label && (
            <label
              htmlFor={field.name}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                labelClassName
              )}
            >
              {label}
              {required && <span className="text-destructive"> *</span>}
            </label>
          )}

          <Input
            {...field}
            {...props}
            id={field.name}
            disabled={disabled}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
          />

          {description && !error && (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}

          {(error || errorMessage) && (
            <ErrorMessage errorMessage={error?.message || errorMessage} />
          )}
        </div>
      )}
    />
  );
};

export { InputController };
