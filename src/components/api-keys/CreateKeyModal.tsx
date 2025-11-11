import {
	AlertTriangle,
	Check,
	Download,
	FlaskConical,
	Rocket
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { createApiKey } from '@/lib/apiKeys';
import { CopyButton } from './CopyButton';

interface CreateKeyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onKeyCreated?: () => void;
}

export function CreateKeyModal({
	open,
	onOpenChange,
	onKeyCreated
}: CreateKeyModalProps) {
	const { mode } = useEnvironment();
	const [step, setStep] = useState<'form' | 'reveal'>('form');
	const [name, setName] = useState('');
	const [createdKey, setCreatedKey] = useState<{
		name: string;
		key: string;
	} | null>(null);
	const [isFlashing, setIsFlashing] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			const newKey = createApiKey(name, mode);
			setCreatedKey({
				name: newKey.name,
				key: newKey.key
			});
			setStep('reveal');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create key');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopySuccess = () => {
		setIsFlashing(true);
		setTimeout(() => setIsFlashing(false), 500);
	};

	const handleDownload = () => {
		if (!createdKey) return;

		const content = `API Key: ${createdKey.name}
Environment: ${mode}
Key: ${createdKey.key}
Created: ${new Date().toISOString()}

⚠️ SECURITY WARNING ⚠️
• Keep this key secure and never share it publicly
• Store this file in a secure location (e.g., password manager)
• Never commit this file to version control
• Delete this file once you've stored the key securely
`;

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${createdKey.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleClose = () => {
		// Reset state
		setStep('form');
		setName('');
		setCreatedKey(null);
		setIsFlashing(false);
		setError('');
		onOpenChange(false);
		if (createdKey && onKeyCreated) {
			onKeyCreated();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[540px]">
				{step === 'form' ? (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								Create API Key
								{mode === 'test' ? (
									<Badge variant="warning" className="gap-1">
										<FlaskConical className="h-3 w-3" />
										TEST
									</Badge>
								) : (
									<Badge variant="default" className="gap-1">
										<Rocket className="h-3 w-3" />
										PRODUCTION
									</Badge>
								)}
							</DialogTitle>
							<DialogDescription>
								Create a new API key for {mode} environment. The key will be
								displayed only once.
							</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleSubmit}>
							<div className="grid gap-4 py-4">
								{/* Name Input */}
								<div className="grid gap-2">
									<label htmlFor="name" className="text-sm font-medium">
										Name <span className="text-destructive">*</span>
									</label>
									<Input
										id="name"
										placeholder="e.g., Production Server Key"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										autoFocus
									/>
									<p className="text-xs text-muted-foreground">
										A descriptive name to help you identify this key
									</p>
								</div>

								{/* Error Message */}
								{error && (
									<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
										{error}
									</div>
								)}
							</div>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={!name.trim() || isSubmitting}>
									{isSubmitting ? 'Creating...' : 'Create Key'}
								</Button>
							</DialogFooter>
						</form>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-500" />
								API Key Created
							</DialogTitle>
							<DialogDescription>
								Save this key now. You won't be able to view it again.
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							{/* Security Warning */}
							<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
								<div className="flex gap-3">
									<AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
									<div className="space-y-1">
										<p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
											Important Security Information
										</p>
										<ul className="space-y-1 text-xs text-amber-600/90 dark:text-amber-400/90">
											<li>
												• This is the only time you'll see the full key value
											</li>
											<li>
												• Copy or download the key before closing this window
											</li>
											<li>
												• Never share your API key publicly or commit it to
												version control
											</li>
											<li>
												• If you lose this key, you'll need to create a new one
											</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Key Display */}
							<div className="grid gap-2">
								<p className="text-sm font-medium">API Key</p>
								<div className="flex items-center gap-2">
									<code
										className={`flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm transition-colors duration-300 ${
											isFlashing ? 'bg-green-500/20' : ''
										}`}
									>
										{createdKey?.key}
									</code>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								<CopyButton
									value={createdKey?.key || ''}
									label="Copy Key"
									variant="outline"
									className="flex-1"
									onCopySuccess={handleCopySuccess}
								/>
								<Button
									variant="outline"
									className="flex-1 gap-2"
									onClick={handleDownload}
								>
									<Download className="h-4 w-4" />
									Download
								</Button>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleClose} className="w-full">
								Done - I've Saved My Key
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
