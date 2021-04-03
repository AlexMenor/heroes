export type Alert = {
  _id: string;
  userId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: number;
  updatedAt: number;
};
