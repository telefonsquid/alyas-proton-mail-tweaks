// Stand in content for the preview. Nothing here comes from a real mailbox.

export type Mail = {
	sender: string;
	subject: string;
	time: string;
	location: string;
	labels: string[];
	unread: boolean;
	attachment: boolean;

	// Comfortable prints the file name, so the mock needs one
	attachmentName?: string;

	// A sender with a contact picture, which Proton draws instead of the initials
	avatar?: string;

	// Proton prints a count only from two messages up, and marks one row as the open one
	count?: number;
	selected?: boolean;
};

export const SYSTEM = [
	{ name: 'Inbox', icon: 'inbox', count: 12 },
	{ name: 'Drafts', icon: 'draft', count: 0 },
	{ name: 'Sent', icon: 'sent', count: 0 },
	{ name: 'Starred', icon: 'star', count: 0 },
	{ name: 'Archive', icon: 'archive', count: 0 },
	{ name: 'Spam', icon: 'spam', count: 0 },
	{ name: 'Trash', icon: 'trash', count: 0 },
	{ name: 'All mail', icon: 'allmail', count: 0 }
] as const;

// A subfolder is a sibling of its parent, indented through data-level rather than nesting
export const FOLDERS = [
	{ name: 'Projects', level: 0 },
	{ name: 'Receipts', level: 0 },
	{ name: 'Travel', level: 0 },
	{ name: 'Flights', level: 1 },
	{ name: 'Hotels', level: 1 }
];

export const LABELS = [
	{ name: 'To read', color: '#415df0' },
	{ name: 'Waiting', color: '#b4a40e' },
	{ name: 'Invoices', color: '#258723' },
	{ name: 'Newsletter', color: '#54473f' },
	{ name: 'Urgent', color: '#ba1e55' },
	{ name: 'Reference', color: '#7c4dff' },
	{ name: 'Shipping', color: '#0f7a8a' },
	{ name: 'Receipts', color: '#c2591c' },
	{ name: 'Follow up', color: '#5b6b7a' },
	{ name: 'Archive later', color: '#8a6d3b' },
	{ name: 'Personal', color: '#2f7d4f' },
	{ name: 'Travel', color: '#1d5fa8' },
	{ name: 'Someday', color: '#6b4fa1' },
	{ name: 'Contracts', color: '#a03b3b' }
];

// Stand in for a contact picture. Inline, so the repo carries no image file.
const AVATAR = (bg: string) =>
	`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23${bg}'/%3E%3Ccircle cx='16' cy='12' r='5' fill='white'/%3E%3Cpath d='M4 32a12 12 0 0124 0z' fill='white'/%3E%3C/svg%3E`;

export const MAILS: Mail[] = [
	{ sender: 'Package Tracking', subject: 'Your parcel is out for delivery today', time: '09:41', location: 'Inbox', labels: ['Shipping'], unread: true, attachment: false, avatar: AVATAR('0f7a8a') },
	{ sender: 'Nora Lindqvist', subject: 'Re: contract draft, second pass', time: '09:12', location: 'Archive', labels: ['Contracts', 'Urgent'], unread: true, attachment: true, attachmentName: 'contract-draft-v2.pdf', count: 4 },
	{ sender: 'Weekly Digest', subject: 'Seven things worth reading this week', time: '08:30', location: 'Inbox', labels: ['Newsletter'], unread: false, attachment: false, count: 100, selected: true, avatar: AVATAR('54473f') },
	{ sender: 'Billing', subject: 'Invoice 2291 is ready', time: 'Yesterday', location: 'Inbox', labels: ['Invoices'], unread: false, attachment: true, attachmentName: 'invoice-2291.pdf', avatar: AVATAR('c2591c') },
	{ sender: 'Tomas Berger', subject: 'Lunch on Thursday?', time: 'Yesterday', location: 'Archive', labels: [], unread: false, attachment: false },
	{ sender: 'Flight Updates', subject: 'Gate change for your morning flight', time: 'Tuesday', location: 'Inbox', labels: ['Travel'], unread: false, attachment: false },
	{ sender: 'Ines Kovac', subject: 'Photos from the weekend', time: 'Tuesday', location: 'Inbox', labels: ['Personal'], unread: false, attachment: true, attachmentName: 'weekend-03.jpg' },
	{ sender: 'Support', subject: 'Ticket 4417 has been closed', time: 'Monday', location: 'Archive', labels: ['Waiting'], unread: false, attachment: false, count: 12 },
	{ sender: 'Hostel Booking', subject: 'Confirmation for your stay in March', time: 'Monday', location: 'Inbox', labels: ['Travel', 'Receipts'], unread: false, attachment: true, attachmentName: 'booking-confirmation.pdf' },
	{ sender: 'Library', subject: 'Two items are due back on Friday', time: 'Sunday', location: 'Inbox', labels: [], unread: false, attachment: false },
	{ sender: 'Rasmus Ek', subject: 'Notes from the planning call', time: 'Sunday', location: 'Archive', labels: ['To read'], unread: false, attachment: false, count: 2 },
	{ sender: 'Energy Provider', subject: 'Your meter reading is due', time: '12 Sep', location: 'Inbox', labels: ['Invoices'], unread: false, attachment: false }
];
