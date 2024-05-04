export type CustomRequest = Request & {
  user: {
    sub: string;
    refreshToken: string;
  };
  headers: {
    authorization: string;
  };
};
