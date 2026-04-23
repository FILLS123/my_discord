export interface IAuthtokens {
    accessToken: string,
    refreshToken: string
}
export enum OtpAction {
  REGISTER,
  LOGIN,
  //RESET_PASSWORD,
}