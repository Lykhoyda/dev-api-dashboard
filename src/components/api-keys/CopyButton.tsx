import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/apiKeys';

interface CopyButtonProps {
	value: string;
	label?: string;
	onCopySuccess?: () => void;
	size?: 'default' | 'sm' | 'lg' | 'icon';
	variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
	className?: string;
	showText?: boolean;
}

/**
 * CopyButton component with comprehensive multi-channel feedback
 *
 * Feedback channels:
 * 1. Icon change: Copy → Check
 * 2. Text change: "Copy" → "Copied!"
 * 3. Toast notification: Success or error message
 * 4. onCopySuccess callback for parent component (e.g., flash animation)
 *
 * @example
 * <CopyButton value="sk_test_abc123" label="Copy API Key" />
 */
export function CopyButton({
	value,
	label = 'Copy',
	onCopySuccess,
	size = 'default',
	variant = 'outline',
	className = '',
	showText = true
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			const success = await copyToClipboard(value);

			if (success) {
				setCopied(true);
				toast.success('Copied to clipboard');

				// Call parent callback for additional feedback (e.g., flash animation)
				onCopySuccess?.();

				// Reset button state after 2 seconds
				setTimeout(() => {
					setCopied(false);
				}, 2000);
			} else {
				throw new Error('Clipboard API not available');
			}
		} catch (error) {
			toast.error('Failed to copy to clipboard');
			console.error('Copy failed:', error);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={handleCopy}
			aria-label={copied ? 'Copied to clipboard' : label}
			disabled={copied}
			type="button"
		>
			{copied ? (
				<>
					<Check className="h-4 w-4" aria-hidden="true" />
					{showText && <span className="ml-2">Copied!</span>}
				</>
			) : (
				<>
					<Copy className="h-4 w-4" aria-hidden="true" />
					{showText && <span className="ml-2">{label}</span>}
				</>
			)}
		</Button>
	);
}
