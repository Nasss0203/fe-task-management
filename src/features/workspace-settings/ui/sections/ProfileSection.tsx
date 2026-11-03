import { Camera, KeyRound, LogOut, Mail, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
	useAccount,
	useChangePassword,
	useRemoveAvatar,
	useUpdateUsername,
	useUploadAvatar,
} from "@/entities/user/model/account.queries";
import { useLogout, useUser } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";

import { getInitials } from "./people/people.utils";
import {
	SettingsGroup,
	SettingsHeader,
	SettingsRow,
	formatSettingsDate,
} from "./settings-layout";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

const ProfileSection = () => {
	const { user } = useUser();
	const logout = useLogout();
	const { data: account } = useAccount();
	const updateUsername = useUpdateUsername();
	const uploadAvatar = useUploadAvatar();
	const removeAvatar = useRemoveAvatar();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [username, setUsername] = useState("");
	const [syncedUsername, setSyncedUsername] = useState<string>();

	if (user && user.username !== syncedUsername) {
		setSyncedUsername(user.username);
		setUsername(user.username);
	}

	if (!user) return null;

	const displayName = user.username || user.email;
	const avatarBusy = uploadAvatar.isPending || removeAvatar.isPending;

	const saveUsername = () => {
		const next = username.trim();
		if (!next || next === user.username || updateUsername.isPending) {
			setUsername(user.username);
			return;
		}
		updateUsername.mutate(next, {
			onSuccess: () => toast.success("Display name updated"),
			onError: (error) => {
				setUsername(user.username);
				toast.error(getApiErrorMessage(error, "Could not update your name."));
			},
		});
	};

	const handleAvatarFile = (file: File | undefined) => {
		if (!file) return;
		if (!AVATAR_TYPES.includes(file.type)) {
			toast.error("Use a PNG, JPEG or WebP image.");
			return;
		}
		if (file.size > AVATAR_MAX_BYTES) {
			toast.error("Image must be at most 2 MB.");
			return;
		}
		uploadAvatar.mutate(file, {
			onSuccess: () => toast.success("Photo updated"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Could not upload the photo.")),
		});
	};

	return (
		<div>
			<SettingsHeader
				title='Profile'
				description='Your personal account information.'
			/>

			<div className='mb-6 flex flex-wrap items-center gap-4'>
				<button
					type='button'
					onClick={() => fileInputRef.current?.click()}
					disabled={avatarBusy}
					aria-label='Change photo'
					className='group relative size-16 shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
				>
					<Avatar className='size-16'>
						{user.avatarUrl ? (
							<AvatarImage src={user.avatarUrl} alt={displayName} />
						) : null}
						<AvatarFallback className='bg-brand-indigo text-[22px] font-semibold text-white'>
							{getInitials(displayName)}
						</AvatarFallback>
					</Avatar>
					<span className='absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-disabled:opacity-100'>
						<Camera className='size-5' />
					</span>
				</button>
				<input
					ref={fileInputRef}
					type='file'
					accept={AVATAR_TYPES.join(",")}
					className='hidden'
					onChange={(event) => {
						handleAvatarFile(event.target.files?.[0]);
						event.target.value = "";
					}}
				/>

				<div className='flex gap-2'>
					<Button
						variant='outline'
						disabled={avatarBusy}
						onClick={() => fileInputRef.current?.click()}
						className='gap-1.5'
					>
						<Upload className='size-3.5' />
						{uploadAvatar.isPending ? "Uploading..." : "Change photo"}
					</Button>
					{user.avatarUrl && (
						<Button
							variant='ghost'
							disabled={avatarBusy}
							className='text-foreground'
							aria-label='Remove photo'
							onClick={() =>
								removeAvatar.mutate(undefined, {
									onError: (error) =>
										toast.error(
											getApiErrorMessage(error, "Could not remove the photo."),
										),
								})
							}
						>
							Remove
						</Button>
					)}
				</div>
			</div>

			<SettingsGroup title='Account'>
				<SettingsRow
					label='Display name'
					description='Shown to people in your workspaces. You can also sign in with it.'
				>
					<Input
						value={username}
						onChange={(event) => setUsername(event.target.value)}
						onBlur={saveUsername}
						onKeyDown={(event) => {
							if (event.key === "Enter") event.currentTarget.blur();
							if (event.key === "Escape") setUsername(user.username);
						}}
						maxLength={100}
						disabled={updateUsername.isPending}
						aria-label='Display name'
						aria-invalid={username.trim().length < 2}
						className='h-[34px] w-full sm:w-[260px]'
					/>
				</SettingsRow>
				<SettingsRow
					label='Email'
					description='Used to sign in and receive notifications.'
				>
					<span className='break-all text-[13.5px] leading-5 text-muted-foreground'>{user.email}</span>
				</SettingsRow>
				<SettingsRow label='Member since'>
					<span className='text-[13.5px] text-muted-foreground'>
						{formatSettingsDate(user.createdAt)}
					</span>
				</SettingsRow>
			</SettingsGroup>

			<SettingsGroup title='Security'>
				<ChangePasswordRow hasPassword={account?.hasPassword ?? true} />
				<SettingsRow
					label='Forgot your password?'
					description='We will email you a link to set a new password.'
				>
					<Button variant='outline' asChild>
						<Link href='/forgot-password'>
							<Mail className='size-3.5' />
							Reset via email
						</Link>
					</Button>
				</SettingsRow>
				<SettingsRow
					label='Log out'
					description='Sign out of Taskmanly on this device.'
				>
					<Button
						variant='outline'
						disabled={logout.isPending}
						onClick={() => logout.mutate()}
					>
						<LogOut className='size-3.5' />
						{logout.isPending ? "Logging out..." : "Log out"}
					</Button>
				</SettingsRow>
			</SettingsGroup>
		</div>
	);
};

function ChangePasswordRow({ hasPassword }: { hasPassword: boolean }) {
	const changePassword = useChangePassword();
	const [open, setOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string>();

	const reset = () => {
		setOpen(false);
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setError(undefined);
	};

	const submit = (event: FormEvent) => {
		event.preventDefault();
		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setError(undefined);
		changePassword.mutate(
			{
				currentPassword: hasPassword ? currentPassword : undefined,
				newPassword,
			},
			{
				onSuccess: () => {
					toast.success(hasPassword ? "Password changed" : "Password set");
					reset();
				},
				onError: (mutationError) =>
					setError(
						getApiErrorMessage(mutationError, "Could not change the password."),
					),
			},
		);
	};

	if (!open) {
		return (
			<SettingsRow
				label='Password'
				description={
					hasPassword
						? "Change the password you use to sign in."
						: "You sign in with Google. Set a password to also sign in with email."
				}
			>
				<Button variant='outline' onClick={() => setOpen(true)}>
					<KeyRound className='size-3.5' />
					{hasPassword ? "Change password" : "Set password"}
				</Button>
			</SettingsRow>
		);
	}

	return (
		<form onSubmit={submit} className='space-y-3 py-4'>
			<div className='text-[13.5px] font-medium leading-5'>
				{hasPassword ? "Change password" : "Set password"}
			</div>
			<div className='grid max-w-md gap-3'>
				{hasPassword && (
					<PasswordInput
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						placeholder='Current password'
						autoComplete='current-password'
						required
					/>
				)}
				<PasswordInput
					value={newPassword}
					onChange={(event) => setNewPassword(event.target.value)}
					placeholder='New password (min. 6 characters)'
					autoComplete='new-password'
					required
				/>
				<PasswordInput
					value={confirmPassword}
					onChange={(event) => setConfirmPassword(event.target.value)}
					placeholder='Confirm new password'
					autoComplete='new-password'
					required
				/>
			</div>
			{error && (
				<p role='alert' className='text-sm text-destructive'>
					{error}
				</p>
			)}
			<div className='flex gap-2'>
				<Button type='submit' disabled={changePassword.isPending}>
					{changePassword.isPending ? "Saving..." : "Save password"}
				</Button>
				<Button
					type='button'
					variant='ghost'
					disabled={changePassword.isPending}
					onClick={reset}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

export default ProfileSection;
