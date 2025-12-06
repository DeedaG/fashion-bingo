import { Mannequin } from './mannequin.model';
import { Economy } from './economy.model';

export interface Player {
    id: string;
    name: string;
    mannequin: Mannequin;
    isPremium?: boolean;
    economy?: Economy;
    coins?: number;
}
