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
import { type ApiKey, regenerateApiKey } from '@/lib/apiKeys';
import { CopyButton } from './CopyButton';

interface RegenerateKeyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	apiKey: ApiKey | null;
	onKeyRegenerated?: () => void;
}

export function RegenerateKeyModal({
	open,
	onOpenChange,
	apiKey,
	onKeyRegenerated
}: RegenerateKeyModalProps) {
	const [step, setStep] = useState<'confirm' | 'reveal'>('confirm');
	const [regeneratedKey, setRegeneratedKey] = useState<{
		name: string;
		key: string;
		environment: 'test' | 'production';
	} | null>(null);
	const [isFlashing, setIsFlashing] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = () => {
		if (!apiKey) return;

		setError('');
		setIsSubmitting(true);

		try {
			const newKey = regenerateApiKey(apiKey.id);
			if (!newKey) {
				throw new Error('Failed to regenerate key');
			}

			setRegeneratedKey({
				name: newKey.name,
				key: newKey.key,
				environment: newKey.environment
			});
			setStep('reveal');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to regenerate key');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCopySuccess = () => {
		setIsFlashing(true);
		setTimeout(() => setIsFlashing(false), 500);
	};

	const handleDownload = () => {
		if (!regeneratedKey) return;

		const content = `API Key: ${regeneratedKey.name}
Environment: ${regeneratedKey.environment}
Key: ${regeneratedKey.key}
Regenerated: ${new Date().toISOString()}

⚠️ SECURITY WARNING ⚠️
Keep this key secure and never share it publicly.
You won't be able to view this key again after closing this window.
The old key has been invalidated.
`;

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${regeneratedKey.name.replace(/\s+/g, '_')}_regenerated_${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleClose = () => {
		setStep('confirm');
		setRegeneratedKey(null);
		setIsFlashing(false);
		setError('');
		onOpenChange(false);
		if (regeneratedKey && onKeyRegenerated) {
			onKeyRegenerated();
		}
	};

	if (!apiKey) return null;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[540px]">
				{step === 'confirm' ? (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								Regenerate API Key
								{apiKey.environment === 'test' ? (
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
								This will generate a new key for "{apiKey.name}".{' '}
								{apiKey.revoked
									? 'The key will be reactivated with the new value.'
									: 'The old key will be immediately invalidated.'}
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
								<div className="flex gap-3">
									<AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
									<div className="space-y-1">
										<p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
											Important: This action cannot be undone
										</p>
										<ul className="space-y-1 text-xs text-amber-600/90 dark:text-amber-400/90">
											{apiKey.revoked ? (
												<>
													<li>
														• This will reactivate the key with a new value
													</li>
													<li>• The new key will be shown only once</li>
													<li>
														• Remember to update any applications that need to
														use this key
													</li>
												</>
											) : (
												<>
													<li>
														• The current key will stop working immediately
													</li>
													<li>
														• Any applications using the old key will need to be
														updated
													</li>
													<li>• The new key will be shown only once</li>
												</>
											)}
										</ul>
									</div>
								</div>
							</div>

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
							<Button onClick={handleConfirm} disabled={isSubmitting}>
								{isSubmitting ? 'Regenerating...' : 'Regenerate Key'}
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Check className="h-5 w-5 text-green-500" />
								API Key Regenerated
							</DialogTitle>
							<DialogDescription>
								Save this key now. You won't be able to view it again. The old
								key has been invalidated.
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
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
											<li>• The old key is now invalid</li>
										</ul>
									</div>
								</div>
							</div>

							<div className="grid gap-2">
								<p className="text-sm font-medium">New API Key</p>
								<div className="flex items-center gap-2">
									<code
										className={`flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm transition-colors duration-300 ${
											isFlashing ? 'bg-green-500/20' : ''
										}`}
									>
										{regeneratedKey?.key}
									</code>
								</div>
							</div>

							<div className="flex gap-2">
								<CopyButton
									value={regeneratedKey?.key || ''}
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

							<div className="grid gap-2">
								<label htmlFor="notes" className="text-sm font-medium">
									Where did you save this key? (optional)
								</label>
								<Input
									id="notes"
									placeholder="e.g., 1Password, .env file on server"
								/>
								<p className="text-xs text-muted-foreground">
									For your records only - not stored
								</p>
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
