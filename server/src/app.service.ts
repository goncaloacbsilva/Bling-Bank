import { Injectable } from '@nestjs/common';
import { protect, unprotect } from '@securelib';
import { ProtectDto } from './dtos/protect.dto';
import { KeyObject, createSecretKey, randomBytes, scryptSync } from 'crypto';
import { UnprotectDto } from './dtos/unprotect.dto';

function generateSymmetricKey(): KeyObject {
  const salt = randomBytes(16); // Generate a random salt
  const key = scryptSync(
    'ogoncaloegayMesmoGayMasUmaPaneleirriseDoCaralho',
    salt,
    32,
  ); // Adjust the length based on your requirements

  console.log('Key: ', key.toString('base64'));

  return createSecretKey(key);
}

@Injectable()
export class AppService {
  async protect(protectDto: ProtectDto) {
    return protect(protectDto, generateSymmetricKey());
  }

  async unprotect(key: string, unprotectDto: UnprotectDto) {
    return unprotect(unprotectDto, createSecretKey(Buffer.from(key, 'base64')));
  }
}
