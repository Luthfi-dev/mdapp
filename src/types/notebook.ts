
export interface ChecklistItem {
    id: string;
    label: string;
    completed: boolean;
}

export interface Note {
    id: string;
    title: string;
    items: ChecklistItem[];
    createdAt: string; // ISO string
}
