import { IsBase64, IsMongoId } from "class-validator";

export class SecureDataResponse {
  @IsBase64()
  mic: string;

  @IsBase64()
  data: string;
}

export class SecureDataRequest extends SecureDataResponse {
  @IsMongoId()
  sessionId: string;

  @IsBase64()
  nonce: string;
}
