import { IsBase64, IsMongoId, IsString } from "class-validator";

export class RawLoginDto {
  @IsBase64()
  mic: string;

  @IsBase64()
  nonce: string;

  @IsBase64()
  data: string;
}

export class LoginDto {
  @IsMongoId()
  clientId: string;

  @IsString()
  password: string;
}
