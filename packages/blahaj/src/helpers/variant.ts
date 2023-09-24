import type { VariantProps } from 'class-variance-authority';
import type { Component } from 'react';

export type VariantPropsWithRequired<
  Component extends (...args: any) => any,
  Keys extends keyof VariantProps<Component>,
> = Omit<VariantProps<Component>, Keys> & RequiredWithoutNull<Pick<VariantProps<Component>, Keys>>;

type RequiredWithoutNull<T> = {
  [K in keyof T]-?: Exclude<T[K], null>;
};
