import { UUIDTypes } from "uuid";

export type Toast = {
    id: UUIDTypes | number;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    duration: number;
}
