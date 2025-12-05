import { Mannequin } from './mannequin.model';

export interface Player {
    id: string;
    name: string;
    mannequin: Mannequin;
    isPremium?: boolean;
}
