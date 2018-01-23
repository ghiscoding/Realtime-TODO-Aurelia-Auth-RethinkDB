export interface User {
  id?: string;
  email?: string;
  password?: string;
  displayName: string;
  picture?: string;
  facebook?: string;
  foursquare?: string;
  google?: string;
  github?: string;
  identSrv?: string;
  linkedin?: string;
  live?: string;
  yahoo?: string;
  twitter?: string;
  [provider: string]: string | null;
}
