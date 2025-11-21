"use client";

import React, { FormHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className,
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      {...props}
    >
      {children}
    </form>
  );
};

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className,
}) => {
  return <div className={cn("space-y-2", className)}>{children}</div>;
};

export const FormRow: React.FC<FormRowProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
};

export default Form;
