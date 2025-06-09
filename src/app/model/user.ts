export interface User {
    userName: string;
    userFirstName: string;
    userLastName: string;
    email: string;
    userPassword?: string;
    roles: { roleName: string }[];
  }