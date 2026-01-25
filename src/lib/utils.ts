import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const openFileInBambuStudio = (url: string | URL) => window.open(`bambustudio://open?file=${encodeURIComponent(url.toString())}`, '_self');
export const formatTime = (seconds: number) => `${Math.floor(seconds / 60 / 60)}h ${Math.floor(seconds / 60 % 60)}m`;

const numberFormatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatPrice = (price: number) => numberFormatter.format(price);

export type DeepPartial<T> = T extends Record<string, unknown> ? {
	[P in keyof T]?: DeepPartial<T[P]>;
} : T;

export function deepMerge<T, U>(obj1: T, obj2: U): T | U {
	for (const key in obj2) {
		if (typeof obj2[key] === 'object' && obj2[key] !== null && typeof (obj1 as Record<keyof U, unknown>)[key] === 'object' && (obj1 as Record<keyof U, unknown>)[key] !== null) {
			deepMerge((obj1 as Record<keyof U, unknown>)[key] as object, obj2[key] as object);
		} else if ((obj2 as Record<keyof U, unknown>)[key] !== undefined) {
			(obj1 as Record<keyof U, unknown>)[key] = obj2[key];
		}
	}
	return obj1 as T | U;
}