import { User } from '../../domain/models/user.model';

export const MOCK_USERS: User[] = [
  new User({
    id: '0',
    email: 'admin@company.com',
    currentPasswordHash: '$2a$10$Mf.m4jSyzYXKKd/RZg2vmuz8CNySQ7vaSpuy2R31SGqtxOnWtNqK6', // hash of "admin-password"
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new User({
    id: '1',
    email: 'member@company.com',
    currentPasswordHash: '$2a$10$cZiRDJMBSrUYGrPDWrXmN.LcjJCEdz7eWxvIeaM8ptM9.JyDNvopu', // hash of "member-password"
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];
