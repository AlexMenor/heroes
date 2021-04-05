export type Location = {
  _id: string;
  updatedAt: number;
  loc: {
    type: 'Point';
    coordinates: [number, number];
  };
};
