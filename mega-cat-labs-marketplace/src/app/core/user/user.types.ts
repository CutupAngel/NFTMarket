import { Role } from '../models/role';
import firebase from 'firebase/compat/app';

export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: string;
    accessToken?: string;
    role: Role;
    isFirebaseUser?: boolean;
    firebaseUser?: firebase.User;
}
