import * as React from 'react';

export const Form = ({ children }: { children: React.ReactNode }) => <form>{children}</form>;
export const FormField = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const FormItem = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const FormLabel = ({ children }: { children: React.ReactNode }) => <label>{children}</label>;
export const FormControl = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const FormDescription = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
export const FormMessage = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
