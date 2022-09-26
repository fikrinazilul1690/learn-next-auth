export interface ILogin {
  access_token: string;
  user: {
    createdAt: Date;
    email: string;
    id: string;
  };
}
